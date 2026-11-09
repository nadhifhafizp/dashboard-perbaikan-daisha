-- 20_backfill.sql : menyalin SEMUA data lama -> 10 tabel baru di schema v2. Aman diulang (v2 dikosongkan dulu).
-- Tabel lama (public."...") hanya DIBACA, tidak pernah diubah.
BEGIN;

TRUNCATE v2."TWMSSparepartLog", v2."TWMSSectionRequestMaterial", v2."TWMSSparepartMaster",
         v2."TWMSSectionRequest", v2."TWMSMaintenanceLog", v2."TWMSRepairTicketDetail",
         v2."TWMSRepairTicket", v2."TWMSDamageCatalog", v2."TWMSDaishaCatalog", v2."TWMSUsers"
RESTART IDENTITY CASCADE;

-- ---------- fungsi bantu (dihapus di akhir) ----------
CREATE FUNCTION v2.try_json(t text) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE AS
$$ BEGIN RETURN t::jsonb; EXCEPTION WHEN others THEN RETURN NULL; END $$;

-- Nama seksi baku: seksi yang ditulis berbeda huruf besar/kecil/spasi disatukan,
-- penulisan yang paling sering dipakai dijadikan nama resmi.
CREATE TEMP TABLE tmp_seksi ON COMMIT DROP AS
WITH raw AS (
  SELECT trim(seksi) AS nama FROM public."Daisha"         WHERE seksi IS NOT NULL
  UNION ALL SELECT trim(seksi) FROM public."User"          WHERE seksi IS NOT NULL
  UNION ALL SELECT trim(seksi) FROM public."DaishaCatalog" WHERE seksi IS NOT NULL
  UNION ALL SELECT trim("seksiPemohon") FROM public."SectionRequest" WHERE "seksiPemohon" IS NOT NULL
  UNION ALL SELECT trim(seksi) FROM public."PmStaging"     WHERE seksi IS NOT NULL
  UNION ALL SELECT trim(COALESCE(to_jsonb(s)->>'name', to_jsonb(s)->>'nama')) FROM public."Section" s
), freq AS (
  SELECT nama, lower(nama) AS k, count(*) AS n FROM raw WHERE nama <> '' GROUP BY nama
)
SELECT DISTINCT ON (k) k, nama FROM freq ORDER BY k, n DESC, nama;

CREATE FUNCTION v2.sec(t text) RETURNS text LANGUAGE sql STABLE AS
$$ SELECT COALESCE((SELECT nama FROM tmp_seksi WHERE k = lower(trim(t))), NULLIF(trim(t), '')) $$;

-- ---------- 1. TWMSUsers ----------
INSERT INTO v2."TWMSUsers" ("Id","Username","PasswordHash","FullName","Role","SectionName","Description","CreateDate","UpdateDate")
OVERRIDING SYSTEM VALUE
SELECT u.id, u.username, u.password, u.name, u.role, v2.sec(u.seksi), u.description, u."createdAt", u."updatedAt"
FROM public."User" u;

-- ---------- 2. TWMSDamageCatalog (dari DaishaCatalog.components / symptoms JSONB) ----------
-- 2a. jenis yang belum punya komponen -> 1 baris jenis saja
INSERT INTO v2."TWMSDamageCatalog" ("DaishaType","SectionName")
SELECT DISTINCT ON (lower(trim(c.name))) trim(c.name), v2.sec(c.seksi)
FROM public."DaishaCatalog" c
WHERE COALESCE(trim(c.name),'') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.components)='array' THEN c.components ELSE '[]'::jsonb END) x
    WHERE COALESCE(trim(x->>'name'),'') <> '')
ORDER BY lower(trim(c.name));

-- 2b. komponen tanpa gejala -> 1 baris komponen
INSERT INTO v2."TWMSDamageCatalog" ("DaishaType","SectionName","ComponentName")
SELECT DISTINCT ON (lower(trim(c.name)), lower(trim(comp->>'name'))) trim(c.name), v2.sec(c.seksi), trim(comp->>'name')
FROM public."DaishaCatalog" c
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.components)='array' THEN c.components ELSE '[]'::jsonb END) comp
WHERE COALESCE(trim(c.name),'') <> '' AND COALESCE(trim(comp->>'name'),'') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(comp->'symptoms')='array' THEN comp->'symptoms' ELSE '[]'::jsonb END) s
    WHERE COALESCE(trim(s->>'description'),'') <> '')
ORDER BY lower(trim(c.name)), lower(trim(comp->>'name'));

-- 2c. komponen + gejala -> 1 baris per gejala
INSERT INTO v2."TWMSDamageCatalog" ("DaishaType","SectionName","ComponentName","SymptomDesc")
SELECT DISTINCT ON (lower(trim(c.name)), lower(trim(comp->>'name')), lower(trim(s->>'description')))
       trim(c.name), v2.sec(c.seksi), trim(comp->>'name'), trim(s->>'description')
FROM public."DaishaCatalog" c
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.components)='array' THEN c.components ELSE '[]'::jsonb END) comp
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(comp->'symptoms')='array' THEN comp->'symptoms' ELSE '[]'::jsonb END) s
WHERE COALESCE(trim(c.name),'') <> '' AND COALESCE(trim(comp->>'name'),'') <> '' AND COALESCE(trim(s->>'description'),'') <> ''
ORDER BY lower(trim(c.name)), lower(trim(comp->>'name')), lower(trim(s->>'description'));

-- ---------- 3. TWMSDaishaCatalog (unit) ----------
INSERT INTO v2."TWMSDaishaCatalog" ("UnitCode","SectionName","DaishaType","UnitCategory","SizeSpec","CurrentCondition","LastPMDate","CreateDate","UpdateDate")
SELECT d.nomor_daisha, v2.sec(d.seksi),
       COALESCE(
         (SELECT x."DaishaType" FROM v2."TWMSDamageCatalog" x
          WHERE lower(x."DaishaType") IN (lower(trim(d.nama_daisha)), lower(trim(d.jenis)))
          ORDER BY (lower(x."DaishaType") = lower(trim(d.nama_daisha))) DESC LIMIT 1),
         NULLIF(trim(d.nama_daisha), ''), NULLIF(trim(d.jenis), ''), '(TIDAK DIKETAHUI)'),
       d.jenis, d.ukuran, d.last_condition, d.last_maintenance_date, d.created_at, d.updated_at
FROM public."Daisha" d;

-- 3b. tabel "MasterDaisha" lama (jika ada): unit yang belum ada di "Daisha" ikut disalin agar tidak hilang
DO $$
BEGIN
  IF to_regclass('public."MasterDaisha"') IS NOT NULL THEN
    EXECUTE $q$
      INSERT INTO v2."TWMSDaishaCatalog" ("UnitCode","SectionName","DaishaType","UnitCategory","SizeSpec")
      SELECT trim(m."noDaisha"), v2.sec(m.seksi),
             COALESCE(NULLIF(trim(m."namaDaisha"), ''), '(TIDAK DIKETAHUI)'), 'MasterDaisha', COALESCE(m.ukuran, 'STANDARD')
      FROM (SELECT DISTINCT ON (upper(trim("noDaisha"))) * FROM public."MasterDaisha"
            WHERE COALESCE(trim("noDaisha"), '') NOT IN ('', '-')
            ORDER BY upper(trim("noDaisha"))) m
      WHERE NOT EXISTS (SELECT 1 FROM v2."TWMSDaishaCatalog" d WHERE upper(trim(d."UnitCode")) = upper(trim(m."noDaisha")))
    $q$;
  END IF;
END $$;

-- 3c. UNIT PENAMPUNG: kode unit yang dipakai tiket / antrean PM tetapi tidak terdaftar di master.
--     Dibuat dengan IsActive = false agar relasi tetap utuh dan tidak ada tiket/antrean yang hilang.
INSERT INTO v2."TWMSDaishaCatalog" ("UnitCode","DaishaType","UnitCategory","IsActive")
SELECT DISTINCT ON (upper(trim(code))) trim(code), '(TIDAK TERDAFTAR)', 'PENAMPUNG', false
FROM (
  SELECT "noDaisha" AS code FROM public."Ticket"
  UNION ALL
  SELECT u.val FROM public."PmStaging" p
  CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.units)='array' THEN p.units ELSE '[]'::jsonb END) u(val)
) x
WHERE COALESCE(trim(code), '') <> ''
  AND NOT EXISTS (SELECT 1 FROM v2."TWMSDaishaCatalog" d WHERE upper(trim(d."UnitCode")) = upper(trim(x.code)))
ORDER BY upper(trim(code)), trim(code);

-- ---------- 4. TWMSRepairTicket + TWMSRepairTicketDetail ----------
INSERT INTO v2."TWMSRepairTicket" ("TicketNo","UnitCode","ReporterName","ReporterSection","Status","ActionTaken","ReportDate","CompletedDate")
SELECT t."idTiket", u."UnitCode", COALESCE(NULLIF(trim(t."namaPelapor"), ''), '-'), u."SectionName",
       COALESCE(t.status, 'Open'), t.catatan, t."waktuMasuk", t."waktuSelesai"
FROM public."Ticket" t
JOIN LATERAL (
  SELECT "UnitCode", "SectionName" FROM v2."TWMSDaishaCatalog"
  WHERE upper(trim("UnitCode")) = upper(trim(t."noDaisha"))
  ORDER BY ("UnitCode" = t."noDaisha") DESC, "Id" LIMIT 1
) u ON true;

-- 4a. sumber utama: Ticket.items (JSONB)
INSERT INTO v2."TWMSRepairTicketDetail" ("TicketId","LineNo","ComponentName","SymptomDesc","ActionType","Qty","DamageCatalogId")
SELECT rt."Id", x.ord::int, it->>'komponen', it->>'gejala', it->>'tindakan',
       COALESCE(NULLIF(regexp_replace(COALESCE(it->>'qty',''), '[^0-9]', '', 'g'), '')::int, 1),
       (SELECT dc."Id" FROM v2."TWMSDamageCatalog" dc
        WHERE lower(dc."DaishaType") = lower(u."DaishaType")
          AND lower(dc."ComponentName") = lower(trim(it->>'komponen'))
          AND lower(coalesce(dc."SymptomDesc",'')) = lower(coalesce(trim(it->>'gejala'),''))
        LIMIT 1)
FROM public."Ticket" ot
JOIN v2."TWMSRepairTicket" rt ON rt."TicketNo" = ot."idTiket"
JOIN v2."TWMSDaishaCatalog" u ON u."UnitCode" = rt."UnitCode"
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(ot.items)='array' THEN ot.items ELSE '[]'::jsonb END)
            WITH ORDINALITY AS x(it, ord)
WHERE jsonb_typeof(it) = 'object'
ORDER BY rt."Id", x.ord;

-- 4b. cadangan: tabel TicketDetail lama, hanya untuk tiket yang items-nya kosong
INSERT INTO v2."TWMSRepairTicketDetail" ("TicketId","LineNo","ComponentName","SymptomDesc","ActionType","Qty","DamageCatalogId")
SELECT rt."Id", row_number() OVER (PARTITION BY td."idTiket" ORDER BY td.id)::int,
       td.komponen, td.gejala, td.tindakan, COALESCE(td.qty, 1),
       (SELECT dc."Id" FROM v2."TWMSDamageCatalog" dc
        WHERE lower(dc."DaishaType") = lower(u."DaishaType")
          AND lower(dc."ComponentName") = lower(trim(td.komponen))
          AND lower(coalesce(dc."SymptomDesc",'')) = lower(coalesce(trim(td.gejala),''))
        LIMIT 1)
FROM public."TicketDetail" td
JOIN v2."TWMSRepairTicket" rt ON rt."TicketNo" = td."idTiket"
JOIN v2."TWMSDaishaCatalog" u ON u."UnitCode" = rt."UnitCode"
WHERE NOT EXISTS (SELECT 1 FROM v2."TWMSRepairTicketDetail" x WHERE x."TicketId" = rt."Id")
ORDER BY rt."Id", td.id;

-- 4c. ringkasan header tiket dari rincian (rincian lengkap tetap di TWMSRepairTicketDetail)
UPDATE v2."TWMSRepairTicket" rt SET
  "DamageCategory"    = s.first_comp,
  "DamageDescription" = left(s.ringkas, 255)
FROM (
  SELECT "TicketId",
         (array_agg("ComponentName" ORDER BY "LineNo"))[1] AS first_comp,
         string_agg(concat_ws(' - ', "ComponentName", "SymptomDesc"), '; ' ORDER BY "LineNo") AS ringkas
  FROM v2."TWMSRepairTicketDetail" GROUP BY "TicketId"
) s
WHERE s."TicketId" = rt."Id";

-- ---------- 5. TWMSMaintenanceLog: catatan PM + antrean penjemputan ----------
INSERT INTO v2."TWMSMaintenanceLog" ("UnitCode","SectionName","RecordType","PeriodMonth","WorkType","ChecklistResult",
    "InspectionNote","ActionTaken","CheckDate","EntryTime","ExitTime","InspectorBy","Notes","UpdateDate")
SELECT u."UnitCode", u."SectionName", 'PM', to_char(m.tanggal_pengerjaan, 'YYYY-MM'), m.jenis_pekerjaan, m.kondisi,
       m.detail_kerusakan, m.tindakan, m.tanggal_pengerjaan, m.waktu_masuk, m.waktu_keluar, m.admin_id, m.catatan, m.created_at
FROM public."MaintenanceLog" m
JOIN public."Daisha" d ON d.id = m.daisha_id
JOIN v2."TWMSDaishaCatalog" u ON u."UnitCode" = d.nomor_daisha
ORDER BY m.tanggal_pengerjaan, m.id;

INSERT INTO v2."TWMSMaintenanceLog" ("UnitCode","SectionName","RecordType","PeriodMonth","StagingStatus","StagingLocation",
    "ReporterName","StagingDate","PickedUpDate","CompletedDate","Notes","UpdateDate")
SELECT DISTINCT ON (p.id, upper(trim(un.val)))
       u."UnitCode", COALESCE(v2.sec(p.seksi), u."SectionName"), 'STAGING', to_char(p."createdAt", 'YYYY-MM'),
       COALESCE(p.status, 'WAITING_PICKUP'), p.lokasi, p.pelapor, p."createdAt", p."pickedUpAt", p."completedAt", p.catatan, p."createdAt"
FROM public."PmStaging" p
CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.units)='array' THEN p.units ELSE '[]'::jsonb END) un(val)
JOIN LATERAL (
  SELECT "UnitCode", "SectionName" FROM v2."TWMSDaishaCatalog"
  WHERE upper(trim("UnitCode")) = upper(trim(un.val)) ORDER BY ("UnitCode" = trim(un.val)) DESC, "Id" LIMIT 1
) u ON true
WHERE trim(un.val) <> ''
ORDER BY p.id, upper(trim(un.val));

-- ---------- 6. TWMSSparepartMaster ----------
INSERT INTO v2."TWMSSparepartMaster" ("PartName","Category","CurrentStock","MinStock","Unit","LocationRack","UpdateDate")
SELECT s."namaKomponen", COALESCE(NULLIF(trim(s.kategori), ''), 'Umum'), s."stokGudang", s."minStok", s.satuan, s.lokasi,
       COALESCE(s.updated_at, s.created_at, now())
FROM public."Sparepart" s;

-- ---------- 7. TWMSSectionRequest ----------
INSERT INTO v2."TWMSSectionRequest" (
  "Id","RequestNo","NomorSurat","RequestDate","RequesterName","RequesterContact","RequesterSection","CreatedBy","RequestType",
  "Subject","MachineName","ItemTitle","ItemSpec","ItemQty","ItemUnit","ProblemFactor","Reason","Urgency","Remark",
  "SectionCode","Drafter","Foreman","CurrentCondition","PhotoBefore","ActionPlan","PhotoAfter","TargetResult","ExecutionNote",
  "Decision","Decision8210","Decision820","CheckResult","CheckResultRequester","SchedulePlan","ScheduleActual","PendingReason",
  "WorkflowStatus","FlowStep","ApprovalToken","FinishDate",
  "SectionHeadName","SectionHeadEmail","SectionHeadStatus","SectionHeadSignature","WorkshopEmail","WorkshopSignature","SpecialProjectSignature",
  "EstCost","EstManHour","EstDuration","EstExecDate","EstComment","ActCost","ActManHour","ActDuration","ActExecDate","ActComment","UpdateDate")
OVERRIDING SYSTEM VALUE
SELECT r.id, r."nomorRequest", r."nomorSurat", r."waktuDibuat", r."picPemohon", r."kontakPemohon", v2.sec(r."seksiPemohon"), r."dibuatOleh", r.tujuan,
  r.perihal, r."namaMachine", r."namaBarang", r.spesifikasi, r.jumlah, r.satuan, r.faktor, r.alasan, r.urgensi, r.catatan,
  r."kodeSeksi", r.drafter, r.foreman, r."keadaanSekarang", r."fotoSebelum", r."rencanaTindakan", r."fotoSesudah", r."targetHasil", r."penjelasanPelaksanaan",
  r.keputusan, r.keputusan8210, r.keputusan820, r."hasilCheck", r."hasilCheckPemohon", r."schedulePlanning", r."scheduleActual", r."alasanPending",
  r.status, r."flowStep", r."approvalToken", NULLIF(to_jsonb(r)->>'waktuSelesai','')::timestamptz,
  r."namaAtasanSeksi", r."emailAtasanSeksi", r."statusApprovalAtasanSeksi", r."ttdAtasanSeksi", r."emailMentorWorkshop", r."ttdAdminWorkshop", r."ttdAtasanSpecialProject",
  r."biayaEstimate", r."orangJamEstimate", r."waktuEstimate", r."tglPelaksanaanEstimate", r."komentarEstimate",
  r."biayaActual", r."orangJamActual", r."waktuActual", r."tglPelaksanaanActual", r."komentarActual", r."waktuUpdate"
FROM public."SectionRequest" r;

-- ---------- 8. TWMSSectionRequestMaterial (dari SectionRequest.materials JSONB) ----------
WITH top AS (
  SELECT r.id AS rid,
         CASE jsonb_typeof(r.materials)
           WHEN 'array'  THEN r.materials
           WHEN 'string' THEN COALESCE(v2.try_json(r.materials #>> '{}'), '[]'::jsonb)
           ELSE '[]'::jsonb END AS arr
  FROM public."SectionRequest" r
), lvl1 AS (
  SELECT rid, m FROM top
  CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(arr) = 'array' THEN arr ELSE '[]'::jsonb END) m
), decoded AS (   -- elemen berupa string JSON (double-encoded) ikut didekode, seperti normalizeMaterials() di kode
  SELECT rid, CASE WHEN jsonb_typeof(m) = 'string' THEN v2.try_json(m #>> '{}') ELSE m END AS j FROM lvl1
), flat AS (
  SELECT rid, j AS m FROM decoded WHERE jsonb_typeof(j) = 'object'
  UNION ALL
  SELECT rid, e FROM decoded
  CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(j) = 'array' THEN j ELSE '[]'::jsonb END) e
  WHERE jsonb_typeof(e) = 'object'
)
INSERT INTO v2."TWMSSectionRequestMaterial" ("RequestId","SparepartId","MaterialName","MaterialType","MaterialSpec","QtyUsed","Unit","DeductStock","QtyDeducted","Remark")
SELECT f.rid,
       CASE WHEN upper(COALESCE(f.m->>'tipe','')) = 'SPAREPART' THEN sp."Id" END,
       trim(f.m->>'namaKomponen'),
       CASE WHEN upper(COALESCE(f.m->>'tipe','')) = 'SPAREPART' THEN 'SPAREPART' ELSE 'MATERIAL' END,
       f.m->>'dimensi',
       COALESCE(NULLIF(regexp_replace(COALESCE(f.m->>'qty',''), '[^0-9.]', '', 'g'), '')::numeric, 1),
       f.m->>'satuan',
       lower(COALESCE(f.m->>'potongStok','false')) IN ('true','t','1'),
       COALESCE(NULLIF(regexp_replace(COALESCE(f.m->>'qtyPotongStok',''), '[^0-9.]', '', 'g'), '')::numeric, 0),
       f.m->>'keterangan'
FROM flat f
LEFT JOIN LATERAL (
  SELECT "Id" FROM v2."TWMSSparepartMaster" WHERE lower("PartName") = lower(trim(f.m->>'namaKomponen')) LIMIT 1
) sp ON true
WHERE COALESCE(trim(f.m->>'namaKomponen'), '') <> '';

-- cadangan: baris dari tabel SectionRequestMaterial lama untuk request yang materials JSONB-nya kosong
INSERT INTO v2."TWMSSectionRequestMaterial" ("RequestId","MaterialName","MaterialType","QtyUsed","Unit","Remark")
SELECT m."requestId", m."namaBarang", 'MATERIAL', COALESCE(m.jumlah, 1), m.satuan, m.spesifikasi
FROM public."SectionRequestMaterial" m
JOIN v2."TWMSSectionRequest" r ON r."Id" = m."requestId"
WHERE NOT EXISTS (SELECT 1 FROM v2."TWMSSectionRequestMaterial" x WHERE x."RequestId" = m."requestId");

-- ---------- 9. TWMSSparepartLog ----------
INSERT INTO v2."TWMSSparepartLog" ("Id","SparepartId","PartName","MovementType","Qty","Notes","MovementBy","MovementDate")
OVERRIDING SYSTEM VALUE
SELECT l.id, sp."Id", COALESCE(x.j->>'namaKomponen', '-'),
       COALESCE(x.j->>'tipe', x.j->>'aksi'),
       NULLIF(regexp_replace(COALESCE(x.j->>'qty', x.j->>'jumlah', ''), '[^0-9-]', '', 'g'), '')::int,
       COALESCE(x.j->>'keterangan', x.j->>'catatan'),
       x.j->>'user',
       NULLIF(x.j->>'tanggal','')::timestamptz
FROM public."SparepartLog" l
CROSS JOIN LATERAL (SELECT to_jsonb(l) AS j) x
LEFT JOIN LATERAL (
  SELECT "Id" FROM v2."TWMSSparepartMaster" WHERE lower("PartName") = lower(trim(x.j->>'namaKomponen')) LIMIT 1
) sp ON true;

-- ---------- 10. sinkronkan counter identity (id lama disalin apa adanya) ----------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['TWMSUsers','TWMSDaishaCatalog','TWMSDamageCatalog','TWMSRepairTicket','TWMSRepairTicketDetail',
    'TWMSSectionRequest','TWMSSectionRequestMaterial','TWMSMaintenanceLog','TWMSSparepartMaster','TWMSSparepartLog']
  LOOP
    EXECUTE format(
      'SELECT setval(pg_get_serial_sequence(%L, %L), COALESCE((SELECT max("Id") FROM v2.%I), 0) + 1, false)',
      'v2.' || quote_ident(t), 'Id', t);
  END LOOP;
END $$;

-- ---------- 11. bersihkan fungsi bantu ----------
DROP FUNCTION v2.sec(text);
DROP FUNCTION v2.try_json(text);

COMMIT;
