import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

async function run() {
  console.log('🚀 [Step 1] Applying 01_schema_baru.sql...');
  const schemaSql = fs.readFileSync(path.resolve('sql/01_schema_baru.sql'), 'utf8');
  await sql.unsafe(schemaSql);
  console.log('✅ 01_schema_baru.sql applied successfully!');

  // Verify created tables
  const newTables = [
    'section', 'app_user', 'daisha_type', 'daisha_variant', 'damage_catalog',
    'daisha', 'ticket', 'ticket_item', 'maintenance_log', 'pm_pickup',
    'sparepart', 'section_request', 'request_form', 'request_phase',
    'request_material', 'request_approval', 'notification', 'sparepart_log'
  ];

  const created = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ANY(${newTables})
    ORDER BY table_name;
  `;
  console.log(`✅ ${created.length}/${newTables.length} new tables verified in public schema:`);
  console.log(created.map(r => '  - ' + r.table_name).join('\n'));

  await sql.end();
}
run().catch(async (err) => {
  console.error('❌ Error applying schema:', err);
  await sql.end();
  process.exit(1);
});
