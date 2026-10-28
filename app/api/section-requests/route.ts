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
  biayaEstimate?: number | null;
  biayaActual?: number | null;
  orangJamEstimate?: number | null;
  orangJamActual?: number | null;
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
export function normalizeMaterials(raw: unknown): Array<{
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
      } catch {
        // ignore
      }
    } else if (typeof item === 'object') {
      result.push(item);
    }
  }
  return result
    .filter((m) => m && (m.namaKomponen || m.id))
    .map((m) => {
      const nama = String(m.namaKomponen || '');
      const lower = nama.toLowerCase();
      const isMat =
        m.tipe === 'MATERIAL' ||
        lower.includes('plat') ||
        lower.includes('cat') ||
        lower.includes('las') ||
        lower.includes('pipa') ||
        lower.includes('hollow') ||
        lower.includes('siku') ||
        m.satuan === 'cm²' ||
        m.satuan === 'm²';

      return {
        id: Number(m.id) || Date.now(),
        sectionRequestId: m.sectionRequestId ? Number(m.sectionRequestId) : undefined,
        namaKomponen: nama,
        tipe: (m.tipe || (isMat ? 'MATERIAL' : 'SPAREPART')) as 'SPAREPART' | 'MATERIAL',
        qty: Number(m.qty) || 1,
        satuan: String(m.satuan || (isMat ? 'cm²' : 'Pcs')),
        dimensi: m.dimensi ? String(m.dimensi) : undefined,
        potongStok: Boolean(m.potongStok),
        qtyPotongStok: m.qtyPotongStok !== undefined ? Number(m.qtyPotongStok) : undefined,
        keterangan: m.keterangan ? String(m.keterangan) : null,
      };
    });
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
  // Verifikasi otorisasi sesi
  const auth = await requireAuth(request, ['ADMIN', 'USER_SEKSI', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  // Pembatasan laju permintaan (rate limiting 60 req/menit)
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

    // ISOLASI DATA PENGGUNA: User Seksi HANYA dapat melihat request milik seksinya sendiri
    const userSeksi = auth.user?.role === 'USER_SEKSI' ? (auth.user.seksi || null) : null;
    const filterByUser = auth.user?.role === 'USER_SEKSI' ? auth.user.username : null;
    const filterStatus = status && status !== 'all' ? sanitizeText(status, 50) : null;
    const filterSeksi = seksi && seksi !== 'all' ? sanitizeText(seksi, 50) : null;
    const filterId = idParam ? parseInt(idParam, 10) : null;

    const requests = await sql`
      SELECT 
        sr.id,
        sr."nomorRequest",
        sr."nomorSurat",
        sr."seksiPemohon",
        sr."picPemohon",
        sr."kontakPemohon",
        sr."namaBarang",
        sr."spesifikasi",
        sr.jumlah,
        sr.satuan,
        sr.urgensi,
        sr.catatan,
        sr.status,
        sr."alasanTolak",
        sr."picBengkel",
        sr.estimasi,
        sr."catatanAdmin",
        sr."dibuatOleh",
        sr."waktuDibuat",
        sr."waktuUpdate",
        sr."waktuSelesai",
        sr.perihal,
        sr."namaMachine",
        sr.tujuan,
        sr.alasan,
        sr."kodeSeksi",
        sr.drafter,
        sr.foreman,
        sr."keadaanSekarang",
        ${includeImage ? sql`sr."fotoSebelum"` : sql`NULL as "fotoSebelum"`},
        CASE WHEN sr."fotoSebelum" IS NOT NULL AND length(sr."fotoSebelum") > 0 THEN TRUE ELSE FALSE END as "hasFotoSebelum",
        sr."rencanaTindakan",
        ${includeImage ? sql`sr."fotoSesudah"` : sql`NULL as "fotoSesudah"`},
        CASE WHEN sr."fotoSesudah" IS NOT NULL AND length(sr."fotoSesudah") > 0 THEN TRUE ELSE FALSE END as "hasFotoSesudah",
        sr."targetHasil",
        sr."penjelasanPelaksanaan",
        sr."biayaEstimate",
        sr."biayaActual",
        sr."orangJamEstimate",
        sr."orangJamActual",
        sr."waktuEstimate",
        sr."waktuActual",
        sr."tglPelaksanaanEstimate",
        sr."tglPelaksanaanActual",
        sr."komentarEstimate",
        sr."komentarActual",
        sr.keputusan,
        sr."keputusan8210",
        sr."keputusan820",
        sr."hasilCheck",
        sr."hasilCheckPemohon",
        sr."schedulePlanning",
        sr."scheduleActual",
        sr."emailAtasanSeksi",
        sr."namaAtasanSeksi",
        sr."statusApprovalAtasanSeksi",
        sr."waktuApprovalAtasanSeksi",
        sr."catatanAtasanSeksi",
        sr."approvalToken",
        sr."emailMentorWorkshop",
        sr."statusApprovalAtasanSpecialProject",
        sr."waktuApprovalAtasanSpecialProject",
        sr."kebutuhanSparepart",
        sr."kebutuhanMaterial",
        sr."flowStep",
        sr."alasanPending",
        COALESCE(sr."materials", '[]'::jsonb) as materials
      FROM "SectionRequest" sr
      WHERE (${filterByUser}::text IS NULL OR sr."dibuatOleh" = ${filterByUser} OR (${userSeksi}::text IS NOT NULL AND LOWER(sr."seksiPemohon") = LOWER(${userSeksi})))
        AND (${filterStatus}::text IS NULL OR sr.status = ${filterStatus})
        AND (${filterSeksi}::text IS NULL OR LOWER(sr."seksiPemohon") = LOWER(${filterSeksi}))
        AND (${filterId}::int IS NULL OR sr.id = ${filterId})
      ORDER BY sr."waktuDibuat" DESC
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
  // Verifikasi otorisasi sesi
  const auth = await requireAuth(request, ['ADMIN', 'USER_SEKSI', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  // Validasi ukuran payload maksimum 10MB
  const sizeCheck = validatePayloadSize(request, 10 * 1024 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // Pembatasan laju permintaan (rate limiting 30 mutasi/menit)
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
      const tujuan = sanitizeText(body.tujuan, 100) || 'Safety';
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

      // Data Atasan & Mentor
      const emailAtasanSeksi = sanitizeText(body.emailAtasanSeksi, 255);
      const namaAtasanSeksi = sanitizeText(body.namaAtasanSeksi || body.foreman, 100);
      const emailMentorWorkshop = sanitizeText(body.emailMentorWorkshop, 255) || 'mentor.workshop@bridgestone.com';

      if (!seksiPemohon || (!perihal && !namaBarang)) {
        return NextResponse.json(
          { error: 'Field wajib (seksi pemohon dan perihal) tidak boleh kosong.' },
          { status: 400 }
        );
      }

      // Gunakan nomor request custom jika ada atau generate otomatis
      let nomorRequest = sanitizeText(body.nomorRequest, 50);
      if (!nomorRequest) {
        nomorRequest = await generateRequestNumber();
      } else {
        const [existing] = await sql<Array<{ id: number }>>`
          SELECT id FROM "SectionRequest" WHERE "nomorRequest" = ${nomorRequest} LIMIT 1
        `;
        if (existing) {
          nomorRequest = await generateRequestNumber();
        }
      }

      // Buat token persetujuan aman untuk email atasan seksi
      const approvalToken = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);

      const [created] = await sql<Array<{ id: number; nomorRequest: string }>>`
        INSERT INTO "SectionRequest" (
          "nomorRequest", "seksiPemohon", "picPemohon", "kontakPemohon",
          "namaBarang", spesifikasi, jumlah, satuan, urgensi, catatan,
          perihal, "namaMachine", tujuan, alasan, "kodeSeksi",
          drafter, foreman, "keadaanSekarang", "fotoSebelum",
          "rencanaTindakan", "fotoSesudah", "targetHasil", "penjelasanPelaksanaan",
          "emailAtasanSeksi", "namaAtasanSeksi", "emailMentorWorkshop",
          "approvalToken", "statusApprovalAtasanSeksi", "flowStep",
          status, "nomorSurat", "dibuatOleh", "waktuDibuat", "waktuUpdate"
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
          'Menunggu Assign Atasan Seksi',
          ${body.nomorSurat ? sanitizeText(body.nomorSurat, 100) : null},
          ${auth.user!.username},
          NOW(),
          NOW()
        )
        RETURNING id, "nomorRequest", "nomorSurat"
      `;

      // Buat notifikasi in-app
      await createInAppNotification({
        requestId: created.id,
        nomorRequest: created.nomorRequest,
        targetRole: 'ATASAN_SEKSI',
        targetEmail: emailAtasanSeksi || undefined,
        tipe: 'APPROVAL_ATASAN_SEKSI',
        judul: `Permohonan Baru: ${nomorRequest}`,
        pesan: `PIC ${picPemohon} (${seksiPemohon}) mengajukan permohonan "${perihal}". Mohon persetujuan dan tanda tangan atasan.`,
        link: `/request/approval?token=${approvalToken}`,
      });

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

      // 4 Aspek Evaluasi Sesuai Flowchart
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

      const [current] = await sql<SectionRequestRow[]>`
        SELECT * FROM "SectionRequest" WHERE id = ${id} LIMIT 1
      `;

      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      // Tentukan step flowchart berikutnya
      let nextFlowStep = current.flowStep;
      let nextStatus = newStatus || current.status;

      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      let atasanSProjectEmail = null;

      if (keputusan === 'REJECT') {
        nextFlowStep = 'STEP_5_DITOLAK';
        nextStatus = 'Ditolak';

        // 1. Notif ke Seksi Pemohon
        await createInAppNotification({
          requestId: current.id,
          nomorRequest: current.nomorRequest,
          targetRole: 'USER_SEKSI',
          targetUser: current.picPemohon,
          tipe: 'INFO_TOLAK_SEKSI',
          judul: `Request ${current.nomorRequest} Ditolak Workshop`,
          pesan: `Permohonan ditolak oleh PIC Workshop. Alasan: ${alasanTolak || komentarActual || 'Tidak memenuhi kriteria workshop'}`,
          link: `/request`,
        });

        // 2. TETAP kirimkan notifikasi ke Atasan Special Project (via email & sistem)
        await createInAppNotification({
          requestId: current.id,
          nomorRequest: current.nomorRequest,
          targetRole: 'ADMIN',
          targetEmail: DEFAULT_ATASAN_SPROJECT_EMAIL,
          tipe: 'INFO_TOLAK_SEKSI',
          judul: `[Info Penolakan] Request ${current.nomorRequest} Ditolak Workshop`,
          pesan: `Permohonan dari Seksi ${current.seksiPemohon} (${current.perihal || current.namaBarang}) tidak disanggupi/ditolak oleh PIC Workshop. Alasan: ${alasanTolak || 'Keterbatasan sumber daya bengkel'}.`,
          link: `/request`,
        });

        atasanSProjectEmail = buildAtasanSpecialProjectEmailContent({
          action: 'REJECT',
          nomorRequest: current.nomorRequest,
          perihal: current.perihal || current.namaBarang || '-',
          seksiPemohon: current.seksiPemohon,
          picPemohon: current.picPemohon,
          alasanTolak: alasanTolak || komentarActual || 'Tidak memenuhi kriteria workshop',
          detailLink: `${origin}/request`,
        });
      } else if (keputusan === 'GO') {
        if (body.assignAtasanSpecialProject || action === 'ASSIGN_ATASAN_SPROJECT') {
          nextFlowStep = 'STEP_6_DALAM_PENGERJAAN';
          nextStatus = 'Disetujui';

          // Setelah Atasan Special Project approve: notif CUKUP via web apps saja yang muncul ke Admin
          await createInAppNotification({
            requestId: current.id,
            nomorRequest: current.nomorRequest,
            targetRole: 'ADMIN',
            tipe: 'ASSIGN_ATASAN_SPROJECT',
            judul: `Request ${current.nomorRequest} Disetujui Atasan S.Project`,
            pesan: `Atasan Special Project (8210 / 820) telah menyetujui request ${current.nomorRequest}. Pengerjaan siap dimulai oleh operator bengkel.`,
            link: `/request`,
          });
        } else {
          nextFlowStep = 'STEP_5_MENUNGGU_ATASAN_SPROJECT';
          nextStatus = 'Menunggu Assign S.Project';

          // PIC Workshop menyanggupi -> Otomatis kirimkan notif ke Atasan Special Project
          await createInAppNotification({
            requestId: current.id,
            nomorRequest: current.nomorRequest,
            targetRole: 'ADMIN',
            targetEmail: DEFAULT_ATASAN_SPROJECT_EMAIL,
            tipe: 'ASSIGN_ATASAN_SPROJECT',
            judul: `[Perlu Assign] Request ${current.nomorRequest} Disanggupi Workshop`,
            pesan: `PIC Workshop telah mengevaluasi dan menyanggupi permohonan dari Seksi ${current.seksiPemohon}. Menunggu persetujuan & assign Atasan Special Project.`,
            link: `/request`,
          });

          atasanSProjectEmail = buildAtasanSpecialProjectEmailContent({
            action: 'GO',
            nomorRequest: current.nomorRequest,
            perihal: current.perihal || current.namaBarang || '-',
            seksiPemohon: current.seksiPemohon,
            picPemohon: current.picPemohon,
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

      // Generate nomor surat resmi jika disetujui (Opsi A: 1 urutan global per tahun) dan belum punya nomor surat
      let finalNomorSurat = current.nomorSurat || null;
      if (body.nomorSurat && typeof body.nomorSurat === 'string' && body.nomorSurat.trim().length > 0) {
        finalNomorSurat = sanitizeText(body.nomorSurat, 100);
      } else if (
        !finalNomorSurat &&
        (keputusan === 'GO' ||
          body.assignAtasanSpecialProject ||
          action === 'ASSIGN_ATASAN_SPROJECT' ||
          nextStatus === 'Disetujui' ||
          nextStatus === 'Dikerjakan')
      ) {
        finalNomorSurat = await generateNextNomorSurat(current.seksiPemohon, new Date());
      }

      const [updated] = await sql<SectionRequestRow[]>`
        UPDATE "SectionRequest"
        SET
          status = ${nextStatus},
          "flowStep" = ${nextFlowStep},
          "nomorSurat" = ${finalNomorSurat},
          "alasanTolak" = ${alasanTolak !== undefined ? (alasanTolak || null) : (current.alasanTolak ?? null)},
          "picBengkel" = ${picBengkel !== undefined ? (picBengkel || null) : (current.picBengkel ?? null)},
          "estimasi" = ${estimasi !== undefined ? (estimasi || null) : (current.estimasi ?? null)},
          "catatanAdmin" = ${catatanAdmin !== undefined ? (catatanAdmin || null) : (current.catatanAdmin ?? null)},
          "biayaEstimate" = ${biayaEstimate !== undefined ? (biayaEstimate || null) : (current.biayaEstimate ?? null)},
          "biayaActual" = ${biayaActual !== undefined ? (biayaActual || null) : (current.biayaActual ?? null)},
          "orangJamEstimate" = ${orangJamEstimate !== undefined ? (orangJamEstimate || null) : (current.orangJamEstimate ?? null)},
          "orangJamActual" = ${orangJamActual !== undefined ? (orangJamActual || null) : (current.orangJamActual ?? null)},
          "waktuEstimate" = ${waktuEstimate !== undefined ? (waktuEstimate || null) : (current.waktuEstimate ?? null)},
          "waktuActual" = ${waktuActual !== undefined ? (waktuActual || null) : (current.waktuActual ?? null)},
          "kebutuhanSparepart" = ${kebutuhanSparepart !== undefined ? (kebutuhanSparepart || null) : (current.kebutuhanSparepart ?? null)},
          "kebutuhanMaterial" = ${kebutuhanMaterial !== undefined ? (kebutuhanMaterial || null) : (current.kebutuhanMaterial ?? null)},
          "tglPelaksanaanEstimate" = ${tglPelaksanaanEstimate !== undefined ? (tglPelaksanaanEstimate || null) : (current.tglPelaksanaanEstimate ?? null)},
          "tglPelaksanaanActual" = ${tglPelaksanaanActual !== undefined ? (tglPelaksanaanActual || null) : (current.tglPelaksanaanActual ?? null)},
          "komentarEstimate" = ${komentarEstimate !== undefined ? (komentarEstimate || null) : (current.komentarEstimate ?? null)},
          "komentarActual" = ${komentarActual !== undefined ? (komentarActual || null) : (current.komentarActual ?? null)},
          keputusan = ${keputusan !== undefined ? (keputusan || null) : (current.keputusan ?? null)},
          "keputusan8210" = ${keputusan8210 !== undefined ? (keputusan8210 || null) : (current.keputusan8210 ?? null)},
          "keputusan820" = ${keputusan820 !== undefined ? (keputusan820 || null) : (current.keputusan820 ?? null)},
          "hasilCheck" = ${hasilCheck !== undefined ? (hasilCheck || null) : (current.hasilCheck ?? null)},
          "hasilCheckPemohon" = ${hasilCheckPemohon !== undefined ? (hasilCheckPemohon || null) : (current.hasilCheckPemohon ?? null)},
          "schedulePlanning" = ${schedulePlanning !== undefined ? (schedulePlanning || null) : (current.schedulePlanning ?? null)},
          "scheduleActual" = ${scheduleActual !== undefined ? (scheduleActual || null) : (current.scheduleActual ?? null)},
          "waktuSelesai" = ${nextStatus === 'Selesai' ? (current.waktuSelesai || new Date()) : (current.waktuSelesai ?? null)},
          "waktuUpdate" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_EVALUASI_WORKSHOP',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: updated.nomorRequest,
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
        message: `Evaluasi request ${updated.nomorRequest} berhasil disimpan.`,
        request: updated,
        atasanSProjectEmail,
      });
    }

    // 3. FINISH_REQUEST: Selesaikan pengerjaan dan kirim notifikasi serah terima
    if (action === 'FINISH_REQUEST') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya PIC Workshop yang dapat menyelesaikan request.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const hasilCheck = sanitizeText(body.hasilCheck, 2000);
      const hasilCheckPemohon = sanitizeText(body.hasilCheckPemohon, 100);

      const [updated] = await withTransaction(async (tx) => {
        const [upd] = await tx<SectionRequestRow[]>`
          UPDATE "SectionRequest"
          SET
            status = 'Selesai',
            "flowStep" = 'STEP_8_SELESAI',
            "hasilCheck" = ${hasilCheck || null},
            "hasilCheckPemohon" = ${hasilCheckPemohon || null},
            "waktuSelesai" = NOW(),
            "waktuUpdate" = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

        // Informasikan ke seksi terkait
        await createInAppNotification({
          requestId: upd.id,
          nomorRequest: upd.nomorRequest,
          targetRole: 'USER_SEKSI',
          targetUser: upd.picPemohon,
          tipe: 'INFO_SELESAI_SEKSI',
          judul: `Pekerjaan Selesai: ${upd.nomorRequest}`,
          pesan: `Pekerjaan "${upd.perihal || upd.namaBarang}" telah selesai dikerjakan oleh bengkel. Silakan cek dan lakukan serah terima barang.`,
          link: `/request`,
        }, tx);

        return [upd];
      });

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

      // Cek apakah item ada di database Sparepart
      const [sparepart] = await sql<Array<{ namaKomponen: string; stokGudang: number; satuan: string }>>`
        SELECT "namaKomponen", "stokGudang", "satuan" FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen} LIMIT 1
      `;

      let shouldDeductStock = false;
      let deductQty = 0;

      if (tipe === 'SPAREPART') {
        // Untuk Sparepart: jika ada di gudang, potong stok fisik
        if (sparepart) {
          deductQty = Math.round(qty);
          if (sparepart.stokGudang < deductQty) {
            return NextResponse.json(
              { error: `Stok gudang "${namaKomponen}" tidak mencukupi (sisa: ${sparepart.stokGudang} ${sparepart.satuan}).` },
              { status: 400 }
            );
          }
          shouldDeductStock = true;
        }
      } else {
        // Untuk Material (plat, kawat las, cat, dll.):
        // Luas / potongan kecil (cm², m²) biasanya dari sisa/off-cut, kecuali user meminta potong stok lembar utuh
        if (sparepart && potongStok && qtyPotongStok > 0) {
          if (sparepart.stokGudang < qtyPotongStok) {
            return NextResponse.json(
              { error: `Stok gudang "${namaKomponen}" tidak mencukupi untuk dipotong ${qtyPotongStok} ${sparepart.satuan} (sisa: ${sparepart.stokGudang}).` },
              { status: 400 }
            );
          }
          shouldDeductStock = true;
          deductQty = qtyPotongStok;
        }
      }

      const [reqData] = await sql<Array<{ nomorRequest: string; namaBarang: string }>>`
        SELECT "nomorRequest", "namaBarang" FROM "SectionRequest" WHERE id = ${sectionRequestId} LIMIT 1
      `;

      const newMat = {
        id: Date.now(),
        sectionRequestId,
        namaKomponen,
        tipe,
        qty,
        satuan,
        dimensi: dimensi || null,
        potongStok: shouldDeductStock,
        qtyPotongStok: shouldDeductStock ? deductQty : 0,
        keterangan: keterangan || null,
      };

      const [currentReq] = await sql<Array<{ materials: unknown }>>`
        SELECT COALESCE("materials", '[]'::jsonb) as materials FROM "SectionRequest" WHERE id = ${sectionRequestId} LIMIT 1
      `;
      const currentList = normalizeMaterials(currentReq?.materials);
      const updatedMaterials = [...currentList, newMat];

      await withTransaction(async (tx) => {
        await tx`
          UPDATE "SectionRequest"
          SET "materials" = ${sql.json(updatedMaterials)},
              "waktuUpdate" = NOW()
          WHERE id = ${sectionRequestId}
        `;
        if (shouldDeductStock && deductQty > 0) {
          await tx`
            UPDATE "Sparepart"
            SET "stokGudang" = "stokGudang" - ${deductQty}
            WHERE "namaKomponen" = ${namaKomponen}
          `;
          await tx`
            INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, referensi, keterangan, tanggal)
            VALUES (
              ${namaKomponen},
              'OUT',
              ${deductQty},
              ${reqData?.nomorRequest || `REQ-${sectionRequestId}`},
              ${`Pemakaian ${tipe.toLowerCase()} untuk request seksi: ${reqData?.namaBarang || '-'} (${qty} ${satuan}${dimensi ? ` • ${dimensi}` : ''})`},
              NOW()
            )
          `;
        }
      });

      return NextResponse.json({
        success: true,
        message: `${tipe === 'MATERIAL' ? 'Material' : 'Sparepart'} ${namaKomponen} (${qty} ${satuan}) berhasil dicatat.${shouldDeductStock ? ` Stok gudang dipotong ${deductQty} ${sparepart?.satuan || 'unit'}.` : ''}`,
        materials: updatedMaterials,
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

      const [current] = await sql<Array<{ id: number; nomorRequest: string; materials: unknown }>>`
        SELECT id, "nomorRequest", COALESCE("materials", '[]'::jsonb) as materials
        FROM "SectionRequest"
        WHERE id = ${sectionRequestId}
        LIMIT 1
      `;

      if (!current) {
        return NextResponse.json({ error: 'Request tidak ditemukan.' }, { status: 404 });
      }

      const currentMats = normalizeMaterials(current.materials);
      const targetMatIndex = currentMats.findIndex((m) => 
        (materialId && Number(m.id) === materialId) ||
        (namaKomponen && m.namaKomponen === namaKomponen)
      );

      if (targetMatIndex === -1) {
        return NextResponse.json({ error: 'Data item tidak ditemukan pada request ini.' }, { status: 404 });
      }

      const targetMat = currentMats[targetMatIndex];
      const updatedMats = currentMats.filter((_, idx) => idx !== targetMatIndex);

      await withTransaction(async (tx) => {
        await tx`
          UPDATE "SectionRequest"
          SET "materials" = ${sql.json(updatedMats)},
              "waktuUpdate" = NOW()
          WHERE id = ${sectionRequestId}
        `;
        if (targetMat.potongStok && targetMat.qtyPotongStok && targetMat.qtyPotongStok > 0) {
          await tx`
            UPDATE "Sparepart"
            SET "stokGudang" = "stokGudang" + ${targetMat.qtyPotongStok}
            WHERE "namaKomponen" = ${targetMat.namaKomponen}
          `;
          await tx`
            INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, referensi, keterangan, tanggal)
            VALUES (
              ${targetMat.namaKomponen},
              'IN',
              ${targetMat.qtyPotongStok},
              ${current.nomorRequest || `REQ-${sectionRequestId}`},
              ${'Pembatalan pemakaian request seksi (stok dikembalikan ke gudang)'},
              NOW()
            )
          `;
        }
      });

      return NextResponse.json({
        success: true,
        message: `Pemakaian ${targetMat.namaKomponen} (${targetMat.qty} ${targetMat.satuan || 'unit'}) berhasil dibatalkan${targetMat.potongStok ? ' dan stok gudang dikembalikan' : ''}.`,
        materials: updatedMats,
      });
    }

    // 6. SET_PENDING_MATERIAL: Tunda pengerjaan karena sparepart habis
    if (action === 'SET_PENDING_MATERIAL') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat mengubah status pending.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const alasan = sanitizeText(body.alasan || 'Menunggu ketersediaan sparepart / material di gudang', 500);

      const [updated] = await sql<SectionRequestRow[]>`
        UPDATE "SectionRequest"
        SET
          status = 'Pending: Material Habis',
          "alasanPending" = ${alasan},
          "waktuUpdate" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_PENDING_MATERIAL',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: updated?.nomorRequest,
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

      const [updated] = await sql<SectionRequestRow[]>`
        UPDATE "SectionRequest"
        SET
          status = 'Dikerjakan',
          "alasanPending" = null,
          "waktuUpdate" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      recordAuditLog({
        action: 'SECTION_REQUEST_RESUME_PROGRESS',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: updated.nomorRequest,
        details: 'Status pengerjaan dilanjutkan (Dikerjakan)',
      });

      return NextResponse.json({
        success: true,
        message: 'Status pengerjaan berhasil dilanjutkan (Dikerjakan).',
        request: updated,
      });
    }

    // 8. DELETE: Hapus request
    if (action === 'DELETE') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat menghapus request.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;

      await sql`DELETE FROM "SectionRequest" WHERE id = ${id}`;

      return NextResponse.json({ success: true, message: 'Request berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/section-requests error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
