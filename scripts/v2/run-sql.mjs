// scripts/v2/run-sql.mjs - menjalankan 1 file .sql apa adanya (multi-statement, termasuk BEGIN/COMMIT di dalamnya).
// Pemakaian:  node scripts/v2/run-sql.mjs scripts/v2/10_ddl_v2.sql
// Gunakan koneksi LANGSUNG Supabase (port 5432), bukan pooler transaction (6543).
import postgres from 'postgres';
import fs from 'fs';

const file = process.argv[2];
const url = process.env.DATABASE_URL;
if (!file || !url) {
  console.error('Pemakaian: DATABASE_URL=... node scripts/v2/run-sql.mjs <file.sql>');
  process.exit(1);
}

const sql = postgres(url, {
  ssl: process.env.PGSSL === 'disable' ? false : 'require',
  prepare: false,
  max: 1,
  onnotice: (n) => console.log('NOTICE:', n.message),
});

try {
  console.log(`> menjalankan ${file}`);
  await sql.unsafe(fs.readFileSync(file, 'utf8')).simple();
  console.log('selesai tanpa error');
} catch (err) {
  console.error('GAGAL:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
