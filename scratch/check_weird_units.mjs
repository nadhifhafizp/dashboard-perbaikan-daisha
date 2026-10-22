import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const mFbd = await sql`SELECT * FROM "MasterDaisha" WHERE "noDaisha" = 'FBD-001'`;
    console.log("MasterDaisha FBD-001:", mFbd);

    const mLayer = await sql`SELECT * FROM "MasterDaisha" WHERE "noDaisha" = 'LAYER-1221212'`;
    console.log("MasterDaisha LAYER-1221212:", mLayer);

    const tFbd = await sql`SELECT * FROM "Ticket" WHERE "noDaisha" ILIKE '%FBD%'`;
    console.log("Ticket FBD:", tFbd);

    const tLayer = await sql`SELECT * FROM "Ticket" WHERE "noDaisha" ILIKE '%LAYER-1221212%'`;
    console.log("Ticket LAYER-1221212:", tLayer);

  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
