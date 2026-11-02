import postgres from 'postgres';

const connString = process.env.DATABASE_URL || "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function c() {
  const catalog = await sql`
    SELECT id, name, seksi, "totalUnits"
    FROM "DaishaCatalog"
    ORDER BY "totalUnits" DESC
  `;
  console.log('DaishaCatalog table:');
  console.log(catalog);

  await sql.end();
}
c();
