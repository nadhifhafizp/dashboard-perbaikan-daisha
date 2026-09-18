import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Database] DATABASE_URL tidak ditemukan di environment variables.');
}

// Singleton connection pattern untuk Next.js mencegah connection exhaustion saat HMR & Serverless
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined;
};

// Tutup koneksi lama jika ada yang menggantung saat dev reload
if (process.env.NODE_ENV !== 'production' && globalForDb.sql) {
  try {
    globalForDb.sql.end({ timeout: 1 }).catch(() => {});
  } catch {
    // Abaikan jika sudah tertutup
  }
  globalForDb.sql = undefined;
}

export const sql =
  globalForDb.sql ??
  postgres(connectionString || '', {
    ssl: 'require',
    prepare: false, // Wajib false untuk Supabase PgBouncer transaction pooler (port 6543)
    max: process.env.NODE_ENV === 'production' ? 1 : 10, // Beri pool connection cukup saat concurrent requests di dev
    idle_timeout: 30,
    connect_timeout: 15,
    transform: {
      undefined: null,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

export default sql;
