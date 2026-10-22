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
  for (const row of daishaCounts) {
    console.log(`${row.seksi.padEnd(12)} | ${row.jenis.padEnd(20)} | ${row.ukuran.padEnd(10)} | ${row.count}`);
  }

  console.log('\n=== DAISHA DISTINCT UKURAN ===');
  const distinctUkuran = await sql`
    SELECT DISTINCT ukuran, COUNT(*)::int as count 
    FROM "Daisha" 
    GROUP BY ukuran;
  `;
  console.table(distinctUkuran);

  console.log('\n=== SAMPLE DAISHA WITH S / SMALL / M / MEDIUM ===');
  const sampleUkuran = await sql`
    SELECT id, nomor_daisha, jenis, ukuran, seksi 
    FROM "Daisha" 
    WHERE ukuran IN ('S', 'SMALL', 'M', 'MEDIUM', 'L', 'LARGE')
    LIMIT 20;
  `;
  console.table(sampleUkuran);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
