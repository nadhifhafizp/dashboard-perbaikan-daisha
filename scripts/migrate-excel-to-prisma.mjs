import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POWER_AUTOMATE_GET_URL = "https://60c8769b69b3e10fa61ae5898cb17f.57.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/1c73e325d5bf449fbe410b155061d4c6/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=djzMdFcRKabnMKGRsV-ftRBADLozaw6NhCIKa6aBv7M";

function detectDaishaSize(noDaisha) {
  if (!noDaisha) return 'Standard';
  const clean = noDaisha.trim().toUpperCase();
  if (clean.startsWith('L')) return 'L';
  if (clean.startsWith('M')) return 'M';
  if (clean.startsWith('S') || clean.startsWith('84')) return 'S';
  return 'Standard';
}

function parseExcelOrTextDate(val) {
  if (!val || val === '-' || val === 'null' || val === 'undefined') return null;
  const str = String(val).trim();
  
  // 1. Cek jika Excel Serial Number (misal: 46216.55625)
  const num = parseFloat(str);
  if (!isNaN(num) && num > 30000 && num < 70000 && !str.includes('-') && !str.includes('/') && !str.includes(':')) {
    try {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(excelEpoch.getTime() + num * 86400000);
    } catch {
      return null;
    }
  }

  // 2. Cek jika format DD/MM/YYYY HH:mm
  if (str.includes('/')) {
    const [datePart, timePart] = str.split(' ');
    const segs = datePart.split('/');
    if (segs.length === 3) {
      const [d, m, y] = segs;
      const [hh, mm] = (timePart || '00:00').split(':');
      const year = y.length === 2 ? `20${y}` : y;
      const parsed = new Date(parseInt(year), parseInt(m) - 1, parseInt(d), parseInt(hh || '0'), parseInt(mm || '0'));
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  // 3. Fallback standard Date parsing
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function parseTicketDamageDetail(detailStr) {
  if (!detailStr || detailStr.trim() === '' || detailStr.trim() === '-') return [];

  let text = detailStr.trim();
  const noteMatch = text.match(/\(Catatan:\s*(.*?)\)\s*$/i);
  if (noteMatch) {
    text = text.replace(noteMatch[0], '').trim();
  }

  const rawSplits = text.split('|').map((s) => s.trim()).filter(Boolean);
  const items = [];

  for (const raw of rawSplits) {
    const match = raw.match(
      /^(?:\d+\.\s*)?\[(.*?)\]\s*(.*?)(?:\s*\((?:(?:Qty|Jumlah):\s*(\d+)(?:,\s*|\s*\|\s*)?Tindakan:\s*(Repair|Ganti)|Tindakan:\s*(Repair|Ganti)(?:,\s*|\s*\|\s*)?(?:Qty|Jumlah):\s*(\d+)|Tindakan:\s*(Repair|Ganti)|(?:Qty|Jumlah):\s*(\d+))\))?$/i
    );

    if (match) {
      const komponen = match[1].trim();
      const gejala = match[2].trim();
      const rawQty = match[3] || match[6] || match[8] || '1';
      const qty = Math.max(1, parseInt(rawQty, 10) || 1);
      const rawTindakan = match[4] || match[5] || match[7] || 'Repair';
      const tindakan = rawTindakan.toLowerCase() === 'ganti' ? 'Ganti' : 'Repair';

      items.push({
        komponen,
        gejala,
        qty,
        tindakan,
      });
    } else {
      items.push({
        komponen: 'Umum',
        gejala: raw,
        qty: 1,
        tindakan: 'Repair',
      });
    }
  }

  return items;
}

async function migrate() {
  console.log('🔄 Memulai migrasi data dari Excel Online ke SQLite (Prisma)...');
  
  console.log('📡 Mengambil data dari Power Automate...');
  const res = await fetch(POWER_AUTOMATE_GET_URL);
  if (!res.ok) {
    throw new Error(`Gagal fetch dari Power Automate (Status: ${res.status})`);
  }

  const json = await res.json();
  const rawTickets = (json.value || json).filter(x => x.ID_Tiket && String(x.ID_Tiket).trim() !== '');

  console.log(`📋 Ditemukan ${rawTickets.length} tiket valid di Excel Online.`);

  // 1. Inisialisasi Master Daisha
  console.log('📦 Memasukkan data ke MasterDaisha...');
  const masterMap = new Map();
  for (const t of rawTickets) {
    const noDaisha = String(t.No_Daisha || '-').trim();
    const namaDaisha = String(t.Nama_Daisha || '-').trim();
    const seksi = String(t.Seksi || '-').trim();
    const ukuran = detectDaishaSize(noDaisha);

    if (noDaisha !== '-') {
      masterMap.set(noDaisha, {
        noDaisha,
        namaDaisha,
        ukuran,
        seksi,
      });
    }
  }

  for (const master of masterMap.values()) {
    await prisma.masterDaisha.upsert({
      where: { noDaisha: master.noDaisha },
      update: {
        namaDaisha: master.namaDaisha,
        ukuran: master.ukuran,
        seksi: master.seksi,
      },
      create: master,
    });
  }
  console.log(`✅ Berhasil menyimpan ${masterMap.size} unit unik ke MasterDaisha.`);

  // 2. Inisialisasi Sparepart Stok Awal
  console.log('🛒 Mempersiapkan katalog stok Sparepart...');
  const defaultSpareparts = [
    { namaKomponen: 'Roda Putar', stokGudang: 50, satuan: 'pcs' },
    { namaKomponen: 'Roda Tetap', stokGudang: 40, satuan: 'pcs' },
    { namaKomponen: 'Ring', stokGudang: 100, satuan: 'pcs' },
    { namaKomponen: 'Dorongan', stokGudang: 30, satuan: 'pcs' },
    { namaKomponen: 'Gandengan belakang', stokGudang: 25, satuan: 'pcs' },
    { namaKomponen: 'Gandengan depan', stokGudang: 25, satuan: 'pcs' },
    { namaKomponen: 'Body frame', stokGudang: 20, satuan: 'pcs' },
    { namaKomponen: 'Plat No', stokGudang: 50, satuan: 'pcs' },
    { namaKomponen: 'Hanger', stokGudang: 30, satuan: 'pcs' },
    { namaKomponen: 'Stopper dudukan ring', stokGudang: 40, satuan: 'pcs' },
  ];

  for (const sp of defaultSpareparts) {
    await prisma.sparepart.upsert({
      where: { namaKomponen: sp.namaKomponen },
      update: {},
      create: sp,
    });
  }
  console.log(`✅ Katalog ${defaultSpareparts.length} jenis Sparepart siap.`);

  // 3. Memasukkan Tiket & Rincian Titik Kerusakan
  console.log('📋 Mengonversi dan memasukkan data Tiket & TicketDetail...');
  let countTickets = 0;
  let countDetails = 0;

  for (const t of rawTickets) {
    const idTiket = String(t.ID_Tiket).trim();
    const noDaisha = String(t.No_Daisha || '-').trim();
    const namaPelapor = String(t.Nama_Pelapor || 'Anonim').trim();
    const status = String(t.Status || 'Open').trim();
    const catatan = t.Catatan && t.Catatan !== '-' ? String(t.Catatan).trim() : null;

    const waktuMasuk = parseExcelOrTextDate(t.Waktu_Masuk) || new Date();
    const waktuSelesai = parseExcelOrTextDate(t.Waktu_Keluar);

    // Pastikan master unit ada jika belum ada di map
    if (noDaisha !== '-' && !masterMap.has(noDaisha)) {
      await prisma.masterDaisha.upsert({
        where: { noDaisha },
        update: {},
        create: {
          noDaisha,
          namaDaisha: String(t.Nama_Daisha || '-').trim(),
          ukuran: detectDaishaSize(noDaisha),
          seksi: String(t.Seksi || '-').trim(),
        },
      });
      masterMap.set(noDaisha, true);
    }

    // Upsert Tiket
    await prisma.ticket.upsert({
      where: { idTiket },
      update: {
        noDaisha,
        namaPelapor,
        status,
        waktuMasuk,
        waktuSelesai,
        catatan,
      },
      create: {
        idTiket,
        noDaisha,
        namaPelapor,
        status,
        waktuMasuk,
        waktuSelesai,
        catatan,
      },
    });
    countTickets++;

    // Hapus detail lama jika ada lalu masukkan detail baru
    await prisma.ticketDetail.deleteMany({ where: { idTiket } });

    const details = parseTicketDamageDetail(t.Detail_Kerusakan);
    for (const d of details) {
      await prisma.ticketDetail.create({
        data: {
          idTiket,
          komponen: d.komponen,
          gejala: d.gejala,
          tindakan: d.tindakan,
          qty: d.qty,
        },
      });
      countDetails++;
    }
  }

  console.log(`\n🎉 MIGRASI SELESAI DENGAN SUKSES!`);
  console.log(`- Total Tiket: ${countTickets}`);
  console.log(`- Total Detail Kerusakan: ${countDetails}`);
  console.log(`- Total Master Daisha: ${masterMap.size}`);
  console.log(`- Database SQLite lokal: prisma/dev.db`);
}

migrate()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat migrasi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
