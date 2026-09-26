import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  prepare: false,
});

async function checkCols() {
  try {
    const srmCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'SectionRequestMaterial'
    `;
    console.log('SectionRequestMaterial columns:', srmCols.map(c => c.column_name));

    const srCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'SectionRequest'
    `;
    console.log('SectionRequest columns:', srCols.map(c => c.column_name));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

checkCols();
