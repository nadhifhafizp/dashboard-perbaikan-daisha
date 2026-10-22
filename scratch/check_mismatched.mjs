import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const seksiCounts = await sql`
      SELECT seksi, count(*)::int as count 
      FROM "Daisha" 
      GROUP BY seksi 
      ORDER BY count DESC
    `;
    console.log("Distinct seksi in Daisha table:");
    for (const s of seksiCounts) {
      console.log(`- ${s.seksi}: ${s.count} units`);
    }

    console.log("\nTypes per seksi:");
    const typesPerSeksi = await sql`
      SELECT seksi, nama_daisha, jenis, count(*)::int as count
      FROM "Daisha"
      GROUP BY seksi, nama_daisha, jenis
      ORDER BY seksi, count DESC
    `;
    for (const t of typesPerSeksi) {
      console.log(`[${t.seksi}] nama: "${t.nama_daisha}" | jenis: "${t.jenis}" -> ${t.count} units`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
