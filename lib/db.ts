import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Database] DATABASE_URL tidak ditemukan di environment variables.');
}

// Singleton connection pattern untuk Next.js mencegah connection exhaustion saat HMR & Serverless
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined;
};

export const sql =
  globalForDb.sql ??
  postgres(connectionString || '', {
    ssl: 'require',
    max: 1, // Di serverless (Vercel), 1 koneksi per container adalah best practice
    idle_timeout: 20,
    connect_timeout: 10,
    transform: {
      undefined: null,
    },
  });

// Simpan di globalThis agar container warm di Vercel selalu memakai ulang koneksi yang sudah terbuka
globalForDb.sql = sql;

export default sql;
