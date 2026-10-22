import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    console.log("=== CHECKING BEFORE CLEANUP ===");
    const fbdDaisha = await sql`SELECT * FROM "Daisha" WHERE nomor_daisha = 'FBD-001'`;
    console.log("FBD in Daisha:", fbdDaisha);
    const fbdMaster = await sql`SELECT * FROM "MasterDaisha" WHERE "noDaisha" = 'FBD-001'`;
    console.log("FBD in MasterDaisha:", fbdMaster);

    const layerBad = await sql`SELECT * FROM "Daisha" WHERE nomor_daisha = 'LAYER-1221212'`;
    console.log("Layer in Daisha with VERTICAL:", layerBad);

    const nagaraFilter = await sql`SELECT count(*)::int as count FROM "Daisha" WHERE jenis = 'NAGARA_FILTER'`;
    console.log("Nagara Filter with NAGARA_FILTER count:", nagaraFilter[0].count);

  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
