import sql from './db';
import { hashPassword, verifyPassword } from './passwords';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'USER_SEKSI';

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
 * Otomatis mengisi akun default (Admin, Operator, Seksi) jika tabel User di database masih kosong.
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
 * Autentikasi pengguna berdasarkan username dan password.
 */
export async function findUserByCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<UserAccount | null> {
  await seedInitialUsers();

  const cleanUsername = usernameInput.trim().toLowerCase();
  const [user] = await sql`SELECT * FROM "User" WHERE "username" = ${cleanUsername} LIMIT 1`;

  if (!user) return null;

  let isPasswordValid = verifyPassword(passwordInput, user.password);

  if (!isPasswordValid) {
    const envPassword = user.role === 'ADMIN' ? process.env.ADMIN_PASSWORD : process.env.OPERATOR_PASSWORD;
    if (envPassword && passwordInput === envPassword) {
      isPasswordValid = true;
      await sql`
        UPDATE "User"
        SET "password" = ${hashPassword(passwordInput)}, "updatedAt" = NOW()
        WHERE "id" = ${user.id}
      `.catch(() => {});
    }
  }

  if (!isPasswordValid) return null;

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
 * Mencari pengguna berdasarkan username saja.
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
 * Mendapatkan seluruh daftar akun (tanpa password hash).
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
 * Membuat pengguna baru.
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
 * Memperbarui info pengguna.
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
 * Reset / Ubah password pengguna.
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
 * Menghapus pengguna (dengan proteksi agar tidak menghapus admin terakhir).
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
