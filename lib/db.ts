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
 * 4. 1 Global Singleton via globalThis:
 *    Mencegah connection exhaustion & multi-instance leak saat Hot Module Reloading di mode dev maupun serverless execution.
 * 5. Transaksi Atomik (ACID):
 *    Fungsi `withTransaction()` membungkus multi-query dengan otomatis ROLLBACK saat error dan release koneksi pool.
 * ============================================================================
 */
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Database] PERINGATAN: DATABASE_URL tidak ditemukan di environment variables.');
}

// Deklarasi global singleton pada globalThis untuk mencegah kebocoran pool koneksi pada Next.js
const globalForDb = globalThis as unknown as {
  sqlInstance: postgres.Sql | undefined;
};

/**
 * Instance SQL Client PostgreSQL Singleton Terpusat
 * Siap digunakan di semua API Route dan modul backend dengan proteksi injection bawaan.
 */
export const sql =
  globalForDb.sqlInstance ??
  postgres(connectionString || '', {
    ssl: 'require', // Memaksa enkripsi TLS saat koneksi ke database cloud
    prepare: false, // Wajib false untuk PgBouncer transaction mode
    max: 10, // Pool size stabil dan aman untuk cloud database
    idle_timeout: 20, // Tutup koneksi idle lokal sebelum PgBouncer memutus koneksi
    max_lifetime: 60 * 10, // Daur ulang koneksi setiap 10 menit
    connect_timeout: 10, // Batas waktu koneksi awal
    keep_alive: 15, // Kirim TCP keep-alive probe setiap 15 detik untuk menjaga socket AWS/Supabase
    onnotice: () => {}, // Abaikan pesan notis log
    transform: {
      undefined: null, // Transformasi otomatis JS undefined ke SQL NULL
    },
  });

// Simpan instance ke globalThis agar tidak membuat koneksi baru saat HMR atau re-import
globalForDb.sqlInstance = sql;

/**
 * Alias query terpusat sesuai standar pemanggilan backend
 */
export const query = sql;

export type TransactionClient = postgres.TransactionSql;

/**
 * Menjalankan operasi multi-kueri di dalam transaksi database ACID yang aman.
 * Otomatis COMMIT jika seluruh operasi sukses, dan otomatis ROLLBACK jika terjadi galat.
 * Mencegah connection leak dengan menjamin pelepasan koneksi kembali ke pool database.
 */
export async function withTransaction<T>(
  callback: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  const result = await sql.begin(async (tx) => {
    return await callback(tx);
  });
  return result as unknown as T;
}

export default sql;
