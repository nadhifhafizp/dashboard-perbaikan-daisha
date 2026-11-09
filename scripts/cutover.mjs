import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false,
  max: 1,
});

async function run() {
  console.log('🚀 [Cutover] Moving legacy tables into schema legacy_v1...');
  const cutoverSql = `
    BEGIN;
    CREATE SCHEMA IF NOT EXISTS legacy_v1;
    ALTER TABLE IF EXISTS "User"                       SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "Section"                    SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "Daisha"                     SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "DaishaCatalog"              SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "MaintenanceLog"             SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "Ticket"                     SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "TicketDetail"               SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "SectionRequest"             SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "SectionRequestMaterial"     SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "SectionRequestNotification" SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "Sparepart"                  SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "SparepartLog"               SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "PmStaging"                  SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "DaishaType"                 SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "DaishaVariant"              SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "DaishaComponent"            SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "DaishaSymptom"              SET SCHEMA legacy_v1;
    ALTER TABLE IF EXISTS "MasterDaisha"               SET SCHEMA legacy_v1;
    COMMIT;
  `;

  await sql.unsafe(cutoverSql);
  console.log('✅ Legacy tables safely moved to schema "legacy_v1" as permanent archive!');

  const legacyTables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'legacy_v1' 
    ORDER BY table_name;
  `;
  console.log(`📦 Archived ${legacyTables.length} tables in legacy_v1:`);
  console.log(legacyTables.map(r => '  - legacy_v1.' + r.table_name).join('\n'));

  await sql.end();
}

run().catch(async (err) => {
  console.error('❌ Cutover failed:', err);
  await sql.end();
  process.exit(1);
});
