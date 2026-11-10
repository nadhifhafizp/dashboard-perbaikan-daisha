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
        sr."Id" AS id,
        sr."RequestNo" AS "nomorRequest",
        sr."NomorSurat" AS "nomorSurat",
        sr."RequesterSection" AS "seksiPemohon",
        sr."RequesterName" AS "picPemohon",
        sr."RequesterContact" AS "kontakPemohon",
        sr."ItemTitle" AS "namaBarang",
        sr."ItemSpec" AS "spesifikasi",
        sr."ItemQty" AS jumlah,
        sr."ItemUnit" AS satuan,
        sr."Urgency" AS urgensi,
        sr."Remark" AS catatan,
        sr."WorkflowStatus" AS status,
        sr."Subject" AS perihal,
        sr."MachineName" AS "namaMachine",
        sr."ProblemFactor" AS faktor,
        sr."RequestType" AS tujuan,
        sr."Reason" AS alasan,
        sr."CurrentCondition" AS "keadaanSekarang",
        sr."PhotoBefore" AS "fotoSebelum",
        sr."ActionPlan" AS "rencanaTindakan",
        sr."PhotoAfter" AS "fotoSesudah",
        sr."TargetResult" AS "targetHasil",
        sr."ExecutionNote" AS "penjelasanPelaksanaan",
        sr."FlowStep" AS "flowStep",
        sr."ApprovalToken" AS "approvalToken",
        sr."SectionHeadName" AS "namaAtasanSeksi",
        sr."SectionHeadEmail" AS "emailAtasanSeksi",
        sr."SectionHeadStatus" AS "statusApprovalAtasanSeksi",
        sr."SectionHeadSignature" AS "ttdAtasanSeksi",
        sr."WorkshopEmail" AS "emailMentorWorkshop",
        sr."WorkshopSignature" AS "ttdAdminWorkshop",
        sr."SpecialProjectSignature" AS "ttdAtasanSpecialProject",
        CASE
          WHEN sr."SpecialProjectSignature" IS NOT NULL AND length(sr."SpecialProjectSignature") > 0 AND sr."SpecialProjectSignature" != 'NONE' AND sr."SpecialProjectSignature" != 'DITOLAK' THEN 'APPROVED'
          WHEN sr."WorkflowStatus" IN ('Dikerjakan', 'Pending: Material Habis', 'Pekerjaan Fisik Selesai', 'Selesai') THEN 'APPROVED'
          WHEN sr."FlowStep" IN ('STEP_6_DALAM_PENGERJAAN', 'STEP_7_PEKERJAAN_SELESAI', 'STEP_8_SELESAI') THEN 'APPROVED'
          WHEN sr."WorkflowStatus" = 'Ditolak' OR sr."FlowStep" = 'STEP_5_DITOLAK' OR sr."Decision8210" = 'DITOLAK' THEN 'REJECTED'
          ELSE 'PENDING'
        END AS "statusApprovalAtasanSpecialProject",
        sr."EstCost" AS "biayaEstimate",
        sr."ActCost" AS "biayaActual",
        sr."EstManHour" AS "orangJamEstimate",
        sr."ActManHour" AS "orangJamActual",
        sr."EstDuration" AS "waktuEstimate",
        sr."ActDuration" AS "waktuActual",
        sr."EstExecDate" AS "tglPelaksanaanEstimate",
        sr."ActExecDate" AS "tglPelaksanaanActual",
        sr."EstComment" AS "komentarEstimate",
        sr."ActComment" AS "komentarActual",
        sr."Decision" AS keputusan,
        sr."Decision8210" AS "keputusan8210",
        sr."Decision820" AS "keputusan820",
        sr."CheckResult" AS "hasilCheck",
        sr."SchedulePlan" AS "schedulePlanning",
        sr."ScheduleActual" AS "scheduleActual",
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', m."Id",
                'sectionRequestId', m."RequestId",
                'namaKomponen', m."MaterialName",
                'tipe', m."MaterialType",
                'qty', m."QtyUsed",
                'satuan', m."Unit",
                'dimensi', m."MaterialSpec"
              ) ORDER BY m."Id"
            )
            FROM "TWMSSectionRequestMaterial" m
            WHERE m."RequestId" = sr."Id"
          ),
          '[]'::jsonb
        ) AS materials
      FROM "TWMSSectionRequest" sr
      WHERE sr."ApprovalToken" = ${token}
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
      flowStep: string;
      status: string;
      emailMentorWorkshop: string | null;
      namaAtasanSeksi: string | null;
      emailAtasanSeksi: string | null;
      keputusan8210: string | null;
      keputusan820: string | null;
      approvalToken: string;
    }>>`
      SELECT 
        "Id" AS id, 
        "RequestNo" AS "nomorRequest", 
        "NomorSurat" AS "nomorSurat", 
        "RequesterSection" AS "seksiPemohon", 
        "RequesterName" AS "picPemohon",
        COALESCE("Subject", "ItemTitle") AS perihal, 
        COALESCE("ItemTitle", "Subject") AS "namaBarang", 
        "SectionHeadStatus" AS "statusApprovalAtasanSeksi",
        "FlowStep" AS "flowStep", 
        "WorkflowStatus" AS status,
        "WorkshopEmail" AS "emailMentorWorkshop", 
        "SectionHeadName" AS "namaAtasanSeksi", 
        "SectionHeadEmail" AS "emailAtasanSeksi",
        "Decision8210" AS "keputusan8210", 
        "Decision820" AS "keputusan820", 
        "ApprovalToken" AS "approvalToken"
      FROM "TWMSSectionRequest"
      WHERE "ApprovalToken" = ${token}
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
      if (current.status === 'Selesai' || current.flowStep === 'STEP_8_SELESAI') {
        return NextResponse.json(
          { error: 'Permohonan ini sudah berstatus Selesai dan tidak dapat diubah lagi.' },
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
          let finalNomorSurat = current.nomorSurat;
          if (!finalNomorSurat || finalNomorSurat.startsWith('REQ-')) {
            finalNomorSurat = await generateNextNomorSurat(current.seksiPemohon, new Date(), tx as unknown as typeof sql);
          }

          const [upd] = await tx<Array<{ nomorRequest: string; nomorSurat: string }>>`
            UPDATE "TWMSSectionRequest"
            SET
              "Decision8210" = ${spReviewer},
              "Decision820" = ${deptHeadReviewer},
              "SectionHeadStatus" = 'APPROVED',
              "SpecialProjectSignature" = ${ttdAtasanSpecialProject || null},
              "NomorSurat" = ${finalNomorSurat},
              "WorkflowStatus" = 'Dikerjakan',
              "FlowStep" = 'STEP_6_DALAM_PENGERJAAN',
              "ExecutionNote" = CASE 
                WHEN "ExecutionNote" IS NULL OR "ExecutionNote" = '' THEN ${catatan ? `[Catatan S.Project: ${catatan}]` : null}
                ELSE "ExecutionNote" || ${catatan ? ` [Catatan S.Project: ${catatan}]` : ''}
              END,
              "UpdateDate" = NOW()
            WHERE "Id" = ${current.id}
            RETURNING "RequestNo" AS "nomorRequest", "NomorSurat" AS "nomorSurat"
          `;

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
            UPDATE "TWMSSectionRequest"
            SET
              "Decision8210" = 'DITOLAK',
              "WorkflowStatus" = 'Ditolak',
              "FlowStep" = 'STEP_5_DITOLAK',
              "PendingReason" = ${alasanTolak || catatan || 'Ditolak oleh Atasan Special Project (8210 / 820)'},
              "UpdateDate" = NOW()
            WHERE "Id" = ${current.id}
            RETURNING "RequestNo" AS "nomorRequest"
          `;

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

    // Jalur B: Approval Atasan / Spv Seksi Pemohon (Tahap 1 / 2)
    if (current.statusApprovalAtasanSeksi === 'APPROVED') {
      return NextResponse.json({
        error: 'Formulir ini sudah disetujui oleh Atasan Seksi sebelumnya.',
      }, { status: 400 });
    }

    const spvName = namaAtasan || current.namaAtasanSeksi || 'Supervisor Seksi';

    if (action === 'APPROVE') {
      const updated = await withTransaction(async (tx) => {
        const [upd] = await tx<Array<{ nomorRequest: string }>>`
          UPDATE "TWMSSectionRequest"
          SET
            "SectionHeadStatus" = 'APPROVED',
            "Foreman" = ${spvName},
            "SectionHeadName" = ${spvName},
            "SectionHeadSignature" = ${ttdAtasanSeksi || ttdManajerSeksi || null},
            "Remark" = CASE WHEN ${catatan && catatan.trim()} THEN ${catatan} ELSE "Remark" END,
            "WorkflowStatus" = 'Pending: Menunggu Evaluasi Workshop',
            "FlowStep" = 'STEP_3_DITERIMA_WORKSHOP',
            "UpdateDate" = NOW()
          WHERE "Id" = ${current.id}
          RETURNING "RequestNo" AS "nomorRequest"
        `;

        return upd;
      });

      // Email notifikasi ke Admin Workshop
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const adminEmailContent = buildAdminWorkshopEmailContent({
        nomorRequest: current.nomorRequest,
        perihal: current.perihal || current.namaBarang,
        seksiPemohon: current.seksiPemohon,
        picPemohon: current.picPemohon,
        namaAtasan: spvName,
        detailLink: `${origin}/request`,
      });

      sendEmailAsync({
        subject: adminEmailContent.subject,
        bodyText: adminEmailContent.bodyText,
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_APPROVE_ATASAN_SEKSI',
        ip,
        status: 'SUCCESS',
        targetId: current.nomorRequest,
        details: `Disetujui oleh Atasan Seksi: ${spvName}`,
      });

      return NextResponse.json({
        success: true,
        message: `Formulir ${current.nomorRequest} berhasil disetujui oleh Atasan Seksi dan diteruskan ke Admin Workshop.`,
        request: updated,
        adminWorkshopEmail: adminEmailContent,
      });
    }

    if (action === 'REJECT') {
      const updated = await withTransaction(async (tx) => {
        const [upd] = await tx<Array<{ nomorRequest: string }>>`
          UPDATE "TWMSSectionRequest"
          SET
            "SectionHeadStatus" = 'REJECTED',
            "PendingReason" = ${alasanTolak || catatan || 'Ditolak oleh Atasan Seksi pemohon'},
            "WorkflowStatus" = 'Ditolak Atasan Seksi',
            "FlowStep" = 'STEP_5_DITOLAK',
            "UpdateDate" = NOW()
          WHERE "Id" = ${current.id}
          RETURNING "RequestNo" AS "nomorRequest"
        `;

        return upd;
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_REJECT_ATASAN_SEKSI',
        ip,
        status: 'SUCCESS',
        targetId: current.nomorRequest,
        details: `Ditolak oleh Atasan: ${spvName}. Alasan: ${alasanTolak || catatan || '-'}`,
      });

      return NextResponse.json({
        success: true,
        message: `Formulir ${current.nomorRequest} ditolak oleh Atasan Seksi.`,
        request: updated,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid (hanya APPROVE atau REJECT).' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests/approval error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat memproses persetujuan.' }, { status: 500 });
  }
}
