import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, {
  max: 2,
  idle_timeout: 5,
  connect_timeout: 10,
  ssl: 'require',
});

async function main() {
  console.log('🗑️  Memulai proses penghapusan data dummy kemarin...');

  try {
    await sql.begin(async (tx) => {
      // 1. Tiket Perbaikan Demo (Ticket & TicketDetail)
      const deletedDetails = await tx`
        DELETE FROM "TicketDetail"
        WHERE "idTiket" LIKE 'DEMO-%'
        RETURNING "idTiket";
      `;
      const deletedTickets = await tx`
        DELETE FROM "Ticket"
        WHERE "idTiket" LIKE 'DEMO-%'
        RETURNING "idTiket";
      `;
      console.log(`✅ Berhasil menghapus ${deletedTickets.length} tiket demo dan ${deletedDetails.length} detail tiket.`);

      // 2. PmStaging Demo
      const deletedStaging = await tx`
        DELETE FROM "PmStaging"
        WHERE "catatan" LIKE '%[DEMO]%'
        RETURNING "id", "seksi";
      `;
      console.log(`✅ Berhasil menghapus ${deletedStaging.length} antrean penjemputan PM demo (PmStaging).`);

      // 3. SectionRequest & SectionRequestMaterial Demo
      const deletedReqMaterials = await tx`
        DELETE FROM "SectionRequestMaterial"
        WHERE "namaBarang" LIKE '%[DEMO]%' 
           OR "requestId" IN (SELECT "id" FROM "SectionRequest" WHERE "nomorRequest" LIKE 'REQ-2026-%')
        RETURNING "id";
      `;
      const deletedRequests = await tx`
        DELETE FROM "SectionRequest"
        WHERE "nomorRequest" LIKE 'REQ-2026-%'
        RETURNING "nomorRequest";
      `;
      console.log(`✅ Berhasil menghapus ${deletedRequests.length} request seksi demo dan ${deletedReqMaterials.length} material request.`);

      // 4. MaintenanceLog Demo & Reset Unit Daisha Terkait
      const affectedUnits = await tx`
        SELECT DISTINCT "daisha_id"
        FROM "MaintenanceLog"
        WHERE "catatan" = 'Inspeksi berkala tahunan tim maintenance workshop';
      `;

      if (affectedUnits.length > 0) {
        const unitIds = affectedUnits.map(u => u.daisha_id);
        const resetDaisha = await tx`
          UPDATE "Daisha"
          SET 
            last_maintenance_date = NULL,
            last_condition = 'UNKNOWN',
            last_waktu_masuk = NULL,
            last_waktu_keluar = NULL,
            updated_at = NOW()
          WHERE "id" IN ${tx(unitIds)}
          RETURNING "id";
        `;
        console.log(`✅ Berhasil mereset status PM pada ${resetDaisha.length} unit Daisha yang sebelumnya diupdate oleh log demo.`);
      }

      const deletedLogs = await tx`
        DELETE FROM "MaintenanceLog"
        WHERE "catatan" = 'Inspeksi berkala tahunan tim maintenance workshop'
        RETURNING "id";
      `;
      console.log(`✅ Berhasil menghapus ${deletedLogs.length} catatan log PM demo (MaintenanceLog).`);

      // 5. Sparepart Demo yang di-seed kemarin
      const demoPartNames = [
        'Roda Kestor 6" PU Swivel (Heavy Duty)',
        'Bearing 6204-2RS Nachi Japan',
        'Roda Kestor 8" PU Rigid (Beban Berat)',
        'Pin Pengunci Stopper Daisha (Baja)',
        'Plat Kunci Pengait B-Truck 4mm',
        'Baut Hex M10 x 30mm SS 304 Grade 8.8',
        'Kawat Las Kobelco LB-52 3.2mm',
        'Cat Epoxy Red Bridgestone 5 Kg',
        'Handle Rubber Grip Ergonomis Daisha',
      ];

      const deletedParts = await tx`
        DELETE FROM "Sparepart"
        WHERE "namaKomponen" IN ${tx(demoPartNames)}
        RETURNING "namaKomponen";
      `;
      console.log(`✅ Berhasil menghapus ${deletedParts.length} master item suku cadang demo (Sparepart).`);
    });

    console.log('\n🎉 SEMUA DATA DUMMY KEMARIN BERHASIL DIHAPUS DARI DATABASE!');
  } catch (err) {
    console.error('❌ Gagal menghapus data dummy:', err);
  } finally {
    await sql.end({ timeout: 5 });
    process.exit(0);
  }
}

main();
