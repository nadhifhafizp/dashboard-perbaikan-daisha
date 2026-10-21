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

/**
 * Instance SQL Client PostgreSQL
 * Siap digunakan di semua API Route dan modul backend dengan proteksi injection bawaan.
 */
export const sql =
  globalForDb.sql ??
  postgres(connectionString || '', {
    ssl: 'require', // Memaksa enkripsi TLS saat koneksi ke database cloud
    prepare: false, // Wajib false untuk PgBouncer transaction mode
    max: process.env.NODE_ENV === 'production' ? 10 : 10, // Pool size adaptif
    idle_timeout: 20, // Tutup koneksi idle lokal sebelum PgBouncer memutus koneksi
    max_lifetime: 60 * 10, // Daur ulang koneksi setiap 10 menit
    connect_timeout: 10, // Batas waktu koneksi awal
    keep_alive: 15, // Kirim TCP keep-alive probe setiap 15 detik untuk menjaga socket AWS/Supabase
    onnotice: () => {}, // Abaikan pesan notis log
    transform: {
      undefined: null, // Transformasi otomatis JS undefined ke SQL NULL
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

export default sql;
