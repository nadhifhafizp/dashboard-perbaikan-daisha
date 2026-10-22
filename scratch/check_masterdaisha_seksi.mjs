import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const mdBuilding = await sql`
    SELECT "namaDaisha", COUNT(*)::int as count 
    FROM "MasterDaisha" 
    WHERE seksi = 'Building' 
    GROUP BY "namaDaisha" 
    ORDER BY count DESC;
  `;
  console.log('MasterDaisha for Building:');
  console.table(mdBuilding);

  const mdAll = await sql`
    SELECT seksi, "namaDaisha", COUNT(*)::int as count 
    FROM "MasterDaisha" 
    GROUP BY seksi, "namaDaisha" 
    ORDER BY seksi, count DESC;
  `;
  console.log('MasterDaisha by Seksi:');
  console.table(mdAll);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
