-- 41_rollback.sql : kembalikan ke tabel lama. Hanya aman jika BELUM ada data baru yang ditulis ke 10 tabel baru
-- sejak cutover (data baru itu tidak ada di tabel lama). Bila sudah ada, ekspor dulu (pg_dump -t) sebelum rollback.
BEGIN;

CREATE SCHEMA v2;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'TWMSUsers',
    'TWMSDaishaCatalog',
    'TWMSDamageCatalog',
    'TWMSRepairTicket',
    'TWMSRepairTicketDetail',
    'TWMSSectionRequest',
    'TWMSSectionRequestMaterial',
    'TWMSMaintenanceLog',
    'TWMSSparepartMaster',
    'TWMSSparepartLog']
  LOOP
    EXECUTE format('ALTER TABLE public.%I SET SCHEMA v2', t);
  END LOOP;

  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'legacy' ORDER BY tablename LOOP
    EXECUTE format('ALTER TABLE legacy.%I SET SCHEMA public', t);
  END LOOP;
END $$;

DROP SCHEMA legacy;

COMMIT;
