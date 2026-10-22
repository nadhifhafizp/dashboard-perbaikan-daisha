import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const tickets = await sql`SELECT * FROM "Ticket" WHERE nomor_daisha ILIKE '%FBD%'`;
    console.log("FBD tickets:", tickets);

    const staging = await sql`SELECT * FROM "PmStaging" WHERE nomor_daisha ILIKE '%FBD%'`;
    console.log("FBD staging:", staging);
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
