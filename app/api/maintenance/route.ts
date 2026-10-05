import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import {
  calculateRemainingWorkDaysInYear,
  calculateDailyTarget,
  formatDateKey,
} from '@/lib/maintenanceWorkdays';
import {
  requireAuth,
  sanitizeText,
} from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let maintenanceCache: any = null;
let maintenanceCacheKey: string = '';
let maintenanceCacheTime: number = 0;

export function invalidateMaintenanceCache() {
  maintenanceCache = null;
  maintenanceCacheKey = '';
  maintenanceCacheTime = 0;
}

/**
 * GET /api/maintenance
 * Mengambil analitik target vs aktual, persentase status tahunan,
 * grid mapping Daisha Vertical (Small, Medium, Large), serta Daisha Nagara Filter.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterJenis = searchParams.get('jenis'); // 'VERTICAL' | 'NAGARA_FILTER' | null
    const filterUkuran = searchParams.get('ukuran'); // 'SMALL' | 'MEDIUM' | 'LARGE' | null
    const yearParam = searchParams.get('year');

    const now = new Date();
    const currentYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Hitung sisa hari kerja di tahun berjalan
    const workDaysInfo = calculateRemainingWorkDaysInYear(now, true);
    const remainingWorkDays = workDaysInfo.remainingWorkDays;

    // Fast in-memory cache hit (5 detik)
    const cacheKey = `maint_${currentYear}_${filterJenis || 'all'}_${filterUkuran || 'all'}`;
    if (maintenanceCache && maintenanceCacheKey === cacheKey && Date.now() - maintenanceCacheTime < 5000) {
      return NextResponse.json(maintenanceCache, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // 1. Parallel fetch: Jalankan seluruh query database sekaligus dalam 1 roundtrip
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const trendDays = 14;
    const trendStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (trendDays - 1), 0, 0, 0, 0);

    const [allDaisha, todayLogs, recentLogs, trendLogRows] = await Promise.all([
      sql`
        SELECT 
          d.id,
          d.nomor_daisha,
          d.jenis,
          d.ukuran,
          d.last_maintenance_date,
          d.updated_at
        FROM "Daisha" d
        ORDER BY 
          d.jenis ASC,
          d.ukuran ASC,
          d.nomor_daisha ASC
      `,
      sql`
        SELECT 
          l.id,
          l.daisha_id,
          l.nomor_daisha,
          l.jenis_pekerjaan,
          l.tanggal_pengerjaan,
          l.admin_id,
          l.catatan,
          d.jenis,
          d.ukuran
        FROM "MaintenanceLog" l
        LEFT JOIN "Daisha" d ON l.daisha_id = d.id
        WHERE l.tanggal_pengerjaan >= ${startOfToday} AND l.tanggal_pengerjaan <= ${endOfToday}
      `,
      sql`
        SELECT 
          l.id,
          l.daisha_id,
          l.nomor_daisha,
          l.jenis_pekerjaan,
          l.tanggal_pengerjaan,
          l.admin_id,
          l.catatan,
          d.jenis,
          d.ukuran
        FROM "MaintenanceLog" l
        LEFT JOIN "Daisha" d ON l.daisha_id = d.id
        ORDER BY l.tanggal_pengerjaan DESC
        LIMIT 30
      `,
      sql`
        SELECT 
          tanggal_pengerjaan,
          jenis_pekerjaan
        FROM "MaintenanceLog"
        WHERE tanggal_pengerjaan >= ${trendStartDate}
      `,
    ]);

    // 2. Hitung agregasi per kategori
    const summary = {
      totalUnits: allDaisha.length,
      maintainedUnits: 0,
      unmaintainedUnits: 0,
      percentage: 0,
      remainingWorkDays,
      dailyTarget: 0,
      todayActual: todayLogs.length,
      todayRutin: todayLogs.filter(l => l.jenis_pekerjaan === 'RUTIN').length,
      todayRepair: todayLogs.filter(l => l.jenis_pekerjaan === 'REPAIR').length,
    };

    const breakdown: Record<string, {
      total: number;
      maintained: number;
      unmaintained: number;
      percentage: number;
      dailyTarget: number;
      todayActual: number;
    }> = {
      'VERTICAL_SMALL': { total: 0, maintained: 0, unmaintained: 0, percentage: 0, dailyTarget: 0, todayActual: 0 },
      'VERTICAL_MEDIUM': { total: 0, maintained: 0, unmaintained: 0, percentage: 0, dailyTarget: 0, todayActual: 0 },
      'VERTICAL_LARGE': { total: 0, maintained: 0, unmaintained: 0, percentage: 0, dailyTarget: 0, todayActual: 0 },
      'NAGARA_FILTER': { total: 0, maintained: 0, unmaintained: 0, percentage: 0, dailyTarget: 0, todayActual: 0 },
    };

    // Mapping unit dengan status tahun berjalan
    const mappedUnits = allDaisha.map((u) => {
      const lastDate = u.last_maintenance_date ? new Date(u.last_maintenance_date) : null;
      const isMaintainedThisYear = lastDate !== null && lastDate >= startOfYear && lastDate <= endOfYear;
      
      let key = '';
      if (u.jenis === 'VERTICAL') {
        key = `VERTICAL_${u.ukuran}`;
      } else if (u.jenis === 'NAGARA_FILTER') {
        key = 'NAGARA_FILTER';
      }

      if (key && breakdown[key]) {
        breakdown[key].total++;
        if (isMaintainedThisYear) {
          breakdown[key].maintained++;
        } else {
          breakdown[key].unmaintained++;
        }
      }

      if (isMaintainedThisYear) {
        summary.maintainedUnits++;
      } else {
        summary.unmaintainedUnits++;
      }

      // Hitung hari sejak maintenance terakhir
      const daysSinceLast = lastDate ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

      // Ekstrak nomor urut numerik (contoh "S-045" -> 45)
      const numMatch = u.nomor_daisha.match(/\d+/);
      const serialNumber = numMatch ? parseInt(numMatch[0], 10) : 0;

      return {
        id: u.id,
        nomor_daisha: u.nomor_daisha,
        serial_number: serialNumber,
        jenis: u.jenis,
        ukuran: u.ukuran,
        last_maintenance_date: u.last_maintenance_date,
        is_maintained: isMaintainedThisYear,
        days_since_last: daysSinceLast,
      };
    });

    // Hitung persentase & target harian untuk summary
    summary.percentage = summary.totalUnits > 0 ? Math.round((summary.maintainedUnits / summary.totalUnits) * 100) : 0;
    summary.dailyTarget = calculateDailyTarget(summary.unmaintainedUnits, remainingWorkDays);

    // Hitung breakdown aktual hari ini & target
    for (const log of todayLogs) {
      let key = '';
      if (log.jenis === 'VERTICAL') {
        key = `VERTICAL_${log.ukuran}`;
      } else if (log.jenis === 'NAGARA_FILTER') {
        key = 'NAGARA_FILTER';
      }
      if (key && breakdown[key]) {
        breakdown[key].todayActual++;
      }
    }

    for (const key of Object.keys(breakdown)) {
      const b = breakdown[key];
      b.percentage = b.total > 0 ? Math.round((b.maintained / b.total) * 100) : 0;
      b.dailyTarget = calculateDailyTarget(b.unmaintained, remainingWorkDays);
    }

    // 3. Agregasi tren 14 hari di memori JS (Super Cepat < 1ms)
    const trendMap = new Map<string, { rutin: number; repair: number }>();
    for (const row of trendLogRows) {
      const dKey = formatDateKey(new Date(row.tanggal_pengerjaan));
      if (!trendMap.has(dKey)) {
        trendMap.set(dKey, { rutin: 0, repair: 0 });
      }
      const entry = trendMap.get(dKey)!;
      if (row.jenis_pekerjaan === 'RUTIN') entry.rutin++;
      else if (row.jenis_pekerjaan === 'REPAIR') entry.repair++;
    }

    const dailyTrend = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
      const dKey = formatDateKey(targetDate);
      const counts = trendMap.get(dKey) || { rutin: 0, repair: 0 };
      const actualCount = counts.rutin + counts.repair;

      const dateLabel = targetDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });

      dailyTrend.push({
        date: dKey,
        dateLabel,
        isWeekend,
        target: isWeekend ? 0 : summary.dailyTarget,
        actual: actualCount,
        rutin: counts.rutin,
        repair: counts.repair,
      });
    }

    // Filter units jika ada parameter query
    let filteredUnits = mappedUnits;
    if (filterJenis) {
      filteredUnits = filteredUnits.filter((u) => u.jenis === filterJenis);
    }
    if (filterUkuran) {
      filteredUnits = filteredUnits.filter((u) => u.ukuran === filterUkuran);
    }

    const responsePayload = {
      success: true,
      currentYear,
      summary,
      breakdown,
      dailyTrend,
      units: filteredUnits,
      recentLogs,
    };

    maintenanceCache = responsePayload;
    maintenanceCacheKey = cacheKey;
    maintenanceCacheTime = Date.now();

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Error fetching maintenance analytics:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data maintenance: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maintenance
 * Mencatat penyelesaian maintenance atau repair.
 * Menyediakan:
 * - Smart Validation: Cek 30 hari terakhir. Jika ada, warning message dikembalikan jika belum di-bypass.
 * - Sinkronisasi otomatis ke data Master Daisha (last_maintenance_date diperbarui ke tanggal pengerjaan).
 * - Sinkronisasi ke Ticket: jika kategori = REPAIR dan ada tiket berstatus Open/Progress untuk noDaisha ini, otomatis ditandai Done.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ['ADMIN', 'OPERATOR']);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await request.json();
    const nomorDaisha = sanitizeText(body.nomor_daisha, 50).trim();
    const jenis = sanitizeText(body.jenis, 30).toUpperCase();
    const ukuran = sanitizeText(body.ukuran, 20).toUpperCase();
    const kategori = sanitizeText(body.kategori, 20).toUpperCase(); // 'RUTIN' | 'REPAIR'
    const tanggalPengerjaanStr = sanitizeText(body.tanggal_pengerjaan, 40);
    const catatan = sanitizeText(body.catatan, 500);
    const adminId = sanitizeText(body.admin_id, 100) || auth.user?.name || auth.user?.username || 'Admin';
    const bypassWarning = Boolean(body.bypass_warning);

    if (!nomorDaisha) {
      return NextResponse.json({ error: 'Nomor Daisha wajib diisi' }, { status: 400 });
    }

    if (!['VERTICAL', 'NAGARA_FILTER'].includes(jenis)) {
      return NextResponse.json({ error: 'Jenis Daisha harus VERTICAL atau NAGARA_FILTER' }, { status: 400 });
    }

    if (!['RUTIN', 'REPAIR'].includes(kategori)) {
      return NextResponse.json({ error: 'Kategori harus RUTIN atau REPAIR' }, { status: 400 });
    }

    const tanggalPengerjaan = tanggalPengerjaanStr ? new Date(tanggalPengerjaanStr) : new Date();
    if (isNaN(tanggalPengerjaan.getTime())) {
      return NextResponse.json({ error: 'Format tanggal pengerjaan tidak valid' }, { status: 400 });
    }

    // 1. Cari Daisha di database (atau buat baru jika nomor belum ada di tabel master)
    let daisha = await sql`
      SELECT id, nomor_daisha, jenis, ukuran, last_maintenance_date
      FROM "Daisha"
      WHERE UPPER(nomor_daisha) = ${nomorDaisha.toUpperCase()}
      LIMIT 1
    `;

    let daishaId: string;
    let lastMaintenanceDate: Date | null = null;

    if (daisha.length === 0) {
      // Buat master Daisha baru jika belum ada
      const normalizedUkuran = jenis === 'NAGARA_FILTER' ? 'NONE' : (ukuran || 'MEDIUM');
      const insertResult = await sql`
        INSERT INTO "Daisha" ("nomor_daisha", "jenis", "ukuran", "last_maintenance_date")
        VALUES (${nomorDaisha}, ${jenis}, ${normalizedUkuran}, ${tanggalPengerjaan})
        RETURNING id, nomor_daisha, jenis, ukuran, last_maintenance_date
      `;
      daishaId = insertResult[0].id;
    } else {
      daishaId = daisha[0].id;
      lastMaintenanceDate = daisha[0].last_maintenance_date ? new Date(daisha[0].last_maintenance_date) : null;
    }

    // 2. SMART VALIDATION & WARNING SYSTEM
    // "Jika nomor tersebut baru saja di-maintenance atau diperbaiki dalam rentang waktu yang terlalu dekat (misal: dalam 30 hari terakhir)"
    if (lastMaintenanceDate && !bypassWarning) {
      const diffMs = Math.abs(tanggalPengerjaan.getTime() - lastMaintenanceDate.getTime());
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        const formattedDate = lastMaintenanceDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        // Ambil log terakhir untuk keterangan tambahan
        const lastLog = await sql`
          SELECT jenis_pekerjaan, tanggal_pengerjaan, admin_id, catatan
          FROM "MaintenanceLog"
          WHERE daisha_id = ${daishaId}
          ORDER BY tanggal_pengerjaan DESC
          LIMIT 1
        `;

        const jobTypeStr = lastLog.length > 0 && lastLog[0].jenis_pekerjaan === 'REPAIR' ? 'perbaikan (repair)' : 'maintenance rutin';

        return NextResponse.json({
          warning: true,
          requireConfirmation: true,
          nomorDaisha,
          lastDate: formattedDate,
          daysAgo: diffDays,
          lastJobType: jobTypeStr,
          message: `Peringatan: Daisha nomor [${nomorDaisha}] ini sudah mengalami ${jobTypeStr} pada periode [${formattedDate}] (${diffDays} hari yang lalu). Lanjutkan input?`,
        }, { status: 409 });
      }
    }

    // 3. Update Master Daisha last_maintenance_date
    await sql`
      UPDATE "Daisha"
      SET 
        "last_maintenance_date" = ${tanggalPengerjaan},
        "updated_at" = now()
      WHERE id = ${daishaId}
    `;

    // 4. Masukkan ke MaintenanceLog
    const logInsert = await sql`
      INSERT INTO "MaintenanceLog" (
        "daisha_id",
        "nomor_daisha",
        "jenis_pekerjaan",
        "tanggal_pengerjaan",
        "admin_id",
        "catatan"
      ) VALUES (
        ${daishaId},
        ${nomorDaisha},
        ${kategori},
        ${tanggalPengerjaan},
        ${adminId},
        ${catatan || null}
      )
      RETURNING id, nomor_daisha, jenis_pekerjaan, tanggal_pengerjaan
    `;

    // 5. Sinkronisasi dengan modul Repair:
    // Jika Kategori Repair Rusak, periksa apakah ada tiket yang masih open/progress di tabel Ticket untuk nomor Daisha ini
    let syncedTicketId: string | null = null;
    if (kategori === 'REPAIR') {
      const openTicket = await sql`
        SELECT "idTiket", "status"
        FROM "Ticket"
        WHERE "noDaisha" ILIKE ${'%' + nomorDaisha + '%'} AND "status" != 'Done' AND "status" != 'Scrap'
        ORDER BY "waktuMasuk" DESC
        LIMIT 1
      `;

      if (openTicket.length > 0) {
        syncedTicketId = openTicket[0].idTiket;
        await sql`
          UPDATE "Ticket"
          SET 
            "status" = 'Done',
            "waktuSelesai" = ${tanggalPengerjaan},
            "catatan" = COALESCE("catatan", '') || ' [Diselesaikan otomatis via Modul Maintenance Daisha]'
          WHERE "idTiket" = ${syncedTicketId}
        `;
      }
    }

    invalidateMaintenanceCache();

    return NextResponse.json({
      success: true,
      message: `Pencatatan ${kategori === 'REPAIR' ? 'perbaikan' : 'maintenance'} untuk Daisha [${nomorDaisha}] berhasil disimpan.`,
      log: logInsert[0],
      syncedTicketId,
    });
  } catch (error: any) {
    console.error('Error saving maintenance entry:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan input maintenance: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
