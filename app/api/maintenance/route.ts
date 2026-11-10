import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import {
  calculateRemainingWorkDaysInPmCycle,
  calculateRemainingWorkDaysInYear,
  calculateDailyTarget,
  formatDateKey,
  isWeekendOrHoliday,
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
export const maxDuration = 60;

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
    
    // Hanya bypass cache jika parameter refresh=true atau force=true
    const bypassCache =
      searchParams.get('refresh') === 'true' ||
      searchParams.get('force') === 'true';

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

    // In-Flight Promise Deduplication
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
      // Siklus 1 Tahun PM Daisha resmi dimulai 1 Oktober s/d 31 Oktober tahun berikutnya
      const pmCycleInfo = calculateRemainingWorkDaysInPmCycle(now, true);
      const startOfPmPeriod = pmCycleInfo.cycleStart;
      const endOfPmPeriod = pmCycleInfo.cycleEnd;
      const remainingWorkDays = pmCycleInfo.remainingWorkDays;

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      // Ambil data tren hingga 35 hari terakhir (cukup untuk rentang 7 hari, 30 hari, dan bulan berjalan)
      const trendDays = 35;
      const trendStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - trendDays, 0, 0, 0, 0);

      // 6 Kategori Daisha Resmi PM Workshop
      const pmTypes = [
        'Vertical',
        'Ply',
        'Slide B-Truck',
        'B-Truck Side',
        'GT Ring',
        'Inner Liner',
        'A-Truck Nagara Filler',
        'Tire Roller',
      ];
      const nowMs = Date.now();

      // Query daisha master (Jika includeAllUnits dan cache valid, gunakan cache)
      const cachedAll = globalForMaint.cachedAllDaisha;
      const canUseCachedAll = !bypassCache && cachedAll && nowMs - cachedAll.timestamp < ALL_DAISHA_TTL;

      const daishaQueryPromise = canUseCachedAll
        ? Promise.resolve(cachedAll.data)
        : includeAllUnits
        ? sql<DaishaRow[]>`
            SELECT 
              d."Id" AS id,
              d."UnitCode" AS nomor_daisha,
              d."DaishaType" AS jenis,
              COALESCE(d."SizeSpec", 'NONE') AS ukuran,
              COALESCE(d."DaishaType", 'Vertical') AS nama_daisha,
              COALESCE(d."SectionName", 'All seksi') AS seksi,
              d."LastPMDate" AS last_maintenance_date,
              COALESCE(d."CurrentCondition", 'OK') AS last_condition,
              d."LastPMDate" AS last_repair_date,
              NULL AS last_waktu_masuk,
              NULL AS last_waktu_keluar,
              d."UpdateDate" AS updated_at
            FROM "TWMSDaishaCatalog" d
            WHERE d."IsActive" = TRUE
          `.then((rows) => {
            globalForMaint.cachedAllDaisha = {
              data: rows,
              timestamp: nowMs,
            };
            return rows;
          })
        : sql<DaishaRow[]>`
            SELECT 
              d."Id" AS id,
              d."UnitCode" AS nomor_daisha,
              d."DaishaType" AS jenis,
              COALESCE(d."SizeSpec", 'NONE') AS ukuran,
              COALESCE(d."DaishaType", 'Vertical') AS nama_daisha,
              COALESCE(d."SectionName", 'All seksi') AS seksi,
              d."LastPMDate" AS last_maintenance_date,
              COALESCE(d."CurrentCondition", 'OK') AS last_condition,
              d."LastPMDate" AS last_repair_date,
              NULL AS last_waktu_masuk,
              NULL AS last_waktu_keluar,
              d."UpdateDate" AS updated_at
            FROM "TWMSDaishaCatalog" d
            WHERE d."IsActive" = TRUE AND d."DaishaType" IN ${sql(pmTypes)}
          `;

      // Eksekusi seluruh kueri secara paralel dan efisien
      const [
        allDaisha,
        todayLogs,
        recentLogs,
        trendLogRows,
        conditionRows,
        catalogRows,
        activeTicketRows,
        seksiAggRows,
      ] = await Promise.all([
        daishaQueryPromise,
        sql`
          SELECT 
            l."Id" AS id,
            l."Id" AS daisha_id,
            l."UnitCode" AS nomor_daisha,
            l."WorkType" AS jenis_pekerjaan,
            COALESCE(l."ChecklistResult", 'OK') AS kondisi,
            l."InspectionNote" AS detail_kerusakan,
            l."ActionTaken" AS tindakan,
            l."EntryTime" AS waktu_masuk,
            l."ExitTime" AS waktu_keluar,
            l."CheckDate" AS tanggal_pengerjaan,
            l."InspectorBy" AS admin_id,
            l."Notes" AS catatan,
            d."DaishaType" AS jenis,
            d."SizeSpec" AS ukuran
          FROM "TWMSMaintenanceLog" l
          LEFT JOIN "TWMSDaishaCatalog" d ON d."UnitCode" = l."UnitCode"
          WHERE l."RecordType" = 'PM'
            AND l."CheckDate" >= ${startOfToday} AND l."CheckDate" <= ${endOfToday}
        `,
        sql`
          SELECT 
            l."Id" AS id,
            l."Id" AS daisha_id,
            l."UnitCode" AS nomor_daisha,
            l."WorkType" AS jenis_pekerjaan,
            COALESCE(l."ChecklistResult", 'OK') AS kondisi,
            l."InspectionNote" AS detail_kerusakan,
            l."ActionTaken" AS tindakan,
            l."EntryTime" AS waktu_masuk,
            l."ExitTime" AS waktu_keluar,
            l."CheckDate" AS tanggal_pengerjaan,
            l."InspectorBy" AS admin_id,
            l."Notes" AS catatan,
            d."DaishaType" AS jenis,
            d."SizeSpec" AS ukuran
          FROM "TWMSMaintenanceLog" l
          LEFT JOIN "TWMSDaishaCatalog" d ON d."UnitCode" = l."UnitCode"
          WHERE l."RecordType" = 'PM'
          ORDER BY l."CheckDate" DESC
          LIMIT 50
        `,
        sql`
          SELECT 
            "CheckDate" AS tanggal_pengerjaan,
            "WorkType" AS jenis_pekerjaan,
            COALESCE("ChecklistResult", 'OK') AS kondisi
          FROM "TWMSMaintenanceLog"
          WHERE "RecordType" = 'PM' AND "CheckDate" >= ${trendStartDate}
        `,
        sql`
          SELECT 
            COALESCE("ChecklistResult", 'OK') AS kondisi,
            COUNT(*)::int AS count
          FROM "TWMSMaintenanceLog"
          WHERE "RecordType" = 'PM' AND "CheckDate" >= ${startOfPmPeriod} AND "CheckDate" <= ${endOfPmPeriod}
          GROUP BY COALESCE("ChecklistResult", 'OK')
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
            min("Id") AS id, 
            "DaishaType" AS name, 
            COALESCE("SectionName", 'Building') AS seksi, 
            NULL AS "codePrefix",
            count(*)::int AS "totalUnits", 
            '[]'::jsonb AS components,
            '[]'::jsonb AS variants
          FROM "TWMSDaishaCatalog"
          WHERE "IsActive" = TRUE AND "DaishaType" IS NOT NULL
          GROUP BY "DaishaType", "SectionName"
          ORDER BY "DaishaType" ASC
        `,
        sql<Array<{ noDaisha: string }>>`
          SELECT DISTINCT UPPER(TRIM("UnitCode")) AS "noDaisha"
          FROM "TWMSRepairTicket"
          WHERE "Status" IN ('Open', 'Progress', 'Pending')
            AND "UnitCode" IS NOT NULL
            AND "UnitCode" != '-'
        `,
        sql<Array<{ seksi: string; total: number; rusak: number; ok: number; total_types: number }>>`
          SELECT 
            COALESCE("SectionName", 'Lainnya') AS seksi,
            count(*)::int AS total,
            count(CASE WHEN "CurrentCondition" = 'RUSAK' THEN 1 END)::int AS rusak,
            count(CASE WHEN "CurrentCondition" != 'RUSAK' OR "CurrentCondition" IS NULL THEN 1 END)::int AS ok,
            count(DISTINCT "DaishaType")::int AS total_types
          FROM "TWMSDaishaCatalog"
          WHERE "IsActive" = TRUE
          GROUP BY "SectionName"
        `,
      ]);

      const seksiAggMap = new Map<string, { total: number; rusak: number; ok: number; total_types: number }>();
      for (const row of seksiAggRows) {
        seksiAggMap.set(row.seksi, row);
      }

      // Sinkronisasi status kondisi unit dengan tiket perbaikan aktif
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

      // Agregasi statistik resmi dari TWMSDamageCatalog / TWMSDaishaCatalog
      const catalogSeksiMap = new Map<string, number>();
      const catalogJenisSet = new Set<string>();
      let catalogTotalAllUnits = 0;

      const pmCatalogSeksiMap = new Map<string, number>();
      let pmCatalogTotalUnits = 0;

      for (const cat of catalogRows) {
        const s = (cat.seksi && cat.seksi.trim()) ? cat.seksi.trim() : 'Building';
        const units = Number(cat.totalUnits) || 0;

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

      const targetAllDaisha = !isAllSeksi
        ? allDaisha.filter(
            (d) => (d.seksi || '').toLowerCase() === filterSeksi.trim().toLowerCase()
          )
        : Array.from(allDaisha);

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

      // Hitung agregasi per kategori KHUSUS PM
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
        const isMaintainedThisYear = effectiveLastDate !== null && effectiveLastDate >= startOfPmPeriod && effectiveLastDate <= endOfPmPeriod;
        
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

      // Sebaran Populasi Seksi KHUSUS PM
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
        const isMaintainedThisYear = effectiveLastDate !== null && effectiveLastDate >= startOfPmPeriod && effectiveLastDate <= endOfPmPeriod;
        if (isMaintainedThisYear) {
          entry.maintained++;
        } else {
          entry.unmaintained++;
        }
        if (u.last_condition === 'RUSAK') {
          entry.rusak++;
        }
      }

      // Sebaran Seluruh Armada Pabrik per Seksi (KPI Jumlah Daisha)
      const allSeksiMap = new Map<string, { total: number; ok: number; rusak: number; jenisSet: Set<string> }>();
      for (const u of allDaisha) {
        const s = (u.seksi && u.seksi.trim() && u.seksi.toLowerCase() !== 'all seksi') ? u.seksi.trim() : 'Lainnya';
        if (!allSeksiMap.has(s)) {
          allSeksiMap.set(s, { total: 0, ok: 0, rusak: 0, jenisSet: new Set() });
        }
        const entry = allSeksiMap.get(s)!;
        entry.total++;
        if (u.last_condition === 'RUSAK') {
          entry.rusak++;
        } else {
          entry.ok++;
        }
        if (u.nama_daisha) entry.jenisSet.add(u.nama_daisha);
        else if (u.jenis) entry.jenisSet.add(u.jenis);
      }

      // Susun sebaran seksi lengkap
      const seksiDistribution = Array.from(DAFTAR_SEKSI).map((seksiName) => {
        const pmStats = pmSeksiMap.get(seksiName) || { total: 0, maintained: 0, unmaintained: 0, rusak: 0 };
        const seksiAgg = seksiAggMap.get(seksiName) || { total: 0, ok: 0, rusak: 0, total_types: 0 };
        const allStats = allSeksiMap.get(seksiName) || {
          total: seksiAgg.total,
          ok: seksiAgg.ok,
          rusak: seksiAgg.rusak,
          jenisSet: new Set<string>(),
        };
        
        let officialSectionUnits = seksiAgg.total > 0 ? seksiAgg.total : allStats.total;
        const matchedKey = Array.from(catalogSeksiMap.keys()).find(
          (k) => k.toLowerCase() === seksiName.toLowerCase()
        );
        if (matchedKey && catalogSeksiMap.has(matchedKey)) {
          officialSectionUnits = catalogSeksiMap.get(matchedKey)!;
        }

        const percentage = pmStats.total > 0 ? Math.round((pmStats.maintained / pmStats.total) * 100) : 0;
        return {
          seksi: seksiName,
          total: officialSectionUnits,
          actualFleetCount: seksiAgg.total > 0 ? seksiAgg.total : allStats.total,
          ok: seksiAgg.total > 0 ? seksiAgg.ok : allStats.ok,
          rusak: seksiAgg.total > 0 ? seksiAgg.rusak : allStats.rusak,
          totalTypes: allStats.jenisSet.size > 0 ? allStats.jenisSet.size : seksiAgg.total_types,
          pmTotal: pmStats.total,
          pmMaintained: pmStats.maintained,
          pmUnmaintained: pmStats.unmaintained,
          pmPercentage: percentage,
        };
      });

      // Filter grid units sesuai parameter jenis dan ukuran
      let filteredGridUnits = mappedPmUnits;
      if (filterJenis) {
        filteredGridUnits = filteredGridUnits.filter((u) => u.jenis === filterJenis);
      }
      if (filterUkuran) {
        filteredGridUnits = filteredGridUnits.filter((u) => u.ukuran === filterUkuran);
      }

      // Urutkan unit Daisha berdasarkan serial number
      filteredGridUnits.sort((a, b) => {
        if (a.jenis !== b.jenis) return a.jenis.localeCompare(b.jenis);
        if (a.ukuran !== b.ukuran) return a.ukuran.localeCompare(b.ukuran);
        return a.serial_number - b.serial_number;
      });

      // Hitung persentase total & target harian
      summary.percentage = summary.totalUnits > 0
        ? Math.round((summary.maintainedUnits / summary.totalUnits) * 100)
        : 0;

      summary.dailyTarget = calculateDailyTarget(summary.unmaintainedUnits, remainingWorkDays);

      // Hitung breakdown percentage & target harian
      Object.keys(breakdown).forEach((k) => {
        const b = breakdown[k];
        b.percentage = b.total > 0 ? Math.round((b.maintained / b.total) * 100) : 0;
        b.dailyTarget = calculateDailyTarget(b.unmaintained, remainingWorkDays);
        b.todayActual = targetTodayLogs.filter((l) => {
          const lCanon = getCanonicalPmJenis(l.jenis);
          const lKey = l.ukuran && l.ukuran !== 'NONE' ? `${lCanon}_${l.ukuran}` : lCanon;
          return lKey === k;
        }).length;
      });

      // Format log terkini
      const recentActivities = recentLogs.map((l) => ({
        id: l.id,
        nomor_daisha: l.nomor_daisha,
        jenis: l.jenis,
        ukuran: l.ukuran,
        jenis_pekerjaan: l.jenis_pekerjaan,
        kondisi: l.kondisi,
        detail_kerusakan: l.detail_kerusakan,
        tindakan: l.tindakan,
        tanggal_pengerjaan: l.tanggal_pengerjaan,
        waktu_masuk: l.waktu_masuk,
        waktu_keluar: l.waktu_keluar,
        admin_id: l.admin_id,
        catatan: l.catatan,
      }));

      // Kondisi agregasi tahun berjalan
      const kondisiCount: Record<string, number> = { OK: 0, RUSAK: 0, SCRAP: 0 };
      conditionRows.forEach((r) => {
        const k = (r.kondisi || 'OK').toUpperCase();
        kondisiCount[k] = (kondisiCount[k] || 0) + r.count;
      });

      // Trend 14 hari terakhir
      const dailyTrendMap = new Map<string, { total: number; rutin: number; repair: number; ok: number; rusak: number }>();
      for (let i = 0; i <= trendDays; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (trendDays - i));
        dailyTrendMap.set(formatDateKey(d), { total: 0, rutin: 0, repair: 0, ok: 0, rusak: 0 });
      }

      trendLogRows.forEach((r) => {
        if (!r.tanggal_pengerjaan) return;
        const key = formatDateKey(new Date(r.tanggal_pengerjaan));
        if (dailyTrendMap.has(key)) {
          const entry = dailyTrendMap.get(key)!;
          entry.total++;
          if (r.jenis_pekerjaan === 'RUTIN') entry.rutin++;
          if (r.jenis_pekerjaan === 'REPAIR') entry.repair++;
          if (r.kondisi === 'OK') entry.ok++;
          if (r.kondisi === 'RUSAK') entry.rusak++;
        }
      });

      const dailyTrend = Array.from(dailyTrendMap.entries()).map(([dateStr, stats]) => {
        const parts = dateStr.split('-');
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const isOffDay = isWeekendOrHoliday(dateObj, true);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dateLabel = `${day}/${month}`;

        return {
          date: dateStr,
          dateLabel,
          isWeekend: isOffDay,
          target: isOffDay ? 0 : summary.dailyTarget,
          actual: stats.total,
          rutin: stats.rutin,
          repair: stats.repair,
          ok: stats.ok,
          rusak: stats.rusak,
        };
      });

      const finalAllDaishaUnits = includeAllUnits ? mappedAllUnits : [];
      const totalAllDaishaFleet = catalogTotalAllUnits > 0 ? catalogTotalAllUnits : allDaisha.length;

      // Condition Stats
      const totalConditionCount = kondisiCount.OK + kondisiCount.RUSAK + kondisiCount.SCRAP;
      const conditionStats = {
        okCount: kondisiCount.OK,
        rusakCount: kondisiCount.RUSAK,
        totalCondition: totalConditionCount,
        okPercentage: totalConditionCount > 0 ? Math.round((kondisiCount.OK / totalConditionCount) * 100) : 0,
        rusakPercentage: totalConditionCount > 0 ? Math.round((kondisiCount.RUSAK / totalConditionCount) * 100) : 0,
      };

      const catalogStats = {
        totalAllUnits: allDaisha.length,
        totalPmUnits: pmCatalogTotalUnits > 0 ? pmCatalogTotalUnits : targetPmDaisha.length,
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
      };

      return {
        success: true,
        summary,
        conditionStats,
        breakdown,
        seksiDistribution,
        totalAllDaishaFleet,
        allUnits: finalAllDaishaUnits,
        allDaishaUnits: finalAllDaishaUnits,
        pmUnits: mappedPmUnits,
        units: filteredGridUnits,
        catalogStats,
        totalCatalogJenisCount: catalogJenisSet.size,
        catalogJenisList: Array.from(catalogJenisSet).sort(),
        recentActivities,
        recentLogs: recentActivities,
        kondisiStatus: kondisiCount,
        dailyTrend,
        activeRepairsCount: activeTicketRows.length,
        meta: {
          year: currentYear,
          remainingWorkDays,
          currentDate: now.toISOString(),
          isPmCycleOctober: true,
          pmCycleStart: startOfPmPeriod.toISOString(),
          filterJenis: filterJenis || 'ALL',
          filterUkuran: filterUkuran || 'ALL',
          filterSeksi: filterSeksi || 'ALL',
          cachedAt: new Date().toISOString(),
        },
      };
    };

    const payloadPromise = computePayload();
    if (!bypassCache) {
      inFlightMaintenancePromises.set(cacheKey, payloadPromise);
    }

    const payload = await payloadPromise;

    if (!bypassCache) {
      inFlightMaintenancePromises.delete(cacheKey);
      maintenanceCacheMap.set(cacheKey, {
        payload,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(payload, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching maintenance analytics:', error);
    return NextResponse.json(
      { error: 'Gagal memuat analitik maintenance: ' + errMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maintenance
 * Input hasil maintenance berkala atau perbaikan Daisha oleh Admin/Operator
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await request.json();

    const nomorDaisha = sanitizeText(body.nomor_daisha, 50).trim();
    const jenis = sanitizeText(body.jenis, 50);
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

    // Cari daisha di TWMSDaishaCatalog
    const daisha = await sql`
      SELECT "Id" AS id, "UnitCode" AS nomor_daisha, "DaishaType" AS jenis, "SizeSpec" AS ukuran, "SectionName" AS seksi, "LastPMDate" AS last_maintenance_date
      FROM "TWMSDaishaCatalog"
      WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${nomorDaisha}))
      LIMIT 1
    `;

    let targetSeksi = 'Building';
    let lastMaintenanceDate: Date | null = null;

    if (daisha.length === 0) {
      const normalizedUkuran = jenis.toUpperCase() === 'VERTICAL' ? (ukuran || 'MEDIUM') : 'NONE';
      const [insertResult] = await sql`
        INSERT INTO "TWMSDaishaCatalog" ("UnitCode", "DaishaType", "SizeSpec", "SectionName", "LastPMDate", "CurrentCondition", "UpdateDate")
        VALUES (${nomorDaisha}, ${jenis}, ${normalizedUkuran}, 'Building', ${tanggalPengerjaan}, ${kondisi}, NOW())
        RETURNING "Id" AS id, "UnitCode" AS nomor_daisha, "DaishaType" AS jenis, "SizeSpec" AS ukuran, "SectionName" AS seksi, "LastPMDate" AS last_maintenance_date
      `;
      targetSeksi = insertResult.seksi || 'Building';
    } else {
      targetSeksi = daisha[0].seksi || 'Building';
      lastMaintenanceDate = daisha[0].last_maintenance_date ? new Date(daisha[0].last_maintenance_date) : null;
    }

    // SMART VALIDATION & WARNING SYSTEM
    if (lastMaintenanceDate && !bypassWarning) {
      const diffMs = Math.abs(tanggalPengerjaan.getTime() - lastMaintenanceDate.getTime());
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        const formattedDate = lastMaintenanceDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const lastLog = await sql`
          SELECT "WorkType" AS jenis_pekerjaan, "CheckDate" AS tanggal_pengerjaan, "InspectorBy" AS admin_id, "Notes" AS catatan
          FROM "TWMSMaintenanceLog"
          WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${nomorDaisha})) AND "RecordType" = 'PM'
          ORDER BY "CheckDate" DESC
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

    // Update TWMSDaishaCatalog
    await sql`
      UPDATE "TWMSDaishaCatalog"
      SET 
        "LastPMDate" = ${tanggalPengerjaan},
        "CurrentCondition" = ${kondisi},
        "UpdateDate" = NOW()
      WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${nomorDaisha}))
    `;

    // Masukkan ke TWMSMaintenanceLog
    const periodMonth = `${tanggalPengerjaan.getFullYear()}-${String(tanggalPengerjaan.getMonth() + 1).padStart(2, '0')}`;
    const [logInsert] = await sql`
      INSERT INTO "TWMSMaintenanceLog" (
        "UnitCode", "SectionName", "RecordType", "PeriodMonth", "WorkType", "ChecklistResult",
        "InspectionNote", "ActionTaken", "EntryTime", "ExitTime", "CheckDate",
        "InspectorBy", "Notes", "UpdateDate"
      ) VALUES (
        ${nomorDaisha}, ${targetSeksi}, 'PM', ${periodMonth}, ${kategori}, ${kondisi},
        ${detailKerusakan || null}, ${tindakan || null}, ${waktuMasuk}, ${waktuKeluar}, ${tanggalPengerjaan},
        ${adminId}, ${catatan || null}, NOW()
      )
      RETURNING "Id" AS id, "UnitCode" AS nomor_daisha, "WorkType" AS jenis_pekerjaan, "ChecklistResult" AS kondisi, "CheckDate" AS tanggal_pengerjaan
    `;

    // Sinkronisasi dengan modul Repair
    let syncedTicketId: string | null = null;
    if (kategori === 'REPAIR') {
      const openTicket = await sql`
        SELECT "TicketNo" AS "idTiket", "Status" AS "status"
        FROM "TWMSRepairTicket"
        WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${nomorDaisha})) AND "Status" NOT IN ('Done', 'Scrap')
        ORDER BY "ReportDate" DESC
        LIMIT 1
      `;

      if (openTicket.length > 0) {
        syncedTicketId = openTicket[0].idTiket;
        await sql`
          UPDATE "TWMSRepairTicket"
          SET 
            "Status" = 'Done',
            "CompletedDate" = ${tanggalPengerjaan},
            "DamageDescription" = COALESCE("DamageDescription", '') || ' [Diselesaikan otomatis via Modul Maintenance Daisha]',
            "UpdateDate" = NOW()
          WHERE "TicketNo" = ${syncedTicketId}
        `;
      }
    }

    invalidateMaintenanceCache();

    return NextResponse.json({
      success: true,
      message: `Pencatatan ${kategori === 'REPAIR' ? 'perbaikan' : 'maintenance'} untuk Daisha [${nomorDaisha}] berhasil disimpan.`,
      log: logInsert,
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
