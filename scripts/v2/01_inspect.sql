-- 01_inspect.sql : audit kondisi database LIVE sebelum migrasi. Hanya SELECT (aman).

-- 1. Struktur tabel yang sebenarnya ada (bandingkan dengan 000_baseline.sql; skema live bisa menyimpang)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Jumlah baris per tabel
SELECT relname AS tabel, n_live_tup AS perkiraan_baris
FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY relname;

-- 3. Seksi yang ditulis berbeda huruf besar/kecil atau spasi (akan disatukan otomatis ke 1 nama baku)
SELECT lower(trim(seksi)) AS kunci, array_agg(DISTINCT seksi) AS variasi_penulisan
FROM (SELECT seksi FROM public."Daisha" UNION ALL SELECT seksi FROM public."User"
      UNION ALL SELECT seksi FROM public."DaishaCatalog" UNION ALL SELECT "seksiPemohon" FROM public."SectionRequest"
      UNION ALL SELECT seksi FROM public."PmStaging") x
WHERE seksi IS NOT NULL AND trim(seksi) <> ''
GROUP BY 1 HAVING count(DISTINCT seksi) > 1;

-- 4. Nomor Daisha kembar bila huruf besar/kecil & spasi diabaikan (idealnya 0 baris; bila ada, putuskan mana yang dipakai)
SELECT upper(trim(nomor_daisha)), array_agg(nomor_daisha), count(*) FROM public."Daisha" GROUP BY 1 HAVING count(*) > 1;

-- 5. Tiket dan antrean PM yang kode unitnya tidak ada di master (akan ditampung di unit penampung, IsActive = false)
SELECT 'tiket' AS sumber, t."idTiket" AS rujukan, t."noDaisha" AS kode_unit FROM public."Ticket" t
WHERE NOT EXISTS (SELECT 1 FROM public."Daisha" d WHERE upper(trim(d.nomor_daisha)) = upper(trim(t."noDaisha")))
UNION ALL
SELECT 'antrean PM', p.id::text, u.val FROM public."PmStaging" p
CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.units)='array' THEN p.units ELSE '[]'::jsonb END) u(val)
WHERE trim(u.val) <> '' AND NOT EXISTS (SELECT 1 FROM public."Daisha" d WHERE upper(trim(d.nomor_daisha)) = upper(trim(u.val)));

-- 6. Antrean PM yang tidak punya satu pun unit (barisnya tidak punya tempat di tabel baru). Harus 0 baris.
SELECT p.id, p.seksi, p.lokasi, p.units FROM public."PmStaging" p
WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.units)='array' THEN p.units ELSE '[]'::jsonb END) u(val) WHERE trim(u.val) <> '');

-- 7. Bentuk JSONB yang tidak standar (materials / items / units / components). Elemen bertipe 'string' tetap diproses, tipe lain dilewati.
SELECT 'materials' AS kolom, jsonb_typeof(materials) AS tipe, count(*) FROM public."SectionRequest" GROUP BY 2
UNION ALL SELECT 'items', jsonb_typeof(items), count(*) FROM public."Ticket" GROUP BY 2
UNION ALL SELECT 'units', jsonb_typeof(units), count(*) FROM public."PmStaging" GROUP BY 2
UNION ALL SELECT 'components', jsonb_typeof(components), count(*) FROM public."DaishaCatalog" GROUP BY 2;

-- 8. Nilai yang akan menjadi kandidat CHECK constraint
SELECT 'user.role' AS kolom, role AS nilai, count(*) FROM public."User" GROUP BY 2
UNION ALL SELECT 'ticket.status', status, count(*) FROM public."Ticket" GROUP BY 2
UNION ALL SELECT 'pm_staging.status', status, count(*) FROM public."PmStaging" GROUP BY 2
ORDER BY 1, 3 DESC;

-- 9. Panjang data terpanjang vs batas kolom baru. Kolom "melebihi" HARUS kosong (bila tidak, backfill akan berhenti dengan error panjang).
SELECT * FROM (
  SELECT 'Daisha.nomor_daisha -> UnitCode (50)' AS kolom, max(length(nomor_daisha)) AS terpanjang, 50 AS batas FROM public."Daisha"
  UNION ALL SELECT 'Daisha.ukuran -> SizeSpec (100)', max(length(ukuran)), 100 FROM public."Daisha"
  UNION ALL SELECT 'Daisha.jenis -> UnitCategory (100)', max(length(jenis)), 100 FROM public."Daisha"
  UNION ALL SELECT 'Daisha.nama_daisha -> DaishaType (150)', max(length(nama_daisha)), 150 FROM public."Daisha"
  UNION ALL SELECT 'Daisha.last_condition -> CurrentCondition (20)', max(length(last_condition)), 20 FROM public."Daisha"
  UNION ALL SELECT 'Ticket.idTiket -> TicketNo (50)', max(length("idTiket")), 50 FROM public."Ticket"
  UNION ALL SELECT 'Ticket.status -> Status (30)', max(length(status)), 30 FROM public."Ticket"
  UNION ALL SELECT 'User.username -> Username (100)', max(length(username)), 100 FROM public."User"
  UNION ALL SELECT 'User.role -> Role (20)', max(length(role)), 20 FROM public."User"
  UNION ALL SELECT 'SectionRequest.nomorRequest -> RequestNo (100)', max(length("nomorRequest")), 100 FROM public."SectionRequest"
  UNION ALL SELECT 'SectionRequest.tujuan -> RequestType (100)', max(length(tujuan)), 100 FROM public."SectionRequest"
  UNION ALL SELECT 'Sparepart.kategori -> Category (100)', max(length(kategori)), 100 FROM public."Sparepart"
  UNION ALL SELECT 'Sparepart.satuan -> Unit (50)', max(length(satuan)), 50 FROM public."Sparepart"
) x WHERE terpanjang > batas;

-- 10. Tabel lama yang ternyata berisi data walau kode memakai JSONB (menentukan apakah perlu disalin)
SELECT (SELECT count(*) FROM public."TicketDetail")            AS ticket_detail,
       (SELECT count(*) FROM public."SectionRequestMaterial")  AS section_request_material;

-- 11. Tabel yang tidak ada di baseline / dipakai kode secara tidak konsisten
SELECT to_regclass('public."MasterDaisha"')    IS NOT NULL AS masterdaisha_ada,
       to_regclass('public."PmStaging"')       IS NOT NULL AS pmstaging_ada,
       to_regclass('public."DaishaCatalog"')   IS NOT NULL AS daishacatalog_ada;
-- Jika masterdaisha_ada = true, lihat unit yang hanya ada di MasterDaisha (akan ikut disalin):
--   SELECT m.* FROM public."MasterDaisha" m
--   WHERE NOT EXISTS (SELECT 1 FROM public."Daisha" d WHERE upper(trim(d.nomor_daisha)) = upper(trim(m."noDaisha")));
