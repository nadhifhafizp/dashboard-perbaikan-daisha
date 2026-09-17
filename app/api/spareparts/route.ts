import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseAndVerifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'daisha_auth_session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return parseAndVerifySession(token);
}

// GET: Ambil daftar sparepart beserta log mutasi terakhir
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.valid || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hanya admin boleh melihat inventaris spareparts
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const withLogs = searchParams.get('logs') === 'true';
    const kategori = searchParams.get('kategori');

    const where: Record<string, unknown> = {};
    if (kategori && kategori !== 'all') {
      where.kategori = kategori;
    }

    const spareparts = await prisma.sparepart.findMany({
      where,
      include: withLogs ? { logs: { orderBy: { tanggal: 'desc' }, take: 50 } } : undefined,
      orderBy: { namaKomponen: 'asc' },
    });

    return NextResponse.json({ success: true, spareparts });
  } catch (error) {
    console.error('GET /api/spareparts error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data spareparts.' }, { status: 500 });
  }
}

// POST: CRUD spareparts & mutasi stok
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.valid || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang dapat mengelola spareparts.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // Tambah sparepart baru
    if (action === 'CREATE') {
      const { namaKomponen, kategori, stokGudang, satuan, minStok, lokasi } = body;

      if (!namaKomponen || !satuan) {
        return NextResponse.json({ error: 'Nama komponen dan satuan wajib diisi.' }, { status: 400 });
      }

      const exists = await prisma.sparepart.findUnique({ where: { namaKomponen } });
      if (exists) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" sudah ada.` }, { status: 400 });
      }

      const created = await prisma.sparepart.create({
        data: {
          namaKomponen,
          kategori: kategori || 'Umum',
          stokGudang: stokGudang || 0,
          satuan,
          minStok: minStok || 0,
          lokasi: lokasi || null,
        },
      });

      // Log stok awal jika ada
      if (stokGudang && stokGudang > 0) {
        await prisma.sparepartLog.create({
          data: {
            namaKomponen,
            tipe: 'IN',
            qty: stokGudang,
            keterangan: 'Stok awal saat pendaftaran',
          },
        });
      }

      return NextResponse.json({ success: true, message: `Sparepart "${namaKomponen}" berhasil ditambahkan.`, sparepart: created });
    }

    // Update info sparepart
    if (action === 'UPDATE') {
      const { namaKomponen, kategori, satuan, minStok, lokasi } = body;

      if (!namaKomponen) {
        return NextResponse.json({ error: 'Nama komponen wajib diisi.' }, { status: 400 });
      }

      const updateData: Record<string, unknown> = {};
      if (kategori !== undefined) updateData.kategori = kategori;
      if (satuan !== undefined) updateData.satuan = satuan;
      if (minStok !== undefined) updateData.minStok = minStok;
      if (lokasi !== undefined) updateData.lokasi = lokasi;

      const updated = await prisma.sparepart.update({
        where: { namaKomponen },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: 'Info sparepart diperbarui.', sparepart: updated });
    }

    // Restock (tambah stok masuk)
    if (action === 'RESTOCK') {
      const { namaKomponen, qty, keterangan } = body;

      if (!namaKomponen || !qty || qty <= 0) {
        return NextResponse.json({ error: 'Nama komponen dan jumlah restock wajib diisi.' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.sparepart.update({
          where: { namaKomponen },
          data: { stokGudang: { increment: qty } },
        }),
        prisma.sparepartLog.create({
          data: {
            namaKomponen,
            tipe: 'IN',
            qty,
            keterangan: keterangan || 'Restock manual',
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Restock ${qty} unit berhasil.` });
    }

    // Pemakaian manual (pengeluaran stok)
    if (action === 'USE') {
      const { namaKomponen, qty, referensi, keterangan } = body;

      if (!namaKomponen || !qty || qty <= 0) {
        return NextResponse.json({ error: 'Nama komponen dan jumlah pemakaian wajib diisi.' }, { status: 400 });
      }

      const sparepart = await prisma.sparepart.findUnique({ where: { namaKomponen } });
      if (!sparepart) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" tidak ditemukan.` }, { status: 404 });
      }
      if (sparepart.stokGudang < qty) {
        return NextResponse.json({ error: `Stok tidak mencukupi (sisa: ${sparepart.stokGudang}).` }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.sparepart.update({
          where: { namaKomponen },
          data: { stokGudang: { decrement: qty } },
        }),
        prisma.sparepartLog.create({
          data: {
            namaKomponen,
            tipe: 'OUT',
            qty,
            referensi: referensi || null,
            keterangan: keterangan || 'Pemakaian manual',
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Pengeluaran ${qty} unit berhasil.` });
    }

    // Hapus sparepart
    if (action === 'DELETE') {
      const { namaKomponen } = body;
      if (!namaKomponen) {
        return NextResponse.json({ error: 'Nama komponen wajib diisi.' }, { status: 400 });
      }

      // Hapus log dulu (cascade), lalu sparepart
      await prisma.sparepartLog.deleteMany({ where: { namaKomponen } });
      await prisma.sectionRequestMaterial.deleteMany({ where: { namaKomponen } });
      await prisma.sparepart.delete({ where: { namaKomponen } });

      return NextResponse.json({ success: true, message: `Sparepart "${namaKomponen}" berhasil dihapus.` });
    }

    // GET logs untuk sparepart tertentu
    if (action === 'GET_LOGS') {
      const { namaKomponen } = body;
      const logs = await prisma.sparepartLog.findMany({
        where: namaKomponen ? { namaKomponen } : undefined,
        orderBy: { tanggal: 'desc' },
        take: 100,
      });
      return NextResponse.json({ success: true, logs });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/spareparts error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
