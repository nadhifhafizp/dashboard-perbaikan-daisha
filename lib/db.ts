/**
 * lib/db.ts — Koneksi Database PostgreSQL Terpusat (Singleton Pool)
 * 
 * ============================================================================
 * SPESIFIKASI ARSITEKTUR & KEAMANAN:
 * 1. Library: `postgres` (postgres.js) — driver tercepat & paling hemat memori di ekosistem Node.js.
 * 2. SQL Injection Defense: 
 *    Template literal `sql\`SELECT * FROM "User" WHERE id = ${id}\`` BUKAN string concatenation.
 *    postgres.js secara otomatis mengonversi variabel `${...}` menjadi Parameterized Queries
 *    ($1, $2, dst.) yang dievaluasi di level mesin PostgreSQL, sehingga kebal 100% terhadap SQL Injection.
 * 3. Supabase / Cloud Pooler Support:
 *    Parameter `prepare: false` wajib diaktifkan saat melewati PgBouncer / Supabase Transaction Pooler (port 6543).
 * 4. Next.js HMR Singleton:
 *    Mencegah connection exhaustion (kebocoran koneksi pool) saat Hot Module Reloading di mode dev.
 * ============================================================================
 */
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Database] PERINGATAN: DATABASE_URL tidak ditemukan di environment variables.');
}

// Deklarasi global singleton untuk mencegah kebocoran pool koneksi pada Next.js HMR
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined;
};

// Tutup koneksi lama jika ada yang menggantung saat dev reload
if (process.env.NODE_ENV !== 'production' && globalForDb.sql) {
  try {
    globalForDb.sql.end({ timeout: 1 }).catch(() => {});
  } catch {
    // Abaikan jika koneksi sudah tertutup
  }
  globalForDb.sql = undefined;
}

/**
 * Instance SQL Client PostgreSQL
 * Siap digunakan di semua API Route dan modul backend dengan proteksi injection bawaan.
 */
export const sql =
  globalForDb.sql ??
  postgres(connectionString || '', {
    ssl: 'require', // Memaksa enkripsi TLS saat koneksi ke database cloud
    prepare: false, // Wajib false untuk PgBouncer transaction mode
    max: process.env.NODE_ENV === 'production' ? 1 : 10, // Pool size adaptif
    idle_timeout: 30, // Timeout koneksi idle dalam detik
    connect_timeout: 15, // Batas waktu koneksi awal
    transform: {
      undefined: null, // Transformasi otomatis JS undefined ke SQL NULL
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

export default sql;
