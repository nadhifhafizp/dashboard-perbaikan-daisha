import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const res = await sql`DELETE FROM "MasterDaisha" WHERE "noDaisha" = 'FBD-001' RETURNING "noDaisha", seksi`;
    console.log("Deleted from MasterDaisha:", res);
    const mCounts = await sql`SELECT seksi, count(*)::int FROM "MasterDaisha" GROUP BY seksi`;
    console.log("MasterDaisha seksi counts:", mCounts);
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
