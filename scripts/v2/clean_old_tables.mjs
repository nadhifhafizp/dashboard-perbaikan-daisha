import postgres from 'postgres';

const url = process.env.DATABASE_URL;
const sql = postgres(url, { prepare: false, ssl: 'require', max: 1 });

const tablesToDropFromPublic = [
  'repair_ticket_items',
  'repair_tickets',
  'ticket_item',
  'ticket',
  'pm_pickup',
  'maintenance_logs',
  'maintenance_log',
  'damage_catalog',
  'daisha_units',
  'daisha_variant',
  'daisha_type',
  'daisha_catalogs',
  'daisha',
  'sparepart_movements',
  'sparepart_log',
  'spareparts',
  'sparepart',
  'section_request_materials',
  'section_request_approvals',
  'section_request_notifications',
  'section_requests',
  'section_request',
  'request_material',
  'request_approval',
  'request_phase',
  'request_form',
  'notification',
  'sections',
  'section',
  'app_user',
  'users',
];

try {
  console.log('> Mulai pembersihan tabel lama...');

  // 1. Simpan tabel arsip dari legacy jika belum ada
  await sql.unsafe(`
    CREATE SCHEMA IF NOT EXISTS arsip;
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'legacy' AND table_name = 'DaishaCatalog') THEN
        ALTER TABLE legacy."DaishaCatalog" SET SCHEMA arsip;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'legacy' AND table_name = 'Section') THEN
        ALTER TABLE legacy."Section" SET SCHEMA arsip;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'legacy' AND table_name = 'SectionRequestNotification') THEN
        ALTER TABLE legacy."SectionRequestNotification" SET SCHEMA arsip;
      END IF;
    END $$;
  `);
  console.log('Tabel arsip diamankan di schema "arsip".');

  // 2. Drop schema legacy
  await sql.unsafe(`DROP SCHEMA IF EXISTS legacy CASCADE;`);
  console.log('Schema "legacy" berhasil dihapus.');

  // 3. Drop seluruh tabel lama lowercase di public
  for (const tbl of tablesToDropFromPublic) {
    await sql.unsafe(`DROP TABLE IF EXISTS public."${tbl}" CASCADE;`);
  }
  console.log(`31 tabel lama di schema "public" berhasil dihapus.`);

  // 4. Verifikasi tabel yang tersisa di public
  const remainingTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log('\nTabel yang tersisa di schema "public":');
  console.table(remainingTables);
} catch (err) {
  console.error('GAGAL:', err);
} finally {
  await sql.end();
}
