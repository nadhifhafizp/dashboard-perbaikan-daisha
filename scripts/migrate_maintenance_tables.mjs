import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function migrate() {
  try {
    console.log('Creating table "Daisha"...');
    await sql`
      CREATE TABLE IF NOT EXISTS "Daisha" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "nomor_daisha" TEXT UNIQUE NOT NULL,
        "jenis" TEXT NOT NULL,
        "ukuran" TEXT NOT NULL,
        "last_maintenance_date" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT now(),
        "updated_at" TIMESTAMPTZ DEFAULT now()
      )
    `;

    console.log('Creating index on "Daisha"...');
    await sql`CREATE INDEX IF NOT EXISTS "idx_daisha_jenis_ukuran" ON "Daisha"("jenis", "ukuran")`;

    console.log('Creating table "MaintenanceLog"...');
    await sql`
      CREATE TABLE IF NOT EXISTS "MaintenanceLog" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "daisha_id" UUID NOT NULL REFERENCES "Daisha"("id") ON DELETE CASCADE,
        "nomor_daisha" TEXT NOT NULL,
        "jenis_pekerjaan" TEXT NOT NULL,
        "tanggal_pengerjaan" TIMESTAMPTZ NOT NULL,
        "admin_id" TEXT,
        "catatan" TEXT,
        "created_at" TIMESTAMPTZ DEFAULT now()
      )
    `;

    console.log('Creating indices on "MaintenanceLog"...');
    await sql`CREATE INDEX IF NOT EXISTS "idx_maintenance_log_daisha" ON "MaintenanceLog"("daisha_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_maintenance_log_tanggal" ON "MaintenanceLog"("tanggal_pengerjaan")`;

    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await sql.end();
  }
}

migrate();
