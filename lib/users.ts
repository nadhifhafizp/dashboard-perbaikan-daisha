import prisma from './prisma';
import { hashPassword, verifyPassword } from './passwords';

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface UserAccount {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

let isSeeded = false;

/**
 * Otomatis mengisi akun default (Admin & Operator) jika tabel User di database masih kosong.
 * Menggunakan password dari environment variables saat pertama kali jalan, kemudian di-hash.
 */
export async function seedInitialUsers(): Promise<void> {
  if (isSeeded) return;
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      isSeeded = true;
      return;
    }

    const initialAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const initialOperatorPassword = process.env.OPERATOR_PASSWORD || 'operator123';

    await prisma.user.createMany({
      data: [
        {
          username: (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase(),
          password: hashPassword(initialAdminPassword),
          name: 'Admin Maintenance & Rekap',
          role: 'ADMIN',
          description: 'Melihat rekapitulasi data, grafik statistik, ekspor Excel, kelola katalog, dan manajemen user.',
        },
        {
          username: (process.env.OPERATOR_USERNAME || 'operator').trim().toLowerCase(),
          password: hashPassword(initialOperatorPassword),
          name: 'Staff Input / Teknisi Lapangan',
          role: 'OPERATOR',
          description: 'Input data kerusakan Daisha baik di plant maupun bengkel maintenance.',
        },
      ],
    });
    isSeeded = true;
    console.log('[Auth] Berhasil inisialisasi akun default (admin & operator) ke database SQLite.');
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
  const user = await prisma.user.findUnique({
    where: { username: cleanUsername },
  });

  if (!user) return null;

  let isPasswordValid = verifyPassword(passwordInput, user.password);

  // Fallback sinkronisasi: jika belum cocok, cek apakah pengguna memasukkan password dari .env.local
  if (!isPasswordValid) {
    const envPassword = user.role === 'ADMIN' ? process.env.ADMIN_PASSWORD : process.env.OPERATOR_PASSWORD;
    if (envPassword && passwordInput === envPassword) {
      isPasswordValid = true;
      // Sinkronkan hash ke database agar ke depan langsung valid via hash
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashPassword(passwordInput) },
      }).catch(() => {});
    }
  }

  if (!isPasswordValid) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Mencari pengguna berdasarkan username saja (misal untuk pengecekan session token).
 */
export async function findUserByUsername(usernameInput: string): Promise<UserAccount | null> {
  await seedInitialUsers();

  const cleanUsername = usernameInput.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { username: cleanUsername },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Mendapatkan seluruh daftar akun (tanpa menyertakan password hash).
 */
export async function getAllUsers(): Promise<UserAccount[]> {
  await seedInitialUsers();

  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

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
  description?: string;
}): Promise<UserAccount> {
  const cleanUsername = data.username.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { username: cleanUsername },
  });
  if (existing) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan.`);
  }

  const user = await prisma.user.create({
    data: {
      username: cleanUsername,
      password: hashPassword(data.passwordPlain),
      name: data.name.trim(),
      role: data.role,
      description: data.description?.trim() || null,
    },
  });

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Memperbarui info pengguna (username, name, role, description).
 */
export async function updateUser(
  id: number,
  data: {
    username?: string;
    name?: string;
    role?: UserRole;
    description?: string;
  }
): Promise<UserAccount> {
  const updateData: {
    username?: string;
    name?: string;
    role?: string;
    description?: string;
  } = {};

  if (data.username) {
    const cleanUsername = data.username.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { username: cleanUsername, NOT: { id } },
    });
    if (existing) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh pengguna lain.`);
    }
    updateData.username = cleanUsername;
  }

  if (data.name) updateData.name = data.name.trim();
  if (data.role) updateData.role = data.role;
  if (data.description !== undefined) updateData.description = data.description.trim() || undefined;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    description: user.description,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Reset / Ubah password pengguna.
 */
export async function changeUserPassword(id: number, newPasswordPlain: string): Promise<void> {
  if (!newPasswordPlain || newPasswordPlain.length < 6) {
    throw new Error('Password baru minimal harus 6 karakter.');
  }

  await prisma.user.update({
    where: { id },
    data: {
      password: hashPassword(newPasswordPlain),
    },
  });
}

/**
 * Menghapus pengguna (dengan proteksi agar tidak menghapus admin terakhir).
 */
export async function deleteUser(id: number): Promise<void> {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  if (target.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      throw new Error('Tidak dapat menghapus akun Admin terakhir pada sistem.');
    }
  }

  await prisma.user.delete({ where: { id } });
}
