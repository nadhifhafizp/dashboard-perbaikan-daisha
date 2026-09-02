import { constantTimeCompare } from './crypto';

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface UserAccount {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  description: string;
}

// 2 Role Pengguna: ADMIN (Rekap & Evaluasi) dan OPERATOR (Staff Input Lapangan/Bengkel)
export function getUsersDatabase(): UserAccount[] {
  return [
    {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Admin Maintenance & Rekap',
      role: 'ADMIN',
      description: 'Melihat rekapitulasi data, grafik statistik, tren kerusakan, ekspor Excel, dan update status perbaikan.',
    },
    {
      username: process.env.OPERATOR_USERNAME || 'operator',
      password: process.env.OPERATOR_PASSWORD || 'operator123',
      name: 'Staff Input / Teknisi Lapangan',
      role: 'OPERATOR',
      description: 'Input data kerusakan Daisha baik yang ditemukan saat inspeksi plant maupun di bengkel.',
    },
  ];
}

export function findUserByCredentials(username: string, password: string): UserAccount | null {
  const cleanUsername = username.trim().toLowerCase();
  const users = getUsersDatabase();
  const user = users.find(
    (u) => u.username.toLowerCase() === cleanUsername && constantTimeCompare(u.password, password)
  );
  return user || null;
}

export function findUserByUsername(username: string): UserAccount | null {
  const cleanUsername = username.trim().toLowerCase();
  const users = getUsersDatabase();
  const user = users.find((u) => u.username.toLowerCase() === cleanUsername);
  return user || null;
}
