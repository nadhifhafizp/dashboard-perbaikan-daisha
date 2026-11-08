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
import {
  DAFTAR_SEKSI,
  DAFTAR_SEMUA_DAISHA,
  DAFTAR_PM_DAISHA,
  isPmEligibleDaisha,
  getCanonicalPmJenis,
} from '@/lib/masterData';

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
    const includeAllUnits = searchParams.get('allUnits') === 'true';

    const now = new Date();
    const currentYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear();

    const normalizedSeksi =
      !filterSeksi || ['all', 'all seksi', 'semua'].includes(filterSeksi.trim().toLowerCase())
        ? 'all'
        : filterSeksi.trim().toLowerCase();
    
    // Selalu bypass cache jika diminta armada penuh (KPI Jumlah Daisha) atau ada timestamp _t
    const bypassCache =
      includeAllUnits ||
      searchParams.has('_t') ||
      searchParams.has('nocache') ||
      searchParams.has('t');

    const cacheKey = `maint_${currentYear}_${filterJenis || 'all'}_${filterUkuran || 'all'}_${normalizedSeksi}_${includeAllUnits ? 'all' : 'pm'}`;
    
    if (!bypassCache) {
      const cachedEntry = maintenanceCacheMap.get(cacheKey);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        return NextResponse.json(cachedEntry.payload, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        });
      }
    }

    // In-Flight Promise Deduplication: jika ada request concurrent untuk cacheKey yang sama, gunakan promise yang sama
    if (!bypassCache && inFlightMaintenancePromises.has(cacheKey)) {
      const sharedResult = await inFlightMaintenancePromises.get(cacheKey)!;
      return NextResponse.json(sharedResult, {
        headers: {
          'X-Cache': 'DEDUP',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    const computePayload = async (): Promise<Record<string, unknown>> => {
      const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      // Siklus PM Daisha resmi dimulai per 1 Oktober (Oktober tahun berjalan)
      const startOfPmPeriod = new Date(currentYear, 9, 1, 0, 0, 0, 0);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const trendDays = 14;
      const trendStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - trendDays, 0, 0, 0, 0);

      // Hitung sisa hari kerja di tahun berjalan
      const workDaysInfo = calculateRemainingWorkDaysInYear(now, true);
      const remainingWorkDays = workDaysInfo.remainingWorkDays;

      // Ambil master daisha dari DB langsung jika bypassCache (selalu segar untuk KPI Armada)
      let allDaisha: DaishaRow[];
      const nowMs = Date.now();
      const cached = globalForMaint.cachedAllDaisha;
      if (!bypassCache && cached && nowMs - cached.timestamp < ALL_DAISHA_TTL) {
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

      // Query tabel log, master katalog, dan tiket aktif secara paralel (Sangat cepat < 35ms)
      const [todayLogs, recentLogs, trendLogRows, conditionRows, catalogRows, activeTicketRows] = await Promise.all([
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
          WHERE tanggal_pengerjaan >= ${startOfPmPeriod} AND tanggal_pengerjaan <= ${endOfYear}
          GROUP BY COALESCE(kondisi, 'OK')
        `,
        sql<Array<{
          id: number;
          name: string;
          seksi: string;
          codePrefix: string | null;
          totalUnits: number | null;
          components: unknown;
          variants: unknown;
        }>>`
          SELECT 
            id, 
            name, 
            seksi, 
            "codePrefix",
            COALESCE("totalUnits", 0)::int as "totalUnits", 
            COALESCE(components, '[]'::jsonb) as components,
            COALESCE(variants, '[]'::jsonb) as variants
          FROM "DaishaCatalog"
          ORDER BY name ASC
        `,
        sql<Array<{ noDaisha: string }>>`
          SELECT DISTINCT UPPER(TRIM("noDaisha")) as "noDaisha"
          FROM "Ticket"
          WHERE status IN ('Open', 'Progress', 'Pending')
            AND "noDaisha" IS NOT NULL
            AND "noDaisha" != '-'
        `,
      ]);

      // Sinkronisasi status kondisi unit dengan tiket perbaikan aktif di workshop
      // Menjamin tidak ada unit hantu / orphan condition yang berbeda antara workshop & KPI
      const activeRepairNoSet = new Set(
        activeTicketRows.map((r) => r.noDaisha.replace(/[\s\-_]+/g, ''))
      );

      for (const d of allDaisha) {
        const norm = (d.nomor_daisha || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
        if (activeRepairNoSet.has(norm)) {
          d.last_condition = 'RUSAK';
        } else if (d.last_condition !== 'SCRAP') {
          d.last_condition = 'OK';
        }
      }

      // Agregasi statistik resmi dari DaishaCatalog (Registri Daisha)
      const catalogSeksiMap = new Map<string, number>();
      const catalogJenisSet = new Set<string>();
      let catalogTotalAllUnits = 0;

      // Statistik khusus 6 armada PM resmi
      const pmCatalogSeksiMap = new Map<string, number>();
      let pmCatalogTotalUnits = 0;

      for (const cat of catalogRows) {
        const s = (cat.seksi && cat.seksi.trim()) ? cat.seksi.trim() : 'Building';
        let units = Number(cat.totalUnits) || 0;
        const variants = Array.isArray(cat.variants) ? (cat.variants as Array<Record<string, unknown>>) : [];
        if (variants.length > 0) {
          const vSum = variants.reduce((acc, v) => {
            const vUnits = Number(v.totalUnits) || 0;
            const minNum = Number(v.minNumber) || 1;
            const maxNum = Number(v.maxNumber) || (minNum + vUnits - 1);
            return acc + (vUnits > 0 ? vUnits : (maxNum >= minNum ? maxNum - minNum + 1 : 0));
          }, 0);
          if (vSum > 0) units = vSum;
        }

        catalogSeksiMap.set(s, (catalogSeksiMap.get(s) || 0) + units);
        catalogTotalAllUnits += units;
        if (cat.name && cat.name.trim()) {
          catalogJenisSet.add(cat.name.trim());
          if (isPmEligibleDaisha(cat.name)) {
            pmCatalogSeksiMap.set(s, (pmCatalogSeksiMap.get(s) || 0) + units);
            pmCatalogTotalUnits += units;
          }
        }
      }

      // Saring armada Daisha jika ada filter seksi spesifik
      const isAllSeksi =
        !filterSeksi ||
        !filterSeksi.trim() ||
        ['all', 'all seksi', 'semua'].includes(filterSeksi.trim().toLowerCase());

      // targetDaisha: armada seluruh pabrik sesuai filter seksi
      const targetAllDaisha = !isAllSeksi
        ? allDaisha.filter(
            (d) => (d.seksi || '').toLowerCase() === filterSeksi.trim().toLowerCase()
          )
        : Array.from(allDaisha);

      // targetPmDaisha: KHUSUS FITUR PM - HANYA 6 JENIS DAISHA RESMI
      const targetPmDaisha = targetAllDaisha.filter((d) =>
        isPmEligibleDaisha(d.jenis || d.nama_daisha)
      );

      const targetPmUnitIds = new Set(targetPmDaisha.map((d) => d.id));
      const targetPmUnitNos = new Set(targetPmDaisha.map((d) => (d.nomor_daisha || '').toUpperCase()));

      const targetTodayLogs = todayLogs.filter(
        (l) =>
          targetPmUnitIds.has(l.daisha_id) ||
          targetPmUnitNos.has((l.nomor_daisha || '').toUpperCase()) ||
          isPmEligibleDaisha(l.jenis)
      );

      // Tentukan angka total populasi resmi PM yang mengacu ke DaishaCatalog
      let officialPmUnits = targetPmDaisha.length;
      if (isAllSeksi) {
        officialPmUnits = pmCatalogTotalUnits > 0 ? pmCatalogTotalUnits : targetPmDaisha.length;
      } else {
        const matchedKey = Array.from(pmCatalogSeksiMap.keys()).find(
          (k) => k.toLowerCase() === filterSeksi.trim().toLowerCase()
        );
        if (matchedKey && pmCatalogSeksiMap.has(matchedKey)) {
          officialPmUnits = pmCatalogSeksiMap.get(matchedKey)!;
        }
      }

      // 2. Hitung agregasi per kategori KHUSUS PM
      const summary = {
        totalUnits: officialPmUnits,
        maintainedUnits: 0,
        unmaintainedUnits: 0,
        percentage: 0,
        remainingWorkDays,
        dailyTarget: 0,
        todayActual: targetTodayLogs.length,
        todayRutin: targetTodayLogs.filter((l) => l.jenis_pekerjaan === 'RUTIN').length,
        todayRepair: targetTodayLogs.filter((l) => l.jenis_pekerjaan === 'REPAIR').length,
      };

      const breakdown: Record<string, {
        total: number;
        maintained: number;
        unmaintained: number;
        percentage: number;
        dailyTarget: number;
        todayActual: number;
      }> = {};

      // Mapping unit PM dengan status tahun berjalan
      const mappedPmUnits = targetPmDaisha.map((u) => {
        const lastMaint = u.last_maintenance_date ? new Date(u.last_maintenance_date) : null;
        const lastRepair = u.last_repair_date ? new Date(u.last_repair_date) : null;
        const effectiveLastDate = (lastMaint && lastRepair)
          ? (lastMaint > lastRepair ? lastMaint : lastRepair)
          : (lastMaint || lastRepair);
        const isMaintainedThisYear = effectiveLastDate !== null && effectiveLastDate >= startOfPmPeriod && effectiveLastDate <= endOfYear;
        
        const canonicalJenis = getCanonicalPmJenis(u.jenis);

        let key = canonicalJenis;
        if (u.ukuran && u.ukuran !== 'NONE') {
          key = `${canonicalJenis}_${u.ukuran}`;
        }

        if (!breakdown[key]) {
          breakdown[key] = { total: 0, maintained: 0, unmaintained: 0, percentage: 0, dailyTarget: 0, todayActual: 0 };
        }

        breakdown[key].total++;
        if (isMaintainedThisYear) {
          breakdown[key].maintained++;
          summary.maintainedUnits++;
        } else {
          breakdown[key].unmaintained++;
          summary.unmaintainedUnits++;
        }

        const daysSinceLast = effectiveLastDate ? Math.floor((now.getTime() - effectiveLastDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const numMatch = u.nomor_daisha.match(/\d+/);
        const serialNumber = numMatch ? parseInt(numMatch[0], 10) : 0;

        return {
          id: u.id,
          nomor_daisha: u.nomor_daisha,
          serial_number: serialNumber,
          jenis: canonicalJenis,
          nama_daisha: u.nama_daisha || canonicalJenis,
          seksi: u.seksi || 'All seksi',
          ukuran: u.ukuran,
          last_maintenance_date: effectiveLastDate ? effectiveLastDate.toISOString() : null,
          last_condition: u.last_condition || 'OK',
          last_repair_date: u.last_repair_date,
          last_waktu_masuk: u.last_waktu_masuk,
          last_waktu_keluar: u.last_waktu_keluar,
          is_maintained: isMaintainedThisYear,
          days_since_last: daysSinceLast,
        };
      });

      // Mapping seluruh armada pabrik (hanya jika diminta spesifik oleh modul KPI Jumlah Daisha)
      const mappedAllUnits = includeAllUnits
        ? targetAllDaisha.map((u) => {
            const canonicalNama = u.nama_daisha && u.nama_daisha !== 'VERTICAL' ? u.nama_daisha : (u.jenis || 'Daisha');
            return {
              id: u.id,
              nomor_daisha: u.nomor_daisha,
              jenis: canonicalNama,
              nama_daisha: canonicalNama,
              seksi: u.seksi || 'All seksi',
              ukuran: u.ukuran,
              last_condition: u.last_condition || 'OK',
            };
          })
        : [];

      // Sebaran Populasi Seksi KHUSUS PM (Building, Cutt/Cal, Extruding)
      const pmSeksiMap = new Map<string, { total: number; maintained: number; unmaintained: number; rusak: number }>();
      for (const u of targetPmDaisha) {
        const s = (u.seksi && u.seksi.trim() && u.seksi.toLowerCase() !== 'all seksi') ? u.seksi.trim() : 'Lainnya';
        if (!pmSeksiMap.has(s)) {
          pmSeksiMap.set(s, { total: 0, maintained: 0, unmaintained: 0, rusak: 0 });
        }
        const entry = pmSeksiMap.get(s)!;
        entry.total++;

        const lastMaint = u.last_maintenance_date ? new Date(u.last_maintenance_date) : null;
        const lastRepair = u.last_repair_date ? new Date(u.last_repair_date) : null;
        const effectiveLastDate = (lastMaint && lastRepair)
          ? (lastMaint > lastRepair ? lastMaint : lastRepair)
          : (lastMaint || lastRepair);
        const isMaintainedThisYear = effectiveLastDate !== null && effectiveLastDate >= startOfPmPeriod && effectiveLastDate <= endOfYear;
        if (isMaintainedThisYear) {
          entry.maintained++;
        } else {
          entry.unmaintained++;
        }
        if (u.last_condition === 'RUSAK') {
          entry.rusak++;
        }
      }

      // Daftar Seksi yang memiliki armada PM resmi
      const pmSeksiList = ['Building', 'Cutt/Cal', 'Extruding'];
      const seksiSummaries = pmSeksiList
        .map((seksiName) => {
          const counts = pmSeksiMap.get(seksiName) || { total: 0, maintained: 0, unmaintained: 0, rusak: 0 };
          const officialTotal = pmCatalogSeksiMap.get(seksiName) ?? counts.total;
          return {
            seksi: seksiName,
            total: officialTotal,
            maintained: counts.maintained,
            unmaintained: Math.max(0, officialTotal - counts.maintained),
            rusak: counts.rusak,
          };
        })
        .sort((a, b) => b.total - a.total);

      // Hitung persentase & target harian untuk summary PM
      summary.unmaintainedUnits = Math.max(0, summary.totalUnits - summary.maintainedUnits);
      summary.percentage = summary.totalUnits > 0 ? Math.round((summary.maintainedUnits / summary.totalUnits) * 100) : 0;
      summary.dailyTarget = calculateDailyTarget(summary.unmaintainedUnits, remainingWorkDays);

      // Hitung breakdown aktual hari ini & target
      for (const log of targetTodayLogs) {
        const canonical = getCanonicalPmJenis(log.jenis);
        let key = canonical;
        if (log.ukuran && log.ukuran !== 'NONE') {
          key = `${canonical}_${log.ukuran}`;
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

      // 3. Agregasi tren 14 hari di memori JS
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
      let filteredPmUnits = mappedPmUnits;
      if (filterJenis) {
        filteredPmUnits = filteredPmUnits.filter(
          (u) =>
            u.jenis.toLowerCase() === filterJenis.toLowerCase() ||
            (filterJenis === 'VERTICAL' && u.jenis === 'Vertical') ||
            (filterJenis === 'NAGARA_FILTER' && u.jenis === 'A-Truck Nagara Filler')
        );
      }
      if (filterUkuran) {
        filteredPmUnits = filteredPmUnits.filter((u) => u.ukuran === filterUkuran);
      }

      // Condition Stats dihitung dari armada targetPmDaisha
      const okCount = targetPmDaisha.filter((d) => (d.last_condition || 'OK') !== 'RUSAK').length;
      const rusakCount = targetPmDaisha.filter((d) => (d.last_condition || 'OK') === 'RUSAK').length;
      const totalCondition = okCount + rusakCount;
      const conditionStats = {
        okCount,
        rusakCount,
        totalCondition,
        okPercentage: totalCondition > 0 ? Number(((okCount / totalCondition) * 100).toFixed(1)) : 100,
        rusakPercentage: totalCondition > 0 ? Number(((rusakCount / totalCondition) * 100).toFixed(1)) : 0,
      };

      const finalRecentLogs = !isAllSeksi
        ? recentLogs.filter((l) => targetPmUnitIds.has(l.daisha_id) || targetPmUnitNos.has((l.nomor_daisha || '').toUpperCase()))
        : recentLogs;

      const pmJenisList = [...DAFTAR_PM_DAISHA];

      return {
        success: true,
        currentYear,
        summary,
        conditionStats,
        breakdown,
        dailyTrend,
        jenisList: pmJenisList,
        seksiList: pmSeksiList,
        seksiSummaries,
        catalogStats: {
          totalAllUnits: catalogTotalAllUnits,
          totalPmUnits: pmCatalogTotalUnits,
          bySeksi: Object.fromEntries(catalogSeksiMap),
          pmBySeksi: Object.fromEntries(pmCatalogSeksiMap),
          catalogs: catalogRows.map((cat) => ({
            id: cat.id,
            name: cat.name,
            seksi: cat.seksi,
            codePrefix: cat.codePrefix,
            totalUnits: Number(cat.totalUnits) || 0,
            components: Array.isArray(cat.components) ? cat.components : [],
            variants: Array.isArray(cat.variants) ? cat.variants : [],
          })),
        },
        units: filteredPmUnits,
        pmUnits: mappedPmUnits,
        allUnits: mappedAllUnits,
        recentLogs: finalRecentLogs,
      };
    };

    const promise = computePayload();
    inFlightMaintenancePromises.set(cacheKey, promise);

    try {
      const responsePayload = await promise;
      if (!bypassCache) {
        maintenanceCacheMap.set(cacheKey, {
          payload: responsePayload,
          timestamp: Date.now(),
        });
        // Batasi ukuran cache map agar memori hemat
        if (maintenanceCacheMap.size > 50) {
          const oldestKey = maintenanceCacheMap.keys().next().value;
          if (oldestKey) maintenanceCacheMap.delete(oldestKey);
        }
      }
      return NextResponse.json(responsePayload, {
        headers: {
          'X-Cache': bypassCache ? 'BYPASS' : 'MISS',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
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

    // Cari daisha di database atau register otomatis bila belum tercatat
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
