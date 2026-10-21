import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function migrate() {
  try {
    console.log('Adding columns to "MaintenanceLog"...');
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "kondisi" TEXT DEFAULT 'OK'`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "detail_kerusakan" TEXT`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "tindakan" TEXT`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "waktu_masuk" TIMESTAMPTZ`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "waktu_keluar" TIMESTAMPTZ`;

    console.log('Adding columns to "Daisha"...');
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_condition" TEXT DEFAULT 'OK'`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_repair_date" TIMESTAMPTZ`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_waktu_masuk" TIMESTAMPTZ`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_waktu_keluar" TIMESTAMPTZ`;

    console.log('Migration v2 finished successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await sql.end();
  }
}

migrate();
