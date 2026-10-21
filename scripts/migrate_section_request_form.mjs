import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function migrate() {
  console.log('--- Migrating SectionRequest table with official form fields ---');
  
  await sql`
    ALTER TABLE "SectionRequest"
      ADD COLUMN IF NOT EXISTS "perihal" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "namaMachine" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "tujuan" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "alasan" TEXT,
      ADD COLUMN IF NOT EXISTS "kodeSeksi" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "drafter" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "foreman" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "keadaanSekarang" TEXT,
      ADD COLUMN IF NOT EXISTS "fotoSebelum" TEXT,
      ADD COLUMN IF NOT EXISTS "rencanaTindakan" TEXT,
      ADD COLUMN IF NOT EXISTS "fotoSesudah" TEXT,
      ADD COLUMN IF NOT EXISTS "targetHasil" TEXT,
      ADD COLUMN IF NOT EXISTS "penjelasanPelaksanaan" TEXT,
      ADD COLUMN IF NOT EXISTS "biayaEstimate" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "biayaActual" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "orangJamEstimate" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "orangJamActual" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "waktuEstimate" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "waktuActual" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "tglPelaksanaanEstimate" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "tglPelaksanaanActual" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "komentarEstimate" TEXT,
      ADD COLUMN IF NOT EXISTS "komentarActual" TEXT,
      ADD COLUMN IF NOT EXISTS "keputusan" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "keputusan8210" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "keputusan820" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "hasilCheck" TEXT,
      ADD COLUMN IF NOT EXISTS "hasilCheckPemohon" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "schedulePlanning" TEXT,
      ADD COLUMN IF NOT EXISTS "scheduleActual" TEXT,
      ADD COLUMN IF NOT EXISTS "alasanPending" TEXT;
  `;

  console.log('Migration executed successfully!');

  const srCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'SectionRequest'
    ORDER BY ordinal_position
  `;
  console.log('Updated SectionRequest columns:', srCols.map(c => `${c.column_name} (${c.data_type})`));

  await sql.end();
}

migrate().catch(console.error);
