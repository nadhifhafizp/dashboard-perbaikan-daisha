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
