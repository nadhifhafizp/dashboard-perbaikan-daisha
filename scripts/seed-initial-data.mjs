import postgres from 'postgres';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required.');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function seed() {
  console.log('=== SEEDING INITIAL USERS (POSTGRES NATIVE) ===');

  try {
    // 1. Seed Users
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM "User"`;
    if (count === 0) {
      console.log('Seeding initial users...');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const operatorPassword = process.env.OPERATOR_PASSWORD || 'operator123';

      await sql`
        INSERT INTO "User" (username, password, name, role, description, "createdAt", "updatedAt")
        VALUES 
          (
            ${(process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase()},
            ${hashPassword(adminPassword)},
            'Admin Maintenance & Rekap',
            'ADMIN',
            'Melihat rekapitulasi data, grafik statistik, ekspor Excel, kelola katalog, dan manajemen user.',
            NOW(),
            NOW()
          ),
          (
            ${(process.env.OPERATOR_USERNAME || 'operator').trim().toLowerCase()},
            ${hashPassword(operatorPassword)},
            'Staff Input / Teknisi Lapangan',
            'OPERATOR',
            'Input data kerusakan Daisha baik di plant maupun bengkel maintenance.',
            NOW(),
            NOW()
          )
      `;
      console.log('✔ 2 User berhasil dibuat (admin & operator)');
    } else {
      console.log(`User sudah ada (${count} user), lewati seed user.`);
    }

    console.log('=== SEEDING SELESAI ===');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await sql.end();
  }
}

seed();
