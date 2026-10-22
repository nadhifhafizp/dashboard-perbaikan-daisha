import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    console.log("=== EXECUTING DATABASE CLEANUP ===");

    // 1. Delete stray FBD-001 with 'TBR Produksi'
    const delDaisha = await sql`DELETE FROM "Daisha" WHERE nomor_daisha = 'FBD-001' RETURNING id, nomor_daisha, seksi`;
    console.log("Deleted from Daisha:", delDaisha);

    const delMaster = await sql`DELETE FROM "MasterDaisha" WHERE "noDaisha" = 'FBD-001' RETURNING "noDaisha", seksi`;
    console.log("Deleted from MasterDaisha:", delMaster);

    // 2. Fix LAYER-1221212 jenis to LAYER
    const fixLayer = await sql`UPDATE "Daisha" SET jenis = 'LAYER' WHERE nomor_daisha = 'LAYER-1221212' RETURNING id, nomor_daisha, jenis, seksi`;
    console.log("Fixed Layer unit:", fixLayer);

    // 3. Fix NAGARA_FILTER jenis to NAGARA_FILLER to match DaishaType catalog
    const fixNagara = await sql`UPDATE "Daisha" SET jenis = 'NAGARA_FILLER' WHERE jenis = 'NAGARA_FILTER' RETURNING id`;
    console.log(`Standardized ${fixNagara.length} Nagara Filler units`);

    // 4. Verify no stray seksi remains
    const seksiCounts = await sql`
      SELECT seksi, count(*)::int as count 
      FROM "Daisha" 
      GROUP BY seksi 
      ORDER BY count DESC
    `;
    console.log("\nVerified Daisha count per Seksi:");
    for (const s of seksiCounts) {
      console.log(`- ${s.seksi}: ${s.count} units`);
    }

  } catch (e) {
    console.error("Cleanup error:", e);
  } finally {
    await sql.end();
  }
}

run();
