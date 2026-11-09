-- 30_verify.sql : bukti bahwa tidak ada data yang hilang. Hanya membaca, aman dijalankan kapan saja.

-- A. Jumlah baris lama vs baru. Kolom "selisih" HARUS 0.
SELECT cek, lama, baru, baru - lama AS selisih FROM (
  SELECT 'User -> TWMSUsers' AS cek, (SELECT count(*) FROM public."User") AS lama, (SELECT count(*) FROM v2."TWMSUsers") AS baru
  UNION ALL SELECT 'Daisha -> TWMSDaishaCatalog (tanpa unit penampung, MasterDaisha dicek di bagian J)',
     (SELECT count(*) FROM public."Daisha"),
     (SELECT count(*) FROM v2."TWMSDaishaCatalog" WHERE NOT (NOT "IsActive" AND "DaishaType" = '(TIDAK TERDAFTAR)') AND COALESCE("UnitCategory",'') <> 'MasterDaisha')
  UNION ALL SELECT 'Ticket -> TWMSRepairTicket', (SELECT count(*) FROM public."Ticket"), (SELECT count(*) FROM v2."TWMSRepairTicket")
  UNION ALL SELECT 'MaintenanceLog -> TWMSMaintenanceLog (PM)', (SELECT count(*) FROM public."MaintenanceLog"),
     (SELECT count(*) FROM v2."TWMSMaintenanceLog" WHERE "RecordType" = 'PM')
  UNION ALL SELECT 'PmStaging.units -> TWMSMaintenanceLog (STAGING)',
     (SELECT count(*) FROM (SELECT DISTINCT p.id, upper(trim(u.val)) FROM public."PmStaging" p,
        LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.units)='array' THEN p.units ELSE '[]'::jsonb END) u(val)
        WHERE trim(u.val) <> '') x),
     (SELECT count(*) FROM v2."TWMSMaintenanceLog" WHERE "RecordType" = 'STAGING')
  UNION ALL SELECT 'SectionRequest -> TWMSSectionRequest', (SELECT count(*) FROM public."SectionRequest"), (SELECT count(*) FROM v2."TWMSSectionRequest")
  UNION ALL SELECT 'Sparepart -> TWMSSparepartMaster', (SELECT count(*) FROM public."Sparepart"), (SELECT count(*) FROM v2."TWMSSparepartMaster")
  UNION ALL SELECT 'SparepartLog -> TWMSSparepartLog', (SELECT count(*) FROM public."SparepartLog"), (SELECT count(*) FROM v2."TWMSSparepartLog")
) t ORDER BY cek;

-- B. Total stok harus sama
SELECT (SELECT COALESCE(sum("stokGudang"),0) FROM public."Sparepart") AS stok_lama,
       (SELECT COALESCE(sum("CurrentStock"),0) FROM v2."TWMSSparepartMaster") AS stok_baru;

-- C. Rincian tiket: elemen items JSONB (+ TicketDetail lama untuk tiket yang items-nya kosong) = baris rincian baru
SELECT (SELECT COALESCE(sum(CASE WHEN jsonb_typeof(items)='array' THEN jsonb_array_length(items) ELSE 0 END),0) FROM public."Ticket") AS elemen_items_lama,
       (SELECT count(*) FROM public."TicketDetail" td WHERE NOT EXISTS (
          SELECT 1 FROM public."Ticket" t WHERE t."idTiket"=td."idTiket" AND jsonb_typeof(t.items)='array' AND jsonb_array_length(t.items)>0)) AS detail_cadangan_lama,
       (SELECT count(*) FROM v2."TWMSRepairTicketDetail") AS rincian_baru;

-- D. Material pengajuan
SELECT (SELECT count(*) FROM v2."TWMSSectionRequestMaterial") AS material_baru,
       (SELECT count(*) FROM public."SectionRequestMaterial") AS tabel_material_lama;
-- pengajuan yang jumlah elemen JSONB-nya tidak sama dengan baris baru (kosong = bagus)
SELECT r.id, r."nomorRequest", jsonb_array_length(r.materials) AS jml_elemen,
       (SELECT count(*) FROM v2."TWMSSectionRequestMaterial" m WHERE m."RequestId" = r.id) AS jml_baru
FROM public."SectionRequest" r
WHERE jsonb_typeof(r.materials)='array'
  AND jsonb_array_length(r.materials) <> (SELECT count(*) FROM v2."TWMSSectionRequestMaterial" m WHERE m."RequestId" = r.id)
  AND NOT EXISTS (SELECT 1 FROM public."SectionRequestMaterial" x WHERE x."requestId" = r.id);

-- E. Katalog kerusakan: gejala/komponen di JSONB vs baris baru (selisih > 0 hanya jika ada duplikat nama di JSONB)
SELECT (SELECT count(*) FROM public."DaishaCatalog" c,
          LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.components)='array' THEN c.components ELSE '[]'::jsonb END) x,
          LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(x->'symptoms')='array' THEN x->'symptoms' ELSE '[]'::jsonb END) s
        WHERE COALESCE(trim(s->>'description'),'') <> '') AS gejala_lama,
       (SELECT count(*) FROM v2."TWMSDamageCatalog" WHERE "SymptomDesc" IS NOT NULL) AS gejala_baru,
       (SELECT count(*) FROM public."DaishaCatalog") AS jenis_lama,
       (SELECT count(DISTINCT lower("DaishaType")) FROM v2."TWMSDamageCatalog") AS jenis_baru;

-- F. Kesesuaian isi kolom penting (harus SAMA di kedua sisi)
SELECT 'tanda tangan atasan seksi'  AS kolom, (SELECT count("ttdAtasanSeksi") FROM public."SectionRequest")        AS lama, (SELECT count("SectionHeadSignature") FROM v2."TWMSSectionRequest") AS baru
UNION ALL SELECT 'tanda tangan workshop',     (SELECT count("ttdAdminWorkshop") FROM public."SectionRequest"),      (SELECT count("WorkshopSignature") FROM v2."TWMSSectionRequest")
UNION ALL SELECT 'tanda tangan special project', (SELECT count("ttdAtasanSpecialProject") FROM public."SectionRequest"), (SELECT count("SpecialProjectSignature") FROM v2."TWMSSectionRequest")
UNION ALL SELECT 'biaya estimasi',            (SELECT count("biayaEstimate") FROM public."SectionRequest"),          (SELECT count("EstCost") FROM v2."TWMSSectionRequest")
UNION ALL SELECT 'biaya aktual',              (SELECT count("biayaActual") FROM public."SectionRequest"),            (SELECT count("ActCost") FROM v2."TWMSSectionRequest")
UNION ALL SELECT 'approvalToken',             (SELECT count("approvalToken") FROM public."SectionRequest"),          (SELECT count("ApprovalToken") FROM v2."TWMSSectionRequest")
UNION ALL SELECT 'foto sebelum',              (SELECT count("fotoSebelum") FROM public."SectionRequest"),            (SELECT count("PhotoBefore") FROM v2."TWMSSectionRequest")
UNION ALL SELECT 'foto sesudah',              (SELECT count("fotoSesudah") FROM public."SectionRequest"),            (SELECT count("PhotoAfter") FROM v2."TWMSSectionRequest");

-- G. Pekerjaan perapian (angka BUKAN syarat 0; teks aslinya tetap tersimpan)
SELECT 'tiket pada unit penampung'            AS cek, count(*) AS jumlah FROM v2."TWMSRepairTicket" t JOIN v2."TWMSDaishaCatalog" u ON u."UnitCode" = t."UnitCode" WHERE NOT u."IsActive"
UNION ALL SELECT 'antrean PM pada unit penampung',        count(*) FROM v2."TWMSMaintenanceLog" m JOIN v2."TWMSDaishaCatalog" u ON u."UnitCode" = m."UnitCode" WHERE NOT u."IsActive"
UNION ALL SELECT 'rincian tiket tanpa DamageCatalogId',   count(*) FROM v2."TWMSRepairTicketDetail" WHERE "DamageCatalogId" IS NULL
UNION ALL SELECT 'material SPAREPART tanpa SparepartId',  count(*) FROM v2."TWMSSectionRequestMaterial" WHERE "MaterialType" = 'SPAREPART' AND "SparepartId" IS NULL
UNION ALL SELECT 'log sparepart tanpa SparepartId',       count(*) FROM v2."TWMSSparepartLog" WHERE "SparepartId" IS NULL
UNION ALL SELECT 'unit tanpa SectionName (aktif)',        count(*) FROM v2."TWMSDaishaCatalog" WHERE "SectionName" IS NULL AND "IsActive"
UNION ALL SELECT 'USER_SEKSI tanpa SectionName',          count(*) FROM v2."TWMSUsers" WHERE "Role" = 'USER_SEKSI' AND "SectionName" IS NULL;

-- H. Kolom yang dibuang harus identik dengan hasil relasi (harus 0 baris)
SELECT m.id, m.nomor_daisha AS nomor_di_log_lama, u."UnitCode" AS unit_baru
FROM public."MaintenanceLog" m
JOIN public."Daisha" d ON d.id = m.daisha_id
LEFT JOIN v2."TWMSDaishaCatalog" u ON u."UnitCode" = d.nomor_daisha
WHERE m.nomor_daisha IS DISTINCT FROM u."UnitCode";

-- I. Antrean PM lama yang tidak punya satu pun unit (barisnya tidak punya tempat di tabel baru) - HARUS 0 baris
SELECT p.id, p.seksi, p.lokasi, p.units FROM public."PmStaging" p
WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.units)='array' THEN p.units ELSE '[]'::jsonb END) u(val) WHERE trim(u.val) <> '');

-- J. Unit di MasterDaisha lama yang belum tersalin (harus 0). DO-block agar tidak error bila tabelnya tidak ada.
DO $$
DECLARE n int;
BEGIN
  IF to_regclass('public."MasterDaisha"') IS NOT NULL THEN
    EXECUTE $q$ SELECT count(*) FROM public."MasterDaisha" m
                WHERE COALESCE(trim(m."noDaisha"), '') NOT IN ('', '-')
                  AND NOT EXISTS (SELECT 1 FROM v2."TWMSDaishaCatalog" d WHERE upper(trim(d."UnitCode")) = upper(trim(m."noDaisha"))) $q$ INTO n;
    RAISE NOTICE 'MasterDaisha yang belum tersalin: %', n;
  ELSE
    RAISE NOTICE 'Tabel MasterDaisha tidak ada - dilewati';
  END IF;
END $$;

-- K. Nilai yang ada (untuk menyusun CHECK constraint nanti)
SELECT 'ticket.Status' AS kolom, "Status" AS nilai, count(*) FROM v2."TWMSRepairTicket" GROUP BY 2
UNION ALL SELECT 'maintenance.StagingStatus', "StagingStatus", count(*) FROM v2."TWMSMaintenanceLog" GROUP BY 2
UNION ALL SELECT 'sparepartlog.MovementType', "MovementType", count(*) FROM v2."TWMSSparepartLog" GROUP BY 2
ORDER BY 1, 3 DESC;
