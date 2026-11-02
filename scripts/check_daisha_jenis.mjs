import postgres from 'postgres';

const connString = process.env.DATABASE_URL || "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function check() {
  const rows = await sql`SELECT DISTINCT jenis FROM "Daisha" ORDER BY jenis`;
  console.log('All Daisha jenis in DB:', rows.map(r => r.jenis));
  const catRows = await sql`SELECT DISTINCT name FROM "DaishaCatalog" ORDER BY name`;
  console.log('All DaishaCatalog names in DB:', catRows.map(r => r.name));
  await sql.end();
}
check();

