import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const types = await sql`
    SELECT id, name, seksi, "codePrefix", "totalUnits" 
    FROM "DaishaType" 
    ORDER BY seksi, name;
  `;
  
  const daishaJenis = await sql`
    SELECT seksi, jenis, COUNT(*)::int as count 
    FROM "Daisha" 
    GROUP BY seksi, jenis 
    ORDER BY seksi, jenis;
  `;

  console.log('=== DAISHA TYPES IN CATALOG ===');
  console.table(types);

  console.log('=== CURRENT DAISHA IN FLEET DB ===');
  console.table(daishaJenis);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
