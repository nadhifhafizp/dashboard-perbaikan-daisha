import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

async function main() {
  console.log('🔄 Memulai proses reset seluruh data Preventive Maintenance (PM)...');

  await sql.begin(async (tx) => {
    // 1. Hapus semua log PM rutin (jenis_pekerjaan = 'RUTIN')
    const deletedPmLogs = await tx`
      DELETE FROM "MaintenanceLog"
      WHERE jenis_pekerjaan = 'RUTIN'
      RETURNING id;
    `;
    console.log(`✅ Berhasil menghapus ${deletedPmLogs.length} catatan log PM rutin di MaintenanceLog.`);

    // 2. Hapus semua antrean penjemputan PM di PmStaging
    const deletedStaging = await tx`
      DELETE FROM "PmStaging"
      RETURNING id;
    `;
    console.log(`✅ Berhasil menghapus ${deletedStaging.length} antrean penjemputan di PmStaging.`);

    // 3. Hapus seluruh notifikasi terkait PM
    const deletedNotifs = await tx`
      DELETE FROM "SectionRequestNotification"
      WHERE "tipe" LIKE 'PM_%'
      RETURNING id;
    `;
    console.log(`✅ Berhasil menghapus ${deletedNotifs.length} notifikasi penjemputan & servis PM.`);

    // 4. Reset status PM pada seluruh armada Daisha
    const resetDaisha = await tx`
      UPDATE "Daisha"
      SET 
        "last_maintenance_date" = NULL,
        "last_waktu_masuk" = NULL,
        "last_waktu_keluar" = NULL,
        "last_condition" = CASE 
          WHEN "last_repair_date" IS NOT NULL THEN "last_condition" 
          ELSE 'OK' 
        END,
        "updated_at" = NOW()
      WHERE "last_maintenance_date" IS NOT NULL
      RETURNING id;
    `;
    console.log(`✅ Berhasil mereset tanggal maintenance terakhir (last_maintenance_date = NULL) pada ${resetDaisha.length} unit Daisha.`);
  });

  console.log('✨ Selesai! Seluruh data PM telah di-reset ke kondisi awal (0 unit PM).');
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Gagal mereset data PM:', err);
  process.exit(1);
});
