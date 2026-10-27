import postgres from 'postgres';

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(connString, { ssl: 'require', prepare: false });

async function main() {
  console.log('Adding nomorSurat column to SectionRequest...');
  await sql`
    ALTER TABLE "SectionRequest"
    ADD COLUMN IF NOT EXISTS "nomorSurat" VARCHAR(100);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "idx_section_request_nomor_surat" ON "SectionRequest"("nomorSurat");
  `;
  console.log('✓ nomorSurat column & index successfully created!');
  await sql.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
