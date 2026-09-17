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

// Buat nomor request unik: REQ-YYYYMMDD-XXX
async function generateRequestNumber(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `REQ-${dateStr}-`;

  const lastRequest = await prisma.sectionRequest.findFirst({
    where: { nomorRequest: { startsWith: prefix } },
    orderBy: { nomorRequest: 'desc' },
  });

  let seq = 1;
  if (lastRequest) {
    const lastSeq = parseInt(lastRequest.nomorRequest.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(3, '0')}`;
}

// GET: Ambil daftar request (Admin: semua, USER_SEKSI: hanya milik seksinya)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.valid || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const seksi = searchParams.get('seksi');

    const where: Record<string, unknown> = {};

    // USER_SEKSI hanya bisa lihat request dari seksinya sendiri
    if (session.user.role === 'USER_SEKSI') {
      where.dibuatOleh = session.user.username;
    }

    if (status && status !== 'all') {
      where.status = status;
    }
    if (seksi && seksi !== 'all') {
      where.seksiPemohon = seksi;
    }

    const requests = await prisma.sectionRequest.findMany({
      where,
      include: { materials: true },
      orderBy: { waktuDibuat: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('GET /api/section-requests error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data request.' }, { status: 500 });
  }
}

// POST: Buat request baru (USER_SEKSI) atau update status (ADMIN)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.valid || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'CREATE') {
      const { seksiPemohon, picPemohon, kontakPemohon, namaBarang, spesifikasi, jumlah, satuan, urgensi, catatan } = body;

      if (!seksiPemohon || !picPemohon || !namaBarang) {
        return NextResponse.json(
          { error: 'Seksi, PIC, dan Nama Barang wajib diisi.' },
          { status: 400 }
        );
      }

      const nomorRequest = await generateRequestNumber();

      const created = await prisma.sectionRequest.create({
        data: {
          nomorRequest,
          seksiPemohon,
          picPemohon,
          kontakPemohon: kontakPemohon || null,
          namaBarang,
          spesifikasi: spesifikasi || null,
          jumlah: jumlah || 1,
          satuan: satuan || 'pcs',
          urgensi: urgensi || 'Normal',
          catatan: catatan || null,
          dibuatOleh: session.user.username,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Request ${nomorRequest} berhasil diajukan.`,
        request: created,
      });
    }

    if (action === 'UPDATE_STATUS') {
      // Hanya admin yang bisa ubah status
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat mengubah status request.' }, { status: 403 });
      }

      const { id, status: newStatus, alasanTolak, picBengkel, estimasi, catatanAdmin } = body;

      if (!id || !newStatus) {
        return NextResponse.json({ error: 'ID dan status baru wajib diisi.' }, { status: 400 });
      }

      const updateData: Record<string, unknown> = { status: newStatus };
      if (alasanTolak !== undefined) updateData.alasanTolak = alasanTolak;
      if (picBengkel !== undefined) updateData.picBengkel = picBengkel;
      if (estimasi !== undefined) updateData.estimasi = estimasi;
      if (catatanAdmin !== undefined) updateData.catatanAdmin = catatanAdmin;
      if (newStatus === 'Selesai') updateData.waktuSelesai = new Date();

      const updated = await prisma.sectionRequest.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: `Status request ${updated.nomorRequest} diubah menjadi ${newStatus}.`,
        request: updated,
      });
    }

    if (action === 'ADD_MATERIAL') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat menambah material.' }, { status: 403 });
      }

      const { sectionRequestId, namaKomponen, qty, keterangan } = body;

      if (!sectionRequestId || !namaKomponen || !qty) {
        return NextResponse.json({ error: 'ID request, nama komponen, dan qty wajib diisi.' }, { status: 400 });
      }

      // Cek stok mencukupi
      const sparepart = await prisma.sparepart.findUnique({ where: { namaKomponen } });
      if (!sparepart) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" tidak ditemukan.` }, { status: 404 });
      }
      if (sparepart.stokGudang < qty) {
        return NextResponse.json({ error: `Stok "${namaKomponen}" tidak mencukupi (sisa: ${sparepart.stokGudang}).` }, { status: 400 });
      }

      const reqData = await prisma.sectionRequest.findUnique({ where: { id: sectionRequestId } });

      // Transaksi: tambah material + kurangi stok + catat log
      await prisma.$transaction([
        prisma.sectionRequestMaterial.create({
          data: { sectionRequestId, namaKomponen, qty, keterangan: keterangan || null },
        }),
        prisma.sparepart.update({
          where: { namaKomponen },
          data: { stokGudang: { decrement: qty } },
        }),
        prisma.sparepartLog.create({
          data: {
            namaKomponen,
            tipe: 'OUT',
            qty,
            referensi: reqData?.nomorRequest || `REQ-${sectionRequestId}`,
            keterangan: `Pemakaian untuk request seksi: ${reqData?.namaBarang || '-'}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Material berhasil ditambahkan dan stok dipotong.' });
    }

    if (action === 'DELETE') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat menghapus request.' }, { status: 403 });
      }

      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'ID request wajib diisi.' }, { status: 400 });
      }

      await prisma.sectionRequest.delete({ where: { id } });

      return NextResponse.json({ success: true, message: 'Request berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
