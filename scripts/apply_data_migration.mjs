import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false,
  max: 1,
  idle_timeout: 300,
  max_lifetime: 600,
  connect_timeout: 30,
});

async function run() {
  console.log('🚀 [Step 2] Executing 02_migrasi_data.sql in transaction...');
  const migrationSql = fs.readFileSync(path.resolve('sql/02_migrasi_data.sql'), 'utf8');

  const startTime = Date.now();
  await sql.unsafe(migrationSql);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ 02_migrasi_data.sql completed and committed in ${duration}s!`);

  // Print counts of new tables
  const tables = [
    'section', 'app_user', 'daisha_type', 'daisha_variant', 'damage_catalog',
    'daisha', 'ticket', 'ticket_item', 'maintenance_log', 'pm_pickup',
    'sparepart', 'section_request', 'request_form', 'request_phase',
    'request_material', 'request_approval', 'notification', 'sparepart_log'
  ];

  console.log('\n📊 Row counts in new schema:');
  for (const t of tables) {
    const res = await sql.unsafe(`SELECT count(*) as count FROM ${t}`);
    console.log(`  - ${t}: ${res[0].count} rows`);
  }

  await sql.end();
}

run().catch(async (err) => {
  console.error('❌ Migration failed and was ROLLED BACK automatically:', err);
  await sql.end();
  process.exit(1);
});
