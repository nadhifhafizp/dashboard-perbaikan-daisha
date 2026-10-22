import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'MasterDaisha'
    `;
    console.log("MasterDaisha cols:", cols.map(c => c.column_name));

    const sample = await sql`SELECT * FROM "MasterDaisha" LIMIT 10`;
    console.log("MasterDaisha sample:", sample);

    const counts = await sql`
      SELECT seksi, count(*)::int as count 
      FROM "MasterDaisha" 
      GROUP BY seksi 
      ORDER BY count DESC
    `;
    console.log("MasterDaisha per seksi:", counts);

  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
