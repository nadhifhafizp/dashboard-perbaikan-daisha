import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Database] DATABASE_URL tidak ditemukan di environment variables.');
}

// Singleton connection pattern untuk Next.js mencegah connection exhaustion saat HMR
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined;
};

export const sql =
  globalForDb.sql ??
  postgres(connectionString || '', {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    transform: {
      undefined: null,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

export default sql;
