import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/daisha_db';
const sql = postgres(connectionString);

async function run() {
  try {
    const rows = await sql`
      SELECT seksi, nama_daisha, jenis, ukuran, count(*) as cnt 
      FROM "Daisha" 
      WHERE seksi ILIKE '%building%' 
      GROUP BY seksi, nama_daisha, jenis, ukuran 
      ORDER BY cnt DESC
    `;
    console.log("=== DAISHA IN SEKSI BUILDING ===");
    for (const r of rows) {
      console.log(`${r.seksi} | ${r.nama_daisha} | ${r.jenis} | ${r.ukuran} -> ${r.cnt} units`);
    }

    const allSeksi = await sql`
      SELECT DISTINCT seksi, count(*) as total 
      FROM "Daisha" 
      GROUP BY seksi 
      ORDER BY total DESC
    `;
    console.log("\n=== ALL SEKSI IN DAISHA TABLE ===");
    for (const s of allSeksi) {
      console.log(`${s.seksi}: ${s.total} units`);
    }

    const allTypesBySeksi = await sql`
      SELECT seksi, jenis, nama_daisha, count(*) as cnt
      FROM "Daisha"
      GROUP BY seksi, jenis, nama_daisha
      ORDER BY seksi, cnt DESC
    `;
    console.log("\n=== ALL TYPES GROUPED BY SEKSI ===");
    let curSeksi = '';
    for (const t of allTypesBySeksi) {
      if (t.seksi !== curSeksi) {
        curSeksi = t.seksi;
        console.log(`\n--- Seksi: ${curSeksi} ---`);
      }
      console.log(`  ${t.nama_daisha || t.jenis} (${t.jenis}) -> ${t.cnt}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
