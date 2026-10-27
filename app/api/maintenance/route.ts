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

// In-Memory Multi-Key Cache untuk Response Payload (TTL: 2 menit per filter)
interface CacheEntry {
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface DaishaRow {
  id: number;
  nomor_daisha: string;
  jenis: string;
  ukuran: string;
  nama_daisha: string;
  seksi: string;
  last_maintenance_date: Date | string | null;
  last_condition: string;
  last_repair_date: Date | string | null;
  last_waktu_masuk: Date | string | null;
  last_waktu_keluar: Date | string | null;
  updated_at: Date | string | null;
}

interface DaishaMasterCache {
  data: DaishaRow[];
  timestamp: number;
}

const globalForMaint = globalThis as unknown as {
  maintenanceCacheMap?: Map<string, CacheEntry>;
  cachedAllDaisha?: DaishaMasterCache | null;
  inFlightMaintenancePromises?: Map<string, Promise<Record<string, unknown>>>;
};

const maintenanceCacheMap = globalForMaint.maintenanceCacheMap ?? new Map<string, CacheEntry>();
globalForMaint.maintenanceCacheMap = maintenanceCacheMap;

const inFlightMaintenancePromises = globalForMaint.inFlightMaintenancePromises ?? new Map<string, Promise<Record<string, unknown>>>();
globalForMaint.inFlightMaintenancePromises = inFlightMaintenancePromises;

const ALL_DAISHA_TTL = 10 * 60 * 1000; // 10 menit
const CACHE_TTL = 2 * 60 * 1000; // 2 menit

export function invalidateMaintenanceCache() {
  maintenanceCacheMap.clear();
  globalForMaint.cachedAllDaisha = null;
  inFlightMaintenancePromises.clear();
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
    const filterSeksi = searchParams.get('seksi'); // 'Building' | 'Bead' | null
    const yearParam = searchParams.get('year');

    const now = new Date();
    const currentYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear();

    const normalizedSeksi =
      !filterSeksi || ['all', 'all seksi', 'semua'].includes(filterSeksi.trim().toLowerCase())
        ? 'all'
        : filterSeksi.trim().toLowerCase();
    const cacheKey = `maint_${currentYear}_${filterJenis || 'all'}_${filterUkuran || 'all'}_${normalizedSeksi}`;
    const cachedEntry = maintenanceCacheMap.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedEntry.payload, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // In-Flight Promise Deduplication: jika ada request concurrent untuk cacheKey yang sama, gunakan promise yang sama
    if (inFlightMaintenancePromises.has(cacheKey)) {
      const sharedResult = await inFlightMaintenancePromises.get(cacheKey)!;
      return NextResponse.json(sharedResult, {
        headers: { 'X-Cache': 'DEDUP' },
      });
    }

    const computePayload = async (): Promise<Record<string, unknown>> => {
      const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const trendDays = 14;
      const trendStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - trendDays, 0, 0, 0, 0);

      // Hitung sisa hari kerja di tahun berjalan
      const workDaysInfo = calculateRemainingWorkDaysInYear(now, true);
      const remainingWorkDays = workDaysInfo.remainingWorkDays;

      // 1. Parallel fetch: Ambil master Daisha dari global memory cache jika ada (< 1ms), hanya query ke DB jika expired
      let allDaisha: DaishaRow[];
      const nowMs = Date.now();
      const cached = globalForMaint.cachedAllDaisha;
      if (cached && nowMs - cached.timestamp < ALL_DAISHA_TTL) {
        allDaisha = cached.data;
      } else {
        allDaisha = await sql<DaishaRow[]>`
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
        `;
        globalForMaint.cachedAllDaisha = {
          data: allDaisha,
          timestamp: nowMs,
        };
      }

      // Query tabel log yang dinamis dan berukuran kecil (< 100 rows, sangat cepat ~30ms)
      const [todayLogs, recentLogs, trendLogRows, conditionRows] = await Promise.all([
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

      // Saring armada Daisha jika ada filter seksi spesifik
      const isAllSeksi =
        !filterSeksi ||
        !filterSeksi.trim() ||
        ['all', 'all seksi', 'semua'].includes(filterSeksi.trim().toLowerCase());

      const targetDaisha = !isAllSeksi
        ? allDaisha.filter(
            (d) => (d.seksi || '').toLowerCase() === filterSeksi.trim().toLowerCase()
          )
        : Array.from(allDaisha);

      const targetUnitIds = new Set(targetDaisha.map((d) => d.id));
      const targetUnitNos = new Set(targetDaisha.map((d) => (d.nomor_daisha || '').toUpperCase()));

      const targetTodayLogs = !isAllSeksi
        ? todayLogs.filter((l) => targetUnitIds.has(l.daisha_id) || targetUnitNos.has((l.nomor_daisha || '').toUpperCase()))
        : todayLogs;

      // 2. Hitung agregasi per kategori
      const summary = {
        totalUnits: targetDaisha.length,
        maintainedUnits: 0,
        unmaintainedUnits: 0,
        percentage: 0,
        remainingWorkDays,
        dailyTarget: 0,
        todayActual: targetTodayLogs.length,
        todayRutin: targetTodayLogs.filter(l => l.jenis_pekerjaan === 'RUTIN').length,
        todayRepair: targetTodayLogs.filter(l => l.jenis_pekerjaan === 'REPAIR').length,
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
      const mappedUnits = targetDaisha.map((u) => {
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

      // 2b. Hitung Sebaran Populasi per Seksi & Daftar Jenis dari SELURUH armada pabrik
      // Penting: Selalu hitung dari allDaisha agar filter dropdown seksi, jenis, dan tabel kepatuhan seksi tidak menghilang ketika user memilih salah 1 seksi!
      const seksiMap = new Map<string, { total: number; maintained: number; unmaintained: number; rusak: number }>();
      const globalJenisSet = new Set<string>();

      for (const u of allDaisha) {
        const s = (u.seksi && u.seksi.trim() && u.seksi.toLowerCase() !== 'all seksi') ? u.seksi.trim() : 'Lainnya';
        if (!seksiMap.has(s)) {
          seksiMap.set(s, { total: 0, maintained: 0, unmaintained: 0, rusak: 0 });
        }
        const entry = seksiMap.get(s)!;
        entry.total++;

        const lastDate = u.last_maintenance_date ? new Date(u.last_maintenance_date) : null;
        const isMaintainedThisYear = lastDate !== null && lastDate >= startOfYear && lastDate <= endOfYear;
        if (isMaintainedThisYear) {
          entry.maintained++;
        } else {
          entry.unmaintained++;
        }
        if (u.last_condition === 'RUSAK') {
          entry.rusak++;
        }

        const j = (u.jenis || '').trim();
        if (j) globalJenisSet.add(j);
      }

      const seksiSummaries = Array.from(seksiMap.entries())
        .map(([seksi, counts]) => ({ seksi, ...counts }))
        .sort((a, b) => b.total - a.total);
      const seksiList = seksiSummaries.map((s) => s.seksi).sort((a, b) => a.localeCompare(b));
      const globalJenisList = Array.from(globalJenisSet).sort((a, b) => a.localeCompare(b));

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

      // Condition Stats selalu dihitung dari seluruh populasi armada targetDaisha
      const okCount = targetDaisha.filter((d) => (d.last_condition || 'OK') !== 'RUSAK').length;
      const rusakCount = targetDaisha.filter((d) => (d.last_condition || 'OK') === 'RUSAK').length;
      const totalCondition = okCount + rusakCount;
      const conditionStats = {
        okCount,
        rusakCount,
        totalCondition,
        okPercentage: totalCondition > 0 ? Number(((okCount / totalCondition) * 100).toFixed(1)) : 100,
        rusakPercentage: totalCondition > 0 ? Number(((rusakCount / totalCondition) * 100).toFixed(1)) : 0,
      };

      const finalRecentLogs = !isAllSeksi
        ? recentLogs.filter((l) => targetUnitIds.has(l.daisha_id) || targetUnitNos.has((l.nomor_daisha || '').toUpperCase()))
        : recentLogs;

      return {
        success: true,
        currentYear,
        summary,
        conditionStats,
        breakdown,
        dailyTrend,
        jenisList: globalJenisList.length > 0 ? globalJenisList : Array.from(jenisSet).sort(),
        seksiList,
        seksiSummaries,
        units: filteredUnits,
        recentLogs: finalRecentLogs,
      };
    };

    const promise = computePayload();
    inFlightMaintenancePromises.set(cacheKey, promise);

    try {
      const responsePayload = await promise;
      maintenanceCacheMap.set(cacheKey, {
        payload: responsePayload,
        timestamp: Date.now(),
      });
      // Batasi ukuran cache map agar memori hemat
      if (maintenanceCacheMap.size > 50) {
        const oldestKey = maintenanceCacheMap.keys().next().value;
        if (oldestKey) maintenanceCacheMap.delete(oldestKey);
      }
      return NextResponse.json(responsePayload, {
        headers: { 'X-Cache': 'MISS' },
      });
    } finally {
      inFlightMaintenancePromises.delete(cacheKey);
    }
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

    if (!jenis) {
      return NextResponse.json({ error: 'Jenis Daisha wajib diisi' }, { status: 400 });
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
      const normalizedUkuran = jenis === 'VERTICAL' ? (ukuran || 'MEDIUM') : 'NONE';
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
