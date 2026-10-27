/**
 * scripts/seed_users.mjs — Skrip Seeding Akun Pengguna Terproteksi
 * 
 * Standar Keamanan F0.4:
 * 1. Tidak memuat password bawaan/hardcoded di dalam kode sumber.
 * 2. Menolak berjalan jika ADMIN_PASSWORD, OPERATOR_PASSWORD, atau SEKSI_PASSWORD tidak disuplai melalui env.
 * 3. Menggunakan algoritma hash PBKDF2 SHA-512 dengan salt acak 16-byte kriptografis.
 */
import postgres from 'postgres';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable wajib diisi sebelum menjalankan seed-users.');
  process.exit(1);
}

const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

const operatorUsername = (process.env.OPERATOR_USERNAME || 'operator').trim().toLowerCase();
const operatorPassword = process.env.OPERATOR_PASSWORD;

const seksiUsername = (process.env.SEKSI_USERNAME || 'seksi_welding').trim().toLowerCase();
const seksiPassword = process.env.SEKSI_PASSWORD;

if (!adminPassword || !operatorPassword || !seksiPassword) {
  console.error('❌ Error Keamanan: Skrip menolak berjalan karena password wajib disuplai melalui ENV.');
  console.error('   Harap jalankan dengan format:');
  console.error('   ADMIN_PASSWORD="..." OPERATOR_PASSWORD="..." SEKSI_PASSWORD="..." npm run db:seed-users');
  process.exit(1);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  prepare: false,
});

async function main() {
  console.log('👤 Memulai seeding akun pengguna terproteksi...');

  try {
    const users = [
      {
        username: adminUsername,
        password: hashPassword(adminPassword),
        name: 'Admin Maintenance & Rekap',
        role: 'ADMIN',
        seksi: null,
        description: 'Melihat rekapitulasi data, grafik statistik, ekspor Excel, kelola katalog, dan manajemen user.',
      },
      {
        username: operatorUsername,
        password: hashPassword(operatorPassword),
        name: 'Staff Input / Teknisi Lapangan',
        role: 'OPERATOR',
        seksi: null,
        description: 'Input data kerusakan Daisha baik di plant maupun bengkel maintenance.',
      },
      {
        username: seksiUsername,
        password: hashPassword(seksiPassword),
        name: 'Seksi Welding & Stamping',
        role: 'USER_SEKSI',
        seksi: 'Welding',
        description: 'User perwakilan seksi untuk request pembuatan barang dan follow up.',
      },
    ];

    for (const u of users) {
      await sql`
        INSERT INTO "User" ("username", "password", "name", "role", "seksi", "description", "createdAt", "updatedAt")
        VALUES (${u.username}, ${u.password}, ${u.name}, ${u.role}, ${u.seksi}, ${u.description}, NOW(), NOW())
        ON CONFLICT ("username") 
        DO UPDATE SET
          "password" = EXCLUDED."password",
          "name" = EXCLUDED."name",
          "role" = EXCLUDED."role",
          "seksi" = EXCLUDED."seksi",
          "description" = EXCLUDED."description",
          "updatedAt" = NOW()
      `;
      console.log(`   ✓ Akun @${u.username} (${u.role}) berhasil dikonfigurasi.`);
    }

    console.log('✅ Seeding akun pengguna selesai dengan aman!');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat seeding user:', err);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
