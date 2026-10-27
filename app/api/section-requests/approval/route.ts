import { NextResponse } from 'next/server';
import sql, { withTransaction } from '@/lib/db';
import { sanitizeText, recordAuditLog, getClientIp } from '@/lib/security';
import { createInAppNotification, buildAdminWorkshopEmailContent, sendEmailAsync } from '@/lib/emailNotification';

// GET: Verifikasi token dan kembalikan data request untuk Atasan Seksi
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { searchParams } = new URL(request.url);
  const token = sanitizeText(searchParams.get('token'), 100);

  if (!token) {
    return NextResponse.json({ error: 'Token persetujuan tidak valid atau tidak disertakan.' }, { status: 400 });
  }

  try {
    const [req] = await sql<Array<Record<string, unknown>>>`
      SELECT 
        sr.*,
        COALESCE(sr."materials", '[]'::jsonb) as materials
      FROM "SectionRequest" sr
      WHERE sr."approvalToken" = ${token}
      LIMIT 1
    `;

    if (!req) {
      return NextResponse.json({ error: 'Tautan persetujuan tidak ditemukan atau telah kedaluwarsa.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: req });
  } catch (error) {
    console.error('GET /api/section-requests/approval error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat memuat formulir.' }, { status: 500 });
  }
}

// POST: Atasan Seksi menyetujui (assign) atau menolak request
export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    const body = await request.json();
    const token = sanitizeText(body.token, 100);
    const action = sanitizeText(body.action, 20); // 'APPROVE' | 'REJECT'
    const namaAtasan = sanitizeText(body.namaAtasan, 100);
    const catatan = sanitizeText(body.catatan, 1000);
    const alasanTolak = sanitizeText(body.alasanTolak, 1000);

    if (!token) {
      return NextResponse.json({ error: 'Token persetujuan tidak valid.' }, { status: 400 });
    }

    const [current] = await sql<Array<{
      id: number;
      nomorRequest: string;
      seksiPemohon: string;
      picPemohon: string;
      perihal: string;
      namaBarang: string;
      statusApprovalAtasanSeksi: string;
      emailMentorWorkshop: string | null;
      namaAtasanSeksi: string | null;
    }>>`
      SELECT 
        id, "nomorRequest", "seksiPemohon", "picPemohon",
        perihal, "namaBarang", "statusApprovalAtasanSeksi",
        "emailMentorWorkshop", "namaAtasanSeksi"
      FROM "SectionRequest"
      WHERE "approvalToken" = ${token}
      LIMIT 1
    `;

    if (!current) {
      return NextResponse.json({ error: 'Data request tidak ditemukan untuk token ini.' }, { status: 404 });
    }

    if (current.statusApprovalAtasanSeksi === 'APPROVED') {
      return NextResponse.json({
        error: 'Formulir ini sudah disetujui sebelumnya dan sedang diproses di Workshop.',
      }, { status: 400 });
    }

    const reviewerName = namaAtasan || current.namaAtasanSeksi || 'Atasan Seksi';

    if (action === 'APPROVE') {
      // 1. Update status request & buat notifikasi dalam 1 transaksi atomik aman
      const updated = await withTransaction(async (tx) => {
        const [upd] = await tx<Array<{ nomorRequest: string }>>`
          UPDATE "SectionRequest"
          SET
            "statusApprovalAtasanSeksi" = 'APPROVED',
            "waktuApprovalAtasanSeksi" = NOW(),
            "foreman" = ${reviewerName},
            "namaAtasanSeksi" = ${reviewerName},
            "catatanAtasanSeksi" = ${catatan || null},
            status = 'Pending: Menunggu Evaluasi Workshop',
            "flowStep" = 'STEP_3_DITERIMA_WORKSHOP',
            "waktuUpdate" = NOW()
          WHERE id = ${current.id}
          RETURNING *
        `;

        // 2. Buat notifikasi otomatis untuk Admin & PIC Workshop (In-App)
        await createInAppNotification({
          requestId: current.id,
          nomorRequest: current.nomorRequest,
          targetRole: 'ADMIN',
          tipe: 'ASSIGN_DITERIMA_WORKSHOP',
          judul: `Request Baru Diterima: ${current.nomorRequest}`,
          pesan: `Request permohonan "${current.perihal || current.namaBarang}" dari Seksi ${current.seksiPemohon} telah disetujui & ditandatangani oleh ${reviewerName}. Siap dilakukan evaluasi pekerjaan (Waktu, Men Power, Sparepart, Material).`,
          link: `/request`,
        }, tx);

        // 3. Notifikasi juga untuk Seksi Pemohon
        await createInAppNotification({
          requestId: current.id,
          nomorRequest: current.nomorRequest,
          targetRole: 'USER_SEKSI',
          targetUser: current.picPemohon,
          tipe: 'APPROVAL_ATASAN_SEKSI',
          judul: `Request ${current.nomorRequest} Disetujui Atasan`,
          pesan: `Atasan Anda (${reviewerName}) telah menyetujui formulir request. Dokumen otomatis diteruskan ke Admin Workshop Produksi.`,
          link: `/request`,
        }, tx);

        return upd;
      });

      // 4. Siapkan template email notifikasi untuk Admin Workshop
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const adminEmailContent = buildAdminWorkshopEmailContent({
        nomorRequest: current.nomorRequest,
        perihal: current.perihal || current.namaBarang,
        seksiPemohon: current.seksiPemohon,
        picPemohon: current.picPemohon,
        namaAtasan: reviewerName,
        detailLink: `${origin}/request`,
      });

      // Kirim email notifikasi secara non-blocking (fire-and-forget) setelah transaksi berhasil di-commit
      sendEmailAsync({
        subject: adminEmailContent.subject,
        bodyText: adminEmailContent.bodyText,
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_APPROVE_ATASAN_SEKSI',
        ip,
        status: 'SUCCESS',
        targetId: current.nomorRequest,
        details: `Disetujui oleh: ${reviewerName}`,
      });

      return NextResponse.json({
        success: true,
        message: `Formulir ${current.nomorRequest} berhasil ditandatangani dan diteruskan ke Admin Workshop Produksi.`,
        request: updated,
        adminWorkshopEmail: adminEmailContent,
      });
    }

    if (action === 'REJECT') {
      const updated = await withTransaction(async (tx) => {
        const [upd] = await tx<Array<{ nomorRequest: string }>>`
          UPDATE "SectionRequest"
          SET
            "statusApprovalAtasanSeksi" = 'REJECTED',
            "waktuApprovalAtasanSeksi" = NOW(),
            "alasanTolak" = ${alasanTolak || catatan || 'Ditolak oleh atasan seksi pemohon'},
            status = 'Ditolak Atasan Seksi',
            "flowStep" = 'STEP_5_DITOLAK',
            "waktuUpdate" = NOW()
          WHERE id = ${current.id}
          RETURNING *
        `;

        await createInAppNotification({
          requestId: current.id,
          nomorRequest: current.nomorRequest,
          targetRole: 'USER_SEKSI',
          targetUser: current.picPemohon,
          tipe: 'INFO_TOLAK_SEKSI',
          judul: `Request ${current.nomorRequest} Ditolak Atasan`,
          pesan: `Permohonan request ditolak oleh ${reviewerName}. Alasan: ${alasanTolak || catatan || '-'}`,
          link: `/request`,
        }, tx);

        return upd;
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_REJECT_ATASAN_SEKSI',
        ip,
        status: 'SUCCESS',
        targetId: current.nomorRequest,
        details: `Ditolak oleh: ${reviewerName}. Alasan: ${alasanTolak || catatan || '-'}`,
      });

      return NextResponse.json({
        success: true,
        message: `Formulir ${current.nomorRequest} ditolak. Pemberitahuan telah dikirim ke pemohon.`,
        request: updated,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid (hanya APPROVE atau REJECT).' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests/approval error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat memproses persetujuan.' }, { status: 500 });
  }
}
