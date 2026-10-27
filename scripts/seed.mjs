/**
 * scripts/seed.mjs — Skrip Seeding Database Terpadu
 * 
 * Menggabungkan seluruh populasi master armada Daisha (Vertical S/M/L, Nagara Filter),
 * akun pengguna seksi, tiket demo komprehensif, log maintenance, dan inventaris sparepart.
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable wajib diisi.');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  max: 2,
  idle_timeout: 10,
  connect_timeout: 10,
  ssl: 'require',
  prepare: false,
});

async function main() {
  console.log('🚀 Memulai proses seeding database terpadu...');

  try {
    // =========================================================================
    // 1. POPULASI MASTER ARMADA DAISHA
    // =========================================================================
    console.log('📦 [1/5] Memeriksa master armada Daisha...');
    const [existingFleet] = await sql`SELECT count(*)::int as count FROM "Daisha"`;
    
    if (existingFleet.count === 0) {
      console.log('   Mengisi 650 unit armada Daisha default pabrik (S, M, L, NF)...');
      const unitsToInsert = [];

      // 1.1 Daisha Vertical - Small (1..200)
      for (let i = 1; i <= 200; i++) {
        const pad = String(i).padStart(3, '0');
        unitsToInsert.push({ nomor_daisha: `S-${pad}`, jenis: 'VERTICAL', ukuran: 'SMALL', seksi: 'Building' });
      }

      // 1.2 Daisha Vertical - Medium (1..200)
      for (let i = 1; i <= 200; i++) {
        const pad = String(i).padStart(3, '0');
        unitsToInsert.push({ nomor_daisha: `M-${pad}`, jenis: 'VERTICAL', ukuran: 'MEDIUM', seksi: 'Banbury' });
      }

      // 1.3 Daisha Vertical - Large (1..200)
      for (let i = 1; i <= 200; i++) {
        const pad = String(i).padStart(3, '0');
        unitsToInsert.push({ nomor_daisha: `L-${pad}`, jenis: 'VERTICAL', ukuran: 'LARGE', seksi: 'Cutt/Cal' });
      }

      // 1.4 Daisha Nagara Filter (1..50)
      for (let i = 1; i <= 50; i++) {
        const pad = String(i).padStart(2, '0');
        unitsToInsert.push({ nomor_daisha: `NF-${pad}`, jenis: 'NAGARA_FILTER', ukuran: 'NONE', seksi: 'Extruding' });
      }

      const chunkSize = 100;
      for (let i = 0; i < unitsToInsert.length; i += chunkSize) {
        const chunk = unitsToInsert.slice(i, i + chunkSize);
        for (const u of chunk) {
          await sql`
            INSERT INTO "Daisha" ("nomor_daisha", "jenis", "ukuran", "seksi", "nama_daisha", "last_condition")
            VALUES (${u.nomor_daisha}, ${u.jenis}, ${u.ukuran}, ${u.seksi}, ${'Daisha ' + u.seksi}, 'OK')
            ON CONFLICT ("nomor_daisha") DO NOTHING
          `;
        }
      }
      console.log(`   ✓ ${unitsToInsert.length} master armada unit berhasil ditambahkan.`);
    } else {
      console.log(`   ✓ Master armada Daisha sudah terisi (${existingFleet.count} unit).`);
    }

    // =========================================================================
    // 2. AKUN PENGGUNA SEKSI
    // =========================================================================
    console.log('👤 [2/5] Memeriksa akun pengguna representatif...');
    const [sampleAdmin] = await sql`SELECT password FROM "User" WHERE role = 'ADMIN' LIMIT 1`;
    if (!sampleAdmin?.password) {
      console.log('   ⚠️ Akun Admin belum dibuat. Harap jalankan "npm run db:seed-users" terlebih dahulu.');
    } else {
      const defaultPasswordHash = sampleAdmin.password;

      const seksiUsers = [
        { username: 'banbury', name: 'SEKSI_BANBURY', seksi: 'Banbury' },
        { username: 'calendering', name: 'SEKSI_CUTTCAL', seksi: 'Cutt/Cal' },
        { username: 'bead', name: 'SEKSI_BEAD', seksi: 'Bead' },
        { username: 'extruding', name: 'SEKSI_EXTRUDING', seksi: 'Extruding' },
        { username: 'polyfilm', name: 'SEKSI_POLYFILM', seksi: 'Poly Film' },
      ];

      for (const u of seksiUsers) {
        await sql`
          INSERT INTO "User" ("username", "password", "name", "role", "seksi", "description", "createdAt", "updatedAt")
          VALUES (${u.username}, ${defaultPasswordHash}, ${u.name}, 'USER_SEKSI', ${u.seksi}, ${'Perwakilan Seksi ' + u.seksi}, NOW(), NOW())
          ON CONFLICT ("username") DO NOTHING
        `;
      }
      console.log('   ✓ Akun pengguna perwakilan seksi siap.');
    }

    // =========================================================================
    // 3. STOK SPAREPART WORKSHOP
    // =========================================================================
    console.log('🔩 [3/5] Memperbarui stok katalog sparepart bengkel...');
    const demoSpareparts = [
      { namaKomponen: 'Roda Kestor 6" PU Swivel (Heavy Duty)', kategori: 'Roda / Kestor', stokGudang: 4, satuan: 'Pcs', minStok: 12, lokasi: 'Rak A-01 (Kritis)' },
      { namaKomponen: 'Bearing 6204-2RS Nachi Japan', kategori: 'Bearing', stokGudang: 8, satuan: 'Pcs', minStok: 20, lokasi: 'Laci B-03 (Menipis)' },
      { namaKomponen: 'Roda Kestor 8" PU Rigid (Beban Berat)', kategori: 'Roda / Kestor', stokGudang: 18, satuan: 'Pcs', minStok: 10, lokasi: 'Rak A-02 (Aman)' },
      { namaKomponen: 'Pin Pengunci Stopper Daisha (Baja)', kategori: 'Mekanik & Stopper', stokGudang: 32, satuan: 'Pcs', minStok: 15, lokasi: 'Rak C-01 (Aman)' },
      { namaKomponen: 'Plat Kunci Pengait B-Truck 4mm', kategori: 'Plat & Rangka', stokGudang: 45, satuan: 'Pcs', minStok: 20, lokasi: 'Rak C-02 (Aman)' },
      { namaKomponen: 'Baut Hex M10 x 30mm SS 304 Grade 8.8', kategori: 'Fastener / Baut', stokGudang: 180, satuan: 'Pcs', minStok: 50, lokasi: 'Bin Box D-01 (Aman)' },
      { namaKomponen: 'Kawat Las Kobelco LB-52 3.2mm', kategori: 'Bahan Las', stokGudang: 25, satuan: 'Kg', minStok: 10, lokasi: 'Gudang Kimia & Las' },
      { namaKomponen: 'Cat Epoxy Red Bridgestone 5 Kg', kategori: 'Pengecatan', stokGudang: 6, satuan: 'Kaleng', minStok: 3, lokasi: 'Gudang Cat Bengkel' },
      { namaKomponen: 'Handle Rubber Grip Ergonomis Daisha', kategori: 'Handle & Aksesori', stokGudang: 22, satuan: 'Pcs', minStok: 10, lokasi: 'Rak E-01 (Aman)' }
    ];

    for (const sp of demoSpareparts) {
      await sql`
        INSERT INTO "Sparepart" ("namaKomponen", "kategori", "stokGudang", "satuan", "minStok", "lokasi", "logs", "created_at", "updated_at")
        VALUES (
          ${sp.namaKomponen}, ${sp.kategori}, ${sp.stokGudang}, ${sp.satuan}, ${sp.minStok}, ${sp.lokasi},
          ${JSON.stringify([{ tanggal: '2026-10-26', aksi: 'Opname Stok Awal', jumlah: sp.stokGudang, user: 'admin' }])},
          NOW(), NOW()
        )
        ON CONFLICT ("namaKomponen") 
        DO UPDATE SET 
          "stokGudang" = EXCLUDED."stokGudang",
          "minStok" = EXCLUDED."minStok",
          "lokasi" = EXCLUDED."lokasi",
          "updated_at" = NOW();
      `;
    }
    console.log(`   ✓ Stok sparepart bengkel berhasil disinkronkan (${demoSpareparts.length} item).`);

    console.log('✅ Seeding database selesai secara komprehensif!');
  } catch (err) {
    console.error('❌ Gagal menjalankan seeding:', err);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
