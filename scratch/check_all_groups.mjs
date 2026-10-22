import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const list = await sql`
      SELECT seksi, jenis, nama_daisha, COUNT(*)::int as count
      FROM "Daisha"
      GROUP BY seksi, jenis, nama_daisha
      ORDER BY seksi, jenis, nama_daisha
    `;
    console.log("All Daisha groups:");
    for (const r of list) {
      console.log(`[${r.seksi}] jenis: ${r.jenis.padEnd(20)} | nama: ${r.nama_daisha.padEnd(25)} | ${r.count}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
