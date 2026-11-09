/**
 * lib/users.ts - Manajemen Akun Pengguna & Otorisasi RBAC
 * 
 * Menggunakan tabel TWMSUsers (10 Tabel Relasional TWMS)
 */
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

export async function findUserByCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<UserAccount | null> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const [user] = await sql`
    SELECT 
      "Id" AS id, 
      "Username" AS username, 
      "PasswordHash" AS password_hash, 
      "FullName" AS full_name, 
      "Role" AS role, 
      "SectionName" AS seksi, 
      "Description" AS description, 
      "CreateDate" AS "createdAt", 
      "UpdateDate" AS "updatedAt"
    FROM "TWMSUsers"
    WHERE LOWER("Username") = ${cleanUsername} AND "IsActive" = true
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

export async function findUserByUsername(usernameInput: string): Promise<UserAccount | null> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const [user] = await sql`
    SELECT 
      "Id" AS id, 
      "Username" AS username, 
      "FullName" AS full_name, 
      "Role" AS role, 
      "SectionName" AS seksi, 
      "Description" AS description, 
      "CreateDate" AS "createdAt", 
      "UpdateDate" AS "updatedAt"
    FROM "TWMSUsers"
    WHERE LOWER("Username") = ${cleanUsername} AND "IsActive" = true
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

export async function getAllUsers(): Promise<UserAccount[]> {
  const users = await sql`
    SELECT 
      "Id" AS id, 
      "Username" AS username, 
      "FullName" AS name, 
      "Role" AS role, 
      "SectionName" AS seksi, 
      "Description" AS description, 
      "CreateDate" AS "createdAt", 
      "UpdateDate" AS "updatedAt"
    FROM "TWMSUsers"
    WHERE "IsActive" = true
    ORDER BY "Id" ASC
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

export async function createUser(data: {
  username: string;
  passwordPlain: string;
  name: string;
  role: UserRole;
  seksi?: string;
  description?: string;
}): Promise<UserAccount> {
  const cleanUsername = data.username.trim().toLowerCase();

  const [existing] = await sql`
    SELECT "Id" FROM "TWMSUsers" WHERE LOWER("Username") = ${cleanUsername} LIMIT 1
  `;
  if (existing) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan.`);
  }

  const [user] = await sql`
    INSERT INTO "TWMSUsers" (
      "Username", "PasswordHash", "FullName", "Role", "SectionName", "Description", "CreateDate", "UpdateDate"
    )
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
    RETURNING "Id" AS id, "Username" AS username, "FullName" AS name, "Role" AS role, "SectionName" AS seksi, "Description" AS description, "CreateDate" AS "createdAt", "UpdateDate" AS "updatedAt"
  `;

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
      SELECT "Id" FROM "TWMSUsers"
      WHERE LOWER("Username") = ${cleanUsername} AND "Id" != ${id}
      LIMIT 1
    `;
    if (existing) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh pengguna lain.`);
    }
  }

  const [user] = await sql`
    UPDATE "TWMSUsers"
    SET
      "Username" = COALESCE(${data.username ? data.username.trim().toLowerCase() : null}, "Username"),
      "FullName" = COALESCE(${data.name ? data.name.trim() : null}, "FullName"),
      "Role" = COALESCE(${data.role || null}, "Role"),
      "SectionName" = ${data.seksi !== undefined ? (data.seksi?.trim() || null) : sql`"SectionName"`},
      "Description" = ${data.description !== undefined ? (data.description?.trim() || null) : sql`"Description"`},
      "UpdateDate" = NOW()
    WHERE "Id" = ${id}
    RETURNING "Id" AS id, "Username" AS username, "FullName" AS name, "Role" AS role, "SectionName" AS seksi, "Description" AS description, "CreateDate" AS "createdAt", "UpdateDate" AS "updatedAt"
  `;

  if (!user) {
    throw new Error('Pengguna tidak ditemukan.');
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

export async function changeUserPassword(id: number, newPasswordPlain: string): Promise<void> {
  if (!newPasswordPlain || newPasswordPlain.length < 6) {
    throw new Error('Password baru minimal harus 6 karakter.');
  }

  const hashed = hashPassword(newPasswordPlain);
  await sql`
    UPDATE "TWMSUsers"
    SET "PasswordHash" = ${hashed}, "UpdateDate" = NOW()
    WHERE "Id" = ${id}
  `;
}

export async function deleteUser(id: number): Promise<void> {
  const [target] = await sql`SELECT "Id", "Role" FROM "TWMSUsers" WHERE "Id" = ${id} LIMIT 1`;
  if (!target) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  if (target.Role === 'ADMIN') {
    const [adminCountResult] = await sql`SELECT COUNT(*)::int AS count FROM "TWMSUsers" WHERE "Role" = 'ADMIN' AND "IsActive" = true`;
    if ((adminCountResult?.count ?? 0) <= 1) {
      throw new Error('Tidak dapat menghapus akun Admin terakhir pada sistem.');
    }
  }

  await sql`DELETE FROM "TWMSUsers" WHERE "Id" = ${id}`;
}
