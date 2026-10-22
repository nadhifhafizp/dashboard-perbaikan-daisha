import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const cols = await sql`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'Ticket';
  `;
  console.log('Ticket columns:', cols.map(c => c.column_name));

  const sample = await sql`SELECT * FROM "Ticket" LIMIT 5;`;
  console.log('Sample ticket:', sample);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
