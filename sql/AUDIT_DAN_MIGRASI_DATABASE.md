# Audit Skema & Migrasi Database — Dashboard Perbaikan Daisha

Sumber audit: repo `nadhifhafizp/dashboard-perbaikan-daisha` (`scripts/migrations/*`, `scripts/migrate.mjs`, dan **seluruh query SQL di `app/`, `lib/`, `scripts/`**).
Saya tidak punya akses ke database live, jadi "skema lama" di sini = **skema efektif yang dipakai kode**, bukan sekadar `000_baseline.sql`.

File terkait: `erd-daisha.drawio` (2 tab: ERD Lama & ERD Baru) · `sql/00_preflight.sql` · `sql/01_schema_baru.sql` · `sql/02_migrasi_data.sql` · `sql/03_cutover_dan_rollback.sql`

---

## 1. Hasil audit

### 1.1 Ringkasan
| | Lama | Baru |
|---|---|---|
| Jumlah tabel | 18 (5 tidak dipakai kode) | **18**, semuanya dipakai |
| Relasi dengan FK nyata | 5 (semuanya di tabel kecil) | **18** |
| Kolom JSONB | 6 | **0** |
| Relasi lewat teks tanpa FK | 9 | **0** |
| Kolom `SectionRequest` | ±75 | **15** di tabel inti + `request_form` (1:1), `request_phase`, `request_approval`, `request_material` |
| Penyimpanan ganda untuk data yang sama | 7 pasang | **0** |

### 1.2 Temuan (urut berat)

**A. Skema di migrasi ≠ skema yang dipakai kode (drift) — risiko tinggi**
1. `DaishaCatalog` dan `PmStaging` dipakai kode (puluhan query) tetapi **tidak dibuat oleh migrasi manapun**. Pada database baru hasil `npm run db:migrate`, fitur katalog, PM staging, dan KPI maintenance akan error. (`001_inner_liner_guide_roller.sql` merujuk `DaishaCatalog`, jadi tabel ini jelas ada di produksi, hanya dibuat manual.)
2. `Section` didefinisikan dua kali dengan kolom berbeda: baseline (`kode`, `nama`) vs `003` (`name`, `colorName`, `badgeBg`, …). Karena `CREATE TABLE IF NOT EXISTS`, yang menang tergantung urutan eksekusi.
3. `SparepartLog`: baseline `aksi/jumlah/user/catatan`, kode memakai `tipe/qty/referensi/keterangan`.
4. `SectionRequest`: kode membaca/menulis kolom yang tidak ada di migrasi manapun (`catatanAdmin`, `alasanTolak`, `picBengkel`, `catatanAtasanSeksi`, `waktuApprovalAtasanSeksi`, `statusApprovalAtasanSpecialProject`, `waktuApprovalAtasanSpecialProject`), kemungkinan ditambah manual di produksi.
5. `MasterDaisha` dibaca di `/api/catalog/units` tetapi tidak ada di migrasi; query yang sama juga memakai `DaishaType.name/seksi` padahal baseline hanya punya `kode/nama`.
6. Dua file migrasi bernomor `005` (`.mjs` dan `.sql`), `001` hanya berisi blok kosong, dan `migrate.mjs` menjalankan baseline lalu mengulang DDL yang sama.

**B. Data ganda (satu fakta disimpan di dua tempat)**
| Fakta | Tempat 1 | Tempat 2 |
|---|---|---|
| Rincian kerusakan tiket | `Ticket.items` JSONB (**dibaca aplikasi**) | `TicketDetail` (ditulis best-effort, `try/catch`) |
| Material pengajuan | `SectionRequest.materials` JSONB (**dibaca**) | `SectionRequestMaterial` (kode hanya `DELETE`) |
| Katalog jenis/komponen/gejala/varian | `DaishaCatalog` JSONB (**dibaca**) | `DaishaType/Variant/Component/Symptom` (tidak dipakai) |
| Log stok | `SparepartLog` (**dibaca**) | `Sparepart.logs` JSONB |
| Nomor daisha di log | `MaintenanceLog.daisha_id` | `MaintenanceLog.nomor_daisha` |
| Nomor request di notifikasi | `Notification.requestId` | `Notification.nomorRequest` |
| Tanggal terakhir servis/perbaikan/masuk/keluar | `Daisha.last_*` (4 kolom) | dapat dihitung dari `MaintenanceLog` & `Ticket` (migrasi `005` ada khusus untuk menambal ketidaksinkronan ini) |

**C. Relasi tanpa foreign key (rawan data yatim, index tidak terpakai)**
`Ticket.noDaisha → Daisha.nomor_daisha` (dijoin dengan `UPPER(TRIM())`, sehingga index tidak dipakai), `SparepartLog.namaKomponen → Sparepart`, `SectionRequestNotification.requestId → SectionRequest`, serta **seksi disimpan sebagai teks bebas di 5 tabel** (`User`, `Daisha`, `DaishaCatalog`, `PmStaging`, `SectionRequest`), sedangkan `Section` hanya tabel warna. `Daisha.nama_daisha → DaishaCatalog.name` juga tanpa FK.

**D. Desain tabel**
- `SectionRequest` memuat ±75 kolom: formulir resmi, 3 level approval (nama/email/status/ttd/waktu/catatan), foto base64 dalam satu baris. Setiap `SELECT *` menarik semuanya.
- Kolom bernilai angka/tanggal bertipe `VARCHAR` (`biayaEstimate`, `waktuEstimate`, `tglPelaksanaanEstimate`, …).
- Tidak ada `CHECK` untuk `Ticket.status` (default `'Queue'` tidak pernah dipakai kode; yang dipakai `Open/Progress/Pending/Done/Scrap`), `Daisha.last_condition` (ada nilai peralihan `REPAIR_DONE`).
- Index mubazir: `idx_user_username`, `idx_daisha_nomor`, `idx_section_request_nomor` duplikat dari index `UNIQUE`.
- Penamaan campur camelCase & snake_case; `"User"` kata terpesan sehingga selalu harus di-quote; sequence disinkronkan manual di `migrate.mjs`.

---

## 2. ERD
Buka `erd-daisha.drawio` di app.diagrams.net (File → Open from → Device). Tab 1 = ERD lama (merah = tidak ada di migrasi, kuning = kolom beda dari baseline, abu-abu = tidak dipakai, garis putus-putus = relasi tanpa FK). Tab 2 = ERD baru.

Ringkas skema baru:
```
section ─┬─< app_user
         ├─< pm_pickup
         ├─< daisha_type ─┬─< daisha_variant
         │                ├─< damage_catalog
         │                └─< daisha ─┬─< ticket ──< ticket_item
         ├─< daisha ──────────────────┘ └─< maintenance_log
         └─< section_request ─┬─< request_form (1:1)
                              ├─< request_phase (estimasi/aktual)
                              ├─< request_approval
                              ├─< request_material
                              └─< notification
sparepart ──< sparepart_log
sparepart ──< request_material >── section_request
```

### Keputusan desain
- **Seksi jadi tabel `section` + FK** di mana-mana (menggantikan 5 kolom teks). Warna seksi tetap 5 kolom biasa (`color_name`, `badge_bg`, `text_color`, `border_color`, `accent_border`).
- **Katalog** `DaishaCatalog` (JSONB) + 4 tabel mati → `daisha_type`, `daisha_variant`, `damage_catalog` (1 baris = 1 gejala; komponen tanpa gejala = `symptom` NULL). `totalUnits` & `rangeFormat` tidak disimpan karena dapat dihitung dari `COUNT(daisha)` dan `min_number..max_number`.
- **Tiket**: `ticket` mengacu `daisha_id` (FK), rincian satu-satunya di `ticket_item` (menggantikan `items` JSONB **dan** `TicketDetail`). Status di-`CHECK`.
- **`daisha.condition`** hanya `OK/RUSAK` (`REPAIR_DONE` dihapus). `last_pm_at` dipertahankan; tanggal masuk/keluar/perbaikan terakhir dihitung dari `ticket` / `maintenance_log`.
- **`section_request`** hanya berisi data alur: nomor, seksi, pemohon, status, langkah, token (15 kolom). Isian formulir resmi pindah ke `request_form` (1:1, termasuk foto base64 supaya daftar pengajuan tidak menarik data berat). Estimasi dan aktual (5 isian × 2) menjadi 2 baris di `request_phase`. Approval dipecah ke `request_approval` (1 baris per peran) — menambah level approval tidak perlu `ALTER TABLE`. Material ke `request_material`.
- **Primary key lama dipertahankan** di tempat yang dirujuk dari luar: `User.id`, `Daisha.id` (UUID), `MaintenanceLog.id` (UUID), `Ticket.idTiket`, `SectionRequest.id`, `Notification.id` — sehingga sesi login, link approval, dan nomor tiket tetap berlaku.
- **Tanpa JSONB sama sekali.** Harga yang dibayar: 18 tabel (bukan 15) dan `request_form` punya ±30 kolom teks. Kolom `request_form` sengaja bertipe `text` agar isi lama (mis. `biayaEstimate` berisi "Rp 1.000.000") tidak berubah; ubah ke `numeric`/`date` belakangan setelah datanya dibersihkan.
- **Pengaman kolom**: skrip migrasi membandingkan semua kolom di tabel lama dengan daftar yang sudah dipetakan. Jika database live punya kolom yang tidak ada di daftar, migrasi **berhenti** dan menyebut nama kolomnya, sehingga tidak ada kolom yang diam-diam tertinggal.
- Semua nama snake_case, semua `timestamptz`, `identity` (bukan `serial` + sinkronisasi manual).

---

## 3. Pemetaan tabel lama → baru
| Lama | Baru | Catatan |
|---|---|---|
| `User` | `app_user` | `password`→`password_hash`, `seksi`(teks)→`section_id` |
| `Section` | `section` | 5 kolom warna dipertahankan (snake_case); ditambah semua nama seksi yang hanya muncul sebagai teks |
| `DaishaCatalog` | `daisha_type` + `daisha_variant` + `damage_catalog` | JSONB `components`/`variants` dipecah jadi baris |
| `DaishaType/Variant/Component/Symptom` | — | tidak dipakai; tetap diarsipkan |
| `Daisha` | `daisha` | `nomor_daisha`→`code` (UPPER/TRIM), `nama_daisha`→`type_id`, `seksi`→`section_id`, `jenis`→`kind`, `ukuran`→`size`, `last_maintenance_date`→`last_pm_at`; 3 kolom `last_*` lain diarsipkan |
| `MasterDaisha` | `daisha` | jika tabel ada, unit yang belum ada ikut digabung |
| `MaintenanceLog` | `maintenance_log` | `nomor_daisha` dibuang (ada `daisha_id`), `admin_id`→`performed_by` |
| `Ticket` | `ticket` | `noDaisha`→`daisha_id`; `Queue`→`Open` |
| `Ticket.items` + `TicketDetail` | `ticket_item` | `items` JSON diutamakan (sumber yang dibaca aplikasi), `TicketDetail` dipakai bila `items` kosong |
| `SectionRequest` | `section_request` + `request_form` + `request_phase` + `request_approval` | tiap kolom lama punya tujuan: identitas/alur → inti; isian formulir & foto → `request_form`; `*Estimate`/`*Actual` → `request_phase`; nama/email/status/ttd/waktu/catatan approval → `request_approval` |
| `SectionRequest.materials` + `SectionRequestMaterial` | `request_material` | 1 baris per material, ada FK ke `sparepart`; tabel lama dipakai hanya bila `materials` kosong |
| `SectionRequestNotification` | `notification` | `requestId` yatim → `NULL` (notifikasi tetap ada) |
| `Sparepart` | `sparepart` | `namaKomponen`→`name`, `stokGudang`→`stock`, … |
| `SparepartLog` | `sparepart_log` | `namaKomponen`→`sparepart_id` + salinan `item_name`; kolom `tipe/aksi` dan `qty/jumlah` dua-duanya dikenali |
| `PmStaging` | `pm_pickup` | `units` JSON → `text[]` |

---

## 4. Prosedur migrasi (urutan wajib)

1. **Backup** (opsional tapi disarankan): `pg_dump "$DATABASE_URL" -Fc -f backup_sebelum_migrasi.dump`
2. **Preflight** (`00_preflight.sql`, hanya baca). Pastikan: query #5 dan #11 kosong (#11 = kolom live yang belum terpetakan); status tiket hanya `Open/Progress/Pending/Done/Scrap/Queue`; catat hasil #3, #4, #7 (lihat "Yang berubah" di bawah).
3. **Latihan** di salinan database (restore dump ke database lain) — jalankan langkah 4–5, lalu `03` (cutover), pastikan aplikasi baru berjalan.
4. **Mode maintenance** (hentikan penulisan dari aplikasi), lalu jalankan `01_schema_baru.sql`.
5. **Migrasi data** `02_migrasi_data.sql` — satu transaksi; bila **satu pun** pemeriksaan gagal, seluruhnya dibatalkan dan tabel baru tetap kosong. Tabel lama hanya dibaca, tidak diubah.
6. **Deploy kode aplikasi** yang membaca skema baru (lihat bagian 6) dan uji.
7. **Cutover** `03_cutover_dan_rollback.sql` bagian A: tabel lama **dipindah** ke schema `legacy_v1` sebagai arsip permanen. Tidak ada langkah yang menghapus data lama.

Migrasi tidak dapat dijalankan dua kali (tabel baru sudah ada). Untuk mengulang, sisihkan tabel baru ke schema lain lewat bagian B di `03` (dipindah, bukan dihapus), lalu mulai dari langkah 4.

### Yang berubah / tidak 1:1 (nilai aslinya tetap tersimpan utuh di `legacy_v1`)
- Kode unit kembar setelah `UPPER(TRIM())` (mis. `s00002 ` dan `S00002`) disatukan: baris dengan `updated_at` terbaru dipakai. Log maintenance dari kedua baris tetap dipindah ke unit tersebut.
- `REPAIR_DONE` dan nilai lain selain `RUSAK` → `OK` (sesuai logika migrasi `005`).
- Tiket yang nomor daisha-nya tidak terdaftar → dibuatkan unit `kind='UNKNOWN'` agar tiket tidak hilang; rapikan manual setelahnya (`SELECT * FROM daisha WHERE kind='UNKNOWN'`).
- Log sparepart yatim (komponen sudah dihapus) **ikut dimigrasi** dengan `sparepart_id` NULL; namanya tersimpan di `item_name`.
- `materials`: bila nama cocok dengan gudang (tanpa membedakan huruf besar/kecil), `request_material.sparepart_id` terisi; bila tidak, NULL dan nama tetap tersimpan. `id` lama berbasis `Date.now()` tidak dipertahankan (tidak dirujuk dari tempat lain). `potongStok` + `qtyPotongStok` digabung jadi `stock_deducted`.
- Kolom turunan yang tidak dibawa: `Daisha.last_repair_date/last_waktu_masuk/last_waktu_keluar`, `Sparepart.logs`, `Notification.nomorRequest`, `DaishaCatalog.totalUnits`, varian `totalUnits/rangeFormat` (nilai `rangeFormat` dipakai untuk mengisi `pad_length` bila kosong).

---

## 5. Hasil pengujian skrip
Dijalankan di Postgres sungguhan (PGlite) dengan data uji yang sengaja kotor: kode unit kembar & beda huruf/spasi, tiket tanpa unit, `items` berupa JSON ter-encode string, tiket hanya punya `TicketDetail`, notifikasi yatim, log sparepart yatim, material hanya di tabel lama, kolom `SectionRequest` di luar migrasi, `SparepartLog` versi live.
- Seluruh pemeriksaan jumlah baris lolos; identity berlanjut benar setelah migrasi (id berikutnya = max+1).
- Data rusak (`status='Weird'`) → migrasi berhenti dengan error `ticket_status_check` dan **0 baris** tertulis.
- Kolom tak dikenal (`SectionRequest.kolomBaruLive` ditambahkan sengaja) → migrasi berhenti dengan nama kolomnya dan **0 baris** tertulis.
- Material yang tersimpan sebagai string JSON, desimal (`4.5`), dan hanya ada di tabel lama semuanya terbaca benar; log sparepart yatim ikut terbawa.
- Skrip cutover berjalan dan tabel lama terbaca utuh di `legacy_v1`.

**Belum teruji**: terhadap data produksi Anda yang sebenarnya, dan ERD `.drawio` belum saya buka di aplikasi draw.io (strukturnya divalidasi; garis relasi di-route otomatis oleh draw.io, geser seperlunya).

---

## 6. Perubahan kode aplikasi yang wajib mengikuti
Skema baru mengubah nama tabel/kolom, jadi kode harus disesuaikan sebelum cutover. Response API bisa dibiarkan sama dengan memberi alias di SQL (`SELECT code AS "noDaisha"`).

| File | Perubahan |
|---|---|
| `scripts/migrate.mjs`, `migrations/*` | jadikan `01_schema_baru.sql` baseline baru; file 000–007 cukup tidak dijalankan lagi (boleh dipindah ke folder arsip) |
| `app/api/repair/route.ts` | `Ticket.noDaisha` → cari/buat `daisha` lalu pakai `daisha_id`; `items` JSON & `TicketDetail` → `ticket_item`; berhenti menulis `last_repair_date/last_waktu_*`; `waktuMasuk/Selesai`→`opened_at/closed_at`; stok: pakai `sparepart.id` |
| `app/api/maintenance/*` | `DaishaCatalog` → `daisha_type` + `COUNT(daisha)`; `last_condition`→`condition`; `PmStaging`→`pm_pickup` |
| `app/api/catalog/*`, `lib/daishaCatalogSync.ts` | edit array JSON → `INSERT/UPDATE/DELETE` pada `daisha_type`, `daisha_variant`, `damage_catalog`; sequence `002_*` tidak diperlukan lagi |
| `app/api/section-requests/*`, `lib/nomorSuratServer.ts` | kolom formulir → `request_form`; estimasi/aktual → `request_phase`; kolom approval → `request_approval` per peran; `materials` JSON → `request_material` (potong/kembalikan stok memakai `sparepart_id` dalam transaksi yang sama); `nomorRequest/nomorSurat`→`request_no/letter_no` |
| `app/api/spareparts/*` | `namaKomponen`→`name`, `stokGudang`→`stock`; log memakai `sparepart_id`; rujukan `SectionRequestMaterial` diganti `request_material` (hapus sparepart tidak lagi menghapus log/material: kolomnya jadi NULL, nama tetap ada) |
| `lib/users.ts`, `app/api/users/*` | `User`→`app_user`; `seksi` → join `section` |
| `app/api/catalog/units/route.ts` | ganti rujukan `MasterDaisha`/`DaishaType` dengan `daisha` + `daisha_type` |
| `scripts/seed*.mjs`, `scripts/*sync*`, `check_*` | sesuaikan nama tabel (skrip sinkronisasi kondisi seperti `sync_daisha_condition.mjs` tidak diperlukan lagi karena kondisi dikelola langsung) |

---

## 7. SQL lengkap

### 7.1 `00_preflight.sql`
```sql
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
    ('User', ARRAY['id','username','password','name','role','seksi','description','createdAt','updatedAt']),
    ('Section', ARRAY['id','name','nama','kode','colorName','badgeBg','textColor','borderColor','accentBorder','updatedAt']),
    ('DaishaCatalog', ARRAY['id','name','seksi','codePrefix','totalUnits','components','variants','createdAt','updatedAt']),
    ('Daisha', ARRAY['id','nomor_daisha','nama_daisha','jenis','ukuran','seksi','last_condition','last_maintenance_date','last_repair_date','last_waktu_masuk','last_waktu_keluar','created_at','updated_at']),
    ('MaintenanceLog', ARRAY['id','daisha_id','nomor_daisha','jenis_pekerjaan','kondisi','detail_kerusakan','tindakan','tanggal_pengerjaan','waktu_masuk','waktu_keluar','admin_id','catatan','created_at']),
    ('Ticket', ARRAY['idTiket','noDaisha','namaPelapor','status','waktuMasuk','waktuSelesai','catatan','items']),
    ('TicketDetail', ARRAY['idDetail','idTiket','komponen','gejala','qty','tindakan']),
    ('SectionRequest', ARRAY['id','nomorRequest','nomorSurat','seksiPemohon','picPemohon','kontakPemohon','namaBarang','spesifikasi','jumlah','satuan','urgensi','catatan','status','flowStep','approvalToken','statusApprovalAtasanSeksi','emailAtasanSeksi','namaAtasanSeksi','emailMentorWorkshop','dibuatOleh','waktuDibuat','waktuUpdate','perihal','namaMachine','faktor','tujuan','alasan','kodeSeksi','drafter','foreman','keadaanSekarang','fotoSebelum','rencanaTindakan','fotoSesudah','targetHasil','penjelasanPelaksanaan','biayaEstimate','biayaActual','orangJamEstimate','orangJamActual','waktuEstimate','waktuActual','tglPelaksanaanEstimate','tglPelaksanaanActual','komentarEstimate','komentarActual','keputusan','keputusan8210','keputusan820','hasilCheck','hasilCheckPemohon','schedulePlanning','scheduleActual','alasanPending','alasanTolak','picBengkel','materials','namaManajerSeksi','emailManajerSeksi','statusApprovalManajerSeksi','ttdManajerSeksi','waktuApprovalManajerSeksi','catatanManajerSeksi','ttdAtasanSeksi','waktuApprovalAtasanSeksi','catatanAtasanSeksi','ttdAdminWorkshop','catatanAdmin','ttdDrafter','ttdSpvWorkshop','ttdAtasanSpecialProject','statusApprovalAtasanSpecialProject','waktuApprovalAtasanSpecialProject']),
    ('SectionRequestMaterial', ARRAY['id','requestId','namaKomponen','spesifikasi','jumlah','satuan','keterangan','created_at']),
    ('SectionRequestNotification', ARRAY['id','requestId','nomorRequest','targetRole','targetEmail','targetUser','tipe','judul','pesan','link','isRead','waktu']),
    ('Sparepart', ARRAY['id','namaKomponen','kategori','stokGudang','satuan','minStok','lokasi','logs','created_at','updated_at']),
    ('SparepartLog', ARRAY['id','namaKomponen','aksi','jumlah','user','catatan','tipe','qty','referensi','keterangan','tanggal']),
    ('PmStaging', ARRAY['id','seksi','units','lokasi','catatan','pelapor','status','createdAt','pickedUpAt','completedAt'])
) k(t, cols) ON c.table_name = k.t
WHERE c.table_schema = 'public' AND NOT (c.column_name = ANY (k.cols));
```

### 7.2 `01_schema_baru.sql`
```sql
-- ============================================================================
-- 01_schema_baru.sql  —  Skema minimalis Dashboard Perbaikan Daisha (PostgreSQL 15+)
-- 18 tabel, snake_case, semua relasi pakai FK nyata. Tidak menyentuh tabel lama.
-- ============================================================================

-- ---------- Master ----------
CREATE TABLE section (
  id            int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name          varchar(100) NOT NULL,
  color_name    varchar(50),
  badge_bg      varchar(50),
  text_color    varchar(50),
  border_color  varchar(50),
  accent_border varchar(50)
);
CREATE UNIQUE INDEX uq_section_name ON section (lower(name));

CREATE TABLE app_user (
  id            int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  username      varchar(100) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name          varchar(255) NOT NULL,
  role          varchar(50)  NOT NULL CHECK (role IN ('ADMIN','OPERATOR','USER_SEKSI')),
  section_id    int REFERENCES section(id) ON DELETE SET NULL,
  description   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- Katalog Daisha (gantikan DaishaCatalog + 4 tabel katalog lama) ----------
CREATE TABLE daisha_type (
  id          int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  section_id  int REFERENCES section(id) ON DELETE SET NULL,
  name        varchar(100) NOT NULL,
  code_prefix varchar(20)
);
CREATE UNIQUE INDEX uq_daisha_type_name ON daisha_type (lower(name));
CREATE INDEX idx_daisha_type_section ON daisha_type (section_id);

CREATE TABLE daisha_variant (
  id          int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  type_id     int NOT NULL REFERENCES daisha_type(id) ON DELETE CASCADE,
  name        varchar(100) NOT NULL,
  size        varchar(30),
  arrangement varchar(50),                    -- susunan
  kind        varchar(50),                    -- tipe
  code_prefix varchar(20),
  pad_length  smallint,
  min_number  int,
  max_number  int,
  badge_color varchar(50)
);
CREATE INDEX idx_daisha_variant_type ON daisha_variant (type_id);

-- 1 baris = 1 gejala; komponen tanpa gejala = symptom NULL
CREATE TABLE damage_catalog (
  id        int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  type_id   int NOT NULL REFERENCES daisha_type(id) ON DELETE CASCADE,
  component varchar(100) NOT NULL,
  symptom   text,
  CONSTRAINT uq_damage_catalog UNIQUE NULLS NOT DISTINCT (type_id, component, symptom)
);

-- ---------- Unit & perbaikan ----------
CREATE TABLE daisha (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE,            -- nomor daisha, selalu UPPER(TRIM())
  type_id    int  REFERENCES daisha_type(id) ON DELETE SET NULL,
  section_id int  REFERENCES section(id)     ON DELETE SET NULL,
  kind       text NOT NULL,                  -- jenis: VERTICAL / NAGARA_FILTER / ...
  size       text NOT NULL,                  -- ukuran: SMALL / MEDIUM / LARGE / NONE
  condition  text NOT NULL DEFAULT 'OK' CHECK (condition IN ('OK','RUSAK')),
  last_pm_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_daisha_section ON daisha (section_id);
CREATE INDEX idx_daisha_type    ON daisha (type_id);
CREATE INDEX idx_daisha_rusak   ON daisha (section_id) WHERE condition = 'RUSAK';

CREATE TABLE ticket (
  id         text PRIMARY KEY,                -- idTiket
  daisha_id  uuid NOT NULL REFERENCES daisha(id) ON DELETE RESTRICT,
  reporter   text NOT NULL,
  status     text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Progress','Pending','Done','Scrap')),
  opened_at  timestamptz NOT NULL DEFAULT now(),
  closed_at  timestamptz,
  note       text
);
CREATE INDEX idx_ticket_daisha ON ticket (daisha_id, opened_at DESC);
CREATE INDEX idx_ticket_opened ON ticket (opened_at);
CREATE INDEX idx_ticket_active ON ticket (daisha_id) WHERE status IN ('Open','Progress','Pending');

CREATE TABLE ticket_item (                    -- gantikan Ticket.items JSONB + TicketDetail
  id        int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  ticket_id text NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
  component text,
  symptom   text,
  qty       int NOT NULL DEFAULT 1,
  action    text                              -- Ganti / Perbaiki / ...
);
CREATE INDEX idx_ticket_item_ticket ON ticket_item (ticket_id);

CREATE TABLE maintenance_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daisha_id     uuid NOT NULL REFERENCES daisha(id) ON DELETE CASCADE,
  work_type     text NOT NULL,                -- RUTIN / REPAIR
  condition     text NOT NULL DEFAULT 'OK',
  damage_detail text,
  action        text,
  work_date     timestamptz NOT NULL,
  entered_at    timestamptz,
  exited_at     timestamptz,
  performed_by  text,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mlog_daisha ON maintenance_log (daisha_id, work_date DESC);
CREATE INDEX idx_mlog_date   ON maintenance_log (work_date);

CREATE TABLE pm_pickup (                      -- PmStaging
  id           int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  section_id   int REFERENCES section(id) ON DELETE SET NULL,
  units        text[] NOT NULL DEFAULT '{}',
  location     text,
  note         text,
  reporter     text NOT NULL,
  status       text NOT NULL DEFAULT 'WAITING_PICKUP'
               CHECK (status IN ('WAITING_PICKUP','PICKED_UP','COMPLETED')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  picked_up_at timestamptz,
  completed_at timestamptz
);
CREATE INDEX idx_pm_pickup_section ON pm_pickup (section_id, created_at DESC);

-- ---------- Gudang ----------
CREATE TABLE sparepart (
  id         int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name       varchar(255) NOT NULL UNIQUE,
  category   varchar(100) NOT NULL DEFAULT 'Umum',
  stock      int NOT NULL DEFAULT 0,
  unit       varchar(50)  NOT NULL DEFAULT 'Pcs',
  min_stock  int NOT NULL DEFAULT 0,
  location   varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Pengajuan seksi ----------
CREATE TABLE section_request (
  id              int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  request_no      varchar(100) NOT NULL UNIQUE,
  letter_no       varchar(100),
  section_id      int REFERENCES section(id) ON DELETE SET NULL,
  requester_pic   varchar(100) NOT NULL,
  requester_contact varchar(100),
  created_by      varchar(100),
  title           varchar(255),               -- perihal
  machine         varchar(255),
  urgency         varchar(50)  NOT NULL DEFAULT 'Normal',
  status          varchar(100) NOT NULL DEFAULT 'Menunggu Assign Spv Seksi',
  flow_step       varchar(100) NOT NULL DEFAULT 'STEP_2_WAITING_ATASAN_SEKSI',
  approval_token  varchar(100),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sreq_status  ON section_request (status);
CREATE INDEX idx_sreq_section ON section_request (section_id);
CREATE INDEX idx_sreq_letter  ON section_request (letter_no);
CREATE UNIQUE INDEX uq_sreq_token ON section_request (approval_token) WHERE approval_token IS NOT NULL;

CREATE TABLE request_form (                   -- isian formulir resmi, 1 baris per pengajuan
  request_id      int PRIMARY KEY REFERENCES section_request(id) ON DELETE CASCADE,
  item_name       text NOT NULL,              -- form ringkas: namaBarang, spesifikasi, jumlah, satuan, catatan
  specification   text,
  qty             int  NOT NULL DEFAULT 1,
  unit            text NOT NULL DEFAULT 'Pcs',
  note            text,
  factor          text,                       -- faktor (Safety, ...)
  purpose         text,                       -- tujuan
  reason          text,                       -- alasan
  section_code    text,                       -- kodeSeksi
  drafter         text,
  foreman         text,
  current_state   text,                       -- keadaanSekarang
  action_plan     text,                       -- rencanaTindakan
  target_result   text,                       -- targetHasil
  execution_note  text,                       -- penjelasanPelaksanaan
  photo_before    text,
  photo_after     text,
  decision        text,                       -- keputusan
  decision_8210   text,                       -- keputusan8210
  decision_820    text,                       -- keputusan820
  check_result    text,                       -- hasilCheck
  check_result_by text,                       -- hasilCheckPemohon
  plan_schedule   text,                       -- schedulePlanning
  actual_schedule text,                       -- scheduleActual
  pending_reason  text,                       -- alasanPending
  reject_reason   text,                       -- alasanTolak
  workshop_pic    text,                       -- picBengkel
  mentor_email    text                        -- emailMentorWorkshop
);

CREATE TABLE request_phase (                  -- estimasi & aktual: 2 baris per pengajuan, bukan 10 kolom
  id         int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  request_id int NOT NULL REFERENCES section_request(id) ON DELETE CASCADE,
  phase      text NOT NULL CHECK (phase IN ('ESTIMATE','ACTUAL')),
  cost       text,                            -- biaya
  man_hours  text,                            -- orangJam
  duration   text,                            -- waktu
  exec_date  text,                            -- tglPelaksanaan
  comment    text,                            -- komentar
  UNIQUE (request_id, phase)
);

CREATE TABLE request_material (               -- gantikan SectionRequest.materials JSONB + SectionRequestMaterial
  id            int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  request_id    int NOT NULL REFERENCES section_request(id) ON DELETE CASCADE,
  sparepart_id  int REFERENCES sparepart(id) ON DELETE SET NULL,   -- terisi bila nama cocok dgn gudang
  name          text NOT NULL,                -- salinan nama (tetap ada walau sparepart dihapus)
  kind          text NOT NULL DEFAULT 'SPAREPART' CHECK (kind IN ('SPAREPART','MATERIAL')),
  qty           numeric(14,3) NOT NULL DEFAULT 1,
  unit          text NOT NULL DEFAULT 'Pcs',
  dimension     text,
  stock_deducted numeric(14,3) NOT NULL DEFAULT 0,   -- jumlah yg sudah dipotong dari stok gudang
  note          text
);
CREATE INDEX idx_rmat_request   ON request_material (request_id);
CREATE INDEX idx_rmat_sparepart ON request_material (sparepart_id);

CREATE TABLE request_approval (               -- gantikan ±22 kolom approval/ttd di SectionRequest
  id         int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  request_id int NOT NULL REFERENCES section_request(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN
             ('ATASAN_SEKSI','MANAJER_SEKSI','ATASAN_SPECIAL_PROJECT','ADMIN_WORKSHOP','DRAFTER','SPV_WORKSHOP')),
  name       text,
  email      text,
  status     text,                            -- PENDING / APPROVED / REJECTED
  signature  text,
  decided_at timestamptz,
  note       text,
  UNIQUE (request_id, role)
);

CREATE TABLE notification (
  id           int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  request_id   int REFERENCES section_request(id) ON DELETE CASCADE,
  target_role  varchar(50),
  target_email varchar(255),
  target_user  varchar(100),
  type         varchar(100),
  title        varchar(255) NOT NULL,
  message      text NOT NULL,
  link         text,
  is_read      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON notification (target_user, is_read);
CREATE INDEX idx_notif_role ON notification (target_role, is_read);
CREATE INDEX idx_notif_req  ON notification (request_id);

-- ---------- Gudang (lanjutan) ----------
CREATE TABLE sparepart_log (
  id           int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  sparepart_id int REFERENCES sparepart(id) ON DELETE SET NULL,
  item_name    text NOT NULL,                 -- salinan nama: riwayat tetap utuh walau sparepart dihapus
  type         text NOT NULL CHECK (type IN ('IN','OUT')),
  qty          int  NOT NULL,
  reference    text,                          -- mis. id tiket
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_splog_part ON sparepart_log (sparepart_id, created_at DESC);
```

### 7.3 `02_migrasi_data.sql`
```sql
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
    ('User', ARRAY['id','username','password','name','role','seksi','description','createdAt','updatedAt']),
    ('Section', ARRAY['id','name','nama','kode','colorName','badgeBg','textColor','borderColor','accentBorder','updatedAt']),
    ('DaishaCatalog', ARRAY['id','name','seksi','codePrefix','totalUnits','components','variants','createdAt','updatedAt']),
    ('Daisha', ARRAY['id','nomor_daisha','nama_daisha','jenis','ukuran','seksi','last_condition','last_maintenance_date','last_repair_date','last_waktu_masuk','last_waktu_keluar','created_at','updated_at']),
    ('MaintenanceLog', ARRAY['id','daisha_id','nomor_daisha','jenis_pekerjaan','kondisi','detail_kerusakan','tindakan','tanggal_pengerjaan','waktu_masuk','waktu_keluar','admin_id','catatan','created_at']),
    ('Ticket', ARRAY['idTiket','noDaisha','namaPelapor','status','waktuMasuk','waktuSelesai','catatan','items']),
    ('TicketDetail', ARRAY['idDetail','idTiket','komponen','gejala','qty','tindakan']),
    ('SectionRequest', ARRAY['id','nomorRequest','nomorSurat','seksiPemohon','picPemohon','kontakPemohon','namaBarang','spesifikasi','jumlah','satuan','urgensi','catatan','status','flowStep','approvalToken','statusApprovalAtasanSeksi','emailAtasanSeksi','namaAtasanSeksi','emailMentorWorkshop','dibuatOleh','waktuDibuat','waktuUpdate','perihal','namaMachine','faktor','tujuan','alasan','kodeSeksi','drafter','foreman','keadaanSekarang','fotoSebelum','rencanaTindakan','fotoSesudah','targetHasil','penjelasanPelaksanaan','biayaEstimate','biayaActual','orangJamEstimate','orangJamActual','waktuEstimate','waktuActual','tglPelaksanaanEstimate','tglPelaksanaanActual','komentarEstimate','komentarActual','keputusan','keputusan8210','keputusan820','hasilCheck','hasilCheckPemohon','schedulePlanning','scheduleActual','alasanPending','alasanTolak','picBengkel','materials','namaManajerSeksi','emailManajerSeksi','statusApprovalManajerSeksi','ttdManajerSeksi','waktuApprovalManajerSeksi','catatanManajerSeksi','ttdAtasanSeksi','waktuApprovalAtasanSeksi','catatanAtasanSeksi','ttdAdminWorkshop','catatanAdmin','ttdDrafter','ttdSpvWorkshop','ttdAtasanSpecialProject','statusApprovalAtasanSpecialProject','waktuApprovalAtasanSpecialProject']),
    ('SectionRequestMaterial', ARRAY['id','requestId','namaKomponen','spesifikasi','jumlah','satuan','keterangan','created_at']),
    ('SectionRequestNotification', ARRAY['id','requestId','nomorRequest','targetRole','targetEmail','targetUser','tipe','judul','pesan','link','isRead','waktu']),
    ('Sparepart', ARRAY['id','namaKomponen','kategori','stokGudang','satuan','minStok','lokasi','logs','created_at','updated_at']),
    ('SparepartLog', ARRAY['id','namaKomponen','aksi','jumlah','user','catatan','tipe','qty','referensi','keterangan','tanggal']),
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
INSERT INTO sparepart (id, name, category, stock, unit, min_stock, location, created_at, updated_at)
SELECT id, "namaKomponen", kategori, "stokGudang", satuan, "minStok", lokasi,
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
SELECT m."requestId", m."namaKomponen", 'MATERIAL', m.jumlah::text, m.satuan, m.spesifikasi, NULL, NULL, m.keterangan
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

  SELECT count(*) INTO _exp FROM "Ticket" t,
    LATERAL jsonb_array_elements(CASE jsonb_typeof(t.items) WHEN 'array' THEN t.items
                                 WHEN 'string' THEN (t.items #>> '{}')::jsonb ELSE '[]'::jsonb END);
  SELECT _exp + count(*) INTO _exp FROM "TicketDetail" td
    WHERE NOT EXISTS (SELECT 1 FROM "Ticket" t WHERE t."idTiket" = td."idTiket"
                      AND CASE jsonb_typeof(t.items) WHEN 'array' THEN jsonb_array_length(t.items) ELSE 0 END > 0);
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
```

### 7.4 `03_cutover_dan_rollback.sql`
```sql
-- ============================================================================
-- 03_cutover_dan_rollback.sql
-- A) CUTOVER — jalankan hanya setelah aplikasi baru terbukti jalan.
--    Tabel lama DIPINDAH (bukan dihapus) ke schema legacy_v1 sebagai arsip.
-- ============================================================================
BEGIN;
CREATE SCHEMA IF NOT EXISTS legacy_v1;
ALTER TABLE "User"                       SET SCHEMA legacy_v1;
ALTER TABLE "Section"                    SET SCHEMA legacy_v1;
ALTER TABLE "Daisha"                     SET SCHEMA legacy_v1;
ALTER TABLE "DaishaCatalog"              SET SCHEMA legacy_v1;
ALTER TABLE "MaintenanceLog"             SET SCHEMA legacy_v1;
ALTER TABLE "Ticket"                     SET SCHEMA legacy_v1;
ALTER TABLE "TicketDetail"               SET SCHEMA legacy_v1;
ALTER TABLE "SectionRequest"             SET SCHEMA legacy_v1;
ALTER TABLE "SectionRequestMaterial"     SET SCHEMA legacy_v1;
ALTER TABLE "SectionRequestNotification" SET SCHEMA legacy_v1;
ALTER TABLE "Sparepart"                  SET SCHEMA legacy_v1;
ALTER TABLE "SparepartLog"               SET SCHEMA legacy_v1;
ALTER TABLE "PmStaging"                  SET SCHEMA legacy_v1;
-- tabel baseline yang tidak dipakai kode (abaikan error jika memang tidak ada):
ALTER TABLE IF EXISTS "DaishaType"      SET SCHEMA legacy_v1;
ALTER TABLE IF EXISTS "DaishaVariant"   SET SCHEMA legacy_v1;
ALTER TABLE IF EXISTS "DaishaComponent" SET SCHEMA legacy_v1;
ALTER TABLE IF EXISTS "DaishaSymptom"   SET SCHEMA legacy_v1;
ALTER TABLE IF EXISTS "MasterDaisha"    SET SCHEMA legacy_v1;
COMMIT;
-- Schema legacy_v1 adalah arsip PERMANEN data lama. Tidak ada langkah yang meminta Anda menghapusnya.

-- ============================================================================
-- B) ULANGI / BATAL SEBELUM CUTOVER — tabel lama masih utuh; tabel baru hanya
--    DISISIHKAN ke schema lain (tidak ada yang dihapus). Ganti nama schema bila sudah ada.
-- ============================================================================
-- CREATE SCHEMA baru_gagal_1;
-- ALTER TABLE sparepart_log, request_material, request_phase, request_form, notification, request_approval, section_request,
--   sparepart, pm_pickup, maintenance_log, ticket_item, ticket, daisha, damage_catalog,
--   daisha_variant, daisha_type, app_user, section SET SCHEMA baru_gagal_1;   -- jalankan satu per satu

-- ============================================================================
-- C) ROLLBACK SETELAH CUTOVER — kembalikan tabel lama (data baru yang masuk
--    setelah cutover harus diekspor manual dari tabel baru sebelum ini):
-- ============================================================================
-- ALTER TABLE legacy_v1."User" SET SCHEMA public;  -- ulangi untuk setiap tabel di legacy_v1
```
