import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function syncSequences() {
  const tables = [
    { table: 'TicketDetail', col: 'idDetail' },
    { table: 'DaishaComponent', col: 'id' },
    { table: 'DaishaSymptom', col: 'id' },
    { table: 'DaishaType', col: 'id' },
    { table: 'DaishaVariant', col: 'id' },
    { table: 'Section', col: 'id' },
    { table: 'SectionRequest', col: 'id' },
    { table: 'SectionRequestMaterial', col: 'id' },
    { table: 'SparepartLog', col: 'id' },
    { table: 'User', col: 'id' },
  ];

  for (const { table, col } of tables) {
    try {
      const quotedTable = `"${table}"`;
      const seqName = await sql`
        SELECT pg_get_serial_sequence(${quotedTable}, ${col}) as seq
      `;
      const seq = seqName[0]?.seq;
      console.log(`Table ${quotedTable}.${col} -> sequence: ${seq}`);

      if (seq) {
        const maxValResult = await sql`
          SELECT COALESCE(MAX(${sql(col)}), 0)::bigint as max_val FROM ${sql(table)}
        `;
        const maxVal = Number(maxValResult[0].max_val);
        const nextVal = maxVal > 0 ? maxVal : 1;

        await sql`
          SELECT setval(${seq}::regclass, ${nextVal}, true)
        `;
        console.log(`  Synced ${seq} to ${nextVal}`);
      }
    } catch (err) {
      console.warn(`  Warning syncing ${table}.${col}:`, err.message);
    }
  }

  await sql.end();
}

syncSequences();
