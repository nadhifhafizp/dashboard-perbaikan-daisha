import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const daishaTypes = await sql`SELECT * FROM "DaishaType"`;
    console.log("DaishaType count:", daishaTypes.length);
    for (const dt of daishaTypes) {
      console.log(`- [${dt.seksi || dt.section || 'no-seksi'}] ${dt.nama || dt.name || dt.code} (${dt.kode || dt.id})`);
    }

    const masterDaisha = await sql`SELECT * FROM "MasterDaisha" LIMIT 20`;
    console.log("MasterDaisha sample count:", masterDaisha.length);
    for (const md of masterDaisha) {
      console.log(`- ${md.nomor_daisha} | ${md.nama_daisha} | ${md.seksi} | ${md.jenis}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
