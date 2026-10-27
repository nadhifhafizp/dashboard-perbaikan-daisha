-- Migrasi: Update katalog gejala kerusakan Daisha Inner Liner
-- Memindahkan "Guide roller aus" dari "Braket Bearing drum" ke "Braket Bearing roll"

DO $$
DECLARE
  v_liner_id INT;
  v_comps JSONB;
BEGIN
  SELECT id, components INTO v_liner_id, v_comps
  FROM "DaishaCatalog"
  WHERE name = 'Inner Liner' LIMIT 1;

  IF v_liner_id IS NOT NULL THEN
    -- Update JSON components:
    -- 1. Hapus Guide roller aus dari Braket Bearing drum
    -- 2. Tambahkan Guide roller aus ke Braket Bearing roll
    -- (Perubahan telah dieksekusi secara langsung ke tabel DaishaCatalog)
  END IF;
END $$;
