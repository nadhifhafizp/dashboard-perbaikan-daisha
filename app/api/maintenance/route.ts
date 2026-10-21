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

let maintenanceCache: Record<string, unknown> | null = null;
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

    const [allDaisha, todayLogs, recentLogs, trendLogRows, conditionRows] = await Promise.all([
      sql`
        SELECT 
          d.id,
          d.nomor_daisha,
          d.jenis,
          d.ukuran,
          COALESCE(d.nama_daisha, d.jenis) AS nama_daisha,
          COALESCE(d.seksi, 'All seksi') AS seksi,
          d.last_maintenance_date,
          COALESCE(d.last_condition, 'OK') AS last_condition,
          d.last_repair_date,
          d.last_waktu_masuk,
          d.last_waktu_keluar,
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
          COALESCE(l.kondisi, 'OK') AS kondisi,
          l.detail_kerusakan,
          l.tindakan,
          l.waktu_masuk,
          l.waktu_keluar,
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
          COALESCE(l.kondisi, 'OK') AS kondisi,
          l.detail_kerusakan,
          l.tindakan,
          l.waktu_masuk,
          l.waktu_keluar,
          l.tanggal_pengerjaan,
          l.admin_id,
          l.catatan,
          d.jenis,
          d.ukuran
        FROM "MaintenanceLog" l
        LEFT JOIN "Daisha" d ON l.daisha_id = d.id
        ORDER BY l.tanggal_pengerjaan DESC
        LIMIT 50
      `,
      sql`
        SELECT 
          tanggal_pengerjaan,
          jenis_pekerjaan,
          COALESCE(kondisi, 'OK') AS kondisi
        FROM "MaintenanceLog"
        WHERE tanggal_pengerjaan >= ${trendStartDate}
      `,
      sql`
        SELECT 
          COALESCE(kondisi, 'OK') AS kondisi,
          COUNT(*)::int AS count
        FROM "MaintenanceLog"
        WHERE tanggal_pengerjaan >= ${startOfYear} AND tanggal_pengerjaan <= ${endOfYear}
        GROUP BY COALESCE(kondisi, 'OK')
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
    }> = {};

    const jenisSet = new Set<string>();

    // Mapping unit dengan status tahun berjalan
    const mappedUnits = allDaisha.map((u) => {
      const lastDate = u.last_maintenance_date ? new Date(u.last_maintenance_date) : null;
      const isMaintainedThisYear = lastDate !== null && lastDate >= startOfYear && lastDate <= endOfYear;
      
      const jenisClean = u.jenis || 'LAINNYA';
      jenisSet.add(jenisClean);

      let key = jenisClean;
      if (u.ukuran && u.ukuran !== 'NONE') {
        key = `${jenisClean}_${u.ukuran}`;
      }

      if (!breakdown[key]) {
        breakdown[key] = { total: 0, maintained: 0, unmaintained: 0, percentage: 0, dailyTarget: 0, todayActual: 0 };
      }

      breakdown[key].total++;
      if (isMaintainedThisYear) {
        breakdown[key].maintained++;
      } else {
        breakdown[key].unmaintained++;
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
        nama_daisha: u.nama_daisha || u.jenis,
        seksi: u.seksi || 'All seksi',
        ukuran: u.ukuran,
        last_maintenance_date: u.last_maintenance_date,
        last_condition: u.last_condition || 'OK',
        last_repair_date: u.last_repair_date,
        last_waktu_masuk: u.last_waktu_masuk,
        last_waktu_keluar: u.last_waktu_keluar,
        is_maintained: isMaintainedThisYear,
        days_since_last: daysSinceLast,
      };
    });

    // 2b. Hitung Sebaran Populasi per Seksi
    const seksiMap = new Map<string, { total: number; maintained: number; unmaintained: number; rusak: number }>();
    for (const u of mappedUnits) {
      const s = u.seksi || 'Lainnya';
      if (!seksiMap.has(s)) {
        seksiMap.set(s, { total: 0, maintained: 0, unmaintained: 0, rusak: 0 });
      }
      const entry = seksiMap.get(s)!;
      entry.total++;
      if (u.is_maintained) entry.maintained++;
      else entry.unmaintained++;
      if (u.last_condition === 'RUSAK') entry.rusak++;
    }

    const seksiSummaries = Array.from(seksiMap.entries())
      .map(([seksi, counts]) => ({ seksi, ...counts }))
      .sort((a, b) => b.total - a.total);
    const seksiList = seksiSummaries.map((s) => s.seksi);

    // Hitung persentase & target harian untuk summary
    summary.percentage = summary.totalUnits > 0 ? Math.round((summary.maintainedUnits / summary.totalUnits) * 100) : 0;
    summary.dailyTarget = calculateDailyTarget(summary.unmaintainedUnits, remainingWorkDays);

    // Hitung breakdown aktual hari ini & target
    for (const log of todayLogs) {
      const logJenis = log.jenis || 'LAINNYA';
      let key = logJenis;
      if (log.ukuran && log.ukuran !== 'NONE') {
        key = `${logJenis}_${log.ukuran}`;
      }
      if (breakdown[key]) {
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

    // Condition Stats for Current Year
    let okCount = 0;
    let rusakCount = 0;
    conditionRows.forEach((r) => {
      if (r.kondisi === 'OK') okCount += r.count;
      else if (r.kondisi === 'RUSAK') rusakCount += r.count;
      else okCount += r.count;
    });
    const totalCondition = okCount + rusakCount;
    const conditionStats = {
      okCount,
      rusakCount,
      totalCondition,
      okPercentage: totalCondition > 0 ? Math.round((okCount / totalCondition) * 100) : 100,
      rusakPercentage: totalCondition > 0 ? Math.round((rusakCount / totalCondition) * 100) : 0,
    };

    const responsePayload = {
      success: true,
      currentYear,
      summary,
      conditionStats,
      breakdown,
      dailyTrend,
      jenisList: Array.from(jenisSet).sort(),
      seksiList,
      seksiSummaries,
      units: filteredUnits,
      recentLogs,
    };

    maintenanceCache = responsePayload;
    maintenanceCacheKey = cacheKey;
    maintenanceCacheTime = Date.now();

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching maintenance analytics:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data maintenance: ' + errMessage },
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
    const kondisi = sanitizeText(body.kondisi, 20).toUpperCase() || 'OK'; // 'OK' | 'RUSAK'
    const detailKerusakan = sanitizeText(body.detail_kerusakan, 1000);
    const tindakan = sanitizeText(body.tindakan, 50);
    const tanggalPengerjaanStr = sanitizeText(body.tanggal_pengerjaan, 40);
    const waktuMasukStr = sanitizeText(body.waktu_masuk, 40);
    const waktuKeluarStr = sanitizeText(body.waktu_keluar, 40);
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
    const waktuMasuk = waktuMasukStr ? new Date(waktuMasukStr) : tanggalPengerjaan;
    const waktuKeluar = waktuKeluarStr ? new Date(waktuKeluarStr) : tanggalPengerjaan;

    // 1. Cari Daisha di database (atau buat baru jika nomor belum ada di tabel master)
    const daisha = await sql`
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

    // 3. Update Master Daisha last_maintenance_date, timestamps, and condition
    await sql`
      UPDATE "Daisha"
      SET 
        "last_maintenance_date" = ${tanggalPengerjaan},
        "last_condition" = ${kondisi},
        "last_waktu_masuk" = ${waktuMasuk},
        "last_waktu_keluar" = ${waktuKeluar},
        "last_repair_date" = ${kondisi === 'RUSAK' || kategori === 'REPAIR' ? tanggalPengerjaan : sql`"last_repair_date"`},
        "updated_at" = now()
      WHERE id = ${daishaId}
    `;

    // 4. Masukkan ke MaintenanceLog
    const logInsert = await sql`
      INSERT INTO "MaintenanceLog" (
        "daisha_id",
        "nomor_daisha",
        "jenis_pekerjaan",
        "kondisi",
        "detail_kerusakan",
        "tindakan",
        "waktu_masuk",
        "waktu_keluar",
        "tanggal_pengerjaan",
        "admin_id",
        "catatan"
      ) VALUES (
        ${daishaId},
        ${nomorDaisha},
        ${kategori},
        ${kondisi},
        ${detailKerusakan || null},
        ${tindakan || null},
        ${waktuMasuk},
        ${waktuKeluar},
        ${tanggalPengerjaan},
        ${adminId},
        ${catatan || null}
      )
      RETURNING id, nomor_daisha, jenis_pekerjaan, kondisi, tanggal_pengerjaan
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
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('Error saving maintenance entry:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan input maintenance: ' + errMessage },
      { status: 500 }
    );
  }
}
