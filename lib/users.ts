/**
 * lib/users.ts - Manajemen Akun Pengguna & Otorisasi RBAC
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * 1. Definisi model akun pengguna dan hak akses (ADMIN, OPERATOR, USER_SEKSI).
 * 2. Auto-seeding akun bawaan pabrik jika tabel database baru diinisialisasi.
 * 3. Otentikasi kredensial login dengan verifikasi hash PBKDF2 SHA-512.
 * 4. Operasi CRUD pengguna lengkap dengan proteksi tidak boleh menghapus Admin terakhir.
 * 5. Data Privacy: Query user untuk frontend secara ketat mengecualikan kolom password.
 * ============================================================================
 */
import sql from './db';
import { hashPassword, verifyPassword } from './passwords';

/**
 * Hak Akses Sistem (Role-Based Access Control)
 * - ADMIN      : Staff Special Project / Bengkel Produksi (Full Access)
 * - OPERATOR   : Teknisi lapangan (Input & Riwayat Daisha)
 * - USER_SEKSI : Perwakilan departemen pabrik (Pengajuan Pesanan Seksi)
 */
export type UserRole = 'ADMIN' | 'OPERATOR' | 'USER_SEKSI';

/**
 * Representasi Objek Akun Pengguna (Data publik aman tanpa password)
 */
export interface UserAccount {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  seksi?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Autentikasi pengguna berdasarkan kombinasi username dan password.
 * 
 * @param usernameInput - Username pengguna
 * @param passwordInput - Password plaintext yang dimasukkan pada form login
 * @returns UserAccount jika lolos validasi, atau null jika gagal
 */
export async function findUserByCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<UserAccount | null> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const [user] = await sql`
    SELECT 
      u.id, 
      u.username, 
      u.password_hash, 
      u.full_name, 
      u.role, 
      COALESCE(s.name, u.legacy_section_name) AS seksi, 
      u.section_id,
      u.description, 
      u.created_at AS "createdAt", 
      u.updated_at AS "updatedAt"
    FROM users u
    LEFT JOIN sections s ON s.id = u.section_id
    WHERE LOWER(u.username) = ${cleanUsername}
    LIMIT 1
  `;

  if (!user) return null;

  if (!verifyPassword(passwordInput, user.password_hash)) return null;

  return {
    id: Number(user.id),
    username: user.username,
    name: user.full_name,
    role: user.role as UserRole,
    seksi: resolveUserSeksi({ ...user, name: user.full_name }),
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Helper internal untuk memastikan akun USER_SEKSI selalu terpetakan ke seksinya
 */
function resolveUserSeksi(user: Record<string, unknown>): string | null {
  const seksi = typeof user.seksi === 'string' ? user.seksi.trim() : null;
  if (seksi) return seksi;

  const role = typeof user.role === 'string' ? user.role : '';
  const username = typeof user.username === 'string' ? user.username : '';
  const name = typeof user.name === 'string' ? user.name : '';

  if (role === 'USER_SEKSI') {
    const knownSections = ['Building', 'Bead', 'Banbury', 'Cutt/Cal', 'Extruding', 'Poly Film', 'Welding'];
    const haystack = `${username} ${name}`.toLowerCase();
    const matched = knownSections.find((s) => haystack.includes(s.toLowerCase()));
    if (matched) return matched;
  }
  return null;
}

/**
 * Mencari profil pengguna berdasarkan username (untuk verifikasi identitas internal).
 */
export async function findUserByUsername(usernameInput: string): Promise<UserAccount | null> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const [user] = await sql`
    SELECT 
      u.id, 
      u.username, 
      u.full_name, 
      u.role, 
      COALESCE(s.name, u.legacy_section_name) AS seksi, 
      u.section_id,
      u.description, 
      u.created_at AS "createdAt", 
      u.updated_at AS "updatedAt"
    FROM users u
    LEFT JOIN sections s ON s.id = u.section_id
    WHERE LOWER(u.username) = ${cleanUsername}
    LIMIT 1
  `;

  if (!user) return null;

  return {
    id: Number(user.id),
    username: user.username,
    name: user.full_name,
    role: user.role as UserRole,
    seksi: resolveUserSeksi({ ...user, name: user.full_name }),
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Mengambil seluruh daftar pengguna dari database.
 * Kolom sensitif seperti hash password sengaja tidak di-select demi menjaga kerahasiaan data.
 * 
 * @returns Array data akun pengguna terdaftar
 */
export async function getAllUsers(): Promise<UserAccount[]> {
  const users = await sql`
    SELECT 
      u.id, 
      u.username, 
      u.full_name AS name, 
      u.role, 
      COALESCE(s.name, u.legacy_section_name) AS seksi, 
      u.section_id,
      u.description, 
      u.created_at AS "createdAt", 
      u.updated_at AS "updatedAt"
    FROM users u
    LEFT JOIN sections s ON s.id = u.section_id
    ORDER BY u.id ASC
  `;

  return users.map((u) => ({
    id: Number(u.id),
    username: u.username,
    name: u.name,
    role: u.role as UserRole,
    seksi: u.seksi || null,
    description: u.description,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
}

/**
 * Mendaftarkan akun pengguna baru ke sistem.
 * Password otomatis dienkripsi dengan PBKDF2 SHA-512 sebelum disimpan ke PostgreSQL.
 * 
 * @param data - Informasi akun baru (username, password, nama, role, seksi, deskripsi)
 * @returns UserAccount data akun yang baru dibuat
 */
export async function createUser(data: {
  username: string;
  passwordPlain: string;
  name: string;
  role: UserRole;
  seksi?: string;
  description?: string;
}): Promise<UserAccount> {
  const cleanUsername = data.username.trim().toLowerCase();

  const [existing] = await sql`SELECT id FROM users WHERE LOWER(username) = ${cleanUsername} LIMIT 1`;
  if (existing) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan.`);
  }

  let sectionId: number | null = null;
  if (data.seksi?.trim()) {
    const [sec] = await sql`SELECT id FROM sections WHERE LOWER(TRIM(name)) = LOWER(TRIM(${data.seksi})) LIMIT 1`;
    if (sec) {
      sectionId = Number(sec.id);
    } else {
      const [newSec] = await sql`
        INSERT INTO sections (name) VALUES (${data.seksi.trim()})
        ON CONFLICT (LOWER(TRIM(name))) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      if (newSec) sectionId = Number(newSec.id);
    }
  }

  const [user] = await sql`
    INSERT INTO users (username, password_hash, full_name, role, section_id, legacy_section_name, description, created_at, updated_at)
    VALUES (
      ${cleanUsername},
      ${hashPassword(data.passwordPlain)},
      ${data.name.trim()},
      ${data.role},
      ${sectionId},
      ${data.seksi?.trim() || null},
      ${data.description?.trim() || null},
      NOW(),
      NOW()
    )
    RETURNING id, username, full_name AS name, role, legacy_section_name AS seksi, description, created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  // Dual-write ke tabel legacy "User" untuk kompatibilitas selama transisi
  try {
    await sql`
      INSERT INTO "User" (id, username, password, name, role, seksi, description, "createdAt", "updatedAt")
      VALUES (
        ${user.id},
        ${cleanUsername},
        ${hashPassword(data.passwordPlain)},
        ${data.name.trim()},
        ${data.role},
        ${data.seksi?.trim() || null},
        ${data.description?.trim() || null},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        seksi = EXCLUDED.seksi,
        description = EXCLUDED.description,
        "updatedAt" = NOW();
    `;
  } catch (err) {
    console.warn('Dual-write ke legacy User dilewati:', err);
  }

  return {
    id: Number(user.id),
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    seksi: user.seksi || null,
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Memperbarui data profil pengguna (nama, role, seksi, atau deskripsi).
 * Mencegah duplikasi jika username diubah ke username yang sudah dimiliki user lain.
 * 
 * @param id - ID akun target
 * @param data - Bidang data yang ingin diperbarui
 * @returns UserAccount data akun setelah perubahan
 */
export async function updateUser(
  id: number,
  data: {
    username?: string;
    name?: string;
    role?: UserRole;
    seksi?: string;
    description?: string;
  }
): Promise<UserAccount> {
  if (data.username) {
    const cleanUsername = data.username.trim().toLowerCase();
    const [existing] = await sql`
      SELECT id FROM users
      WHERE LOWER(username) = ${cleanUsername} AND id != ${id}
      LIMIT 1
    `;
    if (existing) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh pengguna lain.`);
    }
  }

  let sectionId: number | null | undefined = undefined;
  if (data.seksi !== undefined) {
    if (data.seksi && data.seksi.trim()) {
      const [sec] = await sql`SELECT id FROM sections WHERE LOWER(TRIM(name)) = LOWER(TRIM(${data.seksi})) LIMIT 1`;
      if (sec) {
        sectionId = Number(sec.id);
      } else {
        const [newSec] = await sql`
          INSERT INTO sections (name) VALUES (${data.seksi.trim()})
          ON CONFLICT (LOWER(TRIM(name))) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `;
        if (newSec) sectionId = Number(newSec.id);
      }
    } else {
      sectionId = null;
    }
  }

  const [user] = await sql`
    UPDATE users
    SET
      username = COALESCE(${data.username ? data.username.trim().toLowerCase() : null}, username),
      full_name = COALESCE(${data.name ? data.name.trim() : null}, full_name),
      role = COALESCE(${data.role || null}, role),
      section_id = ${sectionId !== undefined ? sectionId : sql`section_id`},
      legacy_section_name = ${data.seksi !== undefined ? (data.seksi?.trim() || null) : sql`legacy_section_name`},
      description = ${data.description !== undefined ? (data.description?.trim() || null) : sql`description`},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, username, full_name AS name, role, legacy_section_name AS seksi, description, created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  if (!user) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  // Dual-write ke tabel legacy "User"
  try {
    await sql`
      UPDATE "User"
      SET
        username = COALESCE(${data.username ? data.username.trim().toLowerCase() : null}, username),
        name = COALESCE(${data.name ? data.name.trim() : null}, name),
        role = COALESCE(${data.role || null}, role),
        seksi = ${data.seksi !== undefined ? (data.seksi?.trim() || null) : sql`seksi`},
        description = ${data.description !== undefined ? (data.description?.trim() || null) : sql`description`},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  } catch (err) {
    console.warn('Dual-update ke legacy User dilewati:', err);
  }

  return {
    id: Number(user.id),
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    seksi: user.seksi || null,
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Mengubah atau me-reset password akun pengguna (hanya bisa diakses oleh Admin atau user bersangkutan).
 * Minimal panjang password: 6 karakter.
 * 
 * @param id - ID akun pengguna
 * @param newPasswordPlain - Password baru dalam bentuk plaintext
 */
export async function changeUserPassword(id: number, newPasswordPlain: string): Promise<void> {
  if (!newPasswordPlain || newPasswordPlain.length < 6) {
    throw new Error('Password baru minimal harus 6 karakter.');
  }

  const hashed = hashPassword(newPasswordPlain);
  await sql`
    UPDATE users
    SET password_hash = ${hashed}, updated_at = NOW()
    WHERE id = ${id}
  `;

  try {
    await sql`
      UPDATE "User"
      SET password = ${hashed}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  } catch {}
}

/**
 * Menghapus akun pengguna dari database.
 * Dilengkapi proteksi keamanan: Menolak penghapusan jika akun tersebut adalah Admin terakhir di sistem.
 * 
 * @param id - ID akun yang akan dihapus
 */
export async function deleteUser(id: number): Promise<void> {
  const [target] = await sql`SELECT id, role FROM users WHERE id = ${id} LIMIT 1`;
  if (!target) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  if (target.role === 'ADMIN') {
    const [adminCountResult] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'ADMIN'`;
    if ((adminCountResult?.count ?? 0) <= 1) {
      throw new Error('Tidak dapat menghapus akun Admin terakhir pada sistem.');
    }
  }

  await sql`DELETE FROM users WHERE id = ${id}`;
  try {
    await sql`DELETE FROM "User" WHERE id = ${id}`;
  } catch {}
}
