import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function run() {
  const users = await sql`SELECT id, username, name, role, seksi FROM "User"`;
  console.log('Users in DB:');
  console.table(users);

  const sampleL = await sql`SELECT id, nomor_daisha, seksi, jenis, ukuran FROM "Daisha" WHERE nomor_daisha LIKE '%L30001%' LIMIT 5`;
  console.log('Sample L30001:');
  console.table(sampleL);

  const seksiCounts = await sql`SELECT seksi, count(*) as count FROM "Daisha" GROUP BY seksi`;
  console.log('Seksi counts in Daisha:');
  console.table(seksiCounts);

  await sql.end();
}

run();
