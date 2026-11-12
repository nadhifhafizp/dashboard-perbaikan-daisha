import { NextResponse } from 'next/server';
import sql, { withTransaction } from '@/lib/db';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';
import { parseToTimestamp, formatDisplayDate } from '@/lib/date';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validateNoDaisha,
} from '@/lib/security';
import { invalidateMaintenanceCache } from '@/app/api/maintenance/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let repairCache: Record<string, unknown>[] | null = null;
let repairCacheTimestamp = 0;
const REPAIR_CACHE_TTL_MS = 10 * 1000; // 10 detik

function invalidateRepairCache(): void {
  repairCache = null;
  repairCacheTimestamp = 0;
}

// Baca data perbaikan dari PostgreSQL (admin, operator, dan user seksi)
export async function GET(request: Request) {
  // Autentikasi dan otorisasi sesi pengguna
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR', 'USER_SEKSI']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (120 req/menit)
  const rateLimit = checkRateLimit(`repair_get:${auth.ip}`, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan data perbaikan.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get('id');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const daysParam = searchParams.get('days');
  const allParam = searchParams.get('all') === 'true';

  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (fromParam) {
    const fTs = parseToTimestamp(fromParam);
    if (fTs > 0) fromDate = new Date(fTs);
  } else if (!allParam && !idParam) {
    // Batasan waktu default (90 hari terakhir) untuk mencegah lag di browser mobile
    const numDays = daysParam ? parseInt(daysParam, 10) || 90 : 90;
    fromDate = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
  }

  if (toParam) {
    const tTs = parseToTimestamp(toParam);
    if (tTs > 0) toDate = new Date(tTs);
  }

  const isFiltered = Boolean(idParam || fromParam || toParam || daysParam || allParam);

  // 3. FAST CACHE HIT (< 2ms) hanya untuk query default tanpa filter kustom
  if (!isFiltered && repairCache && Date.now() - repairCacheTimestamp < REPAIR_CACHE_TTL_MS) {
    return NextResponse.json(repairCache, {
      headers: {
        'X-Database': 'PostgreSQL-Native',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const fromIso = fromDate ? fromDate.toISOString() : null;
    const toIso = toDate ? toDate.toISOString() : null;

    const tickets = await sql`
      SELECT 
        t."TicketNo" AS "idTiket",
        t."Status" AS "status",
        t."ReporterName" AS "namaPelapor",
        t."UnitCode" AS "noDaisha",
        t."ReportDate" AS "waktuMasuk",
        t."CompletedDate" AS "waktuSelesai",
        COALESCE(t."DamageDescription", t."ActionTaken", '-') AS "catatan",
        COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'idDetail', td."LineNo",
              'komponen', td."ComponentName",
              'gejala', td."SymptomDesc",
              'tindakan', td."ActionType",
              'qty', td."Qty"
            ) ORDER BY td."LineNo"
          )
          FROM "TWMSRepairTicketDetail" td
          WHERE td."TicketId" = t."Id"
        ), '[]'::jsonb) AS details,
        d."DaishaType" AS "namaDaisha",
        COALESCE(d."SectionName", t."ReporterSection") AS "seksi"
      FROM "TWMSRepairTicket" t
      LEFT JOIN "TWMSDaishaCatalog" d ON UPPER(TRIM(d."UnitCode")) = UPPER(TRIM(t."UnitCode"))
      WHERE (${idParam}::text IS NULL OR t."TicketNo" = ${idParam} OR UPPER(t."UnitCode") = UPPER(${idParam}))
        AND (${fromIso}::timestamptz IS NULL OR t."ReportDate" >= ${fromIso}::timestamptz OR t."Status" IN ('Open', 'Progress', 'Pending'))
        AND (${toIso}::timestamptz IS NULL OR t."ReportDate" <= ${toIso}::timestamptz OR t."Status" IN ('Open', 'Progress', 'Pending'))
      ORDER BY t."ReportDate" DESC
    `;

    // Format output 100% kompatibel dengan frontend tanpa merubah UI/komponen apa pun
    const formattedData = tickets.map((t) => {
      let detailsList: Array<{ komponen: string; gejala: string; qty: number; tindakan: string }> = [];
      try {
        if (Array.isArray(t.details)) {
          detailsList = t.details;
        } else if (typeof t.details === 'string') {
          detailsList = JSON.parse(t.details || '[]');
        }
      } catch {
        detailsList = [];
      }
      const kategoriList = Array.from(new Set(detailsList.map((d: { komponen: string }) => d.komponen))).filter(Boolean);
      const detailStr = detailsList.length > 0
        ? detailsList.map((d: { komponen: string; gejala: string; qty: number; tindakan: string }, idx: number) => `${idx + 1}. [${d.komponen}] ${d.gejala} (Qty: ${d.qty}, Tindakan: ${d.tindakan})`).join(' | ')
        : '-';

      return {
        ID_Tiket: t.idTiket,
        Status: t.status,
        Nama_Pelapor: t.namaPelapor,
        Seksi: t.seksi || '-',
        No_Daisha: t.noDaisha,
        Nama_Daisha: t.namaDaisha || '-',
        Kategori_Kerusakan: kategoriList.join(', ') || 'Umum',
        Detail_Kerusakan: detailStr,
        Catatan: t.catatan || '-',
        Waktu_Masuk: formatDisplayDate(t.waktuMasuk),
        Waktu_Keluar: formatDisplayDate(t.waktuSelesai),
      };
    });

    if (!isFiltered) {
      repairCache = formattedData;
      repairCacheTimestamp = Date.now();
    }

    return NextResponse.json(formattedData, {
      headers: {
        'X-Database': 'PostgreSQL-Native',
        'X-Cache': isFiltered ? 'FILTERED' : 'MISS',
      },
    });
  } catch (error: unknown) {
    console.error("Database GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data tiket dari database" },
      { status: 500 }
    );
  }
}

// Mutasi data tiket (create, update, delete)
export async function POST(request: Request) {
  // Autentikasi dan otorisasi sesi pengguna
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR', 'USER_SEKSI']);
  if (!auth.authorized) return auth.errorResponse!;

  // Validasi ukuran payload maksimum 512KB
  const sizeCheck = validatePayloadSize(request, 512 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // Pembatasan laju permintaan (rate limiting 60 mutasi/menit)
  const rateLimit = checkRateLimit(`repair_post:${auth.ip}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan mutasi tiket. Coba sesaat lagi.' }, { status: 429 });
  }

  try {
    invalidateRepairCache();
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Format request tidak valid, harus JSON" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action = sanitizeText(body.action, 50).toUpperCase();

    if (!action || !['CREATE', 'UPDATE', 'DELETE', 'EDIT_TICKET'].includes(action)) {
      return NextResponse.json(
        { error: "Aksi tidak valid. Hanya 'CREATE', 'UPDATE', 'DELETE', atau 'EDIT_TICKET' yang diizinkan." },
        { status: 400 }
      );
    }

    // Pembatasan RBAC: User Seksi hanya diizinkan membuat laporan baru (CREATE)
    if (auth.user?.role === 'USER_SEKSI' && action !== 'CREATE') {
      return NextResponse.json(
        { error: "Akses dibatasi. User Seksi hanya dapat membuat laporan perbaikan Daisha baru." },
        { status: 403 }
      );
    }

    // 2.1 CREATE (Bisa dilakukan oleh Operator, Admin, maupun User Seksi)
    if (action === 'CREATE') {
      const idTiket = sanitizeText(body.idTiket, 50) || `TCK-${Date.now()}`;
      const waktuMasuk = sanitizeText(body.waktuMasuk, 30);
      const namaPelapor = sanitizeText(body.namaPelapor, 100);
      let seksi = sanitizeText(body.seksi, 50);
      let namaDaisha = sanitizeText(body.namaDaisha, 100);
      const noDaishaValidation = validateNoDaisha(body.noDaisha);
      const detail = sanitizeText(body.detail, 2000);
      const catatanInput = sanitizeText(body.catatan || body.catatanTambahan || body.lokasi, 500);
      const isSeksiReport = Boolean(body.isSeksiReport || auth.user?.role === 'USER_SEKSI');
      const rawStatus = sanitizeText(body.status, 20);
      const targetStatus = ['Open', 'Progress', 'Pending'].includes(rawStatus) ? rawStatus : 'Open';

      if (!noDaishaValidation.valid) {
        return NextResponse.json({ error: noDaishaValidation.error }, { status: 400 });
      }
      const noDaisha = noDaishaValidation.value;

      // Auto-resolve seksi dan namaDaisha dari tabel TWMSDaishaCatalog
      if (!seksi || !namaDaisha) {
        const [existingDaisha] = await sql`
          SELECT "DaishaType", "SectionName", "SizeSpec"
          FROM "TWMSDaishaCatalog" 
          WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${noDaisha}))
          LIMIT 1
        `;
        if (existingDaisha) {
          if (!namaDaisha && existingDaisha.DaishaType) namaDaisha = existingDaisha.DaishaType;
          if (!seksi && existingDaisha.SectionName) seksi = existingDaisha.SectionName;
        }
      }

      if (!seksi && auth.user?.seksi) {
        seksi = auth.user.seksi;
      }
      if (!seksi) {
        seksi = 'Plant';
      }
      if (!namaDaisha) {
        namaDaisha = `Daisha ${seksi}`;
      }

      // Validasi kelengkapan data wajib
      if (!namaPelapor || !noDaisha) {
        return NextResponse.json(
          { error: "Field wajib (Nama Pelapor dan No Daisha) tidak boleh kosong." },
          { status: 400 }
        );
      }

      // Pastikan data unit di TWMSDaishaCatalog terdaftar / terupdate
      const [existingUnit] = await sql`
        SELECT "SizeSpec" FROM "TWMSDaishaCatalog"
        WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${noDaisha})) LIMIT 1
      `;
      const sizeInfo = detectDaishaSize(noDaisha);
      const ukuranNorm = (sizeInfo?.size === 'Small' ? 'SMALL' : sizeInfo?.size === 'Medium' ? 'MEDIUM' : sizeInfo?.size === 'Large' ? 'LARGE' : 'NONE');
      const ukuran = existingUnit?.SizeSpec || ukuranNorm;

      // Parse waktu masuk secara konsisten
      let parsedDateMasuk = new Date();
      if (waktuMasuk) {
        const ts = parseToTimestamp(waktuMasuk);
        if (ts > 0) parsedDateMasuk = new Date(ts);
      }

      // Pecah rincian kerusakan ke items
      let itemsJson: Array<{ idDetail: number; komponen: string; gejala: string; tindakan: string; qty: number }> = [];

      if (isSeksiReport && (!detail || detail.trim() === '')) {
        itemsJson = [
          {
            idDetail: 1,
            komponen: 'Menunggu Diagnosa Bengkel',
            gejala: catatanInput ? `Laporan Seksi: ${catatanInput}` : 'Dilaporkan rusak oleh seksi di plant',
            tindakan: 'Pemeriksaan',
            qty: 1,
          },
        ];
      } else {
        const parsedDetails = parseTicketDamageDetail(detail || '');
        itemsJson = parsedDetails.items.map((it, idx) => ({
          idDetail: idx + 1,
          komponen: it.komponen,
          gejala: it.gejala,
          tindakan: it.tindakan || 'Repair',
          qty: it.qty || 1,
        }));
        if (itemsJson.length === 0) {
          itemsJson = [
            {
              idDetail: 1,
              komponen: 'Menunggu Diagnosa Bengkel',
              gejala: catatanInput || 'Perlu diagnosa teknisi',
              tindakan: 'Pemeriksaan',
              qty: 1,
            },
          ];
        }
      }

      const finalCatatan = catatanInput || '-';
      const kategoriUtama = itemsJson[0]?.komponen || 'Umum';
      const ringkasanGejala = itemsJson.map((it) => `${it.komponen}: ${it.gejala}`).join('; ');

      // Eksekusi mutasi multi-tabel dalam 1 transaksi atomik aman
      await withTransaction(async (tx) => {
        // 1. Upsert unit di TWMSDaishaCatalog
        await tx`
          INSERT INTO "TWMSDaishaCatalog" ("UnitCode", "DaishaType", "SizeSpec", "SectionName", "CurrentCondition", "UpdateDate")
          VALUES (${noDaisha}, ${namaDaisha}, ${ukuran}, ${seksi}, 'RUSAK', NOW())
          ON CONFLICT ("UnitCode") DO UPDATE 
          SET "DaishaType" = COALESCE(EXCLUDED."DaishaType", "TWMSDaishaCatalog"."DaishaType"), 
              "SectionName" = COALESCE(EXCLUDED."SectionName", "TWMSDaishaCatalog"."SectionName"),
              "CurrentCondition" = 'RUSAK',
              "UpdateDate" = NOW()
        `;

        // 2. Insert Header Tiket ke TWMSRepairTicket
        const [ticketRow] = await tx<Array<{ Id: number }>>`
          INSERT INTO "TWMSRepairTicket" (
            "TicketNo", "UnitCode", "ReporterName", "ReporterSection", "Status",
            "ReportDate", "ActionTaken", "DamageCategory", "DamageDescription", "UpdateDate"
          )
          VALUES (
            ${idTiket}, ${noDaisha}, ${namaPelapor}, ${seksi}, ${targetStatus},
            ${parsedDateMasuk}, ${finalCatatan}, ${kategoriUtama}, ${ringkasanGejala}, NOW()
          )
          RETURNING "Id"
        `;

        const ticketId = ticketRow.Id;

        // 3. Insert baris rincian ke TWMSRepairTicketDetail
        for (const item of itemsJson) {
          // Cari DamageCatalogId bila ada
          const [catMatch] = await tx<Array<{ Id: number }>>`
            SELECT "Id" FROM "TWMSDamageCatalog"
            WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${namaDaisha}))
              AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${item.komponen}))
              AND LOWER(COALESCE(TRIM("SymptomDesc"), '')) = LOWER(COALESCE(TRIM(${item.gejala}), ''))
            LIMIT 1
          `;

          await tx`
            INSERT INTO "TWMSRepairTicketDetail" (
              "TicketId", "LineNo", "ComponentName", "SymptomDesc", "ActionType", "Qty", "DamageCatalogId"
            )
            VALUES (
              ${ticketId}, ${item.idDetail}, ${item.komponen}, ${item.gejala}, ${item.tindakan}, ${item.qty}, ${catMatch?.Id || null}
            )
          `;
        }

        // 4. Pengurangan stok otomatis untuk komponen Ganti Baru
        const gantiItems = itemsJson.filter((it) => it.tindakan === 'Ganti');
        for (const it of gantiItems) {
          try {
            const targetKomponen = (it.komponen || '').trim();
            const deductQty = Number(it.qty) || 1;
            if (!targetKomponen) continue;

            const [upd] = await tx<Array<{ Id: number; PartName: string; CurrentStock: number; Unit: string }>>`
              UPDATE "TWMSSparepartMaster"
              SET "CurrentStock" = "CurrentStock" - ${deductQty}, "UpdateDate" = NOW()
              WHERE UPPER(TRIM("PartName")) = UPPER(TRIM(${targetKomponen}))
              RETURNING "Id", "PartName", "CurrentStock", "Unit"
            `;

            if (upd) {
              await tx`
                INSERT INTO "TWMSSparepartLog" ("SparepartId", "PartName", "MovementType", "Qty", "TicketId", "Notes", "MovementDate")
                VALUES (
                  ${upd.Id},
                  ${upd.PartName},
                  'OUT',
                  ${deductQty},
                  ${ticketId},
                  ${`Penggantian sparepart perbaikan Daisha ${noDaisha} (${namaDaisha}) - ${it.gejala || 'Ganti Baru'}`},
                  NOW()
                )
              `;
            } else {
              console.warn(`[Sparepart] Komponen '${targetKomponen}' tidak ditemukan di katalog gudang, skip pengurangan stok.`);
            }
          } catch (e) {
            console.warn(`[Sparepart] Gagal update stok untuk '${it.komponen}':`, e);
          }
        }
      });

      recordAuditLog({
        action: 'TICKET_CREATE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: idTiket,
        details: `Unit: ${noDaisha} (${namaDaisha}), Seksi: ${seksi}, Pelapor: ${namaPelapor}`,
      });

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dibuat di database`,
        idTiket,
      });
    }

    // 2.2 UPDATE STATUS & CATATAN (ROLE ADMIN & OPERATOR WORKSHOP)
    else if (action === 'UPDATE') {
      if (auth.user?.role !== 'ADMIN' && auth.user?.role !== 'OPERATOR') {
        recordAuditLog({
          action: 'TICKET_STATUS_UPDATE',
          ip: auth.ip,
          user: auth.user?.username,
          role: auth.user?.role,
          status: 'DENIED',
          details: 'Upaya update status oleh non-workshop',
        });
        return NextResponse.json(
          { error: "Akses ditolak. Hanya akun workshop (ADMIN & OPERATOR) yang berhak memperbarui status perbaikan tiket." },
          { status: 403 }
        );
      }

      const idTiket = sanitizeText(body.idTiket, 50);
      const status = sanitizeText(body.status, 20);
      const waktuKeluar = sanitizeText(body.waktuKeluar, 30);
      const catatan = sanitizeText(body.catatan, 500);

      if (!idTiket) {
        return NextResponse.json(
          { error: "ID Tiket wajib diisi untuk melakukan update." },
          { status: 400 }
        );
      }

      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (!['Progress', 'Done', 'Scrap', 'Pending'].includes(normalizedStatus)) {
        return NextResponse.json(
          { error: "Status tidak valid. Status harus Progress, Pending, Done, atau Scrap." },
          { status: 400 }
        );
      }

      // Parse waktu selesai secara konsisten
      let parsedWaktuSelesai: Date | null = null;
      if (normalizedStatus === 'Done') {
        if (waktuKeluar && waktuKeluar !== '-') {
          const ts = parseToTimestamp(waktuKeluar);
          parsedWaktuSelesai = ts > 0 ? new Date(ts) : new Date();
        } else {
          parsedWaktuSelesai = new Date();
        }
      }

      await withTransaction(async (tx) => {
        const [updatedTicket] = await tx<Array<{ Id: number; UnitCode: string; ReportDate: Date | null }>>`
          UPDATE "TWMSRepairTicket"
          SET 
            "Status" = ${normalizedStatus},
            "CompletedDate" = ${parsedWaktuSelesai},
            "DamageDescription" = CASE WHEN ${catatan && catatan !== '-'} THEN ${catatan} ELSE "DamageDescription" END,
            "UpdateDate" = NOW()
          WHERE "TicketNo" = ${idTiket}
          RETURNING "Id", "UnitCode", "ReportDate"
        `;

        if (!updatedTicket) {
          throw new Error(`Tiket ${idTiket} tidak ditemukan.`);
        }

        const noD = (updatedTicket.UnitCode || '').trim();
        const completionDate = parsedWaktuSelesai || new Date();
        const ticketWaktuMasuk = updatedTicket.ReportDate ? new Date(updatedTicket.ReportDate) : completionDate;

        // Sinkronisasi unit jika Selesai (Done)
        if (normalizedStatus === 'Done' && noD) {
          const periodMonth = `${completionDate.getFullYear()}-${String(completionDate.getMonth() + 1).padStart(2, '0')}`;
          const detailKerusakan = body.detail ? sanitizeText(body.detail, 1000) : 'Perbaikan kerusakan di bengkel';

          // Update TWMSDaishaCatalog
          const [daishaRow] = await tx<Array<{ SectionName: string }>>`
            UPDATE "TWMSDaishaCatalog"
            SET 
              "LastPMDate" = ${completionDate},
              "CurrentCondition" = 'OK',
              "TotalRepairs" = COALESCE("TotalRepairs", 0) + 1,
              "UpdateDate" = NOW()
            WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${noD}))
            RETURNING "SectionName"
          `;

          const sectionName = daishaRow?.SectionName || 'Building';

          // Catat log pengerjaan repair di TWMSMaintenanceLog (RecordType = 'PM')
          await tx`
            INSERT INTO "TWMSMaintenanceLog" (
              "UnitCode", "SectionName", "RecordType", "PeriodMonth", "WorkType", "ChecklistResult",
              "InspectionNote", "ActionTaken", "CheckDate", "EntryTime", "ExitTime",
              "InspectorBy", "Notes", "UpdateDate"
            ) VALUES (
              ${noD}, ${sectionName}, 'PM', ${periodMonth}, 'REPAIR', 'OK',
              ${detailKerusakan}, ${'Perbaikan selesai via tiket ' + idTiket}, ${completionDate},
              ${ticketWaktuMasuk}, ${completionDate},
              ${auth.user?.name || auth.user?.username || 'Admin'}, ${'Perbaikan selesai via tiket ' + idTiket}, NOW()
            )
          `;
        }

        // Jika unit dinyatakan Scrap
        if (normalizedStatus === 'Scrap' && noD) {
          await tx`
            UPDATE "TWMSDaishaCatalog"
            SET "CurrentCondition" = 'RUSAK', "IsActive" = false, "UpdateDate" = NOW()
            WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${noD}))
          `;
        }

        // Update detail jika disertakan
        if (body.detail) {
          const detailStr = sanitizeText(body.detail, 2000);
          const parsedDetails = parseTicketDamageDetail(detailStr);
          await tx`DELETE FROM "TWMSRepairTicketDetail" WHERE "TicketId" = ${updatedTicket.Id}`;

          for (let idx = 0; idx < parsedDetails.items.length; idx++) {
            const it = parsedDetails.items[idx];
            await tx`
              INSERT INTO "TWMSRepairTicketDetail" (
                "TicketId", "LineNo", "ComponentName", "SymptomDesc", "ActionType", "Qty"
              ) VALUES (
                ${updatedTicket.Id}, ${idx + 1}, ${it.komponen}, ${it.gejala}, ${it.tindakan || 'Repair'}, ${it.qty || 1}
              )
            `;
          }
        }
      });

      if (normalizedStatus === 'Done' || normalizedStatus === 'Scrap') {
        invalidateMaintenanceCache();
      }

      recordAuditLog({
        action: 'TICKET_STATUS_UPDATE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: idTiket,
        details: `Status: ${normalizedStatus}`,
      });

      return NextResponse.json({
        success: true,
        message: `Status tiket ${idTiket} berhasil diubah menjadi ${normalizedStatus}`,
      });
    }

    // 2.3 DELETE (Hapus atau batalkan tiket - khusus role admin)
    else if (action === 'DELETE') {
      if (auth.user?.role !== 'ADMIN') {
        recordAuditLog({
          action: 'TICKET_DELETE',
          ip: auth.ip,
          user: auth.user?.username,
          role: auth.user?.role,
          status: 'DENIED',
          details: 'Upaya delete tiket oleh non-admin',
        });
        return NextResponse.json(
          { error: "Akses ditolak. Hanya akun ADMIN yang berhak menghapus tiket." },
          { status: 403 }
        );
      }

      const idTiket = sanitizeText(body.idTiket, 50);
      if (!idTiket) {
        return NextResponse.json(
          { error: "ID Tiket wajib diisi untuk membatalkan tiket." },
          { status: 400 }
        );
      }

      await withTransaction(async (tx) => {
        const [ticket] = await tx<Array<{ Id: number; UnitCode: string }>>`
          SELECT "Id", "UnitCode" FROM "TWMSRepairTicket" WHERE "TicketNo" = ${idTiket} LIMIT 1
        `;

        if (!ticket) return;

        // Cascade delete detail dan ticket
        await tx`DELETE FROM "TWMSRepairTicketDetail" WHERE "TicketId" = ${ticket.Id}`;
        await tx`DELETE FROM "TWMSSparepartLog" WHERE "TicketId" = ${ticket.Id}`;
        await tx`DELETE FROM "TWMSRepairTicket" WHERE "Id" = ${ticket.Id}`;

        // Cek apakah unit masih memiliki tiket aktif lain
        if (ticket.UnitCode) {
          const remaining = await tx`
            SELECT count(*)::int as c
            FROM "TWMSRepairTicket"
            WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${ticket.UnitCode}))
              AND "Status" IN ('Open', 'Progress', 'Pending')
          `;
          if ((remaining[0]?.c || 0) === 0) {
            await tx`
              UPDATE "TWMSDaishaCatalog"
              SET "CurrentCondition" = 'OK', "UpdateDate" = NOW()
              WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${ticket.UnitCode}))
            `;
          }
        }
      });

      invalidateMaintenanceCache();
      invalidateRepairCache();

      recordAuditLog({
        action: 'TICKET_DELETE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: idTiket,
      });

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dibatalkan / dihapus`,
      });
    }

    // 2.4 EDIT_TICKET (Koreksi data tiket oleh Pelapor/Operator/Admin)
    else if (action === 'EDIT_TICKET') {
      const idTiket = sanitizeText(body.idTiket, 50);
      const namaPelapor = sanitizeText(body.namaPelapor, 100);
      const seksi = sanitizeText(body.seksi, 50);
      const namaDaisha = sanitizeText(body.namaDaisha, 100);
      const noDaishaValidation = validateNoDaisha(body.noDaisha);
      const detail = sanitizeText(body.detail, 2000);

      if (!idTiket || !noDaishaValidation.valid) {
        return NextResponse.json(
          { error: "ID Tiket dan Nomor Daisha yang valid wajib diisi untuk melakukan koreksi." },
          { status: 400 }
        );
      }
      const noDaisha = noDaishaValidation.value;

      const waktuMasukRaw = sanitizeText(body.waktuMasuk, 30);
      let parsedWaktuMasuk: Date | null = null;
      if (waktuMasukRaw && waktuMasukRaw !== '-') {
        const ts = parseToTimestamp(waktuMasukRaw);
        if (ts > 0) {
          parsedWaktuMasuk = new Date(ts);
        } else {
          const d = new Date(waktuMasukRaw);
          if (!isNaN(d.getTime())) parsedWaktuMasuk = d;
        }
      }

      await withTransaction(async (tx) => {
        // Upsert unit di TWMSDaishaCatalog
        await tx`
          INSERT INTO "TWMSDaishaCatalog" ("UnitCode", "DaishaType", "SectionName", "UpdateDate")
          VALUES (${noDaisha}, ${namaDaisha}, ${seksi}, NOW())
          ON CONFLICT ("UnitCode") DO UPDATE 
          SET "DaishaType" = EXCLUDED."DaishaType", "SectionName" = EXCLUDED."SectionName", "UpdateDate" = NOW()
        `;

        const [tRow] = await tx<Array<{ Id: number }>>`
          SELECT "Id" FROM "TWMSRepairTicket" WHERE "TicketNo" = ${idTiket} LIMIT 1
        `;

        if (!tRow) {
          throw new Error(`Tiket ${idTiket} tidak ditemukan.`);
        }

        const ticketId = tRow.Id;

        // Parse detail kerusakan
        const parsedDetails = parseTicketDamageDetail(detail);
        const ringkasanGejala = parsedDetails.items.map((it) => `${it.komponen}: ${it.gejala}`).join('; ');
        const firstComp = parsedDetails.items[0]?.komponen || 'Umum';

        await tx`
          UPDATE "TWMSRepairTicket"
          SET 
            "UnitCode" = ${noDaisha},
            "ReporterName" = ${namaPelapor || auth.user?.name || 'Operator'},
            "ReporterSection" = ${seksi},
            "ReportDate" = COALESCE(${parsedWaktuMasuk}, "ReportDate"),
            "DamageCategory" = ${firstComp},
            "DamageDescription" = ${ringkasanGejala || '-'},
            "UpdateDate" = NOW()
          WHERE "Id" = ${ticketId}
        `;

        // Update Rincian Kerusakan
        await tx`DELETE FROM "TWMSRepairTicketDetail" WHERE "TicketId" = ${ticketId}`;
        for (let idx = 0; idx < parsedDetails.items.length; idx++) {
          const it = parsedDetails.items[idx];
          await tx`
            INSERT INTO "TWMSRepairTicketDetail" (
              "TicketId", "LineNo", "ComponentName", "SymptomDesc", "ActionType", "Qty"
            ) VALUES (
              ${ticketId}, ${idx + 1}, ${it.komponen}, ${it.gejala}, ${it.tindakan || 'Repair'}, ${it.qty || 1}
            )
          `;
        }
      });

      invalidateRepairCache();
      invalidateMaintenanceCache();

      recordAuditLog({
        action: 'TICKET_EDIT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: idTiket,
        details: `Unit: ${noDaisha}`,
      });

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dikoreksi`,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error("Database POST Error:", error);
    recordAuditLog({
      action: 'TICKET_POST_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: errorMsg,
    });
    return NextResponse.json(
      { error: `Terjadi kesalahan internal pada server database: ${errorMsg}` },
      { status: 500 }
    );
  }
}

// 3. FUNGSI PUT: Alias koreksi tiket untuk kompatibilitas RESTful client
export async function PUT(request: Request) {
  try {
    const rawBody = await request.json();
    const payloadWithAction = {
      action: 'EDIT_TICKET',
      ...rawBody,
    };

    const forwardedRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(payloadWithAction),
    });

    return POST(forwardedRequest);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Format data PUT tidak valid' },
      { status: 400 }
    );
  }
}
