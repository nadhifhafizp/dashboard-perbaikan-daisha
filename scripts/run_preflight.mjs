import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

async function run() {
  const q11 = await sql`
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    JOIN (VALUES
        ('User', ARRAY['id','username','password','name','role','seksi','description','createdAt','updatedAt','created_at','updated_at']),
        ('Section', ARRAY['id','name','nama','kode','colorName','badgeBg','textColor','borderColor','accentBorder','updatedAt']),
        ('DaishaCatalog', ARRAY['id','name','seksi','codePrefix','totalUnits','components','variants','createdAt','updatedAt','created_at','updated_at']),
        ('Daisha', ARRAY['id','nomor_daisha','nama_daisha','jenis','ukuran','seksi','last_condition','last_maintenance_date','last_repair_date','last_waktu_masuk','last_waktu_keluar','logs','created_at','updated_at']),
        ('MaintenanceLog', ARRAY['id','daisha_id','nomor_daisha','jenis_pekerjaan','kondisi','detail_kerusakan','tindakan','tanggal_pengerjaan','waktu_masuk','waktu_keluar','admin_id','catatan','created_at','updated_at']),
        ('Ticket', ARRAY['idTiket','noDaisha','namaPelapor','status','waktuMasuk','waktuSelesai','catatan','items','created_at','updated_at']),
        ('TicketDetail', ARRAY['idDetail','idTiket','komponen','gejala','qty','tindakan','id','created_at','updated_at']),
        ('SectionRequest', ARRAY['id','nomorRequest','nomorSurat','seksiPemohon','picPemohon','kontakPemohon','namaBarang','spesifikasi','jumlah','satuan','urgensi','catatan','status','flowStep','approvalToken','statusApprovalAtasanSeksi','emailAtasanSeksi','namaAtasanSeksi','emailMentorWorkshop','dibuatOleh','waktuDibuat','waktuUpdate','perihal','namaMachine','faktor','tujuan','alasan','kodeSeksi','drafter','foreman','keadaanSekarang','fotoSebelum','rencanaTindakan','fotoSesudah','targetHasil','penjelasanPelaksanaan','biayaEstimate','biayaActual','orangJamEstimate','orangJamActual','waktuEstimate','waktuActual','tglPelaksanaanEstimate','tglPelaksanaanActual','komentarEstimate','komentarActual','keputusan','keputusan8210','keputusan820','hasilCheck','hasilCheckPemohon','schedulePlanning','scheduleActual','alasanPending','alasanTolak','picBengkel','materials','namaManajerSeksi','emailManajerSeksi','statusApprovalManajerSeksi','ttdManajerSeksi','waktuApprovalManajerSeksi','catatanManajerSeksi','ttdAtasanSeksi','waktuApprovalAtasanSeksi','catatanAtasanSeksi','ttdAdminWorkshop','catatanAdmin','ttdDrafter','ttdSpvWorkshop','ttdAtasanSpecialProject','statusApprovalAtasanSpecialProject','waktuApprovalAtasanSpecialProject','estimasi','waktuSelesai','created_at','updated_at','kebutuhanSparepart','kebutuhanMaterial']),
        ('SectionRequestMaterial', ARRAY['id','requestId','namaKomponen','spesifikasi','jumlah','satuan','keterangan','namaBarang','created_at','updated_at']),
        ('SectionRequestNotification', ARRAY['id','requestId','nomorRequest','targetRole','targetEmail','targetUser','tipe','judul','pesan','link','isRead','waktu']),
        ('Sparepart', ARRAY['id','namaKomponen','kategori','stokGudang','satuan','minStok','lokasi','logs','created_at','updated_at']),
        ('SparepartLog', ARRAY['id','namaKomponen','aksi','jumlah','user','catatan','tipe','qty','referensi','keterangan','tanggal','created_at','updated_at']),
        ('PmStaging', ARRAY['id','seksi','units','lokasi','catatan','pelapor','status','createdAt','pickedUpAt','completedAt'])
    ) k(t, cols) ON c.table_name = k.t
    WHERE c.table_schema = 'public' AND NOT (c.column_name = ANY (k.cols));
  `;
  console.log('Unmapped columns count:', q11.length);
  if (q11.length > 0) {
    console.log(q11);
  } else {
    console.log('✅ SEMUA KOLOM 100% TERPETAKAN! Safeguard migration PASSED!');
  }
  await sql.end();
}
run().catch(console.error);
