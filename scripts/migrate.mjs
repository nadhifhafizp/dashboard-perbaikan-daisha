/**
 * scripts/migrate.mjs — Skrip Migrasi Skema Database Terpusat & Idempoten
 * 
 * Menggabungkan seluruh migrasi maintenance v1, v2, form SectionRequest resmi,
 * dan sinkronisasi sequence database menjadi 1 eksekusi terstandar.
 */
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable wajib diisi.');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function migrate() {
  console.log('🚀 Memulai migrasi database terpusat...');

  try {
    // 0. Eksekusi Baseline Skema Utuh (F6.1 & F6.2)
    const baselinePath = path.join(__dirname, 'migrations', '000_baseline.sql');
    if (fs.existsSync(baselinePath)) {
      console.log('🏛️ [0/5] Mengeksekusi DDL baseline "000_baseline.sql"...');
      const baselineSql = fs.readFileSync(baselinePath, 'utf8');
      await sql.unsafe(baselineSql);
      console.log('   ✓ Seluruh tabel inti, relasi, dan indeks terverifikasi.');
    }

    // 1. Tabel Daisha (Master Armada)
    console.log('📦 [1/5] Memeriksa & memverifikasi kolom "Daisha"...');
    await sql`
      CREATE TABLE IF NOT EXISTS "Daisha" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "nomor_daisha" TEXT UNIQUE NOT NULL,
        "nama_daisha" TEXT,
        "jenis" TEXT NOT NULL,
        "ukuran" TEXT NOT NULL,
        "seksi" TEXT,
        "last_condition" TEXT DEFAULT 'OK',
        "last_maintenance_date" TIMESTAMPTZ,
        "last_repair_date" TIMESTAMPTZ,
        "last_waktu_masuk" TIMESTAMPTZ,
        "last_waktu_keluar" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT now(),
        "updated_at" TIMESTAMPTZ DEFAULT now()
      )
    `;

    // Pastikan kolom baru di tabel Daisha tersedia
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "nama_daisha" TEXT`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "seksi" TEXT`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_condition" TEXT DEFAULT 'OK'`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_repair_date" TIMESTAMPTZ`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_waktu_masuk" TIMESTAMPTZ`;
    await sql`ALTER TABLE "Daisha" ADD COLUMN IF NOT EXISTS "last_waktu_keluar" TIMESTAMPTZ`;

    // 2. Tabel MaintenanceLog (Riwayat PM & Servis)
    console.log('📋 [2/5] Memeriksa & membuat tabel "MaintenanceLog"...');
    await sql`
      CREATE TABLE IF NOT EXISTS "MaintenanceLog" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "daisha_id" UUID NOT NULL REFERENCES "Daisha"("id") ON DELETE CASCADE,
        "nomor_daisha" TEXT NOT NULL,
        "jenis_pekerjaan" TEXT NOT NULL,
        "kondisi" TEXT DEFAULT 'OK',
        "detail_kerusakan" TEXT,
        "tindakan" TEXT,
        "tanggal_pengerjaan" TIMESTAMPTZ NOT NULL,
        "waktu_masuk" TIMESTAMPTZ,
        "waktu_keluar" TIMESTAMPTZ,
        "admin_id" TEXT,
        "catatan" TEXT,
        "created_at" TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "kondisi" TEXT DEFAULT 'OK'`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "detail_kerusakan" TEXT`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "tindakan" TEXT`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "waktu_masuk" TIMESTAMPTZ`;
    await sql`ALTER TABLE "MaintenanceLog" ADD COLUMN IF NOT EXISTS "waktu_keluar" TIMESTAMPTZ`;

    // 3. Kolom Formulir Resmi SectionRequest
    console.log('📝 [3/5] Memperbarui kolom formulir resmi "SectionRequest"...');
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
        ADD COLUMN IF NOT EXISTS "alasanPending" TEXT
    `;

    // 4. Indeks Performa
    console.log('⚡ [4/5] Memeriksa & membuat indeks performa kueri...');
    await sql`CREATE INDEX IF NOT EXISTS "idx_daisha_jenis_ukuran" ON "Daisha"("jenis", "ukuran")`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_daisha_nomor" ON "Daisha"("nomor_daisha")`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_maintenance_log_daisha" ON "MaintenanceLog"("daisha_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_maintenance_log_tanggal" ON "MaintenanceLog"("tanggal_pengerjaan")`;

    // 5. Sinkronisasi Sequence Primary Key
    console.log('🔄 [5/5] Sinkronisasi urutan sequence tabel auto-increment...');
    const tables = [
      { table: 'TicketDetail', col: 'idDetail' },
      { table: 'DaishaComponent', col: 'id' },
      { table: 'DaishaSymptom', col: 'id' },
      { table: 'DaishaType', col: 'id' },
      { table: 'DaishaVariant', col: 'id' },
      { table: 'Section', col: 'id' },
      { table: 'SectionRequest', col: 'id' },
      { table: 'SectionRequestMaterial', col: 'id' },
      { table: 'SparepartLog', col: 'id' },
      { table: 'User', col: 'id' },
    ];

    for (const { table, col } of tables) {
      try {
        const quotedTable = `"${table}"`;
        const seqName = await sql`
          SELECT pg_get_serial_sequence(${quotedTable}, ${col}) as seq
        `;
        const seq = seqName[0]?.seq;

        if (seq) {
          const maxValResult = await sql`
            SELECT COALESCE(MAX(${sql(col)}), 0)::bigint as max_val FROM ${sql(table)}
          `;
          const maxVal = Number(maxValResult[0].max_val);
          const nextVal = maxVal > 0 ? maxVal : 1;

          await sql`
            SELECT setval(${seq}::regclass, ${nextVal}, true)
          `;
          console.log(`   ✓ Synced sequence ${seq} -> ${nextVal}`);
        }
      } catch (err) {
        // Table or sequence may not exist yet, safe to skip with notice
        console.log(`   - Sequence check for ${table}.${col}: lewati`);
      }
    }

    console.log('✅ Migrasi skema database berhasil diselesaikan secara utuh!');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat migrasi:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
