-- ============================================================================
-- 02_migrasi_data.sql — salin SEMUA data tabel lama ke skema baru (1 transaksi).
-- Tabel lama TIDAK diubah/dihapus. Jika ada satu pemeriksaan gagal -> otomatis ROLLBACK.
-- Jalankan SETELAH 01_schema_baru.sql dan saat aplikasi dalam mode maintenance.
-- Kolom yang bergeser/tidak tercatat di migrasi dibaca lewat to_jsonb(row)->>'kolom',
-- sehingga tetap aman walau kolom itu ada/tidak ada di database live.
-- ============================================================================
BEGIN;

-- 0. PENGAMAN: setiap kolom di tabel lama HARUS punya tujuan. Kolom yang belum terpetakan -> berhenti
DO $$
DECLARE bad text;
BEGIN
  SELECT string_agg(c.table_name || '.' || c.column_name, ', ' ORDER BY c.table_name, c.ordinal_position) INTO bad
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
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'Kolom ini ada di database tetapi belum punya tujuan di skema baru (kirim daftar ini agar ditambahkan): %', bad;
  END IF;
END $$;

-- 1. SECTION: gabungkan semua nama seksi dari seluruh tabel ------------------
INSERT INTO section (name, color_name, badge_bg, text_color, border_color, accent_border)
SELECT DISTINCT ON (lower(trim(n.name))) trim(n.name), n.c1, n.c2, n.c3, n.c4, n.c5
FROM (
  SELECT COALESCE(to_jsonb(s)->>'name', to_jsonb(s)->>'nama') AS name,
         to_jsonb(s)->>'colorName' AS c1, to_jsonb(s)->>'badgeBg' AS c2, to_jsonb(s)->>'textColor' AS c3,
         to_jsonb(s)->>'borderColor' AS c4, to_jsonb(s)->>'accentBorder' AS c5, 0 AS prio
  FROM "Section" s
  UNION ALL SELECT seksi,          NULL,NULL,NULL,NULL,NULL, 1 FROM "User"
  UNION ALL SELECT seksi,          NULL,NULL,NULL,NULL,NULL, 1 FROM "Daisha"
  UNION ALL SELECT seksi,          NULL,NULL,NULL,NULL,NULL, 1 FROM "DaishaCatalog"
  UNION ALL SELECT seksi,          NULL,NULL,NULL,NULL,NULL, 1 FROM "PmStaging"
  UNION ALL SELECT "seksiPemohon", NULL,NULL,NULL,NULL,NULL, 1 FROM "SectionRequest"
) n
WHERE nullif(trim(n.name), '') IS NOT NULL
ORDER BY lower(trim(n.name)), n.prio;      -- baris dari tabel Section (punya warna) diutamakan

-- 2. APP_USER -----------------------------------------------------------------
INSERT INTO app_user (id, username, password_hash, name, role, section_id, description, created_at, updated_at)
SELECT u.id, u.username, u.password, u.name, u.role, s.id, u.description,
       COALESCE(u."createdAt", now()), COALESCE(u."updatedAt", now())
FROM "User" u
LEFT JOIN section s ON lower(s.name) = lower(trim(u.seksi));

-- 3. KATALOG: daisha_type, daisha_variant, damage_catalog -------------------
INSERT INTO daisha_type (section_id, name, code_prefix)
SELECT s.id, c.name, nullif(c."codePrefix", '')
FROM "DaishaCatalog" c
LEFT JOIN section s ON lower(s.name) = lower(trim(c.seksi))
ORDER BY c.id;

-- tipe yang dipakai unit (Daisha.nama_daisha) tapi belum ada di katalog
INSERT INTO daisha_type (section_id, name)
SELECT DISTINCT ON (lower(trim(d.nama_daisha))) s.id, trim(d.nama_daisha)
FROM "Daisha" d
LEFT JOIN section s ON lower(s.name) = lower(trim(d.seksi))
WHERE nullif(trim(d.nama_daisha), '') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM daisha_type t WHERE lower(t.name) = lower(trim(d.nama_daisha)))
ORDER BY lower(trim(d.nama_daisha));

INSERT INTO daisha_variant (type_id, name, size, arrangement, kind, code_prefix, pad_length, min_number, max_number, badge_color)
SELECT DISTINCT ON (t.id, lower(v->>'name'), coalesce(v->>'codePrefix', ''))
       t.id, v->>'name', nullif(v->>'ukuran',''), nullif(v->>'susunan',''), nullif(v->>'tipe',''),
       nullif(v->>'codePrefix',''),
       COALESCE(nullif(v->>'padLength','')::numeric::smallint,
                length((regexp_match(v->>'rangeFormat', '(\d+)\s*$'))[1])::smallint),
       nullif(v->>'minNumber','')::numeric::int,
       nullif(v->>'maxNumber','')::numeric::int,
       nullif(v->>'badgeColor','')
FROM "DaishaCatalog" c
JOIN daisha_type t ON lower(t.name) = lower(c.name)
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(c.variants) = 'array' THEN c.variants ELSE '[]'::jsonb END) v
WHERE nullif(v->>'name','') IS NOT NULL;

INSERT INTO damage_catalog (type_id, component, symptom)
SELECT DISTINCT t.id, comp->>'name', nullif(trim(sym->>'description'), '')
FROM "DaishaCatalog" c
JOIN daisha_type t ON lower(t.name) = lower(c.name)
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(c.components) = 'array' THEN c.components ELSE '[]'::jsonb END) comp
LEFT JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(comp->'symptoms') = 'array' THEN comp->'symptoms' ELSE '[]'::jsonb END) sym ON true
WHERE nullif(comp->>'name','') IS NOT NULL;

-- 4. DAISHA (UPPER(TRIM(code)); jika ada duplikat setelah normalisasi, ambil yang terbaru)
INSERT INTO daisha (id, code, type_id, section_id, kind, size, condition, last_pm_at, created_at, updated_at)
SELECT DISTINCT ON (upper(trim(d.nomor_daisha)))
       d.id, upper(trim(d.nomor_daisha)), t.id, s.id, d.jenis, d.ukuran,
       CASE WHEN d.last_condition = 'RUSAK' THEN 'RUSAK' ELSE 'OK' END,   -- REPAIR_DONE & lainnya -> OK
       d.last_maintenance_date,
       COALESCE(d.created_at, now()), COALESCE(d.updated_at, now())
FROM "Daisha" d
LEFT JOIN section s      ON lower(s.name) = lower(trim(d.seksi))
LEFT JOIN daisha_type t  ON lower(t.name) = lower(trim(d.nama_daisha))
WHERE nullif(trim(d.nomor_daisha), '') IS NOT NULL
ORDER BY upper(trim(d.nomor_daisha)), d.updated_at DESC NULLS LAST;

-- (opsional) tabel MasterDaisha lama, jika masih ada di database
DO $$
BEGIN
  IF to_regclass('public."MasterDaisha"') IS NOT NULL THEN
    EXECUTE $q$
      INSERT INTO daisha (code, type_id, section_id, kind, size)
      SELECT DISTINCT ON (upper(trim(m."noDaisha")))
             upper(trim(m."noDaisha")), t.id, s.id, 'VERTICAL', COALESCE(nullif(m."ukuran",''), 'NONE')
      FROM "MasterDaisha" m
      LEFT JOIN section s     ON lower(s.name) = lower(trim(m."seksi"))
      LEFT JOIN daisha_type t ON lower(t.name) = lower(trim(m."namaDaisha"))
      WHERE nullif(trim(m."noDaisha"), '') IS NOT NULL AND trim(m."noDaisha") <> '-'
      ON CONFLICT (code) DO NOTHING
    $q$;
  END IF;
END $$;

-- unit "hantu": ada di tiket tetapi tidak pernah terdaftar di master
INSERT INTO daisha (code, kind, size)
SELECT DISTINCT upper(trim(t."noDaisha")), 'UNKNOWN', 'NONE'
FROM "Ticket" t
WHERE nullif(trim(t."noDaisha"), '') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM daisha d WHERE d.code = upper(trim(t."noDaisha")));

-- peta id lama -> id baru (untuk MaintenanceLog)
CREATE TEMP TABLE _daisha_map ON COMMIT DROP AS
SELECT o.id AS old_id, n.id AS new_id
FROM "Daisha" o JOIN daisha n ON n.code = upper(trim(o.nomor_daisha));

-- 5. TICKET + TICKET_ITEM -----------------------------------------------------
INSERT INTO ticket (id, daisha_id, reporter, status, opened_at, closed_at, note)
SELECT t."idTiket", d.id, t."namaPelapor",
       CASE WHEN t.status = 'Queue' THEN 'Open' ELSE t.status END,
       COALESCE(t."waktuMasuk", now()), t."waktuSelesai", t.catatan
FROM "Ticket" t
JOIN daisha d ON d.code = upper(trim(t."noDaisha"));

WITH src AS (                                -- items JSONB = sumber yang dibaca aplikasi; tahan terhadap JSON ter-encode string
  SELECT t."idTiket" AS tid,
         CASE jsonb_typeof(t.items)
           WHEN 'array'  THEN t.items
           WHEN 'string' THEN (t.items #>> '{}')::jsonb
           ELSE '[]'::jsonb END AS arr
  FROM "Ticket" t
)
INSERT INTO ticket_item (ticket_id, component, symptom, qty, action)
SELECT s.tid, i->>'komponen', i->>'gejala',
       COALESCE(round(nullif(i->>'qty','')::numeric)::int, 1), i->>'tindakan'
FROM src s, jsonb_array_elements(s.arr) i
UNION ALL                                    -- tiket tanpa items JSON: pakai TicketDetail
SELECT td."idTiket", td.komponen, td.gejala, COALESCE(td.qty, 1), td.tindakan
FROM "TicketDetail" td
JOIN src s ON s.tid = td."idTiket" AND jsonb_array_length(s.arr) = 0;

-- 6. MAINTENANCE_LOG ----------------------------------------------------------
INSERT INTO maintenance_log (id, daisha_id, work_type, condition, damage_detail, action,
                             work_date, entered_at, exited_at, performed_by, note, created_at)
SELECT l.id, m.new_id, l.jenis_pekerjaan, COALESCE(l.kondisi, 'OK'), l.detail_kerusakan, l.tindakan,
       l.tanggal_pengerjaan, l.waktu_masuk, l.waktu_keluar, l.admin_id, l.catatan,
       COALESCE(l.created_at, now())
FROM "MaintenanceLog" l
JOIN _daisha_map m ON m.old_id = l.daisha_id;

-- 7. PM_PICKUP (PmStaging) ----------------------------------------------------
INSERT INTO pm_pickup (id, section_id, units, location, note, reporter, status, created_at, picked_up_at, completed_at)
SELECT p.id, s.id,
       ARRAY(SELECT jsonb_array_elements_text(to_jsonb(p.units))),   -- jsonb maupun text[]
       p.lokasi, p.catatan, p.pelapor, p.status,
       COALESCE(p."createdAt", now()), p."pickedUpAt", p."completedAt"
FROM "PmStaging" p
LEFT JOIN section s ON lower(s.name) = lower(trim(p.seksi));

-- 8. SECTION_REQUEST + REQUEST_FORM + REQUEST_PHASE + REQUEST_APPROVAL --------
INSERT INTO section_request (id, request_no, letter_no, section_id, requester_pic, requester_contact,
                             created_by, title, machine, urgency, status, flow_step, approval_token,
                             created_at, updated_at)
SELECT r.id, r."nomorRequest", r."nomorSurat", s.id, r."picPemohon", r."kontakPemohon",
       r."dibuatOleh", j->>'perihal', j->>'namaMachine', r.urgensi, r.status, r."flowStep", r."approvalToken",
       COALESCE(r."waktuDibuat", now()), COALESCE(r."waktuUpdate", now())
FROM "SectionRequest" r
CROSS JOIN LATERAL (SELECT to_jsonb(r) AS j) x
LEFT JOIN section s ON lower(s.name) = lower(trim(r."seksiPemohon"));

-- kolom yang mungkin belum ada di database live dibaca lewat j->>'kolom' (NULL bila tidak ada)
INSERT INTO request_form (request_id, item_name, specification, qty, unit, note, factor, purpose, reason, section_code,
                          drafter, foreman, current_state, action_plan, target_result, execution_note,
                          photo_before, photo_after, decision, decision_8210, decision_820, check_result,
                          check_result_by, plan_schedule, actual_schedule, pending_reason, reject_reason,
                          workshop_pic, mentor_email)
SELECT r.id, r."namaBarang", j->>'spesifikasi', COALESCE(round(nullif(j->>'jumlah','')::numeric)::int, 1),
       COALESCE(nullif(j->>'satuan',''), 'Pcs'), j->>'catatan', j->>'faktor', j->>'tujuan', j->>'alasan', j->>'kodeSeksi',
       j->>'drafter', j->>'foreman', j->>'keadaanSekarang', j->>'rencanaTindakan', j->>'targetHasil', j->>'penjelasanPelaksanaan',
       j->>'fotoSebelum', j->>'fotoSesudah', j->>'keputusan', j->>'keputusan8210', j->>'keputusan820', j->>'hasilCheck',
       j->>'hasilCheckPemohon', j->>'schedulePlanning', j->>'scheduleActual', j->>'alasanPending', j->>'alasanTolak',
       j->>'picBengkel', j->>'emailMentorWorkshop'
FROM "SectionRequest" r
CROSS JOIN LATERAL (SELECT to_jsonb(r) AS j) x;

INSERT INTO request_phase (request_id, phase, cost, man_hours, duration, exec_date, comment)
SELECT r.id, p.phase, p.cost, p.mh, p.dur, p.dt, p.cm
FROM "SectionRequest" r
CROSS JOIN LATERAL (SELECT to_jsonb(r) AS j) x
CROSS JOIN LATERAL (VALUES
  ('ESTIMATE', j->>'biayaEstimate', j->>'orangJamEstimate', j->>'waktuEstimate', j->>'tglPelaksanaanEstimate', j->>'komentarEstimate'),
  ('ACTUAL',   j->>'biayaActual',   j->>'orangJamActual',   j->>'waktuActual',   j->>'tglPelaksanaanActual',   j->>'komentarActual')
) AS p(phase, cost, mh, dur, dt, cm)
WHERE coalesce(p.cost, p.mh, p.dur, p.dt, p.cm) IS NOT NULL;

INSERT INTO request_approval (request_id, role, name, email, status, signature, decided_at, note)
SELECT r.id, a.role, a.name, a.email, a.status, a.sig, a.at::timestamptz, a.note
FROM "SectionRequest" r
CROSS JOIN LATERAL (SELECT to_jsonb(r) AS j) x
CROSS JOIN LATERAL (VALUES
  ('ATASAN_SEKSI',          j->>'namaAtasanSeksi',  j->>'emailAtasanSeksi',  j->>'statusApprovalAtasanSeksi',
                            j->>'ttdAtasanSeksi',   j->>'waktuApprovalAtasanSeksi',  j->>'catatanAtasanSeksi'),
  ('MANAJER_SEKSI',         j->>'namaManajerSeksi', j->>'emailManajerSeksi', j->>'statusApprovalManajerSeksi',
                            j->>'ttdManajerSeksi',  j->>'waktuApprovalManajerSeksi', j->>'catatanManajerSeksi'),
  ('ATASAN_SPECIAL_PROJECT', NULL, NULL, j->>'statusApprovalAtasanSpecialProject',
                            j->>'ttdAtasanSpecialProject', j->>'waktuApprovalAtasanSpecialProject', NULL),
  ('ADMIN_WORKSHOP',        NULL, NULL, NULL, j->>'ttdAdminWorkshop', NULL, j->>'catatanAdmin'),
  ('DRAFTER',               NULL, NULL, NULL, j->>'ttdDrafter',       NULL, NULL),
  ('SPV_WORKSHOP',          NULL, NULL, NULL, j->>'ttdSpvWorkshop',   NULL, NULL)
) AS a(role, name, email, status, sig, at, note)
WHERE coalesce(a.name, a.email, a.status, a.sig, a.at, a.note) IS NOT NULL;

-- 9. NOTIFICATION -------------------------------------------------------------
INSERT INTO notification (id, request_id, target_role, target_email, target_user, type, title, message, link, is_read, created_at)
SELECT n.id, sr.id, n."targetRole", n."targetEmail", n."targetUser", n.tipe, n.judul, n.pesan, n.link,
       COALESCE(n."isRead", false), COALESCE(n.waktu, now())
FROM "SectionRequestNotification" n
LEFT JOIN section_request sr ON sr.id = n."requestId";   -- requestId yatim -> NULL (notifikasi tetap tersimpan)

-- 10. SPAREPART + SPAREPART_LOG ----------------------------------------------
INSERT INTO sparepart (name, category, stock, unit, min_stock, location, created_at, updated_at)
SELECT "namaKomponen", kategori, "stokGudang", satuan, "minStok", lokasi,
       COALESCE(created_at, now()), COALESCE(updated_at, now())
FROM "Sparepart";

INSERT INTO sparepart_log (sparepart_id, item_name, type, qty, reference, note, created_at)
SELECT sp.id, l."namaKomponen",
       CASE upper(COALESCE(j->>'tipe', j->>'aksi'))
         WHEN 'IN'  THEN 'IN'  WHEN 'MASUK'  THEN 'IN'  WHEN 'RESTOCK' THEN 'IN'
         WHEN 'OUT' THEN 'OUT' WHEN 'KELUAR' THEN 'OUT'
         ELSE upper(COALESCE(j->>'tipe', j->>'aksi')) END,
       round(COALESCE(j->>'qty', j->>'jumlah')::numeric)::int,
       j->>'referensi',
       COALESCE(j->>'keterangan', j->>'catatan'),
       COALESCE((j->>'tanggal')::timestamptz, now())
FROM "SparepartLog" l
CROSS JOIN LATERAL (SELECT to_jsonb(l) AS j) x
LEFT JOIN sparepart sp ON sp.name = l."namaKomponen"   -- log yatim tetap dibawa (sparepart_id NULL)
ORDER BY l.id;

-- 10b. REQUEST_MATERIAL (dari SectionRequest.materials; fallback SectionRequestMaterial) --------
CREATE TEMP TABLE _mat_src ON COMMIT DROP AS
WITH a AS (
  SELECT r.id AS rid,
         CASE jsonb_typeof(r.materials) WHEN 'array' THEN r.materials
              WHEN 'string' THEN (r.materials #>> '{}')::jsonb ELSE '[]'::jsonb END AS arr
  FROM "SectionRequest" r
), e1 AS (
  SELECT rid, e FROM a, jsonb_array_elements(CASE WHEN jsonb_typeof(arr) = 'array' THEN arr ELSE '[]'::jsonb END) e
), e2 AS (                                    -- elemen yang ter-encode sebagai string JSON
  SELECT rid, CASE jsonb_typeof(e) WHEN 'string' THEN (e #>> '{}')::jsonb ELSE e END AS e FROM e1
), e3 AS (
  SELECT rid, x FROM e2,
         jsonb_array_elements(CASE jsonb_typeof(e) WHEN 'array' THEN e ELSE jsonb_build_array(e) END) x
  WHERE jsonb_typeof(x) = 'object'
)
SELECT rid, x->>'namaKomponen' AS name, x->>'tipe' AS tipe, x->>'qty' AS qty, x->>'satuan' AS satuan,
       x->>'dimensi' AS dimensi, x->>'potongStok' AS potong, x->>'qtyPotongStok' AS qty_potong, x->>'keterangan' AS ket
FROM e3
WHERE nullif(x->>'namaKomponen','') IS NOT NULL OR nullif(x->>'id','') IS NOT NULL
UNION ALL                                     -- request tanpa materials JSON: pakai tabel lama
SELECT m."requestId", 
       COALESCE(to_jsonb(m)->>'namaKomponen', to_jsonb(m)->>'namaBarang') AS name, 
       'MATERIAL', m.jumlah::text, m.satuan, m.spesifikasi, NULL, NULL, 
       to_jsonb(m)->>'keterangan'
FROM "SectionRequestMaterial" m
WHERE NOT EXISTS (SELECT 1 FROM a WHERE a.rid = m."requestId" AND jsonb_typeof(a.arr) = 'array' AND jsonb_array_length(a.arr) > 0)
  AND EXISTS (SELECT 1 FROM section_request sr WHERE sr.id = m."requestId");

INSERT INTO request_material (request_id, sparepart_id, name, kind, qty, unit, dimension, stock_deducted, note)
SELECT s.rid,
       (SELECT sp.id FROM sparepart sp WHERE upper(sp.name) = upper(s.name) LIMIT 1),
       COALESCE(nullif(s.name,''), '(tanpa nama)'),
       COALESCE(nullif(s.tipe,''),                -- aturan yang sama dengan normalizeMaterials() di kode lama
         CASE WHEN lower(COALESCE(s.name,'')) ~ '(plat|cat|las|pipa|hollow|siku)' OR s.satuan IN ('cm²','m²')
              THEN 'MATERIAL' ELSE 'SPAREPART' END),
       COALESCE(nullif(s.qty,'')::numeric, 1),
       COALESCE(nullif(s.satuan,''), CASE WHEN lower(COALESCE(s.name,'')) ~ '(plat|cat|las|pipa|hollow|siku)' THEN 'cm²' ELSE 'Pcs' END),
       nullif(s.dimensi,''),
       CASE WHEN lower(COALESCE(s.potong,'false')) = 'true' THEN COALESCE(nullif(s.qty_potong,'')::numeric, 0) ELSE 0 END,
       nullif(s.ket,'')
FROM _mat_src s;

-- 11. Sinkronkan sequence identity --------------------------------------------
SELECT setval(pg_get_serial_sequence(t, 'id'), GREATEST(COALESCE(max_id, 0), 1), COALESCE(max_id, 0) > 0)
FROM (VALUES
  ('app_user',        (SELECT max(id) FROM app_user)),
  ('section_request', (SELECT max(id) FROM section_request)),
  ('notification',    (SELECT max(id) FROM notification)),
  ('sparepart',       (SELECT max(id) FROM sparepart)),
  ('pm_pickup',       (SELECT max(id) FROM pm_pickup))
) AS s(t, max_id);

-- 12. PEMERIKSAAN: gagal = ROLLBACK otomatis -------------------------------------
DO $$
DECLARE
  _exp bigint; _got bigint;
  _orphan_logs bigint;
BEGIN
  PERFORM 1 WHERE (SELECT count(*) FROM "User") = (SELECT count(*) FROM app_user)
              AND (SELECT count(*) FROM "Ticket") = (SELECT count(*) FROM ticket)
              AND (SELECT count(*) FROM "MaintenanceLog") = (SELECT count(*) FROM maintenance_log)
              AND (SELECT count(*) FROM "SectionRequest") = (SELECT count(*) FROM section_request)
              AND (SELECT count(*) FROM "SectionRequestNotification") = (SELECT count(*) FROM notification)
              AND (SELECT count(*) FROM "Sparepart") = (SELECT count(*) FROM sparepart)
              AND (SELECT count(*) FROM "PmStaging") = (SELECT count(*) FROM pm_pickup);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Jumlah baris tidak cocok (User/Ticket/MaintenanceLog/SectionRequest/Notification/Sparepart/PmStaging)';
  END IF;

  SELECT count(DISTINCT upper(trim(nomor_daisha))) INTO _exp FROM "Daisha" WHERE nullif(trim(nomor_daisha),'') IS NOT NULL;
  SELECT count(*) INTO _got FROM daisha
    WHERE code IN (SELECT upper(trim(nomor_daisha)) FROM "Daisha");
  IF _got <> _exp THEN RAISE EXCEPTION 'Unit daisha tidak cocok: lama=% baru=%', _exp, _got; END IF;

  WITH src AS (
    SELECT t."idTiket" AS tid,
           CASE jsonb_typeof(t.items)
             WHEN 'array' THEN t.items
             WHEN 'string' THEN (t.items #>> '{}')::jsonb
             ELSE '[]'::jsonb END AS arr
    FROM "Ticket" t
  )
  SELECT (SELECT count(*) FROM src s, jsonb_array_elements(s.arr)) +
         (SELECT count(*) FROM "TicketDetail" td JOIN src s ON s.tid = td."idTiket" AND jsonb_array_length(s.arr) = 0)
  INTO _exp;
  SELECT count(*) INTO _got FROM ticket_item;
  IF _exp <> _got THEN RAISE EXCEPTION 'Rincian tiket tidak cocok: seharusnya % didapat %', _exp, _got; END IF;

  IF (SELECT count(*) FROM sparepart_log) <> (SELECT count(*) FROM "SparepartLog") THEN
    RAISE EXCEPTION 'Log sparepart tidak cocok';
  END IF;
  SELECT count(*) INTO _orphan_logs FROM sparepart_log WHERE sparepart_id IS NULL;
  IF _orphan_logs > 0 THEN
    RAISE NOTICE '% log sparepart yatim ikut dimigrasi dengan sparepart_id NULL (nama tetap di item_name)', _orphan_logs;
  END IF;
  IF (SELECT count(*) FROM request_form) <> (SELECT count(*) FROM "SectionRequest") THEN
    RAISE EXCEPTION 'Formulir pengajuan tidak cocok';
  END IF;
  IF (SELECT count(*) FROM request_material) <> (SELECT count(*) FROM _mat_src) THEN
    RAISE EXCEPTION 'Material pengajuan tidak cocok';
  END IF;

  IF EXISTS (SELECT 1 FROM "DaishaCatalog" c
             WHERE NOT EXISTS (SELECT 1 FROM daisha_type t WHERE lower(t.name) = lower(c.name))) THEN
    RAISE EXCEPTION 'Ada jenis katalog yang tidak termigrasi';
  END IF;

  RAISE NOTICE 'Migrasi data LOLOS semua pemeriksaan.';
END $$;

COMMIT;
