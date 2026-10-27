import { FleetUnit } from '@/components/maintenance/FleetExplorer';
import { BreakdownItem } from '@/components/maintenance/MaintenanceKPICards';

export interface UnifiedMatrixItem {
  key: string;
  nama: string;
  subLabel?: string;
  total: number;
  okCount: number;
  rusakCount: number;
  maintained: number;
  unmaintained: number;
  percentage: number;
  dailyTarget: number;
  todayActual: number;
  gapToday: number;
  units: FleetUnit[];
}

export interface PmFilterParams {
  filterSeksi: string;
  filterJenis: string;
  filterUkuran: string;
  filterPmStatus: 'all' | 'maintained' | 'unmaintained';
  filterCondition: 'all' | 'OK' | 'RUSAK';
  searchQuery: string;
}

export function formatJenisLabel(raw: string): string {
  if (!raw) return 'Lainnya';
  let clean = raw.replace(/_(SMALL|MEDIUM|LARGE|NONE)$/i, '');
  clean = clean
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return clean;
}

export function filterFleetUnits(
  units: FleetUnit[],
  filters: PmFilterParams
): FleetUnit[] {
  const {
    filterSeksi,
    filterJenis,
    filterUkuran,
    filterPmStatus,
    filterCondition,
    searchQuery,
  } = filters;

  return units.filter((u) => {
    if (
      filterSeksi !== 'all' &&
      (u.seksi || '').toLowerCase() !== filterSeksi.toLowerCase()
    ) {
      return false;
    }
    if (
      filterJenis !== 'all' &&
      (u.jenis || '').toLowerCase() !== filterJenis.toLowerCase()
    ) {
      return false;
    }
    if (filterUkuran !== 'all') {
      const uUk = (u.ukuran || 'NONE').toUpperCase();
      if (filterUkuran === 'NONE' && uUk !== 'NONE' && uUk !== '') return false;
      if (filterUkuran !== 'NONE' && uUk !== filterUkuran) return false;
    }
    if (filterPmStatus === 'maintained' && !u.is_maintained) return false;
    if (filterPmStatus === 'unmaintained' && u.is_maintained) return false;
    if (filterCondition === 'OK' && (u.last_condition || 'OK') === 'RUSAK')
      return false;
    if (filterCondition === 'RUSAK' && (u.last_condition || 'OK') !== 'RUSAK')
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = (u.nomor_daisha || '').toLowerCase().includes(q);
      const matchJenis = (u.jenis || '').toLowerCase().includes(q);
      const matchSeksi = (u.seksi || '').toLowerCase().includes(q);
      if (!matchNo && !matchJenis && !matchSeksi) return false;
    }

    return true;
  });
}

export function aggregateJenisList(
  filteredUnits: FleetUnit[],
  breakdown: Record<string, BreakdownItem> = {},
  splitBySize: boolean = false,
  remainingWorkDays: number = 1
): {
  jenisList: UnifiedMatrixItem[];
  totalPopulasi: number;
  totalMaintained: number;
  totalUnmaintained: number;
  jenisDoneCount: number;
  jenisPendingCount: number;
} {
  const map = new Map<string, UnifiedMatrixItem>();

  filteredUnits.forEach((u) => {
    const baseJenis = (u.jenis || 'LAINNYA').trim();
    const rawUkuran =
      u.ukuran && u.ukuran !== 'NONE' ? u.ukuran.toUpperCase() : undefined;
    const friendlyBase = formatJenisLabel(baseJenis);

    const groupKey = splitBySize
      ? rawUkuran
        ? `${baseJenis}_${rawUkuran}`
        : baseJenis
      : baseJenis.toLowerCase();

    const displayName =
      splitBySize && rawUkuran
        ? `${friendlyBase} (${
            rawUkuran === 'SMALL' ? 'S' : rawUkuran === 'MEDIUM' ? 'M' : 'L'
          })`
        : friendlyBase;

    if (!map.has(groupKey)) {
      map.set(groupKey, {
        key: groupKey,
        nama: displayName,
        subLabel: rawUkuran ? `Ukuran ${rawUkuran}` : undefined,
        total: 0,
        okCount: 0,
        rusakCount: 0,
        maintained: 0,
        unmaintained: 0,
        percentage: 0,
        dailyTarget: 0,
        todayActual: 0,
        gapToday: 0,
        units: [],
      });
    }

    const item = map.get(groupKey)!;
    item.total++;
    if (u.last_condition === 'RUSAK') {
      item.rusakCount++;
    } else {
      item.okCount++;
    }
    if (u.is_maintained) {
      item.maintained++;
    } else {
      item.unmaintained++;
    }
    item.units.push(u);
  });

  // Sinkronkan target harian & aktual dari API breakdown jika ada
  Object.entries(breakdown).forEach(([k, b]) => {
    const ukMatch = k.match(/_(SMALL|MEDIUM|LARGE|NONE)$/i);
    const ukuran =
      ukMatch && ukMatch[1] !== 'NONE' ? ukMatch[1].toUpperCase() : undefined;
    const baseJenis = k.replace(/_(SMALL|MEDIUM|LARGE|NONE)$/i, '');

    const groupKey = splitBySize
      ? ukuran
        ? `${baseJenis}_${ukuran}`
        : baseJenis
      : baseJenis.toLowerCase();

    const item = map.get(groupKey);
    if (item) {
      item.dailyTarget += b.dailyTarget || 0;
      item.todayActual += b.todayActual || 0;
    }
  });

  let sumPopulasi = 0;
  let sumMaintained = 0;
  let sumUnmaintained = 0;
  let doneJenis = 0;
  let pendingJenis = 0;

  const list: UnifiedMatrixItem[] = Array.from(map.values()).map((item) => {
    item.percentage =
      item.total > 0 ? Math.round((item.maintained / item.total) * 100) : 0;
    if (item.dailyTarget === 0 && item.unmaintained > 0) {
      item.dailyTarget = Math.ceil(
        item.unmaintained / Math.max(1, remainingWorkDays)
      );
    }
    item.gapToday = item.todayActual - item.dailyTarget;

    sumPopulasi += item.total;
    sumMaintained += item.maintained;
    sumUnmaintained += item.unmaintained;

    if (item.percentage >= 100) doneJenis++;
    else pendingJenis++;

    item.units.sort((a, b) => {
      if (a.is_maintained === b.is_maintained) {
        return a.nomor_daisha.localeCompare(b.nomor_daisha, undefined, {
          numeric: true,
        });
      }
      return a.is_maintained ? 1 : -1;
    });

    return item;
  });

  return {
    jenisList: list,
    totalPopulasi: sumPopulasi,
    totalMaintained: sumMaintained,
    totalUnmaintained: sumUnmaintained,
    jenisDoneCount: doneJenis,
    jenisPendingCount: pendingJenis,
  };
}

export function aggregateSeksiList(
  filteredUnits: FleetUnit[],
  remainingWorkDays: number = 1
): UnifiedMatrixItem[] {
  const map = new Map<string, UnifiedMatrixItem>();

  filteredUnits.forEach((u) => {
    const s =
      u.seksi && u.seksi.trim() && u.seksi.toLowerCase() !== 'all seksi'
        ? u.seksi.trim()
        : 'Lainnya';
    if (!map.has(s)) {
      map.set(s, {
        key: s,
        nama: `Seksi ${s}`,
        subLabel: s,
        total: 0,
        okCount: 0,
        rusakCount: 0,
        maintained: 0,
        unmaintained: 0,
        percentage: 0,
        dailyTarget: 0,
        todayActual: 0,
        gapToday: 0,
        units: [],
      });
    }
    const item = map.get(s)!;
    item.total++;
    if (u.last_condition === 'RUSAK') item.rusakCount++;
    else item.okCount++;
    if (u.is_maintained) item.maintained++;
    else item.unmaintained++;
    item.units.push(u);
  });

  return Array.from(map.values()).map((s) => {
    s.percentage =
      s.total > 0 ? Math.round((s.maintained / s.total) * 100) : 0;
    s.dailyTarget = Math.ceil(s.unmaintained / Math.max(1, remainingWorkDays));
    s.units.sort((a, b) => {
      if (a.is_maintained === b.is_maintained) {
        return a.nomor_daisha.localeCompare(b.nomor_daisha, undefined, {
          numeric: true,
        });
      }
      return a.is_maintained ? 1 : -1;
    });
    return s;
  });
}

export function sortMatrixList(
  list: UnifiedMatrixItem[],
  sortBy: 'backlog' | 'total' | 'rusak' | 'pct' | 'target' | 'name'
): UnifiedMatrixItem[] {
  return [...list].sort((a, b) => {
    if (sortBy === 'backlog') return b.unmaintained - a.unmaintained;
    if (sortBy === 'total') return b.total - a.total;
    if (sortBy === 'rusak') return b.rusakCount - a.rusakCount;
    if (sortBy === 'pct') return a.percentage - b.percentage;
    if (sortBy === 'target') return b.dailyTarget - a.dailyTarget;
    if (sortBy === 'name') return a.nama.localeCompare(b.nama);
    return 0;
  });
}
