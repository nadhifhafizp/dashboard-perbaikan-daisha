import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  const rows = await sql`
    SELECT id, nomor_daisha, jenis, ukuran, seksi 
    FROM "Daisha" 
    WHERE ukuran IN ('S', 'Medium', 'L');
  `;
  console.table(rows);

  const mdRows = await sql`
    SELECT "noDaisha", "namaDaisha", ukuran, seksi 
    FROM "MasterDaisha" 
    WHERE ukuran IN ('S', 'Medium', 'L');
  `;
  console.table(mdRows);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
