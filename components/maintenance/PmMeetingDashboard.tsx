'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Truck,
  Building2,
  AlertCircle,
  ArrowUpDown,
  PieChart as PieIcon,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Wrench,
  Activity,
  Filter,
  RotateCcw,
  Calendar,
  X,
} from 'lucide-react';
import { CHART, DONUT } from '@/lib/chart-colors';
import { BreakdownItem } from './MaintenanceKPICards';
import { DailyTrendItem } from './TargetVsActualChart';
import { FleetUnit } from './FleetExplorer';
import { exportFleetToExcel } from '@/lib/excelExport';

interface PmMeetingDashboardProps {
  breakdown: Record<string, BreakdownItem>;
  dailyTrend: DailyTrendItem[];
  units: FleetUnit[];
  remainingWorkDays: number;
  dailyTarget: number;
  todayActual: number;
  currentYear: number;
  conditionStats?: {
    okCount: number;
    rusakCount: number;
    totalCondition: number;
    okPercentage: number;
    rusakPercentage: number;
  };
  onExportRepair?: () => void;
  repairTicketsCount?: number;
  onYearChange?: (year: number) => void;
}

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

function formatJenisLabel(raw: string): string {
  if (!raw) return 'Lainnya';
  let clean = raw.replace(/_(SMALL|MEDIUM|LARGE|NONE)$/i, '');
  clean = clean
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return clean;
}

export default function PmMeetingDashboard({
  breakdown = {},
  dailyTrend = [],
  units = [],
  remainingWorkDays = 1,
  dailyTarget = 0,
  todayActual = 0,
  currentYear,
  conditionStats,
  onExportRepair,
  repairTicketsCount = 0,
  onYearChange,
}: PmMeetingDashboardProps) {
  // Mode pengelompokan tabel: 'JENIS' (Per Jenis & Ukuran) vs 'SEKSI' (Per Seksi Operasional)
  const [groupingMode, setGroupingMode] = useState<'JENIS' | 'SEKSI'>('JENIS');
  // Sub-toggle rinci ukuran (S/M/L) saat groupingMode === 'JENIS'
  const [splitBySize, setSplitBySize] = useState<boolean>(false);
  // Pencarian nama baris
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Pengurutan tabel
  const [sortBy, setSortBy] = useState<'backlog' | 'total' | 'rusak' | 'pct' | 'target' | 'name'>('backlog');
  // Baris yang sedang di-expand untuk melihat unit satuan
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  // Filter status unit di dalam rincian (all | unmaintained | maintained | rusak)
  const [unitStatusFilter, setUnitStatusFilter] = useState<'all' | 'unmaintained' | 'maintained' | 'rusak'>('all');
  // Pencarian nomor unit di dalam rincian
  const [unitSearch, setUnitSearch] = useState<string>('');
  // Tab chart meeting: 'ALL' | 'JENIS' | 'TREND' | 'DONUT'
  const [chartView, setChartView] = useState<'ALL' | 'JENIS' | 'TREND' | 'DONUT'>('ALL');

  // Multi-Filter Mapping PM: Seksi, Jenis, Ukuran, Status PM, dan Kondisi
  const [filterSeksi, setFilterSeksi] = useState<string>('all');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterUkuran, setFilterUkuran] = useState<string>('all');
  const [filterPmStatus, setFilterPmStatus] = useState<'all' | 'maintained' | 'unmaintained'>('all');
  const [filterCondition, setFilterCondition] = useState<'all' | 'OK' | 'RUSAK'>('all');

  // Opsi Seksi dari data master armada
  const seksiOptions = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.seksi && u.seksi.trim() && u.seksi.toLowerCase() !== 'all seksi') {
        set.add(u.seksi.trim());
      }
    });
    return Array.from(set).sort();
  }, [units]);

  // Opsi Jenis Daisha
  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.jenis && u.jenis.trim()) {
        set.add(u.jenis.trim());
      }
    });
    return Array.from(set).sort();
  }, [units]);

  const hasActiveFilters =
    filterSeksi !== 'all' ||
    filterJenis !== 'all' ||
    filterUkuran !== 'all' ||
    filterPmStatus !== 'all' ||
    filterCondition !== 'all' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setFilterSeksi('all');
    setFilterJenis('all');
    setFilterUkuran('all');
    setFilterPmStatus('all');
    setFilterCondition('all');
    setSearchQuery('');
  };

  // Unit yang sudah disaring dengan multi-filter
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (filterSeksi !== 'all' && (u.seksi || '').toLowerCase() !== filterSeksi.toLowerCase()) {
        return false;
      }
      if (filterJenis !== 'all' && (u.jenis || '').toLowerCase() !== filterJenis.toLowerCase()) {
        return false;
      }
      if (filterUkuran !== 'all') {
        const uUk = (u.ukuran || 'NONE').toUpperCase();
        if (filterUkuran === 'NONE' && uUk !== 'NONE' && uUk !== '') return false;
        if (filterUkuran !== 'NONE' && uUk !== filterUkuran) return false;
      }
      if (filterPmStatus === 'maintained' && !u.is_maintained) return false;
      if (filterPmStatus === 'unmaintained' && u.is_maintained) return false;
      if (filterCondition === 'OK' && (u.last_condition || 'OK') === 'RUSAK') return false;
      if (filterCondition === 'RUSAK' && (u.last_condition || 'OK') !== 'RUSAK') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = (u.nomor_daisha || '').toLowerCase().includes(q);
        const matchJenis = (u.jenis || '').toLowerCase().includes(q);
        const matchSeksi = (u.seksi || '').toLowerCase().includes(q);
        if (!matchNo && !matchJenis && !matchSeksi) return false;
      }

      return true;
    });
  }, [units, filterSeksi, filterJenis, filterUkuran, filterPmStatus, filterCondition, searchQuery]);

  // 1. Agregasi Berdasarkan Jenis Daisha & Ukuran (dari filteredUnits)
  const { jenisList, totalPopulasi, totalMaintained, totalUnmaintained, jenisDoneCount, jenisPendingCount } = useMemo(() => {
    const map = new Map<string, UnifiedMatrixItem>();

    filteredUnits.forEach((u) => {
      const baseJenis = (u.jenis || 'LAINNYA').trim();
      const rawUkuran = u.ukuran && u.ukuran !== 'NONE' ? u.ukuran.toUpperCase() : undefined;
      const friendlyBase = formatJenisLabel(baseJenis);

      const groupKey = splitBySize
        ? (rawUkuran ? `${baseJenis}_${rawUkuran}` : baseJenis)
        : baseJenis.toLowerCase();

      const displayName = splitBySize && rawUkuran
        ? `${friendlyBase} (${rawUkuran === 'SMALL' ? 'S' : rawUkuran === 'MEDIUM' ? 'M' : 'L'})`
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
      const ukuran = ukMatch && ukMatch[1] !== 'NONE' ? ukMatch[1].toUpperCase() : undefined;
      const baseJenis = k.replace(/_(SMALL|MEDIUM|LARGE|NONE)$/i, '');

      const groupKey = splitBySize
        ? (ukuran ? `${baseJenis}_${ukuran}` : baseJenis)
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
      item.percentage = item.total > 0 ? Math.round((item.maintained / item.total) * 100) : 0;
      if (item.dailyTarget === 0 && item.unmaintained > 0) {
        item.dailyTarget = Math.ceil(item.unmaintained / Math.max(1, remainingWorkDays));
      }
      item.gapToday = item.todayActual - item.dailyTarget;

      sumPopulasi += item.total;
      sumMaintained += item.maintained;
      sumUnmaintained += item.unmaintained;

      if (item.percentage >= 100) doneJenis++;
      else pendingJenis++;

      item.units.sort((a, b) => {
        if (a.is_maintained === b.is_maintained) {
          return a.nomor_daisha.localeCompare(b.nomor_daisha, undefined, { numeric: true });
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
  }, [filteredUnits, breakdown, splitBySize, remainingWorkDays]);

  // 2. Agregasi Berdasarkan Seksi Operasional Pabrik (dari filteredUnits)
  const seksiList = useMemo(() => {
    const map = new Map<string, UnifiedMatrixItem>();

    filteredUnits.forEach((u) => {
      const s = (u.seksi && u.seksi.trim() && u.seksi.toLowerCase() !== 'all seksi') ? u.seksi.trim() : 'Lainnya';
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
      s.percentage = s.total > 0 ? Math.round((s.maintained / s.total) * 100) : 0;
      s.dailyTarget = Math.ceil(s.unmaintained / Math.max(1, remainingWorkDays));
      s.units.sort((a, b) => {
        if (a.is_maintained === b.is_maintained) {
          return a.nomor_daisha.localeCompare(b.nomor_daisha, undefined, { numeric: true });
        }
        return a.is_maintained ? 1 : -1;
      });
      return s;
    });
  }, [filteredUnits, remainingWorkDays]);

  // Pilih list data aktif sesuai mode grouping
  const activeMatrixList = useMemo(() => {
    const sourceList = groupingMode === 'JENIS' ? jenisList : seksiList;
    return sourceList
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return item.nama.toLowerCase().includes(q) || (item.subLabel || '').toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'backlog') return b.unmaintained - a.unmaintained;
        if (sortBy === 'total') return b.total - a.total;
        if (sortBy === 'rusak') return b.rusakCount - a.rusakCount;
        if (sortBy === 'pct') return a.percentage - b.percentage;
        if (sortBy === 'target') return b.dailyTarget - a.dailyTarget;
        if (sortBy === 'name') return a.nama.localeCompare(b.nama);
        return 0;
      });
  }, [groupingMode, jenisList, seksiList, searchQuery, sortBy]);

  // Data unit yang sedang di-expand untuk rincian
  const activeExpandedItem = useMemo(() => {
    if (!expandedKey) return null;
    const sourceList = groupingMode === 'JENIS' ? jenisList : seksiList;
    return sourceList.find((j) => j.key === expandedKey) || null;
  }, [groupingMode, jenisList, seksiList, expandedKey]);

  // Filter unit di dalam accordion expand
  const filteredExpandedUnits = useMemo(() => {
    if (!activeExpandedItem) return [];
    return activeExpandedItem.units.filter((u) => {
      if (unitStatusFilter === 'maintained' && !u.is_maintained) return false;
      if (unitStatusFilter === 'unmaintained' && u.is_maintained) return false;
      if (unitStatusFilter === 'rusak' && (u.last_condition || 'OK') !== 'RUSAK') return false;
      if (unitSearch.trim()) {
        const q = unitSearch.toLowerCase();
        const matchNo = u.nomor_daisha.toLowerCase().includes(q);
        const matchSeksi = (u.seksi || '').toLowerCase().includes(q);
        const matchJenis = (u.jenis || '').toLowerCase().includes(q);
        return matchNo || matchSeksi || matchJenis;
      }
      return true;
    });
  }, [activeExpandedItem, unitStatusFilter, unitSearch]);

  // Data Donut 1 & Donut 2 untuk Meeting
  const okUnitsCount = useMemo(() => {
    if (conditionStats && conditionStats.totalCondition > 0 && !hasActiveFilters) return conditionStats.okCount;
    return filteredUnits.filter((u) => (u.last_condition || 'OK') !== 'RUSAK').length;
  }, [conditionStats, filteredUnits, hasActiveFilters]);

  const rusakUnitsCount = useMemo(() => {
    if (conditionStats && conditionStats.totalCondition > 0 && !hasActiveFilters) return conditionStats.rusakCount;
    return filteredUnits.filter((u) => (u.last_condition || 'OK') === 'RUSAK').length;
  }, [conditionStats, filteredUnits, hasActiveFilters]);

  const pmDonutData = useMemo(() => [
    { name: 'Sudah di-PM', value: totalMaintained, color: '#059669' },
    { name: 'Belum di-PM', value: totalUnmaintained, color: '#f43f5e' },
  ], [totalMaintained, totalUnmaintained]);

  const conditionDonutData = useMemo(() => [
    { name: 'Siap Pakai (OK)', value: okUnitsCount, color: '#059669' },
    { name: 'Perlu Perbaikan (RUSAK)', value: rusakUnitsCount, color: '#dc2626' },
  ], [okUnitsCount, rusakUnitsCount]);

  // Chart Data untuk Visualisasi Meeting
  const chartJenisData = useMemo(() => {
    return [...jenisList]
      .sort((a, b) => b.total - a.total)
      .slice(0, 14)
      .map((item) => ({
        name: item.nama,
        maintained: item.maintained,
        unmaintained: item.unmaintained,
        total: item.total,
        percentage: item.percentage,
        dailyTarget: item.dailyTarget,
        todayActual: item.todayActual,
      }));
  }, [jenisList]);

  return (
    <div className="space-y-6 font-sans">
      {/* =========================================================================
          1. HEADER RINGKASAN MEETING & FILTER CEPAT
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="t-card text-slate-900 tracking-tight">
                    KPI PM Daisha Tahun {currentYear}
                  </h2>
                  {onYearChange && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-600">Pilih Tahun:</span>
                      <select
                        value={currentYear}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                        className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
                      >
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <p className="t-caption text-slate-500">
                  Monitoring populasi armada, kesehatan unit (OK vs RUSAK), dan target kepatuhan PM tahunan
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tombol Ekspor Terpisah Sesuai Kebutuhan User */}
            {onExportRepair && (
              <button
                type="button"
                onClick={onExportRepair}
                className="h-10 min-h-[40px] px-3.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition inline-flex items-center gap-1.5 cursor-pointer"
                title="Unduh file Excel riwayat tiket servis dan perbaikan"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Ekspor Repair</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => exportFleetToExcel(units, currentYear)}
              className="h-10 min-h-[40px] px-4 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition inline-flex items-center gap-1.5 cursor-pointer"
              title="Unduh file Excel master seluruh armada fisik dan status PM tahun berjalan"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor PM & Master</span>
            </button>

            {/* Switcher Tampilan Grafik */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium h-10 min-h-[40px]">
              <button
                type="button"
                onClick={() => setChartView('ALL')}
                className={`h-full px-3 rounded-md transition cursor-pointer ${
                  chartView === 'ALL' ? 'bg-white text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Grafik
              </button>
              <button
                type="button"
                onClick={() => setChartView('JENIS')}
                className={`h-full px-3 rounded-md transition cursor-pointer ${
                  chartView === 'JENIS' ? 'bg-white text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grafik Jenis
              </button>
              <button
                type="button"
                onClick={() => setChartView('TREND')}
                className={`h-full px-3 rounded-md transition cursor-pointer ${
                  chartView === 'TREND' ? 'bg-white text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tren 14 Hari
              </button>
              <button
                type="button"
                onClick={() => setChartView('DONUT')}
                className={`h-full px-3 rounded-md transition cursor-pointer ${
                  chartView === 'DONUT' ? 'bg-white text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Donat Proporsi
              </button>
            </div>
          </div>
        </div>

        {/* 4 Mini Cards Status Rapat Eksekutif */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Total Populasi Pabrik</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 tabular-nums">{totalPopulasi.toLocaleString('id-ID')}</span>
              <span className="text-xs text-slate-500">Unit</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {jenisList.length} kategori di 6 seksi pabrik
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-xs font-medium text-emerald-800 block">Kondisi Siap Operasi</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-emerald-700 tabular-nums">{okUnitsCount.toLocaleString('id-ID')}</span>
              <span className="text-xs text-emerald-800 font-medium">/ {totalPopulasi} Unit</span>
            </div>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">
              {totalPopulasi > 0 ? ((okUnitsCount / totalPopulasi) * 100).toFixed(1) : 100}% Armada Sehat (OK)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200">
            <span className="text-xs font-medium text-red-800 block">Perlu Repair / Rusak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-red-700 tabular-nums">{rusakUnitsCount}</span>
              <span className="text-xs text-red-800 font-medium">Unit Armada</span>
            </div>
            <span className="text-xs text-red-700 mt-1 block">
              {repairTicketsCount > 0 ? `${repairTicketsCount} tiket servis aktif` : 'Berdasarkan data repair'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Kepatuhan PM Tahunan</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900 tabular-nums">{totalMaintained}</span>
              <span className="text-xs text-slate-500 font-medium">/ {totalPopulasi} Unit</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-1 block">
              {totalPopulasi > 0 ? Math.round((totalMaintained / totalPopulasi) * 100) : 0}% (Sisa {remainingWorkDays} hari kerja)
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. VISUAL CHARTS MEETING (DUA GRAFIK UTAMA UNTUK PRESENTASI)
          ========================================================================= */}
      {(chartView === 'ALL' || chartView === 'JENIS' || chartView === 'TREND') && (
        <div className={`grid gap-6 ${chartView === 'ALL' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* CHART 1: Realisasi PM per Jenis Daisha (Stacked Bar) */}
          {(chartView === 'ALL' || chartView === 'JENIS') && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Realisasi PM per Jenis Daisha</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Perbandingan armada Sudah di-PM (Hijau) vs Belum di-PM (Merah)
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Top 14 Populasi
                  </span>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartJenisData}
                      layout="vertical"
                      margin={{ top: 5, right: 25, left: 25, bottom: 5 }}
                      barCategoryGap="18%"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART.grid} />
                      <XAxis type="number" tick={{ fill: CHART.axis, fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                        width={110}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-1.5 min-w-[200px]">
                                <p className="font-bold text-slate-900 pb-1 border-b border-slate-100">{d.name}</p>
                                <div className="flex justify-between text-slate-600">
                                  <span>Total Populasi:</span>
                                  <span className="font-semibold text-slate-900">{d.total} unit</span>
                                </div>
                                <div className="flex justify-between text-emerald-700">
                                  <span className="font-medium">Sudah di-PM:</span>
                                  <span className="font-bold">{d.maintained} unit ({d.percentage}%)</span>
                                </div>
                                <div className="flex justify-between text-rose-700">
                                  <span className="font-medium">Belum di-PM:</span>
                                  <span className="font-bold">{d.unmaintained} unit</span>
                                </div>
                                <div className="pt-1 border-t border-slate-100 flex justify-between text-slate-500 text-xs">
                                  <span>Target / Real Hari Ini:</span>
                                  <span className="font-semibold text-slate-800">{d.todayActual} / {d.dailyTarget} unit</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                      />
                      <Bar dataKey="maintained" name="Sudah di-PM" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="unmaintained" name="Belum di-PM" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="italic text-xs">Bahan evaluasi prioritas penarikan unit ke workshop</span>
                <span className="font-semibold text-slate-700">Total {totalPopulasi} Daisha</span>
              </div>
            </div>
          )}

          {/* CHART 2: Tren 14 Hari Target vs Aktual Harian */}
          {(chartView === 'ALL' || chartView === 'TREND') && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-sky-600" />
                      <span>Tren Kinerja Harian Workshop (14 Hari)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Konsistensi pencapaian target harian wajib vs realisasi pengerjaan aktual
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Harian
                  </span>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyTrend}
                      margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                      barGap={4}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
                      <XAxis
                        dataKey="dateLabel"
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload as DailyTrendItem;
                            const isMet = p.actual >= p.target && p.target > 0;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-1.5 min-w-[210px]">
                                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                                  <span className="font-bold text-slate-900">{p.dateLabel}</span>
                                  {p.isWeekend ? (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Weekend</span>
                                  ) : isMet ? (
                                    <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">Target Tercapai</span>
                                  ) : (
                                    <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.5 rounded">Kurang {p.target - p.actual} unit</span>
                                  )}
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>Target Wajib:</span>
                                  <span className="font-semibold text-slate-900">{p.target} unit</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900">
                                  <span>Realisasi Aktual:</span>
                                  <span className={p.actual >= p.target ? 'text-emerald-600' : 'text-slate-900'}>{p.actual} unit</span>
                                </div>
                                <div className="pt-1 border-t border-slate-100 text-xs text-slate-500 space-y-0.5">
                                  <div className="flex justify-between">
                                    <span>- PM Rutin:</span>
                                    <span className="text-emerald-700 font-medium">{p.rutin} unit</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>- Repair / Perbaikan:</span>
                                    <span className="text-sky-700 font-medium">{p.repair} unit</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                      />
                      <Bar dataKey="target" name="Target Harian" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="rutin" name="PM Rutin" stackId="act" fill="#059669" radius={[0, 0, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="repair" name="Repair" stackId="act" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="italic text-xs">Target dihitung proporsional terhadap sisa hari kerja aktif</span>
                <span className="font-semibold text-slate-700">{dailyTrend.length} Hari Kerja Terakhir</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CARD DONUT EKSEKUTIF (DUA DONAT BERDAMPINGAN: CAPAIAN PM & KESIAPAN ARMADA) */}
      {(chartView === 'ALL' || chartView === 'DONUT') && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>Indikator Donat Proporsi PM & Kesehatan Armada</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rasio visual capaian kepatuhan tahun berjalan dan persentase kesiapan fisik armada pabrik
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
              Persentase Pabrik
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-center">
            {/* DONUT 1: Progres PM Tahunan */}
            <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
              <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pmDonutData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={DONUT.inner}
                      outerRadius={DONUT.outer}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pmDonutData
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell key={`pm-cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0];
                          const pct = totalPopulasi > 0 ? Math.round(((d.value as number) / totalPopulasi) * 100) : 0;
                          return (
                            <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200 text-xs">
                              <p className="font-semibold text-slate-900">{d.name}</p>
                              <p className="text-slate-600">{Number(d.value).toLocaleString('id-ID')} unit ({pct}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <text
                      x="50%"
                      y="46%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-900 font-extrabold text-2xl"
                    >
                      {totalPopulasi > 0 ? Math.round((totalMaintained / totalPopulasi) * 100) : 0}%
                    </text>
                    <text
                      x="50%"
                      y="62%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-500 font-medium text-xs"
                    >
                      Selesai PM
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col flex-1 w-full space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 text-xs pb-1 border-b border-slate-200">
                  1. Rasio Kepatuhan PM (Tahun {currentYear})
                </span>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Sudah di-PM:</span>
                  </span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {totalMaintained.toLocaleString('id-ID')} unit ({totalPopulasi > 0 ? Math.round((totalMaintained / totalPopulasi) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Belum di-PM:</span>
                  </span>
                  <span className="font-bold text-rose-700 tabular-nums">
                    {totalUnmaintained.toLocaleString('id-ID')} unit ({totalPopulasi > 0 ? Math.round((totalUnmaintained / totalPopulasi) * 100) : 0}%)
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between text-slate-500 text-xs">
                  <span>Total Populasi:</span>
                  <span className="font-semibold text-slate-800">{totalPopulasi.toLocaleString('id-ID')} Unit</span>
                </div>
              </div>
            </div>

            {/* DONUT 2: Kesiapan Fisik Armada */}
            <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
              <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conditionDonutData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={DONUT.inner}
                      outerRadius={DONUT.outer}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {conditionDonutData
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cond-cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0];
                          const pct = totalPopulasi > 0 ? ((Number(d.value) / totalPopulasi) * 100).toFixed(1) : '100';
                          return (
                            <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200 text-xs">
                              <p className="font-semibold text-slate-900">{d.name}</p>
                              <p className="text-slate-600">{Number(d.value).toLocaleString('id-ID')} unit ({pct}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <text
                      x="50%"
                      y="46%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-900 font-extrabold text-2xl"
                    >
                      {totalPopulasi > 0 ? ((okUnitsCount / totalPopulasi) * 100).toFixed(1) : 100}%
                    </text>
                    <text
                      x="50%"
                      y="62%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-500 font-medium text-xs"
                    >
                      Armada Siap
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col flex-1 w-full space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 text-xs pb-1 border-b border-slate-200">
                  2. Status Kesiapan Fisik Armada
                </span>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Siap Operasi (OK):</span>
                  </span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {okUnitsCount.toLocaleString('id-ID')} unit ({totalPopulasi > 0 ? ((okUnitsCount / totalPopulasi) * 100).toFixed(1) : 100}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span>Perlu Perbaikan (RUSAK):</span>
                  </span>
                  <span className="font-bold text-rose-700 tabular-nums">
                    {rusakUnitsCount.toLocaleString('id-ID')} unit ({totalPopulasi > 0 ? ((rusakUnitsCount / totalPopulasi) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between text-slate-500 text-xs">
                  <span>Total Dipantau:</span>
                  <span className="font-semibold text-slate-800">{totalPopulasi.toLocaleString('id-ID')} Unit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. TABEL MAPPING LENGKAP STATUS PM PER JENIS DAISHA DENGAN DRILLDOWN UNIT
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                <span>
                  Mapping PM per {groupingMode === 'JENIS' ? 'Jenis Daisha' : 'Seksi Pabrik'} (Tahun {currentYear})
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring populasi armada, kesehatan unit (OK vs RUSAK), dan kepatuhan PM dengan filter Jenis, Ukuran, dan Seksi
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Switcher Grouping Mode: Per Jenis vs Per Seksi */}
              <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setGroupingMode('JENIS');
                    setExpandedKey(null);
                  }}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    groupingMode === 'JENIS' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Berdasarkan Jenis & Ukuran
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroupingMode('SEKSI');
                    setExpandedKey(null);
                  }}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    groupingMode === 'SEKSI' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Berdasarkan Seksi Pemilik
                </button>
              </div>

              {/* Sub-toggle splitBySize khusus mode JENIS */}
              {groupingMode === 'JENIS' && (
                <button
                  type="button"
                  onClick={() => setSplitBySize(!splitBySize)}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1 cursor-pointer ${
                    splitBySize
                      ? 'bg-red-600 text-white border-red-600 font-bold'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Pecah varian ukuran Small / Medium / Large"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{splitBySize ? 'Rinci Ukuran (Aktif)' : 'Pisah Ukuran (S/M/L)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* BARIS FILTER MULTIKRITERIA: JENIS, RINCIAN UKURAN, SEKSI, STATUS PM, KONDISI */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
            {/* Filter Seksi */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Seksi:</span>
              <select
                value={filterSeksi}
                onChange={(e) => setFilterSeksi(e.target.value)}
                className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
              >
                <option value="all">Semua Seksi ({seksiOptions.length})</option>
                {seksiOptions.map((s) => (
                  <option key={s} value={s}>
                    Seksi {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Jenis Daisha */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Jenis:</span>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500 max-w-[170px]"
              >
                <option value="all">Semua Jenis ({jenisOptions.length})</option>
                {jenisOptions.map((j) => (
                  <option key={j} value={j}>
                    {formatJenisLabel(j)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Rincian Ukuran */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Ukuran:</span>
              <select
                value={filterUkuran}
                onChange={(e) => setFilterUkuran(e.target.value)}
                className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
              >
                <option value="all">Semua Ukuran</option>
                <option value="SMALL">Small (S)</option>
                <option value="MEDIUM">Medium (M)</option>
                <option value="LARGE">Large (L)</option>
                <option value="NONE">Tanpa Ukuran</option>
              </select>
            </div>

            {/* Filter Kepatuhan PM */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Kepatuhan PM:</span>
              <select
                value={filterPmStatus}
                onChange={(e) => setFilterPmStatus(e.target.value as any)}
                className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
              >
                <option value="all">Semua Status PM</option>
                <option value="maintained">Sudah di-PM</option>
                <option value="unmaintained">Belum di-PM (Backlog)</option>
              </select>
            </div>

            {/* Filter Kondisi Fisik */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Kondisi:</span>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value as any)}
                className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
              >
                <option value="all">Semua Kondisi</option>
                <option value="OK">Siap Pakai (OK)</option>
                <option value="RUSAK">Perlu Servis (RUSAK)</option>
              </select>
            </div>

            {/* Pencarian */}
            <div className="relative min-w-[150px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama / no daisha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8 pr-3 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-lg w-full focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8.5 px-2 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none"
              >
                <option value="backlog">Sisa Belum PM (Terbanyak)</option>
                <option value="total">Populasi Terbesar</option>
                <option value="rusak">Kondisi Rusak Terbanyak</option>
                <option value="pct">Persentase Capaian</option>
                <option value="target">Target Harian</option>
                <option value="name">Nama Kategori (A-Z)</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-8.5 px-2.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 inline-flex items-center gap-1 cursor-pointer transition"
                title="Reset semua filter mapping PM"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabel Data Terpadu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4">{groupingMode === 'JENIS' ? 'Jenis Daisha' : 'Seksi Operasional'}</th>
                <th scope="col" className="py-3 px-3 text-right">Populasi</th>
                <th scope="col" className="py-3 px-3 text-right">Siap / OK</th>
                <th scope="col" className="py-3 px-3 text-right">Rusak (Repair)</th>
                <th scope="col" className="py-3 px-3 text-left">Progres PM Tahun {currentYear}</th>
                <th scope="col" className="py-3 px-3 text-right">Sudah di-PM</th>
                <th scope="col" className="py-3 px-3 text-right">Belum di-PM</th>
                <th scope="col" className="py-3 px-3 text-right">Target Harian</th>
                <th scope="col" className="py-3 px-3 text-right">Aktual Hari Ini</th>
                <th scope="col" className="py-3 px-3 text-center">Status PM</th>
                <th scope="col" className="py-3 px-4 text-center">Rincian Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeMatrixList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada kategori armada yang sesuai dengan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                activeMatrixList.map((item) => {
                  const isExpanded = expandedKey === item.key;
                  const isMetToday = item.todayActual >= item.dailyTarget && item.dailyTarget > 0;

                  return (
                    <React.Fragment key={item.key}>
                      <tr
                        className={`transition hover:bg-slate-50/80 ${
                          isExpanded ? 'bg-red-50/30 font-medium' : ''
                        }`}
                      >
                        {/* Nama Kategori */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="font-semibold text-slate-900">{item.nama}</span>
                            {item.subLabel && groupingMode === 'JENIS' && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                                {item.subLabel}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Populasi */}
                        <td className="py-3 px-3 text-right font-semibold text-slate-800 tabular-nums">
                          {item.total.toLocaleString('id-ID')}
                        </td>

                        {/* Siap / OK */}
                        <td className="py-3 px-3 text-right font-semibold text-emerald-700 tabular-nums">
                          {item.okCount.toLocaleString('id-ID')}
                        </td>

                        {/* Rusak / Repair */}
                        <td className="py-3 px-3 text-right tabular-nums">
                          {item.rusakCount > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>{item.rusakCount} unit</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">0</span>
                          )}
                        </td>

                        {/* Progress Bar PM */}
                        <td className="py-3 px-3 min-w-[130px]">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs tabular-nums">
                              <span className="font-semibold text-slate-800">{item.percentage}%</span>
                              <span className="text-slate-400">{item.maintained}/{item.total}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  item.percentage >= 100
                                    ? 'bg-emerald-600'
                                    : item.percentage >= 50
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Sudah di-PM */}
                        <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">
                          {item.maintained.toLocaleString('id-ID')}
                        </td>

                        {/* Belum di-PM */}
                        <td className="py-3 px-3 text-right font-bold text-rose-700 tabular-nums">
                          {item.unmaintained.toLocaleString('id-ID')}
                        </td>

                        {/* Target Harian */}
                        <td className="py-3 px-3 text-right font-semibold text-slate-700 tabular-nums">
                          {item.dailyTarget} <span className="text-xs font-normal text-slate-400">/hr</span>
                        </td>

                        {/* Aktual Hari Ini */}
                        <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                          <span className={item.todayActual > 0 ? 'text-emerald-700' : 'text-slate-500'}>
                            {item.todayActual}
                          </span>
                        </td>

                        {/* Status PM */}
                        <td className="py-3 px-3 text-center">
                          {item.percentage >= 100 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Selesai 100%</span>
                            </span>
                          ) : isMetToday ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Tercapai</span>
                            </span>
                          ) : item.todayActual > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Kurang {Math.max(0, item.dailyTarget - item.todayActual)}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              <span>Belum Jalan</span>
                            </span>
                          )}
                        </td>

                        {/* Aksi Rincian Unit */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedKey(null);
                              } else {
                                setExpandedKey(item.key);
                                setUnitStatusFilter('all');
                                setUnitSearch('');
                              }
                            }}
                            className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-md border transition inline-flex items-center gap-1 cursor-pointer ${
                              isExpanded
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{isExpanded ? 'Tutup Unit' : `Lihat Unit (${item.total})`}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDED ACCORDION: MAPPING SETIAP UNIT DAISHA */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={11} className="p-0 bg-slate-50 border-y border-slate-200">
                            <div className="p-4 sm:p-5 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>Mapping Unit Fisik: {item.nama}</span>
                                    <span className="text-xs font-normal text-slate-500">
                                      ({item.units.length} total unit di pabrik)
                                    </span>
                                  </h4>
                                  <p className="text-xs text-slate-500">
                                    Status kesiapan fisik (OK/Rusak) dan kepatuhan PM tahun {currentYear} untuk setiap nomor armada
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Filter Status Unit */}
                                  <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-white text-xs font-medium">
                                    <button
                                      type="button"
                                      onClick={() => setUnitStatusFilter('all')}
                                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                                        unitStatusFilter === 'all'
                                          ? 'bg-slate-900 text-white font-semibold'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Semua ({item.units.length})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setUnitStatusFilter('unmaintained')}
                                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                                        unitStatusFilter === 'unmaintained'
                                          ? 'bg-rose-600 text-white font-semibold'
                                          : 'text-rose-700 hover:bg-rose-50'
                                      }`}
                                    >
                                      Belum PM ({item.unmaintained})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setUnitStatusFilter('maintained')}
                                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                                        unitStatusFilter === 'maintained'
                                          ? 'bg-emerald-600 text-white font-semibold'
                                          : 'text-emerald-700 hover:bg-emerald-50'
                                      }`}
                                    >
                                      Sudah PM ({item.maintained})
                                    </button>
                                    {item.rusakCount > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setUnitStatusFilter('rusak')}
                                        className={`px-2.5 py-1 rounded transition cursor-pointer ${
                                          unitStatusFilter === 'rusak'
                                            ? 'bg-rose-800 text-white font-semibold'
                                            : 'text-rose-800 font-bold hover:bg-rose-50'
                                        }`}
                                      >
                                        Rusak ({item.rusakCount})
                                      </button>
                                    )}
                                  </div>

                                  {/* Cari Unit */}
                                  <input
                                    type="text"
                                    placeholder="Cari No. Unit / Seksi..."
                                    value={unitSearch}
                                    onChange={(e) => setUnitSearch(e.target.value)}
                                    className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md w-40 focus:outline-hidden focus:border-red-500"
                                  />
                                </div>
                              </div>

                              {/* Grid Unit Kartu */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto pr-1">
                                {filteredExpandedUnits.length === 0 ? (
                                  <div className="col-span-full py-6 text-center text-xs text-slate-400">
                                    Tidak ada unit yang cocok dengan kriteria filter.
                                  </div>
                                ) : (
                                  filteredExpandedUnits.map((u) => {
                                    const isDone = u.is_maintained;
                                    const isDamaged = (u.last_condition || 'OK') === 'RUSAK';
                                    const dateStr = u.last_maintenance_date
                                      ? new Date(u.last_maintenance_date).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'short',
                                        })
                                      : null;

                                    return (
                                      <div
                                        key={u.id}
                                        className={`p-2.5 rounded-lg border text-left transition ${
                                          isDamaged
                                            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                                            : isDone
                                            ? 'bg-emerald-50/50 border-emerald-200'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-bold text-xs text-slate-900 tracking-tight">
                                            {u.nomor_daisha}
                                          </span>
                                          <span
                                            className={`w-2 h-2 rounded-full ${
                                              isDamaged ? 'bg-rose-600' : isDone ? 'bg-emerald-500' : 'bg-amber-400'
                                            }`}
                                          />
                                        </div>

                                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                          <span className="truncate">{u.seksi || 'Pabrik'}</span>
                                          <span className={`font-semibold ${isDamaged ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            {isDamaged ? 'RUSAK' : 'OK'}
                                          </span>
                                        </div>

                                        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                          <span className={isDone ? 'text-emerald-700 font-semibold' : 'text-slate-500 font-medium'}>
                                            {isDone ? 'Sudah PM' : 'Belum PM'}
                                          </span>
                                          {dateStr && <span className="text-slate-400">{dateStr}</span>}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
