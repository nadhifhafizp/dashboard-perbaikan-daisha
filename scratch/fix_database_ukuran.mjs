import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  console.log('=== BEFORE FIX ===');
  console.log('Daisha ukuran:', await sql`SELECT ukuran, COUNT(*)::int as count FROM "Daisha" GROUP BY ukuran;`);
  console.log('MasterDaisha ukuran:', await sql`SELECT ukuran, COUNT(*)::int as count FROM "MasterDaisha" GROUP BY ukuran;`);

  console.log('\nRunning updates...');
  await sql`UPDATE "Daisha" SET ukuran = 'SMALL' WHERE ukuran = 'S' OR LOWER(ukuran) = 'small';`;
  await sql`UPDATE "Daisha" SET ukuran = 'MEDIUM' WHERE ukuran IN ('M', 'Medium') OR LOWER(ukuran) = 'medium';`;
  await sql`UPDATE "Daisha" SET ukuran = 'LARGE' WHERE ukuran = 'L' OR LOWER(ukuran) = 'large';`;

  await sql`UPDATE "MasterDaisha" SET ukuran = 'SMALL' WHERE ukuran = 'S' OR LOWER(ukuran) = 'small';`;
  await sql`UPDATE "MasterDaisha" SET ukuran = 'MEDIUM' WHERE ukuran IN ('M', 'Medium') OR LOWER(ukuran) = 'medium';`;
  await sql`UPDATE "MasterDaisha" SET ukuran = 'LARGE' WHERE ukuran = 'L' OR LOWER(ukuran) = 'large';`;

  console.log('\n=== AFTER FIX ===');
  console.log('Daisha ukuran:', await sql`SELECT ukuran, COUNT(*)::int as count FROM "Daisha" GROUP BY ukuran;`);
  console.log('MasterDaisha ukuran:', await sql`SELECT ukuran, COUNT(*)::int as count FROM "MasterDaisha" GROUP BY ukuran;`);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
