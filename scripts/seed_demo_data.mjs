import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, {
  max: 2,
  idle_timeout: 5,
  connect_timeout: 10,
  ssl: 'require',
});

async function main() {
  console.log('🚀 Memulai proses pengisian data dummy komprehensif...');

  const today = new Date('2026-10-22T08:30:00.000Z');
  const yesterday = new Date('2026-10-21T10:15:00.000Z');
  const twoDaysAgo = new Date('2026-10-20T14:00:00.000Z');
  const threeDaysAgo = new Date('2026-10-19T09:20:00.000Z');

  try {
    // 0. Ambil sample unit daisha nyata dari masing-masing seksi
    console.log('🔍 [0/5] Mengambil nomor unit nyata dari database...');
    const getUnits = async (seksi, limit = 15) => {
      const res = await sql`
        SELECT id, nomor_daisha, seksi, jenis, ukuran, COALESCE(nama_daisha, jenis) as nama_daisha
        FROM "Daisha"
        WHERE LOWER(seksi) = LOWER(${seksi})
        ORDER BY nomor_daisha ASC
        LIMIT ${limit};
      `;
      return res;
    };

    const bldUnits = await getUnits('Building', 20);
    const bbyUnits = await getUnits('Banbury', 20);
    const bdUnits = await getUnits('Bead', 20);
    const calUnits = await getUnits('Cutt/Cal', 20);
    const extUnits = await getUnits('Extruding', 20);
    const plyUnits = await getUnits('Poly Film', 20);

    console.log(`   Ditemukan: Building (${bldUnits.length}), Banbury (${bbyUnits.length}), Bead (${bdUnits.length}), Cutt/Cal (${calUnits.length}), Extruding (${extUnits.length}), Poly Film (${plyUnits.length})`);

    // =========================================================================
    // 1. DATA USER TAMBAHAN (Seksi Banbury, Seksi Cutt/Cal)
    // =========================================================================
    console.log('👤 [1/5] Memeriksa & membuat akun pengguna Seksi...');
    const [buildingUser] = await sql`SELECT password FROM "User" WHERE username = 'building'`;
    if (buildingUser) {
      await sql`
        INSERT INTO "User" ("username", "password", "name", "role", "seksi", "description", "createdAt", "updatedAt")
        VALUES 
          ('banbury', ${buildingUser.password}, 'SEKSI_BANBURY', 'USER_SEKSI', 'Banbury', 'User Perwakilan Seksi Banbury', NOW(), NOW()),
          ('cuttcal', ${buildingUser.password}, 'SEKSI_CUTTCAL', 'USER_SEKSI', 'Cutt/Cal', 'User Perwakilan Seksi Cutt/Cal', NOW(), NOW()),
          ('bead', ${buildingUser.password}, 'SEKSI_BEAD', 'USER_SEKSI', 'Bead', 'User Perwakilan Seksi Bead', NOW(), NOW())
        ON CONFLICT ("username") DO NOTHING;
      `;
      console.log('   ✅ Akun pengguna seksi (banbury, cuttcal, bead) siap (password: building123)');
    }

    // =========================================================================
    // 2. DATA TIKET PERBAIKAN AKTIF (Pending, Process, Done Hari Ini)
    // =========================================================================
    console.log('🎫 [2/5] Menambahkan Tiket Perbaikan Aktif (Pending, Process, Done)...');
    
    // Hapus tiket demo sebelumnya jika ada
    await sql`DELETE FROM "TicketDetail" WHERE "idTiket" LIKE 'DEMO-%'`;
    await sql`DELETE FROM "Ticket" WHERE "idTiket" LIKE 'DEMO-%'`;

    const demoTickets = [
      {
        idTiket: 'DEMO-20261022-001',
        noDaisha: bldUnits[0].nomor_daisha,
        namaPelapor: 'Budi Santoso (Building)',
        status: 'Pending',
        waktuMasuk: today,
        waktuSelesai: null,
        catatan: `Roda belakang sebelah kiri pada unit ${bldUnits[0].nomor_daisha} seret dan oblak parah saat membawa beban.`,
        items: [
          { komponen: 'Roda / Kestor', gejala: 'Roda pecah / aus / oblak / macet', tindakan: 'Ganti Roda Polyurethane 6 Inch' },
          { komponen: 'Bearing', gejala: 'Bunyi decit kencang & putaran macet', tindakan: 'Ganti Bearing 6204-2RS' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-002',
        noDaisha: bbyUnits[0].nomor_daisha,
        namaPelapor: 'Agus Hidayat (Banbury)',
        status: 'Pending',
        waktuMasuk: today,
        waktuSelesai: null,
        catatan: `Rangka unit ${bbyUnits[0].nomor_daisha} bengkok tertabrak sudut pallet, pintu stopper samping tidak bisa terkunci rapat.`,
        items: [
          { komponen: 'Frame / Rangka', gejala: 'Rangka bengkok / retak / patah lasan', tindakan: 'Pelurusan Frame hidrolik & las ulang' },
          { komponen: 'Pengunci / Stopper', gejala: 'Pin pengunci macet / aus', tindakan: 'Setel ulang mekanisme pegas stopper' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-003',
        noDaisha: bdUnits[0].nomor_daisha,
        namaPelapor: 'Dedi Kurniawan (Bead)',
        status: 'Pending',
        waktuMasuk: today,
        waktuSelesai: null,
        catatan: `Pin pengunci unit ${bdUnits[0].nomor_daisha} longgar, berisiko jatuh saat ditarik towing car.`,
        items: [
          { komponen: 'Pengunci / Stopper', gejala: 'Kuncian goyang & baut kendor', tindakan: 'Ganti baut grade 8.8 & pasang bushing baru' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-004',
        noDaisha: calUnits[0].nomor_daisha,
        namaPelapor: 'Iwan Prasetyo (Cutt/Cal)',
        status: 'Pending',
        waktuMasuk: today,
        waktuSelesai: null,
        catatan: `Grip karet sobek dan pipa pegangan goyang pada sambungan las bawah unit ${calUnits[0].nomor_daisha}.`,
        items: [
          { komponen: 'Handle / Pegangan', gejala: 'Pipa gagang goyang / lasan retak', tindakan: 'Pengelasan ulang bracket handle' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-005',
        noDaisha: extUnits[0].nomor_daisha,
        namaPelapor: 'Hendra Wijaya (Extruding)',
        status: 'Process',
        waktuMasuk: yesterday,
        waktuSelesai: null,
        catatan: `Sedang dikerjakan teknisi bengkel: pembongkaran 2 unit castor roda depan unit ${extUnits[0].nomor_daisha}.`,
        items: [
          { komponen: 'Roda / Kestor', gejala: 'Karet ban terkelupas & bracket peyang', tindakan: 'Sedang fabrikasi bracket baru & ganti roda' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-006',
        noDaisha: bldUnits[1].nomor_daisha,
        namaPelapor: 'Rian Saputra (Building)',
        status: 'Process',
        waktuMasuk: yesterday,
        waktuSelesai: null,
        catatan: `Sedang dalam pengelasan plat penguat tray bagian bawah di workshop untuk unit ${bldUnits[1].nomor_daisha}.`,
        items: [
          { komponen: 'Dudukan / Tray', gejala: 'Plat dasar melengkung', tindakan: 'Pasang plat penguat 3.2mm & cat ulang' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-007',
        noDaisha: plyUnits[0].nomor_daisha,
        namaPelapor: 'Syarif Hidayat (Poly Film)',
        status: 'Process',
        waktuMasuk: twoDaysAgo,
        waktuSelesai: null,
        catatan: `Pedal rem roda tidak mengunci dengan kencang saat di lereng lantai pada unit ${plyUnits[0].nomor_daisha}.`,
        items: [
          { komponen: 'Rem / Kestor Brake', gejala: 'Mekanisme pedal aus', tindakan: 'Ganti per pegas & kampas rem roda' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-008',
        noDaisha: bldUnits[2].nomor_daisha,
        namaPelapor: 'Budi Santoso (Building)',
        status: 'Done',
        waktuMasuk: yesterday,
        waktuSelesai: today,
        catatan: `Perbaikan unit ${bldUnits[2].nomor_daisha} selesai tuntas dan telah diuji beban di lantai uji bengkel.`,
        items: [
          { komponen: 'Roda / Kestor', gejala: 'Aus pemakaian normal', tindakan: 'Penggantian 4 roda PU 6 inch + bearing' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-009',
        noDaisha: bbyUnits[1].nomor_daisha,
        namaPelapor: 'Agus Hidayat (Banbury)',
        status: 'Done',
        waktuMasuk: twoDaysAgo,
        waktuSelesai: today,
        catatan: `Pengencangan seluruh baut struktural dan pelumasan grease bearing pada unit ${bbyUnits[1].nomor_daisha}.`,
        items: [
          { komponen: 'Pelumasan & Baut', gejala: 'Kering & kendor', tindakan: 'Greasing chassis & re-torque baut' }
        ]
      },
      {
        idTiket: 'DEMO-20261022-010',
        noDaisha: bdUnits[1].nomor_daisha,
        namaPelapor: 'Dedi Kurniawan (Bead)',
        status: 'Done',
        waktuMasuk: threeDaysAgo,
        waktuSelesai: yesterday,
        catatan: `Pin stopper baru pada unit ${bdUnits[1].nomor_daisha} telah dipasang dan berfungsi sempurna.`,
        items: [
          { komponen: 'Pengunci / Stopper', gejala: 'Pin patah', tindakan: 'Pasang pin baja hardened baru' }
        ]
      }
    ];

    for (const t of demoTickets) {
      await sql`
        INSERT INTO "Ticket" ("idTiket", "noDaisha", "namaPelapor", "status", "waktuMasuk", "waktuSelesai", "catatan", "items", "created_at", "updated_at")
        VALUES (${t.idTiket}, ${t.noDaisha}, ${t.namaPelapor}, ${t.status}, ${t.waktuMasuk}, ${t.waktuSelesai}, ${t.catatan}, ${JSON.stringify(t.items)}, ${t.waktuMasuk}, NOW());
      `;

      for (const item of t.items) {
        await sql`
          INSERT INTO "TicketDetail" ("idTiket", "komponen", "gejala", "tindakan", "created_at", "updated_at")
          VALUES (${t.idTiket}, ${item.komponen}, ${item.gejala}, ${item.tindakan}, ${t.waktuMasuk}, NOW());
        `;
      }
    }
    console.log(`   ✅ ${demoTickets.length} tiket demo berhasil dimasukkan (4 Pending, 3 Process, 3 Done)`);

    // =========================================================================
    // 3. LOG MAINTENANCE & PM HARI INI & 14 HARI TERAKHIR
    // =========================================================================
    console.log('⚙️  [3/5] Menambahkan Log Preventive Maintenance (PM) aktif...');

    const allSampleUnits = [
      ...bldUnits.slice(3, 8),
      ...bbyUnits.slice(2, 7),
      ...bdUnits.slice(2, 7),
      ...calUnits.slice(1, 6),
      ...extUnits.slice(1, 6),
      ...plyUnits.slice(1, 6),
    ];

    const datesToSeed = [
      { date: new Date('2026-10-22T03:30:00Z'), count: 5, rutin: 4, repair: 1 },
      { date: new Date('2026-10-21T04:15:00Z'), count: 7, rutin: 6, repair: 1 },
      { date: new Date('2026-10-20T05:00:00Z'), count: 6, rutin: 5, repair: 1 },
      { date: new Date('2026-10-19T06:30:00Z'), count: 5, rutin: 4, repair: 1 },
      { date: new Date('2026-10-16T04:00:00Z'), count: 6, rutin: 6, repair: 0 },
      { date: new Date('2026-10-15T05:30:00Z'), count: 5, rutin: 4, repair: 1 },
      { date: new Date('2026-10-14T03:45:00Z'), count: 6, rutin: 5, repair: 1 },
    ];

    let daishaIdx = 0;
    for (const ds of datesToSeed) {
      for (let i = 0; i < ds.count; i++) {
        const daisha = allSampleUnits[daishaIdx % allSampleUnits.length];
        daishaIdx++;

        const isRepair = i >= ds.rutin;
        const jenisPekerjaan = isRepair ? 'REPAIR' : 'RUTIN';
        const kondisi = isRepair ? 'RUSAK' : 'OK';
        const tindakan = isRepair 
          ? 'Perbaikan stopper & las ulang bracket roda'
          : 'Pemeriksaan torsi baut, pelumasan bearing, pembersihan kotoran karet roda';

        await sql`
          INSERT INTO "MaintenanceLog" (
            "id", "daisha_id", "nomor_daisha", "jenis_pekerjaan", "tanggal_pengerjaan",
            "admin_id", "catatan", "kondisi", "tindakan", "waktu_masuk", "waktu_keluar", "created_at", "updated_at"
          ) VALUES (
            gen_random_uuid(), ${daisha.id}, ${daisha.nomor_daisha}, ${jenisPekerjaan}, ${ds.date},
            'admin', 'Inspeksi berkala tahunan tim maintenance workshop', ${kondisi}, ${tindakan},
            ${ds.date}, ${new Date(ds.date.getTime() + 45 * 60 * 1000)}, ${ds.date}, ${ds.date}
          );
        `;

        // Update status daisha terkait
        await sql`
          UPDATE "Daisha"
          SET 
            last_maintenance_date = ${ds.date},
            last_condition = ${kondisi},
            last_waktu_masuk = ${ds.date},
            last_waktu_keluar = ${new Date(ds.date.getTime() + 45 * 60 * 1000)},
            updated_at = NOW()
          WHERE id = ${daisha.id};
        `;
      }
    }
    console.log('   ✅ Log Maintenance Oktober 2026 berhasil ditambahkan (Grafik tren 14 hari & capaian harian kini terisi)');

    // =========================================================================
    // 4. ANTREAN PENJEMPUTAN PM WORKSHOP (PmStaging)
    // =========================================================================
    console.log('🚚 [4/5] Menambahkan Antrean Penyiapan Unit PM Seksi (PmStaging)...');
    
    // Hapus staging lama demo
    await sql`DELETE FROM "PmStaging" WHERE catatan LIKE '%[DEMO]%'`;

    const demoStagings = [
      {
        seksi: 'Banbury',
        units: bbyUnits.slice(3, 9).map(u => u.nomor_daisha),
        lokasi: 'Area Line Banbury 2 - Titik Kumpul Daisha A',
        catatan: '[DEMO] Mohon ditarik shift 1 pagi ini, unit sudah selesai dibersihkan oleh operator.',
        pelapor: 'Agus Hidayat (Banbury)',
        status: 'WAITING_PICKUP',
        createdAt: today
      },
      {
        seksi: 'Building',
        units: bldUnits.slice(8, 14).map(u => u.nomor_daisha),
        lokasi: 'Depan Line Building 3 - Dekat Pintu Roller Shutter',
        catatan: '[DEMO] Siap tarik ke workshop untuk jadwal PM berkala.',
        pelapor: 'SEKSI_BUILDING',
        status: 'WAITING_PICKUP',
        createdAt: new Date(today.getTime() - 2 * 3600 * 1000)
      },
      {
        seksi: 'Cutt/Cal',
        units: calUnits.slice(4, 9).map(u => u.nomor_daisha),
        lokasi: 'Gudang Antara Cutt/Cal Bay 4',
        catatan: '[DEMO] Daisha Inner Liner selesai proses produksi, siap diangkut.',
        pelapor: 'Staff Cutt/Cal',
        status: 'WAITING_PICKUP',
        createdAt: yesterday
      },
      {
        seksi: 'Extruding',
        units: extUnits.slice(5, 9).map(u => u.nomor_daisha),
        lokasi: 'Area Extruder 3',
        catatan: '[DEMO] Sudah dijemput tim workshop pada jam 08.00.',
        pelapor: 'Supervisor Extruding',
        status: 'PICKED_UP',
        createdAt: yesterday,
        pickedUpAt: today
      }
    ];

    for (const s of demoStagings) {
      await sql`
        INSERT INTO "PmStaging" ("seksi", "units", "lokasi", "catatan", "pelapor", "status", "createdAt", "pickedUpAt")
        VALUES (${s.seksi}, ${s.units}, ${s.lokasi}, ${s.catatan}, ${s.pelapor}, ${s.status}, ${s.createdAt}, ${s.pickedUpAt || null});
      `;
    }
    console.log('   ✅ 4 Antrean penjemputan PM berhasil dibuat (3 WAITING_PICKUP, 1 PICKED_UP)');

    // =========================================================================
    // 5. SPECIAL PROJECT & REQUEST SEKSI (SectionRequest)
    // =========================================================================
    console.log('📋 [5/5] Mengisi Request Seksi / Special Project komprehensif...');
    
    await sql`DELETE FROM "SectionRequestMaterial" WHERE "namaBarang" LIKE '%[DEMO]%'`;
    await sql`DELETE FROM "SectionRequest" WHERE "nomorRequest" LIKE 'REQ-2026-%'`;

    const demoRequests = [
      {
        nomorRequest: 'REQ-2026-001',
        seksiPemohon: 'Building',
        picPemohon: 'Ahmad Fauzi',
        kontakPemohon: 'Ext. 3421 / 0812-8899-1001',
        perihal: 'Modifikasi Stopper Karet dan Penambahan Handle Ergonomis Daisha Green Tire',
        namaBarang: 'Daisha Green Tire PSR',
        spesifikasi: 'Material plat SS400 tebal 3mm, karet bantalan NBR durometer 70A, handle pipa 1 inch dilapisi karet isolator anti-slip.',
        jumlah: 6,
        satuan: 'Unit',
        urgensi: 'URGENT',
        status: 'MENUNGGU_APPROVAL_ATASAN',
        flowStep: 'WAITING_ATASAN',
        catatan: 'Permintaan perbaikan ergonomi hasil audit K3 bulan Oktober 2026 untuk mencegah cedera punggung operator saat menarik daisha beban penuh.',
        tujuan: 'Meningkatkan kenyamanan kerja operator dan mencegah green tire tergores rangka samping.',
        alasan: 'Stopper bawaan berbahan besi sering meninggalkan goresan pada sidewall ban sebelum proses curing.',
        namaMachine: 'TBR-02 Line Building',
        kodeSeksi: 'BLD-01',
        drafter: 'Budi Santoso',
        foreman: 'Wahyu Pratama',
        namaAtasanSeksi: 'Ir. Haryono (Section Manager Building)',
        emailAtasanSeksi: 'haryono@bridgestone.local',
        statusApprovalAtasanSeksi: 'MENUNGGU',
        biayaEstimate: 'Rp 2.450.000',
        orangJamEstimate: '16 Orang-Jam',
        waktuDibuat: today,
        materials: [
          { namaBarang: '[DEMO] Karet Bantalan NBR 70A', spesifikasi: 'Tebal 10mm x Lebar 50mm x 1m', jumlah: 6, satuan: 'Lembar' },
          { namaBarang: '[DEMO] Pipa Seamless 1 Inch', spesifikasi: 'Schedule 40 Panjang 6m', jumlah: 2, satuan: 'Batang' },
          { namaBarang: '[DEMO] Baut M10x35 SS 304', spesifikasi: 'Stainless Steel Grade A2', jumlah: 24, satuan: 'Pcs' }
        ]
      },
      {
        nomorRequest: 'REQ-2026-002',
        seksiPemohon: 'Banbury',
        picPemohon: 'Bambang Sutrisno',
        kontakPemohon: 'Ext. 2105 / 0813-7722-4411',
        perihal: 'Fabrikasi Rak Penyangga Daisha Can Chemical Khusus Anti-Tumpah',
        namaBarang: 'Rak Daisha Can Chemical',
        spesifikasi: 'Konstruksi hollow 40x40x2.3mm, plat bordes 2.3mm anti-slip, dilengkapi penampung cairan tumpahan (spill containment).',
        jumlah: 2,
        satuan: 'Unit',
        urgensi: 'TINGGI',
        status: 'MENUNGGU_DISETUJUI_WORKSHOP',
        flowStep: 'WAITING_WORKSHOP',
        catatan: 'Sudah disetujui Section Manager Banbury, dokumen menunggu verifikasi jadwal pengerjaan oleh Leader Workshop.',
        tujuan: 'Pencegahan tumpahan chemical cair ke lantai mixing sesuai standar ISO 14001.',
        alasan: 'Wadah can sering tergeser saat dipindahkan dengan forklift.',
        namaMachine: 'Line BB-04',
        kodeSeksi: 'BBY-02',
        drafter: 'Agus Hidayat',
        foreman: 'Sutanto',
        namaAtasanSeksi: 'Drs. Supriyanto (Manager Banbury)',
        emailAtasanSeksi: 'supriyanto@bridgestone.local',
        statusApprovalAtasanSeksi: 'APPROVED',
        waktuApprovalAtasanSeksi: yesterday,
        catatanAtasanSeksi: 'Disetujui untuk prioritas minggu ke-4 Oktober 2026.',
        biayaEstimate: 'Rp 4.800.000',
        orangJamEstimate: '28 Orang-Jam',
        waktuDibuat: yesterday,
        materials: [
          { namaBarang: '[DEMO] Pipa Hollow 40x40x2.3mm', spesifikasi: 'Besi Hitam SNI 6m', jumlah: 6, satuan: 'Batang' },
          { namaBarang: '[DEMO] Plat Bordes 2.3mm', spesifikasi: 'Ukuran 4x8 feet', jumlah: 2, satuan: 'Lembar' }
        ]
      },
      {
        nomorRequest: 'REQ-2026-003',
        seksiPemohon: 'Cutt/Cal',
        picPemohon: 'Iwan Prasetyo',
        kontakPemohon: 'Ext. 1940 / 0815-2233-9988',
        perihal: 'Perbaikan Total Poros Roda & Pengelasan Frame Daisha Inner Liner',
        namaBarang: 'Daisha Inner Liner Heavy Duty',
        spesifikasi: 'Penggantian as roda solid ST-60 diameter 25mm, bubut ulang bushing bronze, las full fillet kawat LB-52U.',
        jumlah: 4,
        satuan: 'Unit',
        urgensi: 'TINGGI',
        status: 'DALAM_PENGERJAAN',
        flowStep: 'WORKSHOP_PROCESS',
        catatan: 'Sedang dikerjakan teknisi Workshop (Joko & Tim Las). Progress pengerjaan saat ini 60%.',
        tujuan: 'Mengembalikan kelurusan rolling daisha agar gulungan inner liner tidak bergetar.',
        alasan: 'Poros roda aus akibat gesekan beban berat kontinu 800kg.',
        namaMachine: 'Calender-01 Line',
        kodeSeksi: 'CAL-03',
        drafter: 'Iwan Prasetyo',
        foreman: 'Rahmat Basuki',
        namaAtasanSeksi: 'Budi Santosa, ST',
        statusApprovalAtasanSeksi: 'APPROVED',
        waktuApprovalAtasanSeksi: twoDaysAgo,
        statusApprovalAtasanSpecialProject: 'APPROVED',
        waktuApprovalAtasanSpecialProject: yesterday,
        picBengkel: 'Joko Susilo (Special Project Workshop)',
        biayaEstimate: 'Rp 3.500.000',
        biayaActual: 'Rp 3.420.000',
        orangJamEstimate: '20 Orang-Jam',
        schedulePlanning: '20 Okt 2026 - 25 Okt 2026',
        waktuDibuat: twoDaysAgo,
        materials: [
          { namaBarang: '[DEMO] As Besi Solid ST-60', spesifikasi: 'Diameter 25mm x 1.5m', jumlah: 4, satuan: 'Batang' },
          { namaBarang: '[DEMO] Bushing Bronze CuSn8', spesifikasi: 'ID 25mm OD 32mm L 40mm', jumlah: 8, satuan: 'Pcs' }
        ]
      },
      {
        nomorRequest: 'REQ-2026-004',
        seksiPemohon: 'Bead',
        picPemohon: 'Dedi Kurniawan',
        kontakPemohon: 'Ext. 2801 / 0818-4455-6677',
        perihal: 'Penggantian Roda Heavy Duty Caster 8 Inch Daisha Bead Preset',
        namaBarang: 'Roda Daisha Bead Preset',
        spesifikasi: 'Roda heavy duty polyurethane 8 inch x 2 inch kapasitas 600kg/roda, plate mounting 100x115mm.',
        jumlah: 8,
        satuan: 'Pcs',
        urgensi: 'NORMAL',
        status: 'PENDING_MATERIAL',
        flowStep: 'PENDING_MATERIAL',
        catatan: 'Menunggu kedatangan suku cadang roda caster dari supplier via Purchasing.',
        alasanPending: 'PO telah diterbitkan ke PT Caster Mandiri, jadwal kirim tanggal 27 Oktober 2026.',
        tujuan: 'Mengganti roda aus yang membuat daisha berat didorong manual.',
        alasan: 'Roda lama sudah aus hingga menyentuh velg besi.',
        namaMachine: 'Bead Grommet Machine',
        kodeSeksi: 'BD-01',
        drafter: 'Dedi Kurniawan',
        foreman: 'Gunawan',
        namaAtasanSeksi: 'Hendro Cahyono',
        statusApprovalAtasanSeksi: 'APPROVED',
        waktuApprovalAtasanSeksi: threeDaysAgo,
        statusApprovalAtasanSpecialProject: 'APPROVED',
        waktuApprovalAtasanSpecialProject: twoDaysAgo,
        biayaEstimate: 'Rp 4.200.000',
        waktuDibuat: threeDaysAgo,
        materials: [
          { namaBarang: '[DEMO] Caster Heavy Duty PU 8 Inch', spesifikasi: 'Swivel with Total Brake, Red Core', jumlah: 8, satuan: 'Pcs' }
        ]
      },
      {
        nomorRequest: 'REQ-2026-005',
        seksiPemohon: 'Extruding',
        picPemohon: 'Hendra Wijaya',
        kontakPemohon: 'Ext. 1512 / 0811-2244-6688',
        perihal: 'Pembuatan Dudukan Sensor Proximity pada Daisha Monowire',
        namaBarang: 'Bracket Sensor Daisha Monowire',
        spesifikasi: 'Plat stainless 304 tebal 2mm, lubang mounting sensor M18x1.5, finishing electropolishing.',
        jumlah: 4,
        satuan: 'Set',
        urgensi: 'NORMAL',
        status: 'SELESAI',
        flowStep: 'COMPLETED',
        catatan: 'Proyek fabrikasi telah rampung, sudah dipasang di line extruding dan diverifikasi bekerja normal.',
        tujuan: 'Integrasi sistem penghitung putaran kabel otomatis ke PLC line.',
        alasan: 'Mengurangi kesalahan pencatatan manual panjang kabel monowire.',
        namaMachine: 'Extruder T-03',
        kodeSeksi: 'EXT-01',
        drafter: 'Hendra Wijaya',
        foreman: 'Subagyo',
        namaAtasanSeksi: 'Teguh Wibowo',
        statusApprovalAtasanSeksi: 'APPROVED',
        statusApprovalAtasanSpecialProject: 'APPROVED',
        hasilCheck: 'Pekerjaan rapi, clearance sensor tepat 2.5mm dan lolos uji coba continuous 24 jam.',
        hasilCheckPemohon: 'DITERIMA_BAIK',
        biayaEstimate: 'Rp 1.500.000',
        biayaActual: 'Rp 1.350.000',
        orangJamEstimate: '10 Orang-Jam',
        orangJamActual: '8 Orang-Jam',
        waktuDibuat: new Date('2026-10-15T08:00:00Z'),
        waktuSelesai: yesterday,
        materials: [
          { namaBarang: '[DEMO] Plat Stainless Steel 304 2mm', spesifikasi: 'Potongan 200x300mm', jumlah: 4, satuan: 'Pcs' }
        ]
      },
      {
        nomorRequest: 'REQ-2026-006',
        seksiPemohon: 'Poly Film',
        picPemohon: 'Syarif Hidayat',
        kontakPemohon: 'Ext. 1120 / 0812-3344-5566',
        perihal: 'Pemasangan Kanopi Penutup Tambahan Daisha Polyfilm Luar Ruangan',
        namaBarang: 'Kanopi Daisha Polyfilm',
        spesifikasi: 'Rangka pipa galvanis 1.5 inch dengan atap terpal PVC tebal 0.8mm.',
        jumlah: 3,
        satuan: 'Unit',
        urgensi: 'NORMAL',
        status: 'DITOLAK',
        flowStep: 'REJECTED',
        alasanTolak: 'Desain kanopi melebihi batas ketinggian overhead crane dan menghalangi jarak pandang safety driver forklift di lorong B.',
        catatan: 'Disarankan menggunakan cover plastik terpal portable yang tidak melekat permanen pada rangka daisha.',
        tujuan: 'Melindungi gulungan polyfilm dari cipratan air saat transit antar gedung.',
        alasan: 'Sering hujan di area loading dock.',
        namaMachine: 'Transit Polyfilm Dock',
        kodeSeksi: 'PLY-01',
        drafter: 'Syarif Hidayat',
        foreman: 'Kuswanto',
        namaAtasanSeksi: 'H. Sudirman',
        statusApprovalAtasanSeksi: 'APPROVED',
        waktuDibuat: new Date('2026-10-12T09:00:00Z'),
        materials: []
      }
    ];

    for (const req of demoRequests) {
      const [insertedReq] = await sql`
        INSERT INTO "SectionRequest" (
          "nomorRequest", "seksiPemohon", "picPemohon", "kontakPemohon", "perihal", "namaBarang", "spesifikasi",
          "jumlah", "satuan", "urgensi", "catatan", "status", "alasanTolak", "picBengkel", "estimasi",
          "tujuan", "alasan", "namaMachine", "kodeSeksi", "drafter", "foreman", "namaAtasanSeksi", "emailAtasanSeksi",
          "statusApprovalAtasanSeksi", "waktuApprovalAtasanSeksi", "catatanAtasanSeksi",
          "statusApprovalAtasanSpecialProject", "waktuApprovalAtasanSpecialProject",
          "biayaEstimate", "biayaActual", "orangJamEstimate", "orangJamActual",
          "schedulePlanning", "hasilCheck", "hasilCheckPemohon", "alasanPending", "flowStep",
          "dibuatOleh", "waktuDibuat", "waktuUpdate", "waktuSelesai", "created_at", "updated_at", "materials"
        ) VALUES (
          ${req.nomorRequest}, ${req.seksiPemohon}, ${req.picPemohon}, ${req.kontakPemohon}, ${req.perihal}, ${req.namaBarang}, ${req.spesifikasi},
          ${req.jumlah}, ${req.satuan}, ${req.urgensi}, ${req.catatan}, ${req.status}, ${req.alasanTolak || null}, ${req.picBengkel || null}, ${req.estimasi || null},
          ${req.tujuan}, ${req.alasan}, ${req.namaMachine}, ${req.kodeSeksi}, ${req.drafter}, ${req.foreman}, ${req.namaAtasanSeksi}, ${req.emailAtasanSeksi || null},
          ${req.statusApprovalAtasanSeksi || 'MENUNGGU'}, ${req.waktuApprovalAtasanSeksi || null}, ${req.catatanAtasanSeksi || null},
          ${req.statusApprovalAtasanSpecialProject || 'MENUNGGU'}, ${req.waktuApprovalAtasanSpecialProject || null},
          ${req.biayaEstimate || null}, ${req.biayaActual || null}, ${req.orangJamEstimate || null}, ${req.orangJamActual || null},
          ${req.schedulePlanning || null}, ${req.hasilCheck || null}, ${req.hasilCheckPemohon || null}, ${req.alasanPending || null}, ${req.flowStep},
          ${req.drafter || req.picPemohon || 'operator'}, ${req.waktuDibuat}, NOW(), ${req.waktuSelesai || null}, ${req.waktuDibuat}, NOW(), ${JSON.stringify(req.materials)}
        )
        RETURNING id;
      `;

      for (const m of req.materials) {
        await sql`
          INSERT INTO "SectionRequestMaterial" ("requestId", "namaBarang", "spesifikasi", "jumlah", "satuan", "created_at", "updated_at")
          VALUES (${insertedReq.id}, ${m.namaBarang}, ${m.spesifikasi}, ${m.jumlah}, ${m.satuan}, ${req.waktuDibuat}, NOW());
        `;
      }
    }
    console.log(`   ✅ ${demoRequests.length} Request Seksi berhasil dimasukkan (mencakup seluruh tahapan alur flowchart)`);

    // =========================================================================
    // 6. STOK SPAREPART REALISTIS
    // =========================================================================
    console.log('📦 [Ekstra] Memperbarui Stok Sparepart Bengkel...');

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
          ${JSON.stringify([{ tanggal: '2026-10-22', aksi: 'Opname Stok Awal', jumlah: sp.stokGudang, user: 'admin' }])},
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
    console.log(`   ✅ Stok sparepart berhasil disinkronkan (${demoSpareparts.length} item dengan status Kritis, Menipis, dan Aman)`);

    console.log('\n🎉 SELURUH DATA DUMMY BERHASIL DIMASUKKAN DENGAN SUKSES!');
  } catch (err) {
    console.error('❌ Gagal memasukkan data dummy:', err);
  } finally {
    await sql.end({ timeout: 5 });
    process.exit(0);
  }
}

main();
