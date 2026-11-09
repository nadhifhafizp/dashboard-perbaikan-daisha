-- 50_tighten_dan_kontraksi.sql : dijalankan BERTAHAP, setelah sistem stabil. Setiap blok berdiri sendiri.
-- (10 tabel baru sudah berada di schema public setelah 40_cutover.sql.)

-- ===== BLOK 1 - Rapikan unit penampung =====
-- Unit dengan IsActive = false dan DaishaType = '(TIDAK TERDAFTAR)' adalah kode yang dipakai tiket/antrean lama
-- tetapi tidak ada di master. Daftar:
--   SELECT "UnitCode" FROM "TWMSDaishaCatalog" WHERE NOT "IsActive" AND "DaishaType" = '(TIDAK TERDAFTAR)';
-- Untuk tiap kode: koreksi jenis/seksinya dan aktifkan, contoh:
--   UPDATE "TWMSDaishaCatalog" SET "DaishaType" = 'Inner Liner', "SectionName" = 'Building', "IsActive" = true WHERE "UnitCode" = 'XX1';
-- atau jika kodenya salah ketik, arahkan tiketnya ke unit yang benar lalu hapus penampungnya:
--   UPDATE "TWMSRepairTicket" SET "UnitCode" = 'IL001' WHERE "UnitCode" = 'NOPE01';
--   DELETE FROM "TWMSDaishaCatalog" WHERE "UnitCode" = 'NOPE01';

-- ===== BLOK 2 - Kencangkan constraint (setelah nilai di bagian K 30_verify.sql diperiksa) =====
BEGIN;
ALTER TABLE "TWMSMaintenanceLog" ADD CONSTRAINT ck_twms_staging_status
  CHECK ("StagingStatus" IS NULL OR "StagingStatus" IN ('WAITING_PICKUP','PICKED_UP','COMPLETED'));
-- Aktifkan hanya setelah daftar nilai di data Anda dipastikan:
-- ALTER TABLE "TWMSRepairTicket" ADD CONSTRAINT ck_twms_ticket_status CHECK ("Status" IN ('Queue','Open','Progress','Pending','Done','Scrap'));
-- ALTER TABLE "TWMSSparepartLog" ADD CONSTRAINT ck_twms_movement CHECK ("MovementType" IN ('IN','OUT'));
COMMIT;

-- ===== BLOK 3 - Tahan data yang sengaja tidak punya tempat di 10 tabel, lalu hapus legacy =====
-- Tidak masuk 10 tabel: konfigurasi varian/rentang kode (DaishaCatalog), warna seksi (Section), notifikasi pengajuan.
-- Pindahkan dulu ke schema "arsip" agar tidak ikut terhapus. TIDAK bisa dibatalkan setelah DROP; lakukan
-- minimal 2-4 minggu setelah cutover dan setelah backup baru.
-- BEGIN;
-- CREATE SCHEMA IF NOT EXISTS arsip;
-- ALTER TABLE IF EXISTS legacy."DaishaCatalog"              SET SCHEMA arsip;
-- ALTER TABLE IF EXISTS legacy."Section"                    SET SCHEMA arsip;
-- ALTER TABLE IF EXISTS legacy."SectionRequestNotification" SET SCHEMA arsip;
-- DROP SCHEMA legacy CASCADE;
-- COMMIT;
