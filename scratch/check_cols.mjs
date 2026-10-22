import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const variantCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'DaishaVariant'
    ORDER BY ordinal_position;
  `;
  console.log('=== DaishaVariant Columns ===');
  console.table(variantCols);

  const daishaCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Daisha'
    ORDER BY ordinal_position;
  `;
  console.log('=== Daisha Columns ===');
  console.table(daishaCols);

  const allVariants = await sql`
    SELECT * FROM "DaishaVariant";
  `;
  console.log('=== All DaishaVariant Rows ===');
  console.table(allVariants);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
