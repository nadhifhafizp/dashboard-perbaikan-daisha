-- 40_cutover.sql : tukar tabel lama <-> baru dalam SATU transaksi (DDL di PostgreSQL bersifat transaksional).
-- Jalankan HANYA saat jendela maintenance & setelah 20_backfill.sql + 30_verify.sql bersih.
-- Nama tabel baru (TWMS...) tidak bentrok dengan tabel lama ("User", "Ticket", ...).
-- Tabel lama dipindah ke schema "legacy" (tidak dihapus).
BEGIN;

CREATE SCHEMA IF NOT EXISTS legacy;

DO $$
DECLARE t text;
BEGIN
  -- 1) tabel lama -> schema legacy (yang tidak ada dilewati)
  FOREACH t IN ARRAY ARRAY[
    'User','Section','Daisha','MasterDaisha','DaishaCatalog','DaishaType','DaishaVariant',
    'DaishaComponent','DaishaSymptom','Ticket','TicketDetail','MaintenanceLog','PmStaging',
    'SectionRequest','SectionRequestMaterial','SectionRequestNotification','Sparepart','SparepartLog']
  LOOP
    EXECUTE format('ALTER TABLE IF EXISTS public.%I SET SCHEMA legacy', t);
  END LOOP;

  -- 2) 10 tabel baru v2 -> public
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'v2' ORDER BY tablename LOOP
    EXECUTE format('ALTER TABLE v2.%I SET SCHEMA public', t);
  END LOOP;
END $$;

DROP SCHEMA v2;   -- gagal (dan seluruh transaksi di-rollback) bila masih ada isinya: perlindungan yang disengaja

COMMIT;
