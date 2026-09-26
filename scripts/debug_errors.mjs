import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

function detectDaishaSize(no) {
  return { code: 'Medium' };
}

function parseTicketDamageDetail(detail) {
  return {
    items: [
      { komponen: 'Roda / Caster', gejala: 'Roda pecah', tindakan: 'Ganti', qty: 2 }
    ]
  };
}

function parseToTimestamp(str) {
  return Date.parse(str) || Date.now();
}

async function debugTicketCreate() {
  console.log('=== Debug Ticket Create ===');
  const idTiket = `TCK-DEBUG-${Date.now()}`;
  const waktuMasuk = '2026-09-23 10:00';
  const namaPelapor = 'Budi Teknisi';
  const seksi = 'TBR Produksi';
  const namaDaisha = 'FLAT BED TBR';
  const noDaisha = 'FBD-001';
  const detail = '1. [Roda / Caster] Roda pecah (Qty: 2, Tindakan: Ganti)';

  try {
    const sizeInfo = detectDaishaSize(noDaisha);
    const ukuran = sizeInfo?.code || 'Standard';
    console.log('1. Upserting MasterDaisha...');
    await sql`
      INSERT INTO "MasterDaisha" ("noDaisha", "namaDaisha", "ukuran", "seksi")
      VALUES (${noDaisha}, ${namaDaisha}, ${ukuran}, ${seksi})
      ON CONFLICT ("noDaisha") DO UPDATE 
      SET "namaDaisha" = EXCLUDED."namaDaisha", "ukuran" = EXCLUDED."ukuran", "seksi" = EXCLUDED."seksi"
    `;

    console.log('2. Inserting Ticket...');
    let parsedDateMasuk = new Date();
    if (waktuMasuk) {
      const ts = parseToTimestamp(waktuMasuk);
      if (ts > 0) parsedDateMasuk = new Date(ts);
    }
    await sql`
      INSERT INTO "Ticket" ("idTiket", "noDaisha", "namaPelapor", "status", "waktuMasuk", "catatan")
      VALUES (${idTiket}, ${noDaisha}, ${namaPelapor}, 'Open', ${parsedDateMasuk}, '-')
    `;

    console.log('3. Inserting TicketDetail...');
    const parsedDetails = parseTicketDamageDetail(detail);
    console.log('Parsed details:', parsedDetails);
    if (parsedDetails.items.length > 0) {
      await sql`
        INSERT INTO "TicketDetail" ("idTiket", "komponen", "gejala", "tindakan", "qty")
        VALUES ${sql(parsedDetails.items.map(it => [idTiket, it.komponen, it.gejala, it.tindakan || 'Repair', it.qty || 1]))}
      `;
    }

    console.log('4. Updating Sparepart...');
    const gantiItems = parsedDetails.items.filter((it) => it.tindakan === 'Ganti');
    for (const it of gantiItems) {
      await sql`
        UPDATE "Sparepart"
        SET "stokGudang" = "stokGudang" - ${it.qty || 1}
        WHERE "namaKomponen" = ${it.komponen}
      `;
    }
    console.log('Ticket create SUCCESS!');

    // Cleanup
    await sql`DELETE FROM "TicketDetail" WHERE "idTiket" = ${idTiket}`;
    await sql`DELETE FROM "Ticket" WHERE "idTiket" = ${idTiket}`;
  } catch (err) {
    console.error('Ticket Create Error:', err);
  }
}

async function debugSparepart() {
  console.log('\n=== Debug Spareparts ===');
  const sps = await sql`SELECT "namaKomponen", "stokGudang" FROM "Sparepart" LIMIT 5`;
  console.log('Existing spareparts in DB:', sps);

  if (sps.length > 0) {
    const testComp = sps[0].namaKomponen;
    console.log(`Testing RESTOCK for "${testComp}"...`);
    try {
      await sql.begin(async (tx) => {
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" + 5
          WHERE "namaKomponen" = ${testComp}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, keterangan, tanggal)
          VALUES (${testComp}, 'IN', 5, 'Test restock', NOW())
        `;
      });
      console.log('Restock SUCCESS!');
    } catch (err) {
      console.error('Restock Error:', err);
    }
  }
}

async function main() {
  await debugTicketCreate();
  await debugSparepart();
  await sql.end();
}

main();
