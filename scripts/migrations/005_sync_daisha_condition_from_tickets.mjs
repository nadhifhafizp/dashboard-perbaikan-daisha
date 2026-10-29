import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('DATABASE_URL tidak ditemukan di environment');
  process.exit(1);
}

const sql = postgres(connString, { ssl: 'require', prepare: false });

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

async function run() {
  try {
    console.log('Menjalankan migrasi 005: Sinkronisasi last_condition dari status tiket...');

    // Step 1: Unit dengan tiket Done (dan tidak ada tiket aktif) → OK
    const result1 = await sql`
      UPDATE "Daisha" d
      SET "last_condition" = 'OK',
          "updated_at" = now()
      WHERE d."last_condition" IN ('RUSAK', 'REPAIR_DONE')
        AND EXISTS (
          SELECT 1
          FROM "Ticket" t
          WHERE UPPER(TRIM(t."noDaisha")) = UPPER(TRIM(d."nomor_daisha"))
            AND t."status" = 'Done'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "Ticket" t3
          WHERE UPPER(TRIM(t3."noDaisha")) = UPPER(TRIM(d."nomor_daisha"))
            AND t3."status" IN ('Open', 'Progress', 'Pending')
        )
    `;
    console.log(`  Step 1: ${result1.count} unit diperbarui ke 'OK' (tiket Done, tidak ada antrean aktif)`);

    // Step 2: Unit REPAIR_DONE tanpa tiket aktif → OK
    const result2 = await sql`
      UPDATE "Daisha" d
      SET "last_condition" = 'OK',
          "updated_at" = now()
      WHERE d."last_condition" = 'REPAIR_DONE'
        AND NOT EXISTS (
          SELECT 1
          FROM "Ticket" t
          WHERE UPPER(TRIM(t."noDaisha")) = UPPER(TRIM(d."nomor_daisha"))
            AND t."status" IN ('Open', 'Progress', 'Pending')
        )
    `;
    console.log(`  Step 2: ${result2.count} unit diperbarui ke 'OK' (REPAIR_DONE tanpa antrean aktif)`);

    // Verifikasi hasil akhir
    const stats = await sql`
      SELECT last_condition, COUNT(*)::int AS jumlah
      FROM "Daisha"
      GROUP BY last_condition
      ORDER BY jumlah DESC
    `;

    console.log('\nDistribusi last_condition setelah migrasi:');
    for (const row of stats) {
      console.log(`  ${row.last_condition ?? 'NULL'}: ${row.jumlah} unit`);
    }

    console.log('\nMigrasi 005 selesai.');
  } catch (err) {
    console.error('Error saat migrasi:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();

