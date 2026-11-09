-- 00_preflight.sql — HANYA MEMBACA. Jalankan dulu; hasilnya menentukan apakah migrasi aman.
-- 1) nilai status tiket (yang diizinkan: Open, Progress, Pending, Done, Scrap; 'Queue' otomatis jadi 'Open')
SELECT status, count(*) FROM "Ticket" GROUP BY 1 ORDER BY 2 DESC;
-- 2) nilai last_condition unit (RUSAK tetap RUSAK; selain itu jadi OK)
SELECT last_condition, count(*) FROM "Daisha" GROUP BY 1 ORDER BY 2 DESC;
-- 3) kode unit kembar setelah UPPER/TRIM (akan disatukan; yang terbaru dipakai)
SELECT upper(trim(nomor_daisha)) AS kode, count(*) FROM "Daisha" GROUP BY 1 HAVING count(*) > 1;
-- 4) tiket yang nomor daisha-nya tidak terdaftar (dibuatkan unit 'UNKNOWN')
SELECT DISTINCT upper(trim(t."noDaisha")) AS kode FROM "Ticket" t
WHERE NOT EXISTS (SELECT 1 FROM "Daisha" d WHERE upper(trim(d.nomor_daisha)) = upper(trim(t."noDaisha")));
-- 5) nama jenis katalog kembar (case-insensitive) -> HARUS 0 baris
SELECT lower(name), count(*) FROM "DaishaCatalog" GROUP BY 1 HAVING count(*) > 1;
-- 6) bentuk JSON items tiket (diharapkan array; string juga ditangani)
SELECT jsonb_typeof(items) AS bentuk, count(*) FROM "Ticket" GROUP BY 1;
-- 7) log sparepart yatim (nama komponen sudah tidak ada di Sparepart) -> TETAP dimigrasi (sparepart_id NULL)
SELECT count(*) AS log_yatim FROM "SparepartLog" l
WHERE NOT EXISTS (SELECT 1 FROM "Sparepart" s WHERE s."namaKomponen" = l."namaKomponen");
-- 8) kolom SectionRequest di database live (semua otomatis masuk ke kolom 'form' / request_approval)
SELECT column_name FROM information_schema.columns WHERE table_name = 'SectionRequest' ORDER BY ordinal_position;
-- 9) elemen 'materials' yang berupa string JSON (ditangani; hanya info). Harus bisa di-parse sebagai JSON
SELECT count(*) AS elemen_string FROM "SectionRequest" r, jsonb_array_elements(CASE WHEN jsonb_typeof(r.materials)='array' THEN r.materials ELSE '[]'::jsonb END) e
WHERE jsonb_typeof(e) = 'string';
-- 10) Sparepart.logs JSONB yang berisi data (tidak dibawa; tetap utuh di legacy_v1). Info saja.
SELECT count(*) AS sparepart_dengan_logs_json FROM "Sparepart" WHERE jsonb_typeof(logs) = 'array' AND jsonb_array_length(logs) > 0;
-- 11) KOLOM YANG BELUM PUNYA TUJUAN di skema baru -> HARUS 0 baris (jika ada, kirim hasilnya agar ditambahkan)
--     (daftar yang sama dipakai sebagai pengaman otomatis di 02_migrasi_data.sql)
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
