-- Migration 005: Sinkronisasi last_condition tabel Daisha dari status tiket
--
-- Masalah: Unit yang tiketnya sudah Done/Scrap masih menyimpan last_condition = 'RUSAK'
-- karena kode lama menyetel 'REPAIR_DONE' saat selesai, bukan 'OK'.
-- Akibatnya KPI "Jumlah Daisha NG" menghitung lebih dari jumlah antrean aktif di bengkel.
--
-- Aturan sinkronisasi:
--   - Jika tiket terbaru unit = Done  → last_condition = 'OK'
--   - Jika tiket terbaru unit = Scrap → last_condition = 'RUSAK'
--   - Jika tiket terbaru unit = Open/Progress/Pending → last_condition = 'RUSAK' (biarkan)
--   - Jika tidak ada tiket sama sekali dan last_condition = 'REPAIR_DONE' → 'OK'

-- Step 1: Unit dengan tiket terbaru = Done → kondisi OK
UPDATE "Daisha" d
SET "last_condition" = 'OK',
    "updated_at" = now()
WHERE d."last_condition" IN ('RUSAK', 'REPAIR_DONE')
  AND EXISTS (
    SELECT 1
    FROM "Ticket" t
    WHERE UPPER(TRIM(t."noDaisha")) = UPPER(TRIM(d."nomor_daisha"))
      AND t."status" = 'Done'
      AND NOT EXISTS (
        SELECT 1
        FROM "Ticket" t2
        WHERE UPPER(TRIM(t2."noDaisha")) = UPPER(TRIM(d."nomor_daisha"))
          AND t2."status" IN ('Open', 'Progress', 'Pending')
          AND t2."waktuMasuk" > t."waktuMasuk"
      )
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Ticket" t3
    WHERE UPPER(TRIM(t3."noDaisha")) = UPPER(TRIM(d."nomor_daisha"))
      AND t3."status" IN ('Open', 'Progress', 'Pending')
  );

-- Step 2: Unit dengan last_condition = 'REPAIR_DONE' yang tidak ada tiket aktif → OK
UPDATE "Daisha" d
SET "last_condition" = 'OK',
    "updated_at" = now()
WHERE d."last_condition" = 'REPAIR_DONE'
  AND NOT EXISTS (
    SELECT 1
    FROM "Ticket" t
    WHERE UPPER(TRIM(t."noDaisha")) = UPPER(TRIM(d."nomor_daisha"))
      AND t."status" IN ('Open', 'Progress', 'Pending')
  );

-- Verifikasi hasil:
SELECT
  last_condition,
  COUNT(*) AS jumlah_unit
FROM "Daisha"
GROUP BY last_condition
ORDER BY jumlah_unit DESC;

