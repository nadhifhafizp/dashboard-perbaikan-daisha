import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const tableType = await sql`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_name IN ('MasterDaisha', 'Daisha');
  `;
  console.table(tableType);

  const rules = await sql`
    SELECT * FROM pg_rules WHERE tablename = 'MasterDaisha';
  `;
  console.log('Rules on MasterDaisha:', rules);

  const viewDef = await sql`
    SELECT definition FROM pg_views WHERE viewname = 'MasterDaisha';
  `;
  console.log('View def:', viewDef);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
