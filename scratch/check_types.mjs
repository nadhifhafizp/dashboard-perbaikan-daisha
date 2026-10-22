import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  console.log('=== CHECK DAISHA WITH BATTERY CAR, KB DRUM, TRANSFER ETC ===');
  const checkNames = await sql`
    SELECT id, nomor_daisha, jenis, nama_daisha, seksi, ukuran 
    FROM "Daisha"
    WHERE LOWER(jenis) LIKE '%battery%' 
       OR LOWER(jenis) LIKE '%drum%' 
       OR LOWER(jenis) LIKE '%jikogu%' 
       OR LOWER(jenis) LIKE '%transfer%' 
       OR LOWER(jenis) LIKE '%reproses%'
       OR LOWER(COALESCE(nama_daisha, '')) LIKE '%battery%'
       OR LOWER(COALESCE(nama_daisha, '')) LIKE '%drum%'
       OR LOWER(COALESCE(nama_daisha, '')) LIKE '%jikogu%'
       OR LOWER(COALESCE(nama_daisha, '')) LIKE '%transfer%'
    LIMIT 30;
  `;
  console.table(checkNames);

  console.log('\n=== CHECK ALL TABLES IN DB ===');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.table(tables);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
