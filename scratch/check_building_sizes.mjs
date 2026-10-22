import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const rows = await sql`
      SELECT 
        nama_daisha, 
        jenis, 
        ukuran, 
        COUNT(*)::int as total,
        COUNT(CASE WHEN last_maintenance_date >= '2026-01-01' THEN 1 END)::int as maintained
      FROM "Daisha"
      WHERE seksi = 'Building'
      GROUP BY nama_daisha, jenis, ukuran
      ORDER BY nama_daisha, ukuran
    `;
    console.log("Building Daisha broken down by size (ukuran):");
    for (const r of rows) {
      const unmaintained = r.total - r.maintained;
      const pct = Math.round((r.maintained / r.total) * 100);
      console.log(`- ${r.nama_daisha.padEnd(20)} | Ukuran: ${r.ukuran.padEnd(8)} | Total: ${r.total.toString().padStart(4)} | Sudah: ${r.maintained.toString().padStart(3)} (${pct}%) | Belum: ${unmaintained.toString().padStart(4)}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
