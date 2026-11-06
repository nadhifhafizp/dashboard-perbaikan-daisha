import postgres from 'postgres';

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.log('DATABASE_URL is not set, skipping DB migration');
  process.exit(0);
}

const sql = postgres(connString, { ssl: 'require', prepare: false });

async function main() {
  console.log('Adding faktor column to SectionRequest...');
  await sql`
    ALTER TABLE "SectionRequest"
    ADD COLUMN IF NOT EXISTS "faktor" VARCHAR(100) DEFAULT 'Safety';
  `;
  console.log('✓ Faktor column successfully created!');
  await sql.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

