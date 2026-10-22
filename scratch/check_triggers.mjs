import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const triggers = await sql`
    SELECT trigger_name, event_manipulation, event_object_table, action_statement
    FROM information_schema.triggers
    WHERE event_object_table IN ('MasterDaisha', 'Daisha');
  `;
  console.table(triggers);

  const functions = await sql`
    SELECT proname, prosrc 
    FROM pg_proc 
    WHERE proname LIKE '%daisha%' OR proname LIKE '%master%';
  `;
  console.log('Functions:', functions);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
