import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  console.log('=== DAISHA VARIANT JOIN DAISHA TYPE ===');
  const variants = await sql`
    SELECT v.id, v.name, v.ukuran, v.susunan, v."codePrefix", v."totalUnits", v."rangeFormat", t.name as type_name, t.seksi
    FROM "DaishaVariant" v
    LEFT JOIN "DaishaType" t ON v."typeId" = t.id
    ORDER BY t.seksi, t.name, v.id;
  `;
  console.table(variants);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
