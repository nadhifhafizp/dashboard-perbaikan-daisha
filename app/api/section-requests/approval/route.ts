import { NextResponse } from 'next/server';
import sql, { withTransaction } from '@/lib/db';
import { sanitizeText, recordAuditLog, getClientIp } from '@/lib/security';
import { createInAppNotification, buildAdminWorkshopEmailContent, sendEmailAsync } from '@/lib/emailNotification';
import { generateNextNomorSurat } from '@/lib/nomorSuratServer';

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
    const action = sanitizeText(body.action, 30); // 'APPROVE' | 'REJECT' | 'APPROVE_SPROJECT' | 'REJECT_SPROJECT'
    const role = sanitizeText(body.role, 30); // 'spv_seksi' | 'manajer_seksi' | 'seksi' | 'special_project'
    const namaAtasan = sanitizeText(body.namaAtasan, 100);
    const namaDeptHead = sanitizeText(body.namaDeptHead, 100);
    const namaManajerSeksi = sanitizeText(body.namaManajerSeksi, 100);
    const catatan = sanitizeText(body.catatan, 1000);
    const alasanTolak = sanitizeText(body.alasanTolak, 1000);
    const ttdAtasanSeksi = body.ttdAtasanSeksi || body.ttd ? sanitizeText(body.ttdAtasanSeksi || body.ttd, 500000) : null;
    const ttdManajerSeksi = body.ttdManajerSeksi ? sanitizeText(body.ttdManajerSeksi, 500000) : null;
    const ttdAtasanSpecialProject = body.ttdAtasanSpecialProject || body.ttd ? sanitizeText(body.ttdAtasanSpecialProject || body.ttd, 500000) : null;

    if (!token) {
      return NextResponse.json({ error: 'Token persetujuan tidak valid.' }, { status: 400 });
    }

    const [current] = await sql<Array<{
      id: number;
      nomorRequest: string;
      nomorSurat: string | null;
      seksiPemohon: string;
      picPemohon: string;
      perihal: string;
      namaBarang: string;
      statusApprovalAtasanSeksi: string;
      statusApprovalManajerSeksi: string | null;
      flowStep: string;
      status: string;
      emailMentorWorkshop: string | null;
      namaAtasanSeksi: string | null;
      emailAtasanSeksi: string | null;
      namaManajerSeksi: string | null;
      emailManajerSeksi: string | null;
      keputusan8210: string | null;
      keputusan820: string | null;
      approvalToken: string;
    }>>`
      SELECT 
        id, "nomorRequest", "nomorSurat", "seksiPemohon", "picPemohon",
        perihal, "namaBarang", "statusApprovalAtasanSeksi", "statusApprovalManajerSeksi",
        "flowStep", status,
        "emailMentorWorkshop", "namaAtasanSeksi", "emailAtasanSeksi",
        "namaManajerSeksi", "emailManajerSeksi",
        "keputusan8210", "keputusan820", "approvalToken"
      FROM "SectionRequest"
      WHERE "approvalToken" = ${token}
      LIMIT 1
    `;

    if (!current) {
      return NextResponse.json({ error: 'Data request tidak ditemukan untuk token ini.' }, { status: 404 });
    }

    // Jalur A: Approval Atasan Special Project (8210 / 820)
    const isSpecialProjectApproval =
      role === 'special_project' ||
      action === 'APPROVE_SPROJECT' ||
      action === 'REJECT_SPROJECT';

    if (isSpecialProjectApproval) {
      if (current.status === 'Selesai' || current.flowStep === 'STEP_7_SELESAI') {
        return NextResponse.json(
          {
            error:
              'Permohonan ini sudah berstatus Selesai dan tidak dapat diubah lagi.',
          },
          { status: 400 }
        );
      }

      const spReviewer =
        namaAtasan?.trim() ||
        (current.keputusan8210?.startsWith('Manager Special') ? '' : current.keputusan8210) ||
        '';
      const deptHeadReviewer =
        namaDeptHead?.trim() ||
        (current.keputusan820?.startsWith('Dept Head') ? '' : current.keputusan820) ||
        '';

      if (action === 'APPROVE' || action === 'APPROVE_SPROJECT') {
        const updated = await withTransaction(async (tx) => {
          // Alur Tahap 4: Penerbitan Nomor Surat Resmi (Format: 001/SEKSI/ROMAWI/TAHUN)
          // Nomor surat resmi HANYA dan BARU terbit setelah Atasan Special Project meng-assign request!
          let finalNomorSurat = current.nomorSurat;
          if (!finalNomorSurat || finalNomorSurat.startsWith('REQ-')) {
            finalNomorSurat = await generateNextNomorSurat(current.seksiPemohon, new Date(), tx as unknown as typeof sql);
          }

          const [upd] = await tx<Array<{ nomorRequest: string; nomorSurat: string }>>`
            UPDATE "SectionRequest"
            SET
              "keputusan8210" = ${spReviewer},
              "keputusan820" = ${deptHeadReviewer},
              "statusApprovalAtasanSpecialProject" = 'APPROVED',
              "statusApprovalAtasanSeksi" = 'APPROVED',
              "ttdAtasanSpecialProject" = ${ttdAtasanSpecialProject || null},
              "nomorSurat" = ${finalNomorSurat},
              status = 'Dikerjakan',
              "flowStep" = 'STEP_6_DALAM_PENGERJAAN',
              "waktuApprovalAtasanSpecialProject" = NOW(),
              "catatanAdmin" = CASE 
                WHEN "catatanAdmin" IS NULL OR "catatanAdmin" = '' THEN ${catatan ? `[Catatan S.Project: ${catatan}]` : null}
                ELSE "catatanAdmin" || ${catatan ? ` [Catatan S.Project: ${catatan}]` : ''}
              END,
              "waktuUpdate" = NOW()
            WHERE id = ${current.id}
            RETURNING *
          `;

          // In-App Notification untuk Workshop & Admin
          await createInAppNotification(
            {
              requestId: current.id,
              nomorRequest: finalNomorSurat || current.nomorRequest,
              targetRole: 'ADMIN',
              tipe: 'ASSIGN_ATASAN_SPROJECT',
              judul: `Request ${finalNomorSurat || current.nomorRequest} Disetujui Atasan S.Project`,
              pesan: `Atasan Special Project (${spReviewer}) telah menyetujui & meng-assign request. Nomor Surat resmi "${finalNomorSurat}" telah diterbitkan dan pengerjaan fisik siap dimulai oleh teknisi bengkel.`,
              link: `/request`,
            },
            tx
          );

          // In-App Notification untuk Pemohon Seksi
          await createInAppNotification(
            {
              requestId: current.id,
              nomorRequest: finalNomorSurat || current.nomorRequest,
              targetRole: 'USER_SEKSI',
              targetUser: current.picPemohon,
              tipe: 'ASSIGN_ATASAN_SPROJECT',
              judul: `Request ${finalNomorSurat || current.nomorRequest} Disetujui Special Project`,
              pesan: `Permohonan Anda (${current.perihal || current.namaBarang}) telah resmi disetujui Atasan Special Project dengan Nomor Surat ${finalNomorSurat}. Pekerjaan bengkel segera diproses.`,
              link: `/request`,
            },
            tx
          );

          return upd;
        });

        recordAuditLog({
          action: 'SECTION_REQUEST_APPROVE_ATASAN_SPROJECT',
          ip,
          status: 'SUCCESS',
          targetId: current.nomorRequest,
          details: `Disetujui oleh: ${spReviewer} & ${deptHeadReviewer}`,
        });

        return NextResponse.json({
          success: true,
          message: `Permohonan ${current.nomorRequest} berhasil disetujui oleh Atasan Special Project dan berstatus "Dikerjakan".`,
          request: updated,
        });
      }

      if (action === 'REJECT' || action === 'REJECT_SPROJECT') {
        const updated = await withTransaction(async (tx) => {
          const [upd] = await tx<Array<{ nomorRequest: string }>>`
            UPDATE "SectionRequest"
            SET
              "keputusan8210" = 'DITOLAK',
              status = 'Ditolak',
              "flowStep" = 'STEP_5_DITOLAK',
              "alasanTolak" = ${alasanTolak || catatan || 'Ditolak oleh Atasan Special Project (8210 / 820)'},
              "waktuUpdate" = NOW()
            WHERE id = ${current.id}
            RETURNING *
          `;

          await createInAppNotification(
            {
              requestId: current.id,
              nomorRequest: current.nomorRequest,
              targetRole: 'USER_SEKSI',
              targetUser: current.picPemohon,
              tipe: 'INFO_TOLAK_SEKSI',
              judul: `Request ${current.nomorRequest} Ditolak Special Project`,
              pesan: `Permohonan ditolak oleh Atasan Special Project (${spReviewer}). Alasan: ${alasanTolak || catatan || '-'}`,
              link: `/request`,
            },
            tx
          );

          await createInAppNotification(
            {
              requestId: current.id,
              nomorRequest: current.nomorRequest,
              targetRole: 'ADMIN',
              tipe: 'INFO_TOLAK_SEKSI',
              judul: `Request ${current.nomorRequest} Ditolak Atasan Special Project`,
              pesan: `Permohonan Seksi ${current.seksiPemohon} ditolak oleh Atasan Special Project. Alasan: ${alasanTolak || catatan || '-'}`,
              link: `/request`,
            },
            tx
          );

          return upd;
        });

        recordAuditLog({
          action: 'SECTION_REQUEST_REJECT_ATASAN_SPROJECT',
          ip,
          status: 'SUCCESS',
          targetId: current.nomorRequest,
          details: `Ditolak oleh: ${spReviewer}. Alasan: ${alasanTolak || catatan || '-'}`,
        });

        return NextResponse.json({
          success: true,
          message: `Permohonan ${current.nomorRequest} ditolak oleh Atasan Special Project.`,
          request: updated,
        });
      }
    }

    // Jalur B: Approval Manajer Seksi Pemohon (Tahap 2)
    const isManajerSeksiApproval =
      role === 'manajer_seksi' ||
      (current.statusApprovalAtasanSeksi === 'APPROVED' &&
        current.statusApprovalManajerSeksi !== 'APPROVED' &&
        !isSpecialProjectApproval);

    if (isManajerSeksiApproval) {
      if (current.statusApprovalManajerSeksi === 'APPROVED') {
        return NextResponse.json(
          { error: 'Formulir ini sudah disetujui oleh Manajer Seksi sebelumnya.' },
          { status: 400 }
        );
      }

      const manajerName = namaManajerSeksi || namaAtasan || current.namaManajerSeksi || 'Manajer Seksi';

      if (action === 'APPROVE') {
        const updated = await withTransaction(async (tx) => {
          const [upd] = await tx<Array<{ nomorRequest: string }>>`
            UPDATE "SectionRequest"
            SET
              "statusApprovalManajerSeksi" = 'APPROVED',
              "waktuApprovalManajerSeksi" = NOW(),
              "namaManajerSeksi" = ${manajerName},
              "ttdManajerSeksi" = ${ttdManajerSeksi || ttdAtasanSeksi || null},
              "catatanManajerSeksi" = ${catatan || null},
              status = 'Pending: Menunggu Evaluasi Workshop',
              "flowStep" = 'STEP_3_DITERIMA_WORKSHOP',
              "waktuUpdate" = NOW()
            WHERE id = ${current.id}
            RETURNING *
          `;

          // Buat notifikasi otomatis untuk Admin & PIC Workshop (In-App)
          await createInAppNotification(
            {
              requestId: current.id,
              nomorRequest: current.nomorRequest,
              targetRole: 'ADMIN',
              tipe: 'ASSIGN_DITERIMA_WORKSHOP',
              judul: `Request Siap Evaluasi: ${current.nomorRequest}`,
              pesan: `Request permohonan "${current.perihal || current.namaBarang}" dari Seksi ${current.seksiPemohon} telah disetujui lengkap oleh Spv (${current.namaAtasanSeksi}) & Manajer Seksi (${manajerName}). Siap dilakukan evaluasi pekerjaan bengkel.`,
              link: `/request`,
            },
            tx
          );

          // Notifikasi untuk Seksi Pemohon
          await createInAppNotification(
            {
              requestId: current.id,
              nomorRequest: current.nomorRequest,
              targetRole: 'USER_SEKSI',
              targetUser: current.picPemohon,
              tipe: 'APPROVAL_MANAJER_SEKSI',
              judul: `Request ${current.nomorRequest} Disetujui Manajer Seksi`,
              pesan: `Manajer Seksi Anda (${manajerName}) telah menyetujui formulir request. Permohonan resmi diteruskan ke Workshop Produksi.`,
              link: `/request`,
            },
            tx
          );

          return upd;
        });

        // Email notifikasi ke Admin Workshop
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const adminEmailContent = buildAdminWorkshopEmailContent({
          nomorRequest: current.nomorRequest,
          perihal: current.perihal || current.namaBarang,
          seksiPemohon: current.seksiPemohon,
          picPemohon: current.picPemohon,
          namaAtasan: `${current.namaAtasanSeksi || 'Spv'} & ${manajerName}`,
          detailLink: `${origin}/request`,
        });

        sendEmailAsync({
          subject: adminEmailContent.subject,
          bodyText: adminEmailContent.bodyText,
        });

        recordAuditLog({
          action: 'SECTION_REQUEST_APPROVE_MANAJER_SEKSI',
          ip,
          status: 'SUCCESS',
          targetId: current.nomorRequest,
          details: `Disetujui oleh Manajer Seksi: ${manajerName}`,
        });

        return NextResponse.json({
          success: true,
          message: `Formulir ${current.nomorRequest} berhasil disetujui oleh Manajer Seksi dan diteruskan ke Admin Workshop.`,
          request: updated,
          adminWorkshopEmail: adminEmailContent,
        });
      }

      if (action === 'REJECT') {
        const updated = await withTransaction(async (tx) => {
          const [upd] = await tx<Array<{ nomorRequest: string }>>`
            UPDATE "SectionRequest"
            SET
              "statusApprovalManajerSeksi" = 'REJECTED',
              "waktuApprovalManajerSeksi" = NOW(),
              "alasanTolak" = ${alasanTolak || catatan || 'Ditolak oleh Manajer Seksi Pemohon'},
              status = 'Ditolak Manajer Seksi',
              "flowStep" = 'STEP_5_DITOLAK',
              "waktuUpdate" = NOW()
            WHERE id = ${current.id}
            RETURNING *
          `;

          await createInAppNotification(
            {
              requestId: current.id,
              nomorRequest: current.nomorRequest,
              targetRole: 'USER_SEKSI',
              targetUser: current.picPemohon,
              tipe: 'INFO_TOLAK_SEKSI',
              judul: `Request ${current.nomorRequest} Ditolak Manajer Seksi`,
              pesan: `Permohonan request ditolak oleh Manajer Seksi (${manajerName}). Alasan: ${alasanTolak || catatan || '-'}`,
              link: `/request`,
            },
            tx
          );

          return upd;
        });

        recordAuditLog({
          action: 'SECTION_REQUEST_REJECT_MANAJER_SEKSI',
          ip,
          status: 'SUCCESS',
          targetId: current.nomorRequest,
          details: `Ditolak oleh Manajer Seksi: ${manajerName}. Alasan: ${alasanTolak || catatan || '-'}`,
        });

        return NextResponse.json({
          success: true,
          message: `Formulir ${current.nomorRequest} ditolak oleh Manajer Seksi.`,
          request: updated,
        });
      }
    }

    // Jalur C: Approval Supervisor (Spv) Seksi Pemohon (Tahap 1)
    if (current.statusApprovalAtasanSeksi === 'APPROVED') {
      return NextResponse.json({
        error: 'Formulir ini sudah disetujui oleh Supervisor Seksi sebelumnya.',
      }, { status: 400 });
    }

    const spvName = namaAtasan || current.namaAtasanSeksi || 'Supervisor Seksi';

    if (action === 'APPROVE') {
      const hasManajer = Boolean(current.namaManajerSeksi || current.emailManajerSeksi);

      const updated = await withTransaction(async (tx) => {
        const [upd] = await tx<Array<{ nomorRequest: string }>>`
          UPDATE "SectionRequest"
          SET
            "statusApprovalAtasanSeksi" = 'APPROVED',
            "waktuApprovalAtasanSeksi" = NOW(),
            "foreman" = ${spvName},
            "namaAtasanSeksi" = ${spvName},
            "ttdAtasanSeksi" = ${ttdAtasanSeksi || null},
            "catatanAtasanSeksi" = ${catatan || null},
            status = ${hasManajer ? 'Menunggu Assign Manajer Seksi' : 'Pending: Menunggu Evaluasi Workshop'},
            "flowStep" = ${hasManajer ? 'STEP_2B_WAITING_MANAJER_SEKSI' : 'STEP_3_DITERIMA_WORKSHOP'},
            "waktuUpdate" = NOW()
          WHERE id = ${current.id}
          RETURNING *
        `;

        if (hasManajer) {
          // Notifikasi untuk Manajer Seksi (Tahap 2)
          await createInAppNotification({
            requestId: current.id,
            nomorRequest: current.nomorRequest,
            targetRole: 'MANAJER_SEKSI',
            targetEmail: current.emailManajerSeksi || undefined,
            tipe: 'APPROVAL_MANAJER_SEKSI',
            judul: `Request ${current.nomorRequest} Menunggu Persetujuan Manajer Seksi`,
            pesan: `Spv Seksi (${spvName}) telah menandatangani formulir request "${current.perihal || current.namaBarang}". Mohon tanda tangan persetujuan Manajer Seksi.`,
            link: `/request/approval?token=${current.approvalToken}&role=manajer_seksi`,
          }, tx);

          // Notifikasi untuk PIC Pemohon
          await createInAppNotification({
            requestId: current.id,
            nomorRequest: current.nomorRequest,
            targetRole: 'USER_SEKSI',
            targetUser: current.picPemohon,
            tipe: 'APPROVAL_ATASAN_SEKSI',
            judul: `Request ${current.nomorRequest} Disetujui Spv Seksi`,
            pesan: `Spv Seksi (${spvName}) telah menandatangani form. Dokumen saat ini diteruskan ke Manajer Seksi (${current.namaManajerSeksi || 'Atasan'}) untuk persetujuan akhir seksi.`,
            link: `/request`,
          }, tx);
        } else {
          // Jika tidak ada manajer seksi terdaftar, langsung teruskan ke Workshop
          await createInAppNotification({
            requestId: current.id,
            nomorRequest: current.nomorRequest,
            targetRole: 'ADMIN',
            tipe: 'ASSIGN_DITERIMA_WORKSHOP',
            judul: `Request Baru Diterima: ${current.nomorRequest}`,
            pesan: `Request permohonan "${current.perihal || current.namaBarang}" dari Seksi ${current.seksiPemohon} telah disetujui & ditandatangani oleh ${spvName}. Siap dilakukan evaluasi pekerjaan bengkel.`,
            link: `/request`,
          }, tx);

          await createInAppNotification({
            requestId: current.id,
            nomorRequest: current.nomorRequest,
            targetRole: 'USER_SEKSI',
            targetUser: current.picPemohon,
            tipe: 'APPROVAL_ATASAN_SEKSI',
            judul: `Request ${current.nomorRequest} Disetujui Atasan`,
            pesan: `Atasan Anda (${spvName}) telah menyetujui formulir request. Dokumen otomatis diteruskan ke Admin Workshop Produksi.`,
            link: `/request`,
          }, tx);
        }

        return upd;
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_APPROVE_SPV_SEKSI',
        ip,
        status: 'SUCCESS',
        targetId: current.nomorRequest,
        details: `Disetujui oleh Spv: ${spvName}`,
      });

      return NextResponse.json({
        success: true,
        message: hasManajer
          ? `Formulir ${current.nomorRequest} berhasil ditandatangani oleh Spv dan diteruskan ke Manajer Seksi.`
          : `Formulir ${current.nomorRequest} berhasil ditandatangani dan diteruskan ke Admin Workshop.`,
        request: updated,
      });
    }

    if (action === 'REJECT') {
      const updated = await withTransaction(async (tx) => {
        const [upd] = await tx<Array<{ nomorRequest: string }>>`
          UPDATE "SectionRequest"
          SET
            "statusApprovalAtasanSeksi" = 'REJECTED',
            "waktuApprovalAtasanSeksi" = NOW(),
            "alasanTolak" = ${alasanTolak || catatan || 'Ditolak oleh Spv Seksi pemohon'},
            status = 'Ditolak Spv Seksi',
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
          judul: `Request ${current.nomorRequest} Ditolak Spv Seksi`,
          pesan: `Permohonan request ditolak oleh Spv Seksi (${spvName}). Alasan: ${alasanTolak || catatan || '-'}`,
          link: `/request`,
        }, tx);

        return upd;
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_REJECT_SPV_SEKSI',
        ip,
        status: 'SUCCESS',
        targetId: current.nomorRequest,
        details: `Ditolak oleh Spv: ${spvName}. Alasan: ${alasanTolak || catatan || '-'}`,
      });

      return NextResponse.json({
        success: true,
        message: `Formulir ${current.nomorRequest} ditolak oleh Spv Seksi. Pemberitahuan telah dikirim ke pemohon.`,
        request: updated,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid (hanya APPROVE atau REJECT).' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests/approval error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat memproses persetujuan.' }, { status: 500 });
  }
}
