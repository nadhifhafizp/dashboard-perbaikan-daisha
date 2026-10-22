import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  console.log('=== DISTINCT UKURAN IN DAISHA ===');
  const dUkuran = await sql`SELECT ukuran, COUNT(*)::int as count FROM "Daisha" GROUP BY ukuran;`;
  console.table(dUkuran);

  console.log('=== DISTINCT UKURAN IN MASTER DAISHA ===');
  const mdUkuran = await sql`SELECT ukuran, COUNT(*)::int as count FROM "MasterDaisha" GROUP BY ukuran;`;
  console.table(mdUkuran);

  console.log('=== DISTINCT UKURAN IN MAINTENANCE LOG ===');
  try {
    const mlUkuran = await sql`SELECT ukuran, COUNT(*)::int as count FROM "MaintenanceLog" GROUP BY ukuran;`;
    console.table(mlUkuran);
  } catch(e) {
    console.log('MaintenanceLog has no ukuran column or:', e.message);
  }

  console.log('=== DISTINCT UKURAN IN DAISHA VARIANT ===');
  const dvUkuran = await sql`SELECT ukuran, COUNT(*)::int as count FROM "DaishaVariant" GROUP BY ukuran;`;
  console.table(dvUkuran);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
