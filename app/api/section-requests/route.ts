import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';

// Buat nomor request unik: REQ-YYYYMMDD-XXX
async function generateRequestNumber(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `REQ-${dateStr}-`;

  const [lastRequest] = await sql<Array<{ nomorRequest: string }>>`
    SELECT "nomorRequest"
    FROM "SectionRequest"
    WHERE "nomorRequest" LIKE ${prefix + '%'}
    ORDER BY "nomorRequest" DESC
    LIMIT 1
  `;

  let seq = 1;
  if (lastRequest) {
    const lastSeq = parseInt(lastRequest.nomorRequest.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(3, '0')}`;
}

// GET: Ambil daftar request (Admin: semua, USER_SEKSI: hanya milik seksinya)
export async function GET(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION
  const auth = await requireAuth(request, ['ADMIN', 'USER_SEKSI', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (60 req/menit)
  const rateLimit = checkRateLimit(`requests_get:${auth.ip}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan data request.' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const seksi = searchParams.get('seksi');

    // ISOLASI DATA PENGGUNA: User Seksi HANYA dapat melihat request milik seksinya sendiri
    const filterByUser = auth.user?.role === 'USER_SEKSI' ? auth.user.username : null;
    const filterStatus = status && status !== 'all' ? sanitizeText(status, 50) : null;
    const filterSeksi = seksi && seksi !== 'all' ? sanitizeText(seksi, 50) : null;

    const requests = await sql`
      SELECT 
        sr.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', srm.id,
              'sectionRequestId', srm."sectionRequestId",
              'namaKomponen', srm."namaKomponen",
              'qty', srm.qty,
              'keterangan', srm.keterangan
            )
          ) FILTER (WHERE srm.id IS NOT NULL),
          '[]'::json
        ) as materials
      FROM "SectionRequest" sr
      LEFT JOIN "SectionRequestMaterial" srm ON srm."sectionRequestId" = sr.id
      WHERE (${filterByUser}::text IS NULL OR sr."dibuatOleh" = ${filterByUser})
        AND (${filterStatus}::text IS NULL OR sr.status = ${filterStatus})
        AND (${filterSeksi}::text IS NULL OR sr."seksiPemohon" = ${filterSeksi})
      GROUP BY sr.id
      ORDER BY sr."waktuDibuat" DESC
    `;

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('GET /api/section-requests error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data request seksi.' }, { status: 500 });
  }
}

// POST: Buat request baru atau update status/material
export async function POST(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION
  const auth = await requireAuth(request, ['ADMIN', 'USER_SEKSI', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD LIMIT (Maksimal 256KB)
  const sizeCheck = validatePayloadSize(request, 256 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (30 mutasi/menit)
  const rateLimit = checkRateLimit(`requests_post:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan mutasi request.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const action = sanitizeText(body.action, 30);

    // 1. Buat request baru
    if (action === 'CREATE') {
      const seksiPemohon = sanitizeText(body.seksiPemohon || body.seksi, 50);
      const picPemohon = sanitizeText(body.picPemohon || body.namaPemohon || auth.user?.name || auth.user?.username, 100);
      const kontakPemohon = sanitizeText(body.kontakPemohon, 50);
      const namaBarang = sanitizeText(body.namaBarang, 100);
      const spesifikasi = sanitizeText(body.spesifikasi || body.deskripsi, 2000);
      const jumlah = validatePositiveInt(body.jumlah, 'Jumlah barang', 1, 10000).value;
      const satuan = sanitizeText(body.satuan, 20) || 'pcs';
      const urgensi = sanitizeText(body.urgensi || body.prioritas, 20) || 'Normal';
      const catatan = sanitizeText(body.catatan || body.catatanTambahan, 1000);

      if (!seksiPemohon || !picPemohon || !namaBarang || !jumlah) {
        return NextResponse.json(
          { error: 'Field wajib (seksi pemohon, nama PIC, nama barang, jumlah) tidak boleh kosong.' },
          { status: 400 }
        );
      }

      const nomorRequest = await generateRequestNumber();

      const [created] = await sql<Array<{ id: number; nomorRequest: string }>>`
        INSERT INTO "SectionRequest" (
          "nomorRequest", "seksiPemohon", "picPemohon", "kontakPemohon",
          "namaBarang", spesifikasi, jumlah, satuan, urgensi, catatan,
          status, "dibuatOleh", "waktuDibuat", "waktuUpdate"
        )
        VALUES (
          ${nomorRequest},
          ${seksiPemohon},
          ${picPemohon},
          ${kontakPemohon || null},
          ${namaBarang},
          ${spesifikasi || null},
          ${jumlah},
          ${satuan},
          ${urgensi},
          ${catatan || null},
          'Diajukan',
          ${auth.user!.username},
          NOW(),
          NOW()
        )
        RETURNING id, "nomorRequest"
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_CREATE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: created.nomorRequest,
        details: `Barang: ${namaBarang}, Qty: ${jumlah}, Seksi: ${seksiPemohon}`,
      });

      return NextResponse.json({
        success: true,
        message: `Request ${nomorRequest} berhasil diajukan.`,
        request: created,
      });
    }

    // 2. Update status request (Khusus role ADMIN)
    if (action === 'UPDATE_STATUS') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat mengubah status request.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const newStatus = sanitizeText(body.status, 50);
      const alasanTolak = body.alasanTolak !== undefined ? sanitizeText(body.alasanTolak, 500) : undefined;
      const picBengkel = body.picBengkel !== undefined ? sanitizeText(body.picBengkel, 100) : undefined;
      const estimasi = body.estimasi !== undefined ? sanitizeText(body.estimasi, 50) : undefined;
      const catatanAdmin = body.catatanAdmin !== undefined ? sanitizeText(body.catatanAdmin, 1000) : undefined;

      if (!body.id || !newStatus) {
        return NextResponse.json({ error: 'ID dan status baru wajib diisi.' }, { status: 400 });
      }

      const [current] = await sql<Array<{
        alasanTolak: string | null;
        picBengkel: string | null;
        estimasi: string | null;
        catatanAdmin: string | null;
        waktuSelesai: Date | null;
      }>>`
        SELECT "alasanTolak", "picBengkel", "estimasi", "catatanAdmin", "waktuSelesai"
        FROM "SectionRequest"
        WHERE id = ${id}
      `;

      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      const [updated] = await sql<Array<{ nomorRequest: string }>>`
        UPDATE "SectionRequest"
        SET
          status = ${newStatus},
          "alasanTolak" = ${alasanTolak !== undefined ? (alasanTolak || null) : current.alasanTolak},
          "picBengkel" = ${picBengkel !== undefined ? (picBengkel || null) : current.picBengkel},
          "estimasi" = ${estimasi !== undefined ? (estimasi || null) : current.estimasi},
          "catatanAdmin" = ${catatanAdmin !== undefined ? (catatanAdmin || null) : current.catatanAdmin},
          "waktuSelesai" = ${newStatus === 'Selesai' ? new Date() : current.waktuSelesai},
          "waktuUpdate" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_UPDATE_STATUS',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: updated.nomorRequest,
        details: `Status diubah menjadi: ${newStatus}`,
      });

      return NextResponse.json({
        success: true,
        message: `Status request ${updated.nomorRequest} diubah menjadi ${newStatus}.`,
        request: updated,
      });
    }

    // 3. Tambah alokasi material dari gudang (Khusus role ADMIN)
    if (action === 'ADD_MATERIAL') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat menambah material.' }, { status: 403 });
      }

      const sectionRequestId = validatePositiveInt(body.sectionRequestId, 'ID Request', 1).value;
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      const qty = validatePositiveInt(body.qty, 'Jumlah material', 1, 10000).value;
      const keterangan = sanitizeText(body.keterangan, 255);

      if (!body.sectionRequestId || !namaKomponen || !body.qty) {
        return NextResponse.json({ error: 'ID request, nama komponen, dan qty wajib diisi.' }, { status: 400 });
      }

      const [sparepart] = await sql<Array<{ namaKomponen: string; stokGudang: number }>>`
        SELECT "namaKomponen", "stokGudang" FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen} LIMIT 1
      `;
      if (!sparepart) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" tidak ditemukan di gudang.` }, { status: 404 });
      }
      if (sparepart.stokGudang < qty) {
        return NextResponse.json({ error: `Stok "${namaKomponen}" tidak mencukupi (sisa: ${sparepart.stokGudang}).` }, { status: 400 });
      }

      const [reqData] = await sql<Array<{ nomorRequest: string; namaBarang: string }>>`
        SELECT "nomorRequest", "namaBarang" FROM "SectionRequest" WHERE id = ${sectionRequestId} LIMIT 1
      `;

      await sql.begin(async (tx) => {
        await tx`
          INSERT INTO "SectionRequestMaterial" ("sectionRequestId", "namaKomponen", qty, keterangan)
          VALUES (${sectionRequestId}, ${namaKomponen}, ${qty}, ${keterangan || null})
        `;
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" - ${qty}
          WHERE "namaKomponen" = ${namaKomponen}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, referensi, keterangan, tanggal)
          VALUES (
            ${namaKomponen},
            'OUT',
            ${qty},
            ${reqData?.nomorRequest || `REQ-${sectionRequestId}`},
            ${`Pemakaian untuk request seksi: ${reqData?.namaBarang || '-'}`},
            NOW()
          )
        `;
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_ADD_MATERIAL',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: reqData?.nomorRequest,
        details: `${namaKomponen} (-${qty})`,
      });

      return NextResponse.json({ success: true, message: 'Material berhasil ditambahkan dan stok gudang dipotong.' });
    }

    // 4. Hapus request (Khusus role ADMIN)
    if (action === 'DELETE') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat menghapus request.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;

      await sql.begin(async (tx) => {
        await tx`DELETE FROM "SectionRequestMaterial" WHERE "sectionRequestId" = ${id}`;
        await tx`DELETE FROM "SectionRequest" WHERE id = ${id}`;
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_DELETE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
      });

      return NextResponse.json({ success: true, message: 'Request berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests error:', error);
    recordAuditLog({
      action: 'SECTION_REQUEST_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: error instanceof Error ? error.message : 'Internal Server Error',
    });
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
