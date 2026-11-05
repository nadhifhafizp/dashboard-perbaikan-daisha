import postgres from 'postgres';

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(connString, { ssl: 'require', prepare: false });

async function main() {
  console.log('Adding signature columns to SectionRequest...');
  await sql`
    ALTER TABLE "SectionRequest"
    ADD COLUMN IF NOT EXISTS "ttdAtasanSeksi" TEXT,
    ADD COLUMN IF NOT EXISTS "ttdAdminWorkshop" TEXT,
    ADD COLUMN IF NOT EXISTS "ttdAtasanSpecialProject" TEXT;
  `;
  console.log('✓ Signature columns successfully created!');
  await sql.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
