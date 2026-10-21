import { NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';
import { createInAppNotification, buildAtasanSpecialProjectEmailContent } from '@/lib/emailNotification';
import { DEFAULT_ATASAN_SPROJECT_EMAIL } from '@/lib/workflowConstants';

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

// Helper untuk memastikan format data materials selalu array of object bersih
export function normalizeMaterials(raw: unknown): Array<{
  id: number;
  sectionRequestId: number;
  namaKomponen: string;
  qty: number;
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
  const result: any[] = [];
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
  return result.filter((m) => m && (m.namaKomponen || m.id));
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
        sr.id,
        sr."nomorRequest",
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
        sr."fotoSebelum",
        sr."rencanaTindakan",
        sr."fotoSesudah",
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
      WHERE (${filterByUser}::text IS NULL OR sr."dibuatOleh" = ${filterByUser})
        AND (${filterStatus}::text IS NULL OR sr.status = ${filterStatus})
        AND (${filterSeksi}::text IS NULL OR sr."seksiPemohon" = ${filterSeksi})
      ORDER BY sr."waktuDibuat" DESC
    `;

    const mappedRequests = requests.map((r) => ({
      ...r,
      materials: normalizeMaterials(r.materials),
    }));

    return NextResponse.json({ success: true, requests: mappedRequests });
  } catch (error) {
    console.error('GET /api/section-requests error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data request seksi.' }, { status: 500 });
  }
}

// POST: Buat request baru atau update status/material/evaluasi
export async function POST(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION
  const auth = await requireAuth(request, ['ADMIN', 'USER_SEKSI', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD LIMIT (Maksimal 10MB untuk menampung gambar terkompresi)
  const sizeCheck = validatePayloadSize(request, 10 * 1024 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (30 mutasi/menit)
  const rateLimit = checkRateLimit(`requests_post:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan mutasi request.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const action = sanitizeText(body.action, 40);

    // =========================================================================
    // 1. CREATE: PIC Seksi Mengisi Form & Mengirim ke Atasan untuk Assign
    // =========================================================================
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
          ${auth.user!.username},
          NOW(),
          NOW()
        )
        RETURNING id, "nomorRequest"
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

    // =========================================================================
    // 2. EVALUASI_WORKSHOP: PIC Workshop Mengevaluasi Waktu, Men Power, Sparepart, Material
    // =========================================================================
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

      const [current] = await sql<Array<any>>`
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
          perihal: current.perihal || current.namaBarang,
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
            perihal: current.perihal || current.namaBarang,
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

      const [updated] = await sql<Array<{ nomorRequest: string }>>`
        UPDATE "SectionRequest"
        SET
          status = ${nextStatus},
          "flowStep" = ${nextFlowStep},
          "alasanTolak" = ${alasanTolak !== undefined ? (alasanTolak || null) : current.alasanTolak},
          "picBengkel" = ${picBengkel !== undefined ? (picBengkel || null) : current.picBengkel},
          "estimasi" = ${estimasi !== undefined ? (estimasi || null) : current.estimasi},
          "catatanAdmin" = ${catatanAdmin !== undefined ? (catatanAdmin || null) : current.catatanAdmin},
          "biayaEstimate" = ${biayaEstimate !== undefined ? (biayaEstimate || null) : current.biayaEstimate},
          "biayaActual" = ${biayaActual !== undefined ? (biayaActual || null) : current.biayaActual},
          "orangJamEstimate" = ${orangJamEstimate !== undefined ? (orangJamEstimate || null) : current.orangJamEstimate},
          "orangJamActual" = ${orangJamActual !== undefined ? (orangJamActual || null) : current.orangJamActual},
          "waktuEstimate" = ${waktuEstimate !== undefined ? (waktuEstimate || null) : current.waktuEstimate},
          "waktuActual" = ${waktuActual !== undefined ? (waktuActual || null) : current.waktuActual},
          "kebutuhanSparepart" = ${kebutuhanSparepart !== undefined ? (kebutuhanSparepart || null) : current.kebutuhanSparepart},
          "kebutuhanMaterial" = ${kebutuhanMaterial !== undefined ? (kebutuhanMaterial || null) : current.kebutuhanMaterial},
          "tglPelaksanaanEstimate" = ${tglPelaksanaanEstimate !== undefined ? (tglPelaksanaanEstimate || null) : current.tglPelaksanaanEstimate},
          "tglPelaksanaanActual" = ${tglPelaksanaanActual !== undefined ? (tglPelaksanaanActual || null) : current.tglPelaksanaanActual},
          "komentarEstimate" = ${komentarEstimate !== undefined ? (komentarEstimate || null) : current.komentarEstimate},
          "komentarActual" = ${komentarActual !== undefined ? (komentarActual || null) : current.komentarActual},
          keputusan = ${keputusan !== undefined ? (keputusan || null) : current.keputusan},
          "keputusan8210" = ${keputusan8210 !== undefined ? (keputusan8210 || null) : current.keputusan8210},
          "keputusan820" = ${keputusan820 !== undefined ? (keputusan820 || null) : current.keputusan820},
          "hasilCheck" = ${hasilCheck !== undefined ? (hasilCheck || null) : current.hasilCheck},
          "hasilCheckPemohon" = ${hasilCheckPemohon !== undefined ? (hasilCheckPemohon || null) : current.hasilCheckPemohon},
          "schedulePlanning" = ${schedulePlanning !== undefined ? (schedulePlanning || null) : current.schedulePlanning},
          "scheduleActual" = ${scheduleActual !== undefined ? (scheduleActual || null) : current.scheduleActual},
          "waktuSelesai" = ${nextStatus === 'Selesai' ? (current.waktuSelesai || new Date()) : current.waktuSelesai},
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

      return NextResponse.json({
        success: true,
        message: `Evaluasi request ${updated.nomorRequest} berhasil disimpan.`,
        request: updated,
        atasanSProjectEmail,
      });
    }

    // =========================================================================
    // 3. SELESAI & INFORMASIKAN KE SEKSI
    // =========================================================================
    if (action === 'FINISH_REQUEST') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya PIC Workshop yang dapat menyelesaikan request.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const hasilCheck = sanitizeText(body.hasilCheck, 2000);
      const hasilCheckPemohon = sanitizeText(body.hasilCheckPemohon, 100);

      const [updated] = await sql<Array<any>>`
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
        requestId: updated.id,
        nomorRequest: updated.nomorRequest,
        targetRole: 'USER_SEKSI',
        targetUser: updated.picPemohon,
        tipe: 'INFO_SELESAI_SEKSI',
        judul: `Pekerjaan Selesai: ${updated.nomorRequest}`,
        pesan: `Pekerjaan "${updated.perihal || updated.namaBarang}" telah selesai dikerjakan oleh bengkel. Silakan cek dan lakukan serah terima barang.`,
        link: `/request`,
      });

      return NextResponse.json({
        success: true,
        message: `Pekerjaan selesai dan informasi telah dikirimkan ke Seksi Pemohon.`,
        request: updated,
      });
    }

    // =========================================================================
    // 4. Tambah alokasi material dari gudang
    // =========================================================================
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

      const newMat = {
        id: Date.now(),
        sectionRequestId,
        namaKomponen,
        qty,
        keterangan: keterangan || null,
      };

      const [currentReq] = await sql<Array<{ materials: any }>>`
        SELECT COALESCE("materials", '[]'::jsonb) as materials FROM "SectionRequest" WHERE id = ${sectionRequestId} LIMIT 1
      `;
      const currentList = normalizeMaterials(currentReq?.materials);
      const updatedMaterials = [...currentList, newMat];

      await sql.begin(async (tx) => {
        await tx`
          UPDATE "SectionRequest"
          SET "materials" = ${sql.json(updatedMaterials)},
              "waktuUpdate" = NOW()
          WHERE id = ${sectionRequestId}
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

      return NextResponse.json({
        success: true,
        message: `Material ${namaKomponen} (${qty}) berhasil ditambahkan dan stok gudang dipotong.`,
        materials: updatedMaterials,
      });
    }

    // =========================================================================
    // 5. REMOVE_MATERIAL: Batalkan Pemakaian Sparepart & Kembalikan Stok ke Gudang
    // =========================================================================
    if (action === 'REMOVE_MATERIAL') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat membatalkan material.' }, { status: 403 });
      }

      const sectionRequestId = validatePositiveInt(body.sectionRequestId, 'ID Request', 1).value;
      const materialId = body.materialId ? Number(body.materialId) : null;
      const namaKomponen = body.namaKomponen ? sanitizeText(body.namaKomponen, 100) : null;

      const [current] = await sql<Array<{ id: number; nomorRequest: string; materials: any }>>`
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
        return NextResponse.json({ error: 'Data material tidak ditemukan pada request ini.' }, { status: 404 });
      }

      const targetMat = currentMats[targetMatIndex];
      const updatedMats = currentMats.filter((_, idx) => idx !== targetMatIndex);

      await sql.begin(async (tx) => {
        await tx`
          UPDATE "SectionRequest"
          SET "materials" = ${sql.json(updatedMats)},
              "waktuUpdate" = NOW()
          WHERE id = ${sectionRequestId}
        `;
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" + ${targetMat.qty}
          WHERE "namaKomponen" = ${targetMat.namaKomponen}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, referensi, keterangan, tanggal)
          VALUES (
            ${targetMat.namaKomponen},
            'IN',
            ${targetMat.qty},
            ${current.nomorRequest || `REQ-${sectionRequestId}`},
            ${'Pembatalan pemakaian material request (stok dikembalikan ke gudang)'},
            NOW()
          )
        `;
      });

      return NextResponse.json({
        success: true,
        message: `Pemakaian material ${targetMat.namaKomponen} (${targetMat.qty}) berhasil dibatalkan dan stok dikembalikan.`,
        materials: updatedMats,
      });
    }

    // =========================================================================
    // 6. SET_PENDING_MATERIAL: Tunda Pengerjaan Karena Material/Sparepart Habis
    // =========================================================================
    if (action === 'SET_PENDING_MATERIAL') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat mengubah status pending.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;
      const alasan = sanitizeText(body.alasan || 'Menunggu ketersediaan sparepart / material di gudang', 500);

      const [updated] = await sql<Array<any>>`
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
        targetId: updated.nomorRequest,
        details: `Status diubah ke Pending Material: ${alasan}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Status pengerjaan berhasil diubah menjadi Pending Material.',
        request: updated,
      });
    }

    // =========================================================================
    // 7. RESUME_PROGRESS: Lanjutkan Pengerjaan Setelah Material Tersedia
    // =========================================================================
    if (action === 'RESUME_PROGRESS') {
      if (auth.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Hanya admin yang dapat melanjutkan proses.' }, { status: 403 });
      }

      const id = validatePositiveInt(body.id, 'ID Request', 1).value;

      const [updated] = await sql<Array<any>>`
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

    // =========================================================================
    // 8. Hapus request
    // =========================================================================
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
