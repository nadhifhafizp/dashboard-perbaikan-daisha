import postgres from 'postgres';
import fs from 'fs';

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  for (const line of content.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    }
  }
}

const sql = postgres(dbUrl, { ssl: 'require', max: 2 });

async function syncTwoDoors() {
  console.log('🔄 Memulai Sinkronisasi 2 Pintu PM Daisha (PM Rutin + Perbaikan Daisha)...');

  try {
    // 1. PINTU 2: Sinkronisasi dari Tiket Perbaikan Selesai (status = 'Done')
    // Update master Daisha berdasarkan noDaisha yang cocok (langsung atau tanpa spasi)
    const updateRepair = await sql`
      WITH done_agg AS (
        SELECT 
          "noDaisha",
          MAX("waktuSelesai") AS max_selesai,
          MAX("waktuMasuk") AS max_masuk
        FROM "Ticket"
        WHERE status = 'Done' 
          AND "noDaisha" IS NOT NULL 
          AND "noDaisha" != ''
        GROUP BY "noDaisha"
      )
      UPDATE "Daisha" d
      SET 
        "last_maintenance_date" = COALESCE(
          GREATEST(d."last_maintenance_date", da.max_selesai),
          da.max_selesai,
          now()
        ),
        "last_repair_date" = COALESCE(
          GREATEST(d."last_repair_date", da.max_selesai),
          da.max_selesai,
          now()
        ),
        "last_waktu_masuk" = COALESCE(d."last_waktu_masuk", da.max_masuk),
        "last_waktu_keluar" = COALESCE(
          GREATEST(d."last_waktu_keluar", da.max_selesai),
          da.max_selesai,
          now()
        ),
        "last_condition" = CASE 
          WHEN d."last_condition" IS NULL OR d."last_condition" = 'OK' THEN 'REPAIR_DONE'
          ELSE d."last_condition"
        END,
        "updated_at" = now()
      FROM done_agg da
      WHERE UPPER(TRIM(d."nomor_daisha")) = UPPER(TRIM(da."noDaisha"))
         OR REPLACE(UPPER(d."nomor_daisha"), ' ', '') = REPLACE(UPPER(da."noDaisha"), ' ', '')
      RETURNING d.id, d.nomor_daisha
    `;

    console.log(`✅ Pintu 2 (Perbaikan Daisha): Berhasil mensinkronkan ${updateRepair.length} unit Daisha dari tiket selesai.`);

    // 2. PINTU 1: Sinkronisasi dari MaintenanceLog (PM Rutin & Servis)
    const updateMaint = await sql`
      WITH log_agg AS (
        SELECT 
          nomor_daisha,
          MAX(tanggal_pengerjaan) AS max_tgl,
          MAX(waktu_keluar) AS max_keluar,
          MAX(kondisi) AS last_kon
        FROM "MaintenanceLog"
        WHERE nomor_daisha IS NOT NULL AND nomor_daisha != ''
        GROUP BY nomor_daisha
      )
      UPDATE "Daisha" d
      SET 
        "last_maintenance_date" = COALESCE(
          GREATEST(d."last_maintenance_date", la.max_tgl),
          la.max_tgl
        ),
        "last_condition" = COALESCE(la.last_kon, d."last_condition", 'OK'),
        "updated_at" = now()
      FROM log_agg la
      WHERE UPPER(TRIM(d."nomor_daisha")) = UPPER(TRIM(la.nomor_daisha))
         OR REPLACE(UPPER(d."nomor_daisha"), ' ', '') = REPLACE(UPPER(la.nomor_daisha), ' ', '')
      RETURNING d.id, d.nomor_daisha
    `;

    console.log(`✅ Pintu 1 (PM Rutin & Maintenance Log): Berhasil mensinkronkan ${updateMaint.length} unit Daisha.`);

    // 3. Verifikasi jumlah unit Daisha yang sekarang memiliki last_maintenance_date
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const countMaintainedTotal = await sql`
      SELECT count(*)::int as count 
      FROM "Daisha" 
      WHERE "last_maintenance_date" IS NOT NULL
    `;
    const countMaintainedThisYear = await sql`
      SELECT count(*)::int as count 
      FROM "Daisha" 
      WHERE "last_maintenance_date" >= ${startOfYear}
    `;

    console.log(`📊 Total Unit Daisha Maintained: ${countMaintainedTotal[0].count}`);
    console.log(`📊 Total Unit Daisha Maintained Tahun ${currentYear}: ${countMaintainedThisYear[0].count}`);

  } catch (err) {
    console.error('❌ Gagal sinkronisasi:', err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

syncTwoDoors();
