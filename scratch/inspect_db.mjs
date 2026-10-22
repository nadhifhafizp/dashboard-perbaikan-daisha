import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  console.log('=== DAISHA TABLE GROUP BY SEKSI, JENIS, UKURAN ===');
  const daishaCounts = await sql`
    SELECT COALESCE(seksi, 'EMPTY') as seksi, 
           COALESCE(jenis, 'EMPTY') as jenis, 
           COALESCE(ukuran, 'EMPTY') as ukuran, 
           COUNT(*)::int as count 
    FROM "Daisha" 
    GROUP BY seksi, jenis, ukuran 
    ORDER BY seksi, jenis, ukuran;
  `;
  console.table(daishaCounts);

  console.log('\n=== DAISHA DISTINCT UKURAN ===');
  const distinctUkuran = await sql`
    SELECT DISTINCT ukuran, COUNT(*)::int as count 
    FROM "Daisha" 
    GROUP BY ukuran;
  `;
  console.table(distinctUkuran);

  console.log('\n=== DAISHA VARIANT TABLE ===');
  try {
    const variants = await sql`
      SELECT id, name, ukuran, susunan, "codePrefix", "totalUnits"
      FROM "DaishaVariant"
      ORDER BY id;
    `;
    console.table(variants);
  } catch (e) {
    console.log('Error reading DaishaVariant:', e.message);
  }

  console.log('\n=== DAISHA TYPE TABLE ===');
  try {
    const types = await sql`
      SELECT * FROM "DaishaType" ORDER BY id;
    `;
    console.table(types);
  } catch (e) {
    console.log('No DaishaType table or error:', e.message);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
