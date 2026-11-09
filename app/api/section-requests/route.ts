import { NextResponse } from 'next/server';
import crypto from 'crypto';
import sql, { withTransaction } from '@/lib/db';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
  validatePositiveQuantity,
} from '@/lib/security';
import { createInAppNotification, buildAtasanSpecialProjectEmailContent, sendEmailAsync } from '@/lib/emailNotification';
import { DEFAULT_ATASAN_SPROJECT_EMAIL } from '@/lib/workflowConstants';
import { generateNextNomorSurat } from '@/lib/nomorSuratServer';

// Parse base64/URL image safely
function parseImageString(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.length <= 6 * 1024 * 1024) {
      return trimmed;
    }
  }
  return null;
}

export interface SectionRequestRow {
  id: number;
  nomorRequest: string;
  nomorSurat?: string | null;
  flowStep: string;
  status: string;
  seksiPemohon: string;
  picPemohon: string;
  perihal?: string;
  namaBarang?: string;
  alasanTolak?: string | null;
  picBengkel?: string | null;
  estimasi?: string | null;
  catatanAdmin?: string | null;
  biayaEstimate?: string | number | null;
  biayaActual?: string | number | null;
  orangJamEstimate?: string | number | null;
  orangJamActual?: string | number | null;
  waktuEstimate?: string | null;
  waktuActual?: string | null;
  kebutuhanSparepart?: string | null;
  kebutuhanMaterial?: string | null;
  tglPelaksanaanEstimate?: string | null;
  tglPelaksanaanActual?: string | null;
  komentarEstimate?: string | null;
  komentarActual?: string | null;
  keputusan?: string | null;
  keputusan8210?: string | null;
  keputusan820?: string | null;
  hasilCheck?: string | null;
  hasilCheckPemohon?: string | null;
  schedulePlanning?: string | null;
  scheduleActual?: string | null;
  waktuSelesai?: Date | string | null;
  materials?: unknown;
  [key: string]: unknown;
}

// Helper untuk memastikan format data materials selalu array of object bersih
function normalizeMaterials(raw: unknown): Array<{
  id: number;
  sectionRequestId?: number;
  namaKomponen: string;
  tipe?: 'SPAREPART' | 'MATERIAL';
  qty: number;
  satuan?: string;
  dimensi?: string;
  potongStok?: boolean;
  qtyPotongStok?: number;
  keterangan?: string | null;
}> {
  if (!raw) return [];
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  const result: Record<string, unknown>[] = [];
  for (const item of parsed) {
    if (!item) continue;
    if (typeof item === 'string') {
      try {
        const inner = JSON.parse(item);
        if (Array.isArray(inner)) {
          result.push(...inner);
        } else if (inner && typeof inner === 'object') {
          result.push(inner);
        }
      } catch {}
    } else if (typeof item === 'object') {
      result.push(item as Record<string, unknown>);
    }
  }

  return result
    .filter((m) => m && (m.namaKomponen || m.MaterialName))
    .map((m) => {
      const nama = String(m.namaKomponen || m.MaterialName || '');
      const lower = nama.toLowerCase();
      const isMat =
        m.tipe === 'MATERIAL' ||
        m.MaterialType === 'MATERIAL' ||
        lower.includes('plat') ||
        lower.includes('cat') ||
        lower.includes('las') ||
        lower.includes('pipa') ||
        lower.includes('hollow') ||
        lower.includes('siku') ||
        m.satuan === 'cm²' ||
        m.satuan === 'm²' ||
        m.Unit === 'cm²' ||
        m.Unit === 'm²';

      return {
        id: Number(m.id || m.Id) || Date.now(),
        sectionRequestId: m.sectionRequestId ? Number(m.sectionRequestId) : (m.RequestId ? Number(m.RequestId) : undefined),
        namaKomponen: nama,
        tipe: ((m.tipe || m.MaterialType || (isMat ? 'MATERIAL' : 'SPAREPART')) as string).toUpperCase() as 'SPAREPART' | 'MATERIAL',
        qty: Number(m.qty ?? m.QtyUsed) || 1,
        satuan: String(m.satuan || m.Unit || (isMat ? 'cm²' : 'Pcs')),
        dimensi: m.dimensi ? String(m.dimensi) : (m.MaterialSpec ? String(m.MaterialSpec) : undefined),
        potongStok: Boolean(m.potongStok ?? m.DeductStock),
        qtyPotongStok: m.qtyPotongStok !== undefined ? Number(m.qtyPotongStok) : (m.QtyDeducted !== undefined ? Number(m.QtyDeducted) : undefined),
        keterangan: m.keterangan ? String(m.keterangan) : (m.Remark ? String(m.Remark) : null),
      };
    });
}

// GET: Ambil daftar request (Admin: semua, USER_SEKSI: hanya milik seksinya)
export async function GET(request: Request) {
  const auth = await requireAuth(request, ['ADMIN', 'USER_SEKSI', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  const rateLimit = checkRateLimit(`requests_get:${auth.ip}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan data request.' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const includeImage = searchParams.get('includeImage') === 'true' || Boolean(idParam);
    const status = searchParams.get('status');
    const seksi = searchParams.get('seksi');

    const userSeksi = auth.user?.role === 'USER_SEKSI' ? (auth.user.seksi || null) : null;
    const filterByUser = auth.user?.role === 'USER_SEKSI' ? auth.user.username : null;
    const filterStatus = status && status !== 'all' ? sanitizeText(status, 50) : null;
    const filterSeksi = seksi && seksi !== 'all' ? sanitizeText(seksi, 50) : null;
    const filterId = idParam ? parseInt(idParam, 10) : null;

    const requests = await sql`
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
        sr."PendingReason" AS "alasanTolak",
        sr."UpdateBy" AS "picBengkel",
        sr."EstDuration" AS estimasi,
        sr."ExecutionNote" AS "catatanAdmin",
        sr."CreatedBy" AS "dibuatOleh",
        sr."RequestDate" AS "waktuDibuat",
        sr."UpdateDate" AS "waktuUpdate",
        sr."FinishDate" AS "waktuSelesai",
        sr."Subject" AS perihal,
        sr."MachineName" AS "namaMachine",
        sr."ProblemFactor" AS faktor,
        sr."RequestType" AS tujuan,
        sr."Reason" AS alasan,
        sr."SectionCode" AS "kodeSeksi",
        sr."Drafter" AS drafter,
        sr."Foreman" AS foreman,
        sr."CurrentCondition" AS "keadaanSekarang",
        ${includeImage ? sql`sr."PhotoBefore"` : sql`NULL`} AS "fotoSebelum",
        CASE WHEN sr."PhotoBefore" IS NOT NULL AND length(sr."PhotoBefore") > 0 THEN TRUE ELSE FALSE END AS "hasFotoSebelum",
        sr."ActionPlan" AS "rencanaTindakan",
        ${includeImage ? sql`sr."PhotoAfter"` : sql`NULL`} AS "fotoSesudah",
        CASE WHEN sr."PhotoAfter" IS NOT NULL AND length(sr."PhotoAfter") > 0 THEN TRUE ELSE FALSE END AS "hasFotoSesudah",
        sr."TargetResult" AS "targetHasil",
        sr."ExecutionNote" AS "penjelasanPelaksanaan",
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
        sr."CheckResultRequester" AS "hasilCheckPemohon",
        sr."SchedulePlan" AS "schedulePlanning",
        sr."ScheduleActual" AS "scheduleActual",
        sr."SectionHeadEmail" AS "emailAtasanSeksi",
        sr."SectionHeadName" AS "namaAtasanSeksi",
        sr."SectionHeadStatus" AS "statusApprovalAtasanSeksi",
        sr."ApprovalToken" AS "approvalToken",
        sr."WorkshopEmail" AS "emailMentorWorkshop",
        sr."FlowStep" AS "flowStep",
        sr."PendingReason" AS "alasanPending",
        sr."SectionHeadSignature" AS "ttdAtasanSeksi",
        sr."WorkshopSignature" AS "ttdAdminWorkshop",
        sr."SpecialProjectSignature" AS "ttdAtasanSpecialProject",
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
                'dimensi', m."MaterialSpec",
                'potongStok', m."DeductStock",
                'qtyPotongStok', m."QtyDeducted",
                'keterangan', m."Remark"
              ) ORDER BY m."Id"
            )
            FROM "TWMSSectionRequestMaterial" m
            WHERE m."RequestId" = sr."Id"
          ),
          '[]'::jsonb
        ) AS materials
      FROM "TWMSSectionRequest" sr
      WHERE (${filterByUser}::text IS NULL OR sr."CreatedBy" = ${filterByUser} OR (${userSeksi}::text IS NOT NULL AND LOWER(sr."RequesterSection") = LOWER(${userSeksi})))
        AND (${filterStatus}::text IS NULL OR sr."WorkflowStatus" = ${filterStatus})
        AND (${filterSeksi}::text IS NULL OR LOWER(sr."RequesterSection") = LOWER(${filterSeksi}))
        AND (${filterId}::int IS NULL OR sr."Id" = ${filterId})
      ORDER BY sr."RequestDate" DESC
    `;

    const mappedRequests = requests.map((r) => ({
      ...r,
      materials: normalizeMaterials(r.materials),
    }));

    if (filterId && mappedRequests.length > 0) {
      return NextResponse.json({ success: true, request: mappedRequests[0] });
    }

    return NextResponse.json({ success: true, requests: mappedRequests });
  } catch (error) {
    console.error('GET /api/section-requests error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data request seksi.' }, { status: 500 });
  }
}

// POST: Buat request baru atau update status/material/evaluasi
export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN', 'USER_SEKSI', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  const sizeCheck = validatePayloadSize(request, 10 * 1024 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  const rateLimit = checkRateLimit(`requests_post:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan mutasi request.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const actionRaw = sanitizeText(body.action, 50)?.toUpperCase();
    const action = actionRaw || (!body.id && !body.sectionRequestId ? 'CREATE' : '');

    // 1. CREATE: PIC Seksi membuat request baru ke workshop
    if (action === 'CREATE') {
      const seksiPemohon = sanitizeText(body.seksiPemohon || body.seksi, 50);
      const picPemohon = sanitizeText(body.picPemohon || body.drafter || body.namaPemohon || auth.user?.name || auth.user?.username, 100);
      const kontakPemohon = sanitizeText(body.kontakPemohon, 50);
      const perihal = sanitizeText(body.perihal || body.namaBarang, 255);
      const namaMachine = sanitizeText(body.namaMachine, 255);
      const namaBarang = sanitizeText(body.namaBarang || body.perihal || body.namaMachine || 'Pekerjaan Bengkel', 100);
      const spesifikasi = sanitizeText(body.spesifikasi || body.rencanaTindakan, 2000);
      const jumlah = validatePositiveInt(body.jumlah || 1, 'Jumlah barang', 1, 10000).value;
      const satuan = sanitizeText(body.satuan, 20) || 'set';
      const faktor = sanitizeText(body.faktor, 100) || 'Safety';
      const tujuan = sanitizeText(body.tujuan, 1000) || '';
      const alasan = sanitizeText(body.alasan, 2000);
      const urgensi = sanitizeText(body.urgensi || body.prioritas, 20) || 'Normal';
      const kodeSeksi = sanitizeText(body.kodeSeksi, 50);
      const drafter = sanitizeText(body.drafter || picPemohon, 100);
      const foreman = sanitizeText(body.foreman, 100);
      const keadaanSekarang = sanitizeText(body.keadaanSekarang, 5000);
      const fotoSebelum = parseImageString(body.fotoSebelum);
      const rencanaTindakan = sanitizeText(body.rencanaTindakan, 5000);
      const fotoSesudah = parseImageString(body.fotoSesudah);
      const targetHasil = sanitizeText(body.targetHasil, 2000);
      const penjelasanPelaksanaan = sanitizeText(body.penjelasanPelaksanaan, 5000);
      const catatan = sanitizeText(body.catatan || body.catatanTambahan, 1000);

      const emailAtasanSeksi = sanitizeText(body.emailAtasanSeksi, 255);
      const namaAtasanSeksi = sanitizeText(body.namaAtasanSeksi || body.foreman, 100);
      const emailMentorWorkshop = sanitizeText(body.emailMentorWorkshop, 255) || 'mentor.workshop@bridgestone.com';

      if (!seksiPemohon || (!perihal && !namaBarang)) {
        return NextResponse.json(
          { error: 'Field wajib (seksi pemohon dan perihal) tidak boleh kosong.' },
          { status: 400 }
        );
      }

      const now = new Date();
      const datePrefix = `REQ-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      
      const [latestReq] = await sql<Array<{ nomorRequest: string }>>`
        SELECT "RequestNo" AS "nomorRequest" FROM "TWMSSectionRequest"
        WHERE "RequestNo" LIKE ${datePrefix + '-%'}
        ORDER BY "Id" DESC LIMIT 1
      `;
      let seq = 1;
      if (latestReq?.nomorRequest) {
        const parts = latestReq.nomorRequest.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
      }
      const nomorRequest = `${datePrefix}-${String(seq).padStart(3, '0')}`;
      const approvalToken = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);

      const [created] = await sql<Array<{ id: number; nomorRequest: string; nomorSurat: string | null }>>`
        INSERT INTO "TWMSSectionRequest" (
          "RequestNo", "RequesterSection", "RequesterName", "RequesterContact",
          "ItemTitle", "ItemSpec", "ItemQty", "ItemUnit", "Urgency", "Remark",
          "Subject", "MachineName", "ProblemFactor", "RequestType", "Reason", "SectionCode",
          "Drafter", "Foreman", "CurrentCondition", "PhotoBefore",
          "ActionPlan", "PhotoAfter", "TargetResult", "ExecutionNote",
          "SectionHeadEmail", "SectionHeadName", "WorkshopEmail",
          "ApprovalToken", "SectionHeadStatus", "FlowStep",
          "WorkflowStatus", "NomorSurat", "CreatedBy", "RequestDate", "UpdateDate"
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
          ${perihal || null},
          ${namaMachine || null},
          ${faktor},
          ${tujuan || null},
          ${alasan || null},
          ${kodeSeksi || null},
          ${drafter || null},
          ${foreman || null},
          ${keadaanSekarang || null},
          ${fotoSebelum || null},
          ${rencanaTindakan || null},
          ${fotoSesudah || null},
          ${targetHasil || null},
          ${penjelasanPelaksanaan || null},
          ${emailAtasanSeksi || null},
          ${namaAtasanSeksi || null},
          ${emailMentorWorkshop || null},
          ${approvalToken},
          'PENDING',
          'STEP_2_WAITING_ATASAN_SEKSI',
          'Menunggu Assign Spv Seksi',
          null,
          ${auth.user!.username},
          NOW(),
          NOW()
        )
        RETURNING "Id" AS id, "RequestNo" AS "nomorRequest", "NomorSurat" AS "nomorSurat"
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_CREATE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: created.nomorRequest,
        details: `Perihal: ${perihal}, Seksi: ${seksiPemohon}, Atasan: ${namaAtasanSeksi || emailAtasanSeksi}`,
      });

      return NextResponse.json({
        success: true,
        message: `Request ${nomorRequest} berhasil dibuat. Link persetujuan telah disiapkan untuk Atasan Seksi.`,
        request: created,
        approvalToken,
        approvalLink: `/request/approval?token=${approvalToken}`,
      });
    }

    // 2. EVALUASI_WORKSHOP: Evaluasi kebutuhan durasi, personil, dan material
    if (
      action === 'EVALUASI_WORKSHOP' ||
      action === 'UPDATE_EVALUATION' ||
      action === 'UPDATE_STATUS' ||
      action === 'ASSIGN_ATASAN_SPROJECT'
    ) {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya PIC Workshop / Admin yang dapat melakukan evaluasi pekerjaan.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const newStatus = sanitizeText(body.status, 50);
      const keputusan = sanitizeText(body.keputusan, 50); // 'GO' | 'PENDING' | 'REJECT'
      const alasanTolak = sanitizeText(body.alasanTolak, 500);

      const waktuEstimate = sanitizeText(body.waktuEstimate, 100);
      const waktuActual = sanitizeText(body.waktuActual, 100);
      const orangJamEstimate = sanitizeText(body.orangJamEstimate, 100);
      const orangJamActual = sanitizeText(body.orangJamActual, 100);
      const kebutuhanSparepart = sanitizeText(body.kebutuhanSparepart, 2000);
      const kebutuhanMaterial = sanitizeText(body.kebutuhanMaterial, 2000);
      const biayaEstimate = sanitizeText(body.biayaEstimate, 100);
      const biayaActual = sanitizeText(body.biayaActual, 100);

      const tglPelaksanaanEstimate = sanitizeText(body.tglPelaksanaanEstimate, 100);
      const tglPelaksanaanActual = sanitizeText(body.tglPelaksanaanActual, 100);
      const komentarEstimate = sanitizeText(body.komentarEstimate, 1000);
      const komentarActual = sanitizeText(body.komentarActual, 1000);
      const picBengkel = sanitizeText(body.picBengkel, 100);
      const estimasi = sanitizeText(body.estimasi, 50);
      const catatanAdmin = sanitizeText(body.catatanAdmin, 1000);

      const keputusan8210 = sanitizeText(body.keputusan8210, 100);
      const keputusan820 = sanitizeText(body.keputusan820, 100);
      const hasilCheck = sanitizeText(body.hasilCheck, 2000);
      const hasilCheckPemohon = sanitizeText(body.hasilCheckPemohon, 100);
      const schedulePlanning = sanitizeText(body.schedulePlanning, 1000);
      const scheduleActual = sanitizeText(body.scheduleActual, 1000);

      const [current] = await sql<Array<{
        Id: number;
        RequestNo: string;
        NomorSurat: string | null;
        RequesterSection: string;
        RequesterName: string;
        Subject: string;
        ItemTitle: string;
        SectionHeadStatus: string;
        SpecialProjectSignature: string | null;
        WorkflowStatus: string;
        FlowStep: string;
        WorkshopSignature: string | null;
        FinishDate: Date | null;
      }>>`
        SELECT 
          "Id", "RequestNo", "NomorSurat", "RequesterSection", "RequesterName",
          "Subject", "ItemTitle", "SectionHeadStatus", "SpecialProjectSignature",
          "WorkflowStatus", "FlowStep", "WorkshopSignature", "FinishDate"
        FROM "TWMSSectionRequest" WHERE "Id" = ${id} LIMIT 1
      `;

      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      if (
        (keputusan === 'GO' || body.assignAtasanSpecialProject || action === 'ASSIGN_ATASAN_SPROJECT') &&
        current.SectionHeadStatus !== 'APPROVED'
      ) {
        return NextResponse.json(
          {
            error:
              'Permohonan ini belum disetujui / di-assign oleh Atasan Seksi Pemohon. Harap menunggu persetujuan Atasan Seksi terlebih dahulu.',
          },
          { status: 400 }
        );
      }

      const isCompletingWork =
        newStatus === 'Pekerjaan Fisik Selesai' ||
        newStatus === 'Selesai' ||
        body.flowStep === 'STEP_7_PEKERJAAN_SELESAI' ||
        body.flowStep === 'STEP_8_SELESAI';

      if (isCompletingWork && !current.SpecialProjectSignature) {
        return NextResponse.json(
          {
            error:
              'Pekerjaan belum dapat diselesaikan karena permohonan ini belum disetujui / di-assign oleh Atasan Special Project.',
          },
          { status: 400 }
        );
      }

      const ttdAdminWorkshop = body.ttdAdminWorkshop ? sanitizeText(body.ttdAdminWorkshop, 500000) : undefined;
      const ttdAtasanSpecialProject = body.ttdAtasanSpecialProject ? sanitizeText(body.ttdAtasanSpecialProject, 500000) : undefined;

      let nextFlowStep = current.FlowStep;
      let nextStatus = newStatus || current.WorkflowStatus;

      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      let atasanSProjectEmail = null;

      if (keputusan === 'REJECT') {
        nextFlowStep = 'STEP_5_DITOLAK';
        nextStatus = 'Ditolak';

        atasanSProjectEmail = buildAtasanSpecialProjectEmailContent({
          action: 'REJECT',
          nomorRequest: current.RequestNo,
          perihal: current.Subject || current.ItemTitle || '-',
          seksiPemohon: current.RequesterSection,
          picPemohon: current.RequesterName,
          alasanTolak: alasanTolak || komentarActual || 'Tidak memenuhi kriteria workshop',
          detailLink: `${origin}/request`,
        });
      } else if (keputusan === 'GO' || body.assignAtasanSpecialProject || action === 'ASSIGN_ATASAN_SPROJECT') {
        if (body.assignAtasanSpecialProject || action === 'ASSIGN_ATASAN_SPROJECT') {
          nextFlowStep = 'STEP_6_DALAM_PENGERJAAN';
          nextStatus = newStatus === 'Disetujui' ? 'Dikerjakan' : (newStatus || 'Dikerjakan');
        } else {
          nextFlowStep = 'STEP_5_MENUNGGU_ATASAN_SPROJECT';
          nextStatus = 'Menunggu Assign S.Project';

          atasanSProjectEmail = buildAtasanSpecialProjectEmailContent({
            action: 'GO',
            nomorRequest: current.RequestNo,
            perihal: current.Subject || current.ItemTitle || '-',
            seksiPemohon: current.RequesterSection,
            picPemohon: current.RequesterName,
            waktuEstimate,
            orangJamEstimate,
            kebutuhanSparepart,
            kebutuhanMaterial,
            biayaEstimate,
            detailLink: `${origin}/request`,
          });
        }
      }

      if (body.flowStep) {
        nextFlowStep = sanitizeText(body.flowStep, 50);
      }

      let finalNomorSurat = current.NomorSurat || null;
      if (body.nomorSurat && typeof body.nomorSurat === 'string' && body.nomorSurat.trim().length > 0) {
        finalNomorSurat = sanitizeText(body.nomorSurat, 100);
      } else if (
        (body.assignAtasanSpecialProject || action === 'ASSIGN_ATASAN_SPROJECT') &&
        (!finalNomorSurat || finalNomorSurat.startsWith('REQ-'))
      ) {
        finalNomorSurat = await generateNextNomorSurat(current.RequesterSection, new Date());
      }

      const prevTtdWorkshop = current.WorkshopSignature || null;
      const prevTtdSpecialProject = current.SpecialProjectSignature || null;

      const [updated] = await sql<Array<{ RequestNo: string; NomorSurat: string | null }>>`
        UPDATE "TWMSSectionRequest"
        SET
          "WorkflowStatus" = ${nextStatus},
          "FlowStep" = ${nextFlowStep},
          "NomorSurat" = ${finalNomorSurat},
          "WorkshopSignature" = ${ttdAdminWorkshop !== undefined ? (ttdAdminWorkshop || null) : prevTtdWorkshop},
          "SpecialProjectSignature" = ${ttdAtasanSpecialProject !== undefined ? (ttdAtasanSpecialProject || null) : prevTtdSpecialProject},
          "PendingReason" = ${alasanTolak !== undefined ? (alasanTolak || null) : null},
          "UpdateBy" = ${picBengkel !== undefined ? (picBengkel || null) : null},
          "EstDuration" = ${waktuEstimate !== undefined ? (waktuEstimate || null) : (estimasi !== undefined ? (estimasi || null) : null)},
          "ExecutionNote" = ${catatanAdmin !== undefined ? (catatanAdmin || null) : null},
          "EstCost" = ${biayaEstimate !== undefined ? (biayaEstimate || null) : null},
          "ActCost" = ${biayaActual !== undefined ? (biayaActual || null) : null},
          "EstManHour" = ${orangJamEstimate !== undefined ? (orangJamEstimate || null) : null},
          "ActManHour" = ${orangJamActual !== undefined ? (orangJamActual || null) : null},
          "ActDuration" = ${waktuActual !== undefined ? (waktuActual || null) : null},
          "EstExecDate" = ${tglPelaksanaanEstimate !== undefined ? (tglPelaksanaanEstimate || null) : null},
          "ActExecDate" = ${tglPelaksanaanActual !== undefined ? (tglPelaksanaanActual || null) : null},
          "EstComment" = ${komentarEstimate !== undefined ? (komentarEstimate || null) : null},
          "ActComment" = ${komentarActual !== undefined ? (komentarActual || null) : null},
          "Decision" = ${keputusan !== undefined ? (keputusan || null) : null},
          "Decision8210" = ${keputusan8210 !== undefined ? (keputusan8210 || null) : null},
          "Decision820" = ${keputusan820 !== undefined ? (keputusan820 || null) : null},
          "CheckResult" = ${hasilCheck !== undefined ? (hasilCheck || null) : null},
          "CheckResultRequester" = ${hasilCheckPemohon !== undefined ? (hasilCheckPemohon || null) : null},
          "SchedulePlan" = ${schedulePlanning !== undefined ? (schedulePlanning || null) : null},
          "ScheduleActual" = ${scheduleActual !== undefined ? (scheduleActual || null) : null},
          "FinishDate" = ${nextStatus === 'Selesai' ? (current.FinishDate || new Date()) : current.FinishDate},
          "UpdateDate" = NOW()
        WHERE "Id" = ${id}
        RETURNING "RequestNo", "NomorSurat"
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_EVALUASI_WORKSHOP',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: updated.RequestNo,
        details: `Keputusan: ${keputusan || '-'}, FlowStep: ${nextFlowStep}`,
      });

      if (atasanSProjectEmail) {
        sendEmailAsync({
          to: DEFAULT_ATASAN_SPROJECT_EMAIL,
          subject: atasanSProjectEmail.subject,
          bodyText: atasanSProjectEmail.bodyText,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Evaluasi request ${updated.RequestNo} berhasil disimpan.`,
        request: updated,
        atasanSProjectEmail,
      });
    }

    // 3. FINISH_REQUEST: Selesaikan pengerjaan dan serah terima
    if (action === 'FINISH_REQUEST') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya PIC Workshop yang dapat menyelesaikan request.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const hasilCheck = sanitizeText(body.hasilCheck, 2000);
      const hasilCheckPemohon = sanitizeText(body.hasilCheckPemohon, 100);

      const [current] = await sql<Array<{ Id: number; RequestNo: string; SpecialProjectSignature: string | null }>>`
        SELECT "Id", "RequestNo", "SpecialProjectSignature" FROM "TWMSSectionRequest" WHERE "Id" = ${id} LIMIT 1
      `;
      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      if (!current.SpecialProjectSignature) {
        return NextResponse.json(
          { error: 'Pekerjaan belum dapat diselesaikan karena permohonan ini belum disetujui / di-assign oleh Atasan Special Project.' },
          { status: 400 }
        );
      }

      const [updated] = await sql<Array<{ Id: number; RequestNo: string }>>`
        UPDATE "TWMSSectionRequest"
        SET
          "WorkflowStatus" = 'Selesai',
          "FlowStep" = 'STEP_8_SELESAI',
          "CheckResult" = ${hasilCheck || null},
          "CheckResultRequester" = ${hasilCheckPemohon || null},
          "FinishDate" = NOW(),
          "UpdateDate" = NOW()
        WHERE "Id" = ${id}
        RETURNING "Id", "RequestNo"
      `;

      return NextResponse.json({
        success: true,
        message: `Pekerjaan selesai dan informasi telah dikirimkan ke Seksi Pemohon.`,
        request: updated,
      });
    }

    // 4. ADD_MATERIAL: Tambah pemakaian sparepart atau material
    if (action === 'ADD_MATERIAL') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat menambah pemakaian sparepart/material.' }, { status: 403 });
      }

      const sectionRequestId = validatePositiveInt(body.sectionRequestId, 'ID Request', 1).value;
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      const tipe = body.tipe === 'MATERIAL' ? 'MATERIAL' : 'SPAREPART';
      const qtyValidation = validatePositiveQuantity(body.qty, 'Jumlah pemakaian', 0.001, 1000000);
      if (!qtyValidation.valid) {
        return NextResponse.json({ error: qtyValidation.error || 'Jumlah pemakaian tidak valid.' }, { status: 400 });
      }
      const qty = qtyValidation.value;
      const satuan = sanitizeText(body.satuan, 30) || (tipe === 'MATERIAL' ? 'cm²' : 'Pcs');
      const dimensi = sanitizeText(body.dimensi, 100);
      const keterangan = sanitizeText(body.keterangan, 255);
      const potongStok = Boolean(body.potongStok);
      const qtyPotongStok = body.qtyPotongStok ? validatePositiveInt(body.qtyPotongStok, 'Jumlah potong stok', 1, 10000).value : 0;

      if (!body.sectionRequestId || !namaKomponen) {
        return NextResponse.json({ error: 'ID request dan nama komponen/material wajib diisi.' }, { status: 400 });
      }

      const [sparepart] = await sql<Array<{ Id: number; PartName: string; CurrentStock: number; Unit: string }>>`
        SELECT "Id", "PartName", "CurrentStock", "Unit" FROM "TWMSSparepartMaster" 
        WHERE UPPER(TRIM("PartName")) = UPPER(TRIM(${namaKomponen})) LIMIT 1
      `;

      let shouldDeductStock = false;
      let deductQty = 0;

      if (tipe === 'SPAREPART') {
        if (sparepart) {
          deductQty = Math.round(qty);
          if (sparepart.CurrentStock < deductQty) {
            return NextResponse.json(
              { error: `Stok gudang "${namaKomponen}" tidak mencukupi (sisa: ${sparepart.CurrentStock} ${sparepart.Unit}).` },
              { status: 400 }
            );
          }
          shouldDeductStock = true;
        }
      } else {
        if (sparepart && potongStok && qtyPotongStok > 0) {
          if (sparepart.CurrentStock < qtyPotongStok) {
            return NextResponse.json(
              { error: `Stok gudang "${namaKomponen}" tidak mencukupi untuk dipotong ${qtyPotongStok} ${sparepart.Unit} (sisa: ${sparepart.CurrentStock}).` },
              { status: 400 }
            );
          }
          shouldDeductStock = true;
          deductQty = qtyPotongStok;
        }
      }

      const [reqData] = await sql<Array<{ RequestNo: string; ItemTitle: string }>>`
        SELECT "RequestNo", "ItemTitle" FROM "TWMSSectionRequest" WHERE "Id" = ${sectionRequestId} LIMIT 1
      `;

      await withTransaction(async (tx) => {
        await tx`
          INSERT INTO "TWMSSectionRequestMaterial" (
            "RequestId", "SparepartId", "MaterialName", "MaterialType",
            "MaterialSpec", "QtyUsed", "Unit", "DeductStock", "QtyDeducted", "Remark"
          ) VALUES (
            ${sectionRequestId},
            ${sparepart?.Id || null},
            ${namaKomponen},
            ${tipe},
            ${dimensi || null},
            ${qty},
            ${satuan},
            ${shouldDeductStock},
            ${shouldDeductStock ? deductQty : 0},
            ${keterangan || null}
          )
        `;

        await tx`UPDATE "TWMSSectionRequest" SET "UpdateDate" = NOW() WHERE "Id" = ${sectionRequestId}`;

        if (shouldDeductStock && deductQty > 0 && sparepart) {
          await tx`
            UPDATE "TWMSSparepartMaster"
            SET "CurrentStock" = "CurrentStock" - ${deductQty}, "UpdateDate" = NOW()
            WHERE "Id" = ${sparepart.Id}
          `;
          await tx`
            INSERT INTO "TWMSSparepartLog" ("SparepartId", "PartName", "MovementType", "Qty", "Notes", "MovementDate")
            VALUES (
              ${sparepart.Id},
              ${sparepart.PartName},
              'OUT',
              ${deductQty},
              ${`Pemakaian ${tipe.toLowerCase()} untuk request seksi: ${reqData?.ItemTitle || '-'} (${qty} ${satuan}${dimensi ? ` • ${dimensi}` : ''})`},
              NOW()
            )
          `;
        }
      });

      // Ambil rincian material terupdate
      const updatedMaterialsRaw = await sql`
        SELECT 
          m."Id" AS id,
          m."RequestId" AS "sectionRequestId",
          m."MaterialName" AS "namaKomponen",
          m."MaterialType" AS tipe,
          m."QtyUsed" AS qty,
          m."Unit" AS satuan,
          m."MaterialSpec" AS dimensi,
          m."DeductStock" AS "potongStok",
          m."QtyDeducted" AS "qtyPotongStok",
          m."Remark" AS keterangan
        FROM "TWMSSectionRequestMaterial" m
        WHERE m."RequestId" = ${sectionRequestId}
        ORDER BY m."Id" ASC
      `;

      return NextResponse.json({
        success: true,
        message: `${tipe === 'MATERIAL' ? 'Material' : 'Sparepart'} ${namaKomponen} (${qty} ${satuan}) berhasil dicatat.${shouldDeductStock ? ` Stok gudang dipotong ${deductQty} ${sparepart?.Unit || 'unit'}.` : ''}`,
        materials: updatedMaterialsRaw,
      });
    }

    // 5. REMOVE_MATERIAL: Batalkan pemakaian sparepart/material
    if (action === 'REMOVE_MATERIAL') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat membatalkan sparepart/material.' }, { status: 403 });
      }

      const sectionRequestId = validatePositiveInt(body.sectionRequestId, 'ID Request', 1).value;
      const materialId = body.materialId ? Number(body.materialId) : null;
      const namaKomponen = body.namaKomponen ? sanitizeText(body.namaKomponen, 100) : null;

      const [target] = await sql<Array<{
        Id: number;
        MaterialName: string;
        DeductStock: boolean;
        QtyDeducted: number;
        SparepartId: number | null;
      }>>`
        SELECT "Id", "MaterialName", "DeductStock", "QtyDeducted", "SparepartId"
        FROM "TWMSSectionRequestMaterial"
        WHERE "RequestId" = ${sectionRequestId}
          AND (${materialId}::int IS NULL OR "Id" = ${materialId})
          AND (${namaKomponen}::text IS NULL OR UPPER(TRIM("MaterialName")) = UPPER(TRIM(${namaKomponen})))
        LIMIT 1
      `;

      if (!target) {
        return NextResponse.json({ error: 'Data item tidak ditemukan pada request ini.' }, { status: 404 });
      }

      await withTransaction(async (tx) => {
        await tx`DELETE FROM "TWMSSectionRequestMaterial" WHERE "Id" = ${target.Id}`;
        await tx`UPDATE "TWMSSectionRequest" SET "UpdateDate" = NOW() WHERE "Id" = ${sectionRequestId}`;

        if (target.DeductStock && target.QtyDeducted > 0 && target.SparepartId) {
          await tx`
            UPDATE "TWMSSparepartMaster"
            SET "CurrentStock" = "CurrentStock" + ${target.QtyDeducted}, "UpdateDate" = NOW()
            WHERE "Id" = ${target.SparepartId}
          `;
          await tx`
            INSERT INTO "TWMSSparepartLog" ("SparepartId", "PartName", "MovementType", "Qty", "Notes", "MovementDate")
            VALUES (
              ${target.SparepartId},
              ${target.MaterialName},
              'IN',
              ${target.QtyDeducted},
              ${'Pembatalan pemakaian request seksi (stok dikembalikan ke gudang)'},
              NOW()
            )
          `;
        }
      });

      const updatedMaterialsRaw = await sql`
        SELECT 
          m."Id" AS id,
          m."RequestId" AS "sectionRequestId",
          m."MaterialName" AS "namaKomponen",
          m."MaterialType" AS tipe,
          m."QtyUsed" AS qty,
          m."Unit" AS satuan,
          m."MaterialSpec" AS dimensi,
          m."DeductStock" AS "potongStok",
          m."QtyDeducted" AS "qtyPotongStok",
          m."Remark" AS keterangan
        FROM "TWMSSectionRequestMaterial" m
        WHERE m."RequestId" = ${sectionRequestId}
        ORDER BY m."Id" ASC
      `;

      return NextResponse.json({
        success: true,
        message: `Pemakaian ${target.MaterialName} berhasil dibatalkan${target.DeductStock ? ' dan stok gudang dikembalikan' : ''}.`,
        materials: updatedMaterialsRaw,
      });
    }

    // 6. SET_PENDING_MATERIAL: Tunda pengerjaan karena sparepart habis
    if (action === 'SET_PENDING_MATERIAL') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat mengubah status pending.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const alasan = sanitizeText(body.alasan || 'Menunggu ketersediaan sparepart / material di gudang', 500);

      const [current] = await sql<Array<{ SpecialProjectSignature: string | null }>>`
        SELECT "SpecialProjectSignature" FROM "TWMSSectionRequest" WHERE "Id" = ${id} LIMIT 1
      `;
      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      if (!current.SpecialProjectSignature) {
        return NextResponse.json(
          { error: 'Pengerjaan belum aktif karena belum disetujui / di-assign oleh Atasan Special Project.' },
          { status: 400 }
        );
      }

      const [updated] = await sql<Array<{ RequestNo: string }>>`
        UPDATE "TWMSSectionRequest"
        SET
          "WorkflowStatus" = 'Pending: Material Habis',
          "PendingReason" = ${alasan},
          "UpdateDate" = NOW()
        WHERE "Id" = ${id}
        RETURNING "RequestNo"
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_PENDING_MATERIAL',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: updated?.RequestNo,
        details: `Status diubah ke Pending Material: ${alasan}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Status pengerjaan berhasil diubah menjadi Pending Material.',
        request: updated,
      });
    }

    // 7. RESUME_PROGRESS: Lanjutkan pengerjaan setelah material tersedia
    if (action === 'RESUME_PROGRESS') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat melanjutkan proses.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;

      const [current] = await sql<Array<{ SpecialProjectSignature: string | null }>>`
        SELECT "SpecialProjectSignature" FROM "TWMSSectionRequest" WHERE "Id" = ${id} LIMIT 1
      `;
      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      if (!current.SpecialProjectSignature) {
        return NextResponse.json(
          { error: 'Pengerjaan belum aktif karena belum disetujui / di-assign oleh Atasan Special Project.' },
          { status: 400 }
        );
      }

      const [updated] = await sql<Array<{ RequestNo: string }>>`
        UPDATE "TWMSSectionRequest"
        SET
          "WorkflowStatus" = 'Dikerjakan',
          "PendingReason" = null,
          "UpdateDate" = NOW()
        WHERE "Id" = ${id}
        RETURNING "RequestNo"
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_RESUME_PROGRESS',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: updated.RequestNo,
        details: 'Status pengerjaan dilanjutkan (Dikerjakan)',
      });

      return NextResponse.json({
        success: true,
        message: 'Status pengerjaan berhasil dilanjutkan (Dikerjakan).',
        request: updated,
      });
    }

    // 8. DELETE: Hapus request via POST action
    if (action === 'DELETE') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat menghapus request.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;

      const [current] = await sql<Array<{ Id: number; RequestNo: string }>>`
        SELECT "Id", "RequestNo" FROM "TWMSSectionRequest" WHERE "Id" = ${id} LIMIT 1
      `;

      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      await withTransaction(async (tx) => {
        await tx`DELETE FROM "TWMSSectionRequestMaterial" WHERE "RequestId" = ${id}`;
        await tx`DELETE FROM "TWMSSectionRequest" WHERE "Id" = ${id}`;
      });

      recordAuditLog({
        action: 'SECTION_REQUEST_DELETE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: current.RequestNo,
        details: `Request ${current.RequestNo} berhasil dihapus oleh ${auth.user?.username}`,
      });

      return NextResponse.json({ success: true, message: `Request ${current.RequestNo} berhasil dihapus.` });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// DELETE: Handler resmi HTTP DELETE /api/section-requests?id=123
export async function DELETE(request: Request) {
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const idRaw = searchParams.get('id');
  let id: number | null = null;

  if (idRaw) {
    const val = validatePositiveInt(idRaw, 'ID Request', 1);
    if (val.error) return NextResponse.json({ error: val.error }, { status: 400 });
    id = val.value;
  } else {
    try {
      const body = await request.json();
      if (body.id) {
        const val = validatePositiveInt(body.id, 'ID Request', 1);
        if (val.error) return NextResponse.json({ error: val.error }, { status: 400 });
        id = val.value;
      }
    } catch {}
  }

  if (!id) {
    return NextResponse.json({ error: 'Parameter id wajib disertakan.' }, { status: 400 });
  }

  try {
    const [current] = await sql<Array<{ Id: number; RequestNo: string }>>`
      SELECT "Id", "RequestNo" FROM "TWMSSectionRequest" WHERE "Id" = ${id} LIMIT 1
    `;

    if (!current) {
      return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
    }

    await withTransaction(async (tx) => {
      await tx`DELETE FROM "TWMSSectionRequestMaterial" WHERE "RequestId" = ${id}`;
      await tx`DELETE FROM "TWMSSectionRequest" WHERE "Id" = ${id}`;
    });

    recordAuditLog({
      action: 'SECTION_REQUEST_DELETE',
      ip: auth.ip,
      user: auth.user?.username,
      role: auth.user?.role,
      status: 'SUCCESS',
      targetId: current.RequestNo,
      details: `Request ${current.RequestNo} berhasil dihapus oleh ${auth.user?.username}`,
    });

    return NextResponse.json({
      success: true,
      message: `Request ${current.RequestNo} berhasil dihapus.`,
    });
  } catch (error) {
    console.error('DELETE /api/section-requests error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat menghapus request.' }, { status: 500 });
  }
}
