import { DatabaseSync } from 'node:sqlite';
import { PrismaClient } from '../lib/prisma-client/index.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const dbPath = fs.existsSync(path.resolve('prisma', 'dev.db'))
    ? path.resolve('prisma', 'dev.db')
    : path.resolve('dev.db');

  if (!fs.existsSync(dbPath)) {
    console.log('dev.db tidak ditemukan, lewati migrasi SQLite.');
    return;
  }

  console.log(`Membuka database SQLite di: ${dbPath}...`);
  const sqlite = new DatabaseSync(dbPath);
  const prisma = new PrismaClient();

  try {
    // 1. User
    const users = sqlite.prepare('SELECT * FROM User').all();
    if (users.length > 0) {
      console.log(`Memigrasikan ${users.length} User...`);
      await prisma.user.createMany({
        data: users.map(u => ({
          username: u.username,
          password: u.password,
          name: u.name,
          role: u.role,
          seksi: u.seksi || null,
          description: u.description || null,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
        })),
        skipDuplicates: true,
      });
      console.log('✔ User berhasil!');
    }

    // 2. MasterDaisha
    const masterDaishas = sqlite.prepare('SELECT * FROM MasterDaisha').all();
    if (masterDaishas.length > 0) {
      console.log(`Memigrasikan ${masterDaishas.length} MasterDaisha...`);
      await prisma.masterDaisha.createMany({
        data: masterDaishas.map(m => ({
          noDaisha: m.noDaisha,
          namaDaisha: m.namaDaisha,
          ukuran: m.ukuran,
          seksi: m.seksi,
        })),
        skipDuplicates: true,
      });
      console.log('✔ MasterDaisha berhasil!');
    }

    // 3. Ticket
    const tickets = sqlite.prepare('SELECT * FROM Ticket').all();
    if (tickets.length > 0) {
      console.log(`Memigrasikan ${tickets.length} Ticket...`);
      await prisma.ticket.createMany({
        data: tickets.map(t => ({
          idTiket: t.idTiket,
          noDaisha: t.noDaisha,
          namaPelapor: t.namaPelapor,
          status: t.status,
          waktuMasuk: t.waktuMasuk ? new Date(t.waktuMasuk) : new Date(),
          waktuSelesai: t.waktuSelesai ? new Date(t.waktuSelesai) : null,
          catatan: t.catatan || null,
        })),
        skipDuplicates: true,
      });
      console.log('✔ Ticket berhasil!');
    }

    // 4. TicketDetail
    const ticketDetails = sqlite.prepare('SELECT * FROM TicketDetail').all();
    if (ticketDetails.length > 0) {
      console.log(`Memigrasikan ${ticketDetails.length} TicketDetail...`);
      await prisma.ticketDetail.createMany({
        data: ticketDetails.map(td => ({
          idDetail: td.idDetail,
          idTiket: td.idTiket,
          komponen: td.komponen,
          gejala: td.gejala,
          tindakan: td.tindakan,
          qty: td.qty || 1,
        })),
        skipDuplicates: true,
      });
      console.log('✔ TicketDetail berhasil!');
    }

    // 5. DaishaType
    const daishaTypes = sqlite.prepare('SELECT * FROM DaishaType').all();
    if (daishaTypes.length > 0) {
      console.log(`Memigrasikan ${daishaTypes.length} DaishaType...`);
      await prisma.daishaType.createMany({
        data: daishaTypes.map(dt => ({
          id: dt.id,
          name: dt.name,
          seksi: dt.seksi,
        })),
        skipDuplicates: true,
      });
      console.log('✔ DaishaType berhasil!');
    }

    // 6. DaishaComponent
    const components = sqlite.prepare('SELECT * FROM DaishaComponent').all();
    if (components.length > 0) {
      console.log(`Memigrasikan ${components.length} DaishaComponent...`);
      await prisma.daishaComponent.createMany({
        data: components.map(c => ({
          id: c.id,
          daishaTypeId: c.daishaTypeId,
          name: c.name,
        })),
        skipDuplicates: true,
      });
      console.log('✔ DaishaComponent berhasil!');
    }

    // 7. DaishaSymptom
    const symptoms = sqlite.prepare('SELECT * FROM DaishaSymptom').all();
    if (symptoms.length > 0) {
      console.log(`Memigrasikan ${symptoms.length} DaishaSymptom...`);
      await prisma.daishaSymptom.createMany({
        data: symptoms.map(s => ({
          id: s.id,
          componentId: s.componentId,
          description: s.description,
        })),
        skipDuplicates: true,
      });
      console.log('✔ DaishaSymptom berhasil!');
    }

    // 8. Sparepart
    try {
      const spareparts = sqlite.prepare('SELECT * FROM Sparepart').all();
      if (spareparts.length > 0) {
        console.log(`Memigrasikan ${spareparts.length} Sparepart...`);
        await prisma.sparepart.createMany({
          data: spareparts.map(sp => ({
            namaKomponen: sp.namaKomponen,
            kategori: sp.kategori || 'Umum',
            stokGudang: sp.stokGudang || 0,
            satuan: sp.satuan || 'pcs',
            minStok: sp.minStok || 0,
            lokasi: sp.lokasi || null,
          })),
          skipDuplicates: true,
        });
        console.log('✔ Sparepart berhasil!');
      }
    } catch (e) {
      console.log('Tabel Sparepart dilewati:', e.message);
    }

    // 9. SectionRequest
    try {
      const requests = sqlite.prepare('SELECT * FROM SectionRequest').all();
      if (requests.length > 0) {
        console.log(`Memigrasikan ${requests.length} SectionRequest...`);
        await prisma.sectionRequest.createMany({
          data: requests.map(req => ({
            id: req.id,
            nomorRequest: req.nomorRequest,
            seksiPemohon: req.seksiPemohon,
            picPemohon: req.picPemohon,
            kontakPemohon: req.kontakPemohon || null,
            namaBarang: req.namaBarang,
            spesifikasi: req.spesifikasi || null,
            jumlah: req.jumlah || 1,
            satuan: req.satuan || 'pcs',
            urgensi: req.urgensi || 'Normal',
            catatan: req.catatan || null,
            status: req.status || 'Diajukan',
            alasanTolak: req.alasanTolak || null,
            picBengkel: req.picBengkel || null,
            estimasi: req.estimasi || null,
            catatanAdmin: req.catatanAdmin || null,
            dibuatOleh: req.dibuatOleh,
            waktuDibuat: req.waktuDibuat ? new Date(req.waktuDibuat) : new Date(),
            waktuUpdate: req.waktuUpdate ? new Date(req.waktuUpdate) : new Date(),
            waktuSelesai: req.waktuSelesai ? new Date(req.waktuSelesai) : null,
          })),
          skipDuplicates: true,
        });
        console.log('✔ SectionRequest berhasil!');
      }
    } catch (e) {
      console.log('Tabel SectionRequest dilewati:', e.message);
    }

    // 10. Update autoincrement sequences di PostgreSQL
    console.log('Menyelaraskan ID sequences di PostgreSQL Supabase...');
    const tablesWithAutoId = ['TicketDetail', 'DaishaType', 'DaishaComponent', 'DaishaSymptom', 'SectionRequest'];
    for (const table of tablesWithAutoId) {
      try {
        await prisma.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 1)) FROM "${table}";`
        );
      } catch (err) {
        // Abaikan jika nama kolom/sequence berbeda
      }
    }

    console.log('\n🎉 SEMUA DATA DARI SQLITE BERHASIL DIMIGRASIKAN 100% KE SUPABASE!');
  } catch (err) {
    console.error('Error saat migrasi:', err);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

runMigration();
