/**
 * lib/users.ts — Manajemen Akun Pengguna & Otorisasi RBAC
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

let isSeeded = false;

/**
 * Menginisialisasi akun bawaan jika database masih kosong.
 * Akun default yang dibuat:
 * 1. Admin      : username dari ENV / 'admin'
 * 2. Operator   : username dari ENV / 'operator'
 * 3. User Seksi : 'seksi_welding'
 */
export async function seedInitialUsers(): Promise<void> {
  if (isSeeded) return;
  try {
    const [countResult] = await sql`SELECT COUNT(*)::int AS count FROM "User"`;
    const count = countResult?.count ?? 0;
    const initialAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const initialOperatorPassword = process.env.OPERATOR_PASSWORD || 'operator123';

    if (count === 0) {
      const adminUser = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
      const opUser = (process.env.OPERATOR_USERNAME || 'operator').trim().toLowerCase();

      await sql`
        INSERT INTO "User" ("username", "password", "name", "role", "description", "createdAt", "updatedAt")
        VALUES 
          (${adminUser}, ${hashPassword(initialAdminPassword)}, 'Admin Maintenance & Rekap', 'ADMIN', 'Melihat rekapitulasi data, grafik statistik, ekspor Excel, kelola katalog, dan manajemen user.', NOW(), NOW()),
          (${opUser}, ${hashPassword(initialOperatorPassword)}, 'Staff Input / Teknisi Lapangan', 'OPERATOR', 'Input data kerusakan Daisha baik di plant maupun bengkel maintenance.', NOW(), NOW()),
          ('seksi_welding', ${hashPassword('seksi123')}, 'Seksi Welding & Stamping', 'USER_SEKSI', 'User perwakilan seksi untuk request pembuatan barang dan follow up.', NOW(), NOW())
      `;
      console.log('[Auth] Berhasil inisialisasi akun default (admin, operator, seksi_welding) ke database PostgreSQL.');
    } else {
      const [seksiCountResult] = await sql`SELECT COUNT(*)::int AS count FROM "User" WHERE "role" = 'USER_SEKSI'`;
      if ((seksiCountResult?.count ?? 0) === 0) {
        await sql`
          INSERT INTO "User" ("username", "password", "name", "role", "seksi", "description", "createdAt", "updatedAt")
          VALUES ('seksi_welding', ${hashPassword('seksi123')}, 'Seksi Welding & Stamping', 'USER_SEKSI', 'Welding', 'User perwakilan seksi untuk request pembuatan barang dan follow up.', NOW(), NOW())
        `;
      }
    }
    isSeeded = true;
  } catch (err) {
    console.error('[Auth] Error saat inisialisasi akun default:', err);
  }
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
  await seedInitialUsers();

  const cleanUsername = usernameInput.trim().toLowerCase();
  const [user] = await sql`SELECT * FROM "User" WHERE "username" = ${cleanUsername} LIMIT 1`;

  if (!user) return null;

  if (!verifyPassword(passwordInput, user.password)) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    seksi: user.seksi,
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Mencari profil pengguna berdasarkan username (untuk verifikasi identitas internal).
 */
export async function findUserByUsername(usernameInput: string): Promise<UserAccount | null> {
  await seedInitialUsers();

  const cleanUsername = usernameInput.trim().toLowerCase();
  const [user] = await sql`SELECT * FROM "User" WHERE "username" = ${cleanUsername} LIMIT 1`;

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    seksi: user.seksi,
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
  await seedInitialUsers();

  const users = await sql<UserAccount[]>`
    SELECT "id", "username", "name", "role", "seksi", "description", "createdAt", "updatedAt"
    FROM "User"
    ORDER BY "id" ASC
  `;

  return users.map((u) => ({
    ...u,
    role: u.role as UserRole,
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

  const [existing] = await sql`SELECT "id" FROM "User" WHERE "username" = ${cleanUsername} LIMIT 1`;
  if (existing) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan.`);
  }

  const [user] = await sql<UserAccount[]>`
    INSERT INTO "User" ("username", "password", "name", "role", "seksi", "description", "createdAt", "updatedAt")
    VALUES (
      ${cleanUsername},
      ${hashPassword(data.passwordPlain)},
      ${data.name.trim()},
      ${data.role},
      ${data.seksi?.trim() || null},
      ${data.description?.trim() || null},
      NOW(),
      NOW()
    )
    RETURNING "id", "username", "name", "role", "seksi", "description", "createdAt", "updatedAt"
  `;

  return {
    ...user,
    role: user.role as UserRole,
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
      SELECT "id" FROM "User"
      WHERE "username" = ${cleanUsername} AND "id" != ${id}
      LIMIT 1
    `;
    if (existing) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh pengguna lain.`);
    }
  }

  const [user] = await sql<UserAccount[]>`
    UPDATE "User"
    SET
      "username" = COALESCE(${data.username ? data.username.trim().toLowerCase() : null}, "username"),
      "name" = COALESCE(${data.name ? data.name.trim() : null}, "name"),
      "role" = COALESCE(${data.role || null}, "role"),
      "seksi" = ${data.seksi !== undefined ? (data.seksi?.trim() || null) : sql`"seksi"`},
      "description" = ${data.description !== undefined ? (data.description?.trim() || null) : sql`"description"`},
      "updatedAt" = NOW()
    WHERE "id" = ${id}
    RETURNING "id", "username", "name", "role", "seksi", "description", "createdAt", "updatedAt"
  `;

  if (!user) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  return {
    ...user,
    role: user.role as UserRole,
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

  await sql`
    UPDATE "User"
    SET "password" = ${hashPassword(newPasswordPlain)}, "updatedAt" = NOW()
    WHERE "id" = ${id}
  `;
}

/**
 * Menghapus akun pengguna dari database.
 * Dilengkapi proteksi keamanan: Menolak penghapusan jika akun tersebut adalah Admin terakhir di sistem.
 * 
 * @param id - ID akun yang akan dihapus
 */
export async function deleteUser(id: number): Promise<void> {
  const [target] = await sql`SELECT "id", "role" FROM "User" WHERE "id" = ${id} LIMIT 1`;
  if (!target) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  if (target.role === 'ADMIN') {
    const [adminCountResult] = await sql`SELECT COUNT(*)::int AS count FROM "User" WHERE "role" = 'ADMIN'`;
    if ((adminCountResult?.count ?? 0) <= 1) {
      throw new Error('Tidak dapat menghapus akun Admin terakhir pada sistem.');
    }
  }

  await sql`DELETE FROM "User" WHERE "id" = ${id}`;
}
