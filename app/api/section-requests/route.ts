import { NextResponse } from 'next/server';
import sql from '@/lib/db';
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
  try {
    const session = await getSession();
    if (!session.valid || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const seksi = searchParams.get('seksi');

    const filterByUser = session.user.role === 'USER_SEKSI' ? session.user.username : null;
    const filterStatus = status && status !== 'all' ? status : null;
    const filterSeksi = seksi && seksi !== 'all' ? seksi : null;

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
            ) ORDER BY srm.id ASC
          ) FILTER (WHERE srm.id IS NOT NULL),
          '[]'::json
        ) as materials
      FROM "SectionRequest" sr
      LEFT JOIN "SectionRequestMaterial" srm ON srm."sectionRequestId" = sr.id
      WHERE 
        (${filterByUser}::text IS NULL OR sr."dibuatOleh" = ${filterByUser})
        AND (${filterStatus}::text IS NULL OR sr.status = ${filterStatus})
        AND (${filterSeksi}::text IS NULL OR sr."seksiPemohon" = ${filterSeksi})
      GROUP BY sr.id
      ORDER BY sr."waktuDibuat" DESC
    `;

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

      const [created] = await sql`
        INSERT INTO "SectionRequest" (
          "nomorRequest",
          "seksiPemohon",
          "picPemohon",
          "kontakPemohon",
          "namaBarang",
          "spesifikasi",
          "jumlah",
          "satuan",
          "urgensi",
          "catatan",
          "dibuatOleh",
          "waktuDibuat",
          "waktuUpdate"
        )
        VALUES (
          ${nomorRequest},
          ${seksiPemohon},
          ${picPemohon},
          ${kontakPemohon || null},
          ${namaBarang},
          ${spesifikasi || null},
          ${jumlah || 1},
          ${satuan || 'pcs'},
          ${urgensi || 'Normal'},
          ${catatan || null},
          ${session.user.username},
          NOW(),
          NOW()
        )
        RETURNING *
      `;

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

      const [current] = await sql<Array<{
        alasanTolak: string | null;
        picBengkel: string | null;
        estimasi: string | null;
        catatanAdmin: string | null;
        waktuSelesai: Date | null;
      }>>`
        SELECT "alasanTolak", "picBengkel", "estimasi", "catatanAdmin", "waktuSelesai"
        FROM "SectionRequest"
        WHERE id = ${Number(id)}
      `;

      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      const [updated] = await sql<Array<{ nomorRequest: string }>>`
        UPDATE "SectionRequest"
        SET
          status = ${newStatus},
          "alasanTolak" = ${alasanTolak !== undefined ? alasanTolak : current.alasanTolak},
          "picBengkel" = ${picBengkel !== undefined ? picBengkel : current.picBengkel},
          "estimasi" = ${estimasi !== undefined ? estimasi : current.estimasi},
          "catatanAdmin" = ${catatanAdmin !== undefined ? catatanAdmin : current.catatanAdmin},
          "waktuSelesai" = ${newStatus === 'Selesai' ? new Date() : current.waktuSelesai},
          "waktuUpdate" = NOW()
        WHERE id = ${Number(id)}
        RETURNING *
      `;

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
      const [sparepart] = await sql<Array<{ namaKomponen: string; stokGudang: number }>>`
        SELECT "namaKomponen", "stokGudang" FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen} LIMIT 1
      `;
      if (!sparepart) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" tidak ditemukan.` }, { status: 404 });
      }
      if (sparepart.stokGudang < qty) {
        return NextResponse.json({ error: `Stok "${namaKomponen}" tidak mencukupi (sisa: ${sparepart.stokGudang}).` }, { status: 400 });
      }

      const [reqData] = await sql<Array<{ nomorRequest: string; namaBarang: string }>>`
        SELECT "nomorRequest", "namaBarang" FROM "SectionRequest" WHERE id = ${Number(sectionRequestId)} LIMIT 1
      `;

      // Transaksi: tambah material + kurangi stok + catat log
      await sql.begin(async (tx) => {
        await tx`
          INSERT INTO "SectionRequestMaterial" ("sectionRequestId", "namaKomponen", qty, keterangan)
          VALUES (${Number(sectionRequestId)}, ${namaKomponen}, ${Number(qty)}, ${keterangan || null})
        `;
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" - ${Number(qty)}
          WHERE "namaKomponen" = ${namaKomponen}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, referensi, keterangan, tanggal)
          VALUES (
            ${namaKomponen},
            'OUT',
            ${Number(qty)},
            ${reqData?.nomorRequest || `REQ-${sectionRequestId}`},
            ${`Pemakaian untuk request seksi: ${reqData?.namaBarang || '-'}`},
            NOW()
          )
        `;
      });

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

      await sql.begin(async (tx) => {
        await tx`DELETE FROM "SectionRequestMaterial" WHERE "sectionRequestId" = ${Number(id)}`;
        await tx`DELETE FROM "SectionRequest" WHERE id = ${Number(id)}`;
      });

      return NextResponse.json({ success: true, message: 'Request berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
