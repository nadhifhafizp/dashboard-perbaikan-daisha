import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const existing = await sql`SELECT * FROM "Daisha" WHERE nomor_daisha LIKE 'BC%'`;
  console.log('Existing BC:', existing);

  // Let's also check Daisha table columns schema
  const cols = await sql`
    SELECT column_name, ordinal_position, is_nullable, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Daisha'
    ORDER BY ordinal_position;
  `;
  console.table(cols);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
