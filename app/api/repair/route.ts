import { NextResponse } from 'next/server';
import sql from '@/lib/db';
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

export function invalidateRepairCache(): void {
  repairCache = null;
  repairCacheTimestamp = 0;
}

// 1. FUNGSI GET: Membaca data langsung dari PostgreSQL (ADMIN, OPERATOR, & USER_SEKSI)
export async function GET(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION (Admin, Operator, dan User Seksi)
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR', 'USER_SEKSI']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (120 req/menit)
  const rateLimit = checkRateLimit(`repair_get:${auth.ip}`, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan data perbaikan.' }, { status: 429 });
  }

  // 3. FAST CACHE HIT (< 2ms)
  if (repairCache && Date.now() - repairCacheTimestamp < REPAIR_CACHE_TTL_MS) {
    return NextResponse.json(repairCache, {
      headers: {
        'X-Database': 'PostgreSQL-Native',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const tickets = await sql`
      SELECT 
        t."idTiket",
        t."status",
        t."namaPelapor",
        t."noDaisha",
        t."waktuMasuk",
        t."waktuSelesai",
        t."catatan",
        COALESCE(t."items", '[]'::jsonb) AS details,
        d."nama_daisha" AS "namaDaisha",
        d."seksi"
      FROM "Ticket" t
      LEFT JOIN "Daisha" d ON UPPER(t."noDaisha") = UPPER(d."nomor_daisha")
      ORDER BY t."waktuMasuk" DESC
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

    repairCache = formattedData;
    repairCacheTimestamp = Date.now();

    return NextResponse.json(formattedData, {
      headers: {
        'X-Database': 'PostgreSQL-Native',
        'X-Cache': 'MISS',
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

// 2. FUNGSI POST: Create, Update, Delete tiket langsung via postgres.js
export async function POST(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION (Admin, Operator, dan User Seksi)
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR', 'USER_SEKSI']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD LIMIT (Maksimal 512KB)
  const sizeCheck = validatePayloadSize(request, 512 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (60 mutasi/menit)
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

      // Auto-resolve seksi dan namaDaisha dari tabel Daisha
      if (!seksi || !namaDaisha) {
        const [existingDaisha] = await sql`
          SELECT "nama_daisha", "seksi", "jenis", "ukuran" 
          FROM "Daisha" 
          WHERE UPPER("nomor_daisha") = UPPER(${noDaisha})
          LIMIT 1
        `;
        if (existingDaisha) {
          if (!namaDaisha && existingDaisha.nama_daisha) namaDaisha = existingDaisha.nama_daisha;
          if (!seksi && existingDaisha.seksi) seksi = existingDaisha.seksi;
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

      // Pastikan data unit di tabel Daisha terdaftar / terupdate
      // Resolve jenis & ukuran dari DB dulu, baru fallback ke deteksi
      const [existingUnit] = await sql`
        SELECT "jenis", "ukuran" FROM "Daisha"
        WHERE UPPER("nomor_daisha") = UPPER(${noDaisha}) LIMIT 1
      `;
      const sizeInfo = detectDaishaSize(noDaisha);
      const ukuranNorm = (sizeInfo?.size === 'Small' ? 'SMALL' : sizeInfo?.size === 'Medium' ? 'MEDIUM' : sizeInfo?.size === 'Large' ? 'LARGE' : 'NONE');
      const ukuran = existingUnit?.ukuran || ukuranNorm;
      const jenisDefault = noDaisha.toUpperCase().includes('NF') || namaDaisha.toLowerCase().includes('nagara') ? 'NAGARA_FILTER' : 'VERTICAL';
      const jenis = existingUnit?.jenis || jenisDefault;
      await sql`
        INSERT INTO "Daisha" ("nomor_daisha", "nama_daisha", "ukuran", "seksi", "jenis", "last_condition")
        VALUES (${noDaisha}, ${namaDaisha}, ${ukuran}, ${seksi}, ${jenis}, 'RUSAK')
        ON CONFLICT ("nomor_daisha") DO UPDATE 
        SET "nama_daisha" = COALESCE(EXCLUDED."nama_daisha", "Daisha"."nama_daisha"), 
            "seksi" = COALESCE(EXCLUDED."seksi", "Daisha"."seksi"),
            "last_condition" = 'RUSAK'
      `;

      // Parse waktu masuk secara konsisten
      let parsedDateMasuk = new Date();
      if (waktuMasuk) {
        const ts = parseToTimestamp(waktuMasuk);
        if (ts > 0) parsedDateMasuk = new Date(ts);
      }

      // Pecah rincian kerusakan ke items JSONB (atau gunakan template laporan seksi jika tanpa detail)
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

      // Buat Tiket dalam 1 query saja
      await sql`
        INSERT INTO "Ticket" ("idTiket", "noDaisha", "namaPelapor", "status", "waktuMasuk", "catatan", "items")
        VALUES (${idTiket}, ${noDaisha}, ${namaPelapor}, ${targetStatus}, ${parsedDateMasuk}, ${finalCatatan}, ${JSON.stringify(itemsJson)}::jsonb)
      `;

      // Pengurangan stok otomatis untuk komponen Ganti Baru (Projek 3)
      const gantiItems = itemsJson.filter((it) => it.tindakan === 'Ganti');
      await Promise.allSettled(
        gantiItems.map((it) =>
          sql`
            UPDATE "Sparepart"
            SET "stokGudang" = "stokGudang" - ${it.qty || 1}
            WHERE "namaKomponen" = ${it.komponen}
          `.catch((e) => {
            console.warn(`[Sparepart] Komponen '${it.komponen}' tidak ditemukan, skip pengurangan stok:`, e);
          })
        )
      );

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

    // 2.2 UPDATE STATUS & CATATAN (KHUSUS ROLE ADMIN)
    else if (action === 'UPDATE') {
      if (auth.user?.role !== 'ADMIN') {
        recordAuditLog({
          action: 'TICKET_STATUS_UPDATE',
          ip: auth.ip,
          user: auth.user?.username,
          role: auth.user?.role,
          status: 'DENIED',
          details: 'Upaya update status oleh non-admin',
        });
        return NextResponse.json(
          { error: "Akses ditolak. Hanya akun ADMIN yang berhak memperbarui status perbaikan tiket." },
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

      await sql`
        UPDATE "Ticket"
        SET 
          "status" = ${normalizedStatus},
          "waktuSelesai" = ${parsedWaktuSelesai},
          "catatan" = ${catatan && catatan !== '-' ? catatan : null}
        WHERE "idTiket" = ${idTiket}
      `;

      // PRD Modul Maintenance: Sinkronisasi perbaikan selesai -> terhitung riwayat servis & maintenance
      if (normalizedStatus === 'Done') {
        try {
          const tRow = await sql`SELECT "noDaisha", "waktuMasuk" FROM "Ticket" WHERE "idTiket" = ${idTiket} LIMIT 1`;
          if (tRow.length > 0 && tRow[0].noDaisha) {
            const noD = tRow[0].noDaisha.trim();
            const completionDate = parsedWaktuSelesai || new Date();
            const ticketWaktuMasuk = tRow[0].waktuMasuk ? new Date(tRow[0].waktuMasuk) : completionDate;
            const detailKerusakan = body.detail ? sanitizeText(body.detail, 1000) : 'Perbaikan kerusakan di bengkel';
            
            // Cari unit Daisha atau buat baru
            const daishaMatch = await sql`
              SELECT id FROM "Daisha" WHERE UPPER(nomor_daisha) = ${noD.toUpperCase()} LIMIT 1
            `;

            let dId: string;
            if (daishaMatch.length > 0) {
              dId = daishaMatch[0].id;
              await sql`
                UPDATE "Daisha"
                SET 
                  "last_maintenance_date" = ${completionDate},
                  "last_repair_date" = ${completionDate},
                  "last_waktu_masuk" = ${ticketWaktuMasuk},
                  "last_waktu_keluar" = ${completionDate},
                  "last_condition" = 'REPAIR_DONE',
                  "updated_at" = now()
                WHERE id = ${dId}
              `;
            } else {
              const sInfo = detectDaishaSize(noD);
              const ukuranResolved = sInfo?.size === 'Small' ? 'SMALL' : sInfo?.size === 'Medium' ? 'MEDIUM' : sInfo?.size === 'Large' ? 'LARGE' : 'NONE';
              const jenisResolved = noD.toUpperCase().includes('NF') || noD.toUpperCase().includes('FIL') ? 'NAGARA_FILTER' : 'VERTICAL';
              const inserted = await sql`
                INSERT INTO "Daisha" (
                  "nomor_daisha", "jenis", "ukuran", "last_maintenance_date",
                  "last_repair_date", "last_waktu_masuk", "last_waktu_keluar", "last_condition"
                )
                VALUES (
                  ${noD}, ${jenisResolved}, ${ukuranResolved}, ${completionDate},
                  ${completionDate}, ${ticketWaktuMasuk}, ${completionDate}, 'REPAIR_DONE'
                )
                RETURNING id
              `;
              dId = inserted[0].id;
            }

            // Catat log pengerjaan repair terintegrasi
            await sql`
              INSERT INTO "MaintenanceLog" (
                "daisha_id", "nomor_daisha", "jenis_pekerjaan", "kondisi",
                "tanggal_pengerjaan", "waktu_masuk", "waktu_keluar", "detail_kerusakan",
                "admin_id", "catatan"
              ) VALUES (
                ${dId}, ${noD}, 'REPAIR', 'RUSAK',
                ${completionDate}, ${ticketWaktuMasuk}, ${completionDate}, ${detailKerusakan},
                ${auth.user?.name || auth.user?.username || 'Admin'}, ${'Perbaikan selesai via tiket ' + idTiket}
              )
            `;

            invalidateMaintenanceCache();
          }
        } catch (syncErr) {
          console.warn('[Sync Maintenance] Gagal sinkronisasi tiket Done ke modul Maintenance:', syncErr);
        }
      }

      if (body.detail) {
        const detailStr = sanitizeText(body.detail, 2000);
        const parsedDetails = parseTicketDamageDetail(detailStr);
        const itemsJson = parsedDetails.items.map((it, idx) => ({
          idDetail: idx + 1,
          komponen: it.komponen,
          gejala: it.gejala,
          tindakan: it.tindakan || 'Repair',
          qty: it.qty || 1,
        }));
        await sql`
          UPDATE "Ticket"
          SET "items" = ${JSON.stringify(itemsJson)}::jsonb
          WHERE "idTiket" = ${idTiket}
        `;
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

    // 2.3 DELETE / BATALKAN TIKET (KHUSUS ROLE ADMIN — operasi destruktif)
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

      await sql`DELETE FROM "TicketDetail" WHERE "idTiket" = ${idTiket}`;
      await sql`DELETE FROM "Ticket" WHERE "idTiket" = ${idTiket}`;

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

      // Update Daisha — pertahankan jenis & ukuran yang sudah ada di DB
      const [editExisting] = await sql`
        SELECT "jenis", "ukuran" FROM "Daisha"
        WHERE UPPER("nomor_daisha") = UPPER(${noDaisha}) LIMIT 1
      `;
      const sizeInfoEdit = detectDaishaSize(noDaisha);
      const ukuranEdit = editExisting?.ukuran || (sizeInfoEdit?.size === 'Small' ? 'SMALL' : sizeInfoEdit?.size === 'Medium' ? 'MEDIUM' : sizeInfoEdit?.size === 'Large' ? 'LARGE' : 'NONE');
      const jenisEdit = editExisting?.jenis || (noDaisha.toUpperCase().includes('NF') || namaDaisha.toLowerCase().includes('nagara') ? 'NAGARA_FILTER' : 'VERTICAL');
      await sql`
        INSERT INTO "Daisha" ("nomor_daisha", "nama_daisha", "ukuran", "seksi", "jenis")
        VALUES (${noDaisha}, ${namaDaisha}, ${ukuranEdit}, ${seksi}, ${jenisEdit})
        ON CONFLICT ("nomor_daisha") DO UPDATE 
        SET "nama_daisha" = EXCLUDED."nama_daisha", "seksi" = EXCLUDED."seksi"
      `;

      // Update Ticket
      const waktuMasukRaw = sanitizeText(body.waktuMasuk, 30);
      let parsedWaktuMasuk: Date | null = null;
      if (waktuMasukRaw && waktuMasukRaw !== '-') {
        const d = new Date(waktuMasukRaw);
        if (!isNaN(d.getTime())) parsedWaktuMasuk = d;
      }

      await sql`
        UPDATE "Ticket"
        SET 
          "noDaisha" = ${noDaisha},
          "namaPelapor" = ${namaPelapor || auth.user?.name || 'Operator'},
          "waktuMasuk" = COALESCE(${parsedWaktuMasuk}, "waktuMasuk")
        WHERE "idTiket" = ${idTiket}
      `;

      // Update Rincian Kerusakan
      await sql`DELETE FROM "TicketDetail" WHERE "idTiket" = ${idTiket}`;
      const parsedDetails = parseTicketDamageDetail(detail);
      if (parsedDetails.items.length > 0) {
        await sql`
          INSERT INTO "TicketDetail" ("idTiket", "komponen", "gejala", "tindakan", "qty")
          VALUES ${sql(parsedDetails.items.map(it => [idTiket, it.komponen, it.gejala, it.tindakan || 'Repair', it.qty || 1]))}
        `;
      }

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
    console.error("Database POST Error:", error);
    recordAuditLog({
      action: 'TICKET_POST_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: error instanceof Error ? error.message : 'Internal Server Error',
    });
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server database" },
      { status: 500 }
    );
  }
}