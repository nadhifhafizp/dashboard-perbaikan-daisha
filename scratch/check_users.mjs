import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User'`;
    console.log("User table columns:", cols.map(c => c.column_name));
    const users = await sql`SELECT * FROM "User"`;
    console.log("Users in DB count:", users.length);
    for (const u of users) {
      console.log(`User: ${u.username} | role: ${u.role} | seksi: ${u.seksi} | name: ${u.name || u.nama}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
