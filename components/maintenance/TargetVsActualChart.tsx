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
} from 'recharts';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Layers,
  Calendar,
  Search,
  AlertTriangle,
  ArrowUpDown,
  CalendarClock,
} from 'lucide-react';
import { FleetUnit } from './FleetExplorer';
import { BreakdownItem } from './MaintenanceKPICards';

export interface DailyTrendItem {
  date: string;
  dateLabel: string;
  isWeekend: boolean;
  target: number;
  actual: number;
  rutin: number;
  repair: number;
}

export interface JenisBacklogItem {
  key: string;
  nama: string;
  ukuran?: string;
  total: number;
  maintained: number;
  backlog: number; // Unmaintained units
  dailyTarget: number;
  realActual: number; // Today's actual
  gap: number; // realActual - dailyTarget
  percentage: number;
  variantsCount?: number;
}

interface TargetVsActualChartProps {
  data: DailyTrendItem[];
  dailyTarget: number;
  breakdown?: Record<string, BreakdownItem>;
  units?: FleetUnit[];
  remainingWorkDays?: number;
  title?: string;
  subtitle?: string;
}

// Format nama daisha yang ramah dan konsisten
function formatJenisName(raw: string): string {
  if (!raw) return 'Lainnya';
  // Hapus postfix ukuran jika ada
  let clean = raw.replace(/_(SMALL|MEDIUM|LARGE|NONE)$/i, '');
  // Format snake/screaming_snake jadi Title Case
  clean = clean
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return clean;
}

export default function TargetVsActualChart({
  data,
  dailyTarget,
  breakdown = {},
  units = [],
  remainingWorkDays = 1,
  title = 'Grafik Target vs Realisasi PM & Backlog per Jenis Daisha',
  subtitle = 'Komparasi visual target harian dan aktual pengerjaan terpisah per jenis daisha serta pantauan sisa antrean backlog',
}: TargetVsActualChartProps) {
  // Mode Tampilan: Per Jenis Daisha (Backlog Tracker) vs Tren Harian 14 Hari
  const [viewMode, setViewMode] = useState<'JENIS' | 'TREND'>('JENIS');
  // Opsi Pengelompokan: Gabung jenis utama vs Rinci per varian ukuran
  const [splitBySize, setSplitBySize] = useState<boolean>(false);
  // Filter pencarian nama daisha
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Pengurutan tabel backlog: 'backlog' (terbanyak), 'gap' (defisit terbesar), 'name' (abjad)
  const [sortBy, setSortBy] = useState<'backlog' | 'gap' | 'target' | 'name'>('backlog');

  // ============================================================================
  // 1. Agregasi Data per Jenis Daisha dari `breakdown` dan `units`
  // ============================================================================
  const { jenisDataList, totalBacklog, totalDailyTarget, totalRealActualToday } = useMemo(() => {
    const map = new Map<string, JenisBacklogItem>();

    // Jika ada `breakdown` object dari API
    const hasBreakdown = breakdown && Object.keys(breakdown).length > 0;

    if (hasBreakdown) {
      Object.entries(breakdown).forEach(([key, b]) => {
        // Deteksi ukuran jika ada
        const ukMatch = key.match(/_(SMALL|MEDIUM|LARGE|NONE)$/i);
        const ukuran = ukMatch && ukMatch[1] !== 'NONE' ? ukMatch[1].toUpperCase() : undefined;
        const baseJenis = key.replace(/_(SMALL|MEDIUM|LARGE|NONE)$/i, '');
        const friendlyName = formatJenisName(baseJenis);

        const groupKey = splitBySize
          ? (ukuran ? `${baseJenis}_${ukuran}` : baseJenis)
          : baseJenis.toLowerCase();

        const displayName = splitBySize && ukuran
          ? `${friendlyName} (${ukuran === 'SMALL' ? 'S' : ukuran === 'MEDIUM' ? 'M' : 'L'})`
          : friendlyName;

        if (!map.has(groupKey)) {
          map.set(groupKey, {
            key: groupKey,
            nama: displayName,
            ukuran: splitBySize ? ukuran : undefined,
            total: 0,
            maintained: 0,
            backlog: 0,
            dailyTarget: 0,
            realActual: 0,
            gap: 0,
            percentage: 0,
            variantsCount: 0,
          });
        }

        const entry = map.get(groupKey)!;
        entry.total += b.total || 0;
        entry.maintained += b.maintained || 0;
        entry.backlog += b.unmaintained || 0;
        entry.dailyTarget += b.dailyTarget || 0;
        entry.realActual += b.todayActual || 0;
        entry.variantsCount = (entry.variantsCount || 0) + 1;
      });
    } else if (units && units.length > 0) {
      // Fallback aggregasi langsung dari array `units`
      units.forEach((u) => {
        const baseName = (u.nama_daisha || u.jenis || 'Daisha').trim();
        const rawUkuran = (u.ukuran || '').toUpperCase();
        const hasSize = rawUkuran && rawUkuran !== 'NONE';

        const groupKey = splitBySize
          ? (hasSize ? `${baseName.toLowerCase()}_${rawUkuran.toLowerCase()}` : baseName.toLowerCase())
          : baseName.toLowerCase();

        const displayName = splitBySize && hasSize
          ? `${baseName} (${rawUkuran === 'SMALL' ? 'S' : rawUkuran === 'MEDIUM' ? 'M' : 'L'})`
          : baseName;

        if (!map.has(groupKey)) {
          map.set(groupKey, {
            key: groupKey,
            nama: displayName,
            ukuran: splitBySize && hasSize ? rawUkuran : undefined,
            total: 0,
            maintained: 0,
            backlog: 0,
            dailyTarget: 0,
            realActual: 0,
            gap: 0,
            percentage: 0,
            variantsCount: 0,
          });
        }

        const entry = map.get(groupKey)!;
        entry.total += 1;
        if (u.is_maintained) {
          entry.maintained += 1;
        } else {
          entry.backlog += 1;
        }
        entry.variantsCount = (entry.variantsCount || 0) + 1;
      });

      // Hitung target harian dari sisa backlog
      map.forEach((entry) => {
        entry.dailyTarget = remainingWorkDays > 0 ? Math.ceil(entry.backlog / remainingWorkDays) : entry.backlog;
      });
    }

    // Finalisasi percentage dan GAP
    let sumBacklog = 0;
    let sumTarget = 0;
    let sumActual = 0;

    const list = Array.from(map.values()).map((item) => {
      item.percentage = item.total > 0 ? Math.round((item.maintained / item.total) * 100) : 0;
      item.gap = item.realActual - item.dailyTarget;
      sumBacklog += item.backlog;
      sumTarget += item.dailyTarget;
      sumActual += item.realActual;
      return item;
    });

    return {
      jenisDataList: list,
      totalBacklog: sumBacklog,
      totalDailyTarget: sumTarget,
      totalRealActualToday: sumActual,
    };
  }, [breakdown, units, splitBySize, remainingWorkDays]);

  // Filter & Urutkan Data Jenis
  const filteredAndSortedJenis = useMemo(() => {
    let result = jenisDataList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => item.nama.toLowerCase().includes(q));
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'backlog') return b.backlog - a.backlog;
      if (sortBy === 'gap') return a.gap - b.gap; // defisit paling parah di atas
      if (sortBy === 'target') return b.dailyTarget - a.dailyTarget;
      if (sortBy === 'name') return a.nama.localeCompare(b.nama);
      return 0;
    });
  }, [jenisDataList, searchQuery, sortBy]);

  // Data 14 Hari untuk Trend Chart
  const todayItem = data && data.length > 0 ? data[data.length - 1] : null;
  const todayTrendActual = todayItem ? todayItem.actual : 0;
  const todayTrendTarget = todayItem ? todayItem.target || dailyTarget : dailyTarget;

  // Custom Tooltip untuk BarChart Per Jenis Daisha
  const CustomJenisTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: JenisBacklogItem }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const isAchieved = d.realActual >= d.dailyTarget && d.dailyTarget > 0;
      return (
        <div className="bg-white text-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-2 min-w-[240px]">
          <div className="pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{d.nama}</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              Total {d.total} Unit
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5 tabular-nums">
            {/* Sisa Backlog (Paling Penting) */}
            <div className="flex items-center justify-between bg-rose-50 text-rose-800 px-2 py-1 rounded font-semibold border border-rose-200">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Sisa Backlog (Belum PM):</span>
              </span>
              <span className="font-bold text-rose-900 text-xs">{d.backlog} Unit</span>
            </div>

            {/* Target Harian */}
            <div className="flex items-center justify-between text-slate-600 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                <span>Target Harian Wajib:</span>
              </span>
              <span className="font-bold text-slate-900">{d.dailyTarget} Unit</span>
            </div>

            {/* Real Actual */}
            <div className="flex items-center justify-between text-slate-900 font-semibold px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Real Actual Hari Ini:</span>
              </span>
              <span className={isAchieved ? 'text-emerald-600 font-bold' : 'text-slate-900'}>
                {d.realActual} Unit
              </span>
            </div>

            {/* GAP Selisih */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] px-1">
              <span className="text-slate-500">Status GAP Hari Ini:</span>
              <span className={`font-bold ${d.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {d.gap >= 0 ? `+${d.gap} Unit (Tercapai)` : `${d.gap} Unit (Defisit)`}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Realisasi Kepatuhan PM:</span>
              <span className="font-semibold text-slate-800">{d.percentage}% ({d.maintained}/{d.total})</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* 1. Header & Segmented Mode Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        {/* View Switcher: Per Jenis Daisha vs Tren 14 Hari */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('JENIS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'JENIS'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Per Jenis Daisha (Backlog Tracker)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TREND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'TREND'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-sky-600" />
            <span>Tren 14 Hari</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Badges: Total Backlog, Target Harian, Real Actual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Sisa Backlog (Belum PM) */}
        <div className="px-3.5 py-2 rounded-xl bg-rose-50/60 border border-rose-200 text-left">
          <span className="text-[10px] text-rose-700 font-semibold block uppercase tracking-wider">
            Total Sisa Backlog PM
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-rose-900 tabular-nums">
              {totalBacklog.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-normal text-rose-700">Unit Belum PM</span>
          </div>
        </div>

        {/* Target Harian Wajib */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
            Target Harian Wajib
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              {(totalDailyTarget || dailyTarget).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-normal text-slate-500">Unit / Hari</span>
          </div>
        </div>

        {/* Real Actual Hari Ini */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
            Real Actual Hari Ini
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-emerald-600 tabular-nums">
              {totalRealActualToday.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-normal text-slate-500">Unit Selesai</span>
          </div>
        </div>

        {/* Status GAP Hari Ini */}
        {(() => {
          const gapTotal = totalRealActualToday - (totalDailyTarget || dailyTarget);
          const isAchieved = gapTotal >= 0;
          return (
            <div
              className={`px-3.5 py-2 rounded-xl border text-left ${
                isAchieved ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}
            >
              <span
                className={`text-[10px] font-semibold block uppercase tracking-wider ${
                  isAchieved ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                Status GAP Hari Ini
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-base sm:text-lg font-bold tabular-nums ${
                    isAchieved ? 'text-emerald-800' : 'text-rose-800'
                  }`}
                >
                  {gapTotal >= 0 ? `+${gapTotal}` : `${gapTotal}`}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isAchieved ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isAchieved ? 'Unit (Tercapai)' : 'Unit (Defisit Kuota)'}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ============================================================================
          TAMPILAN 1: VISUAL PER JENIS DAISHA (TARGET VS REAL ACTUAL & BACKLOG)
          ============================================================================ */}
      {viewMode === 'JENIS' && (
        <div className="space-y-4">
          {/* Controls: Search, Split by Size, Sorting */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle Rinci Ukuran (S/M/L) */}
              <button
                type="button"
                onClick={() => setSplitBySize(!splitBySize)}
                className={`h-8 px-2.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  splitBySize
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{splitBySize ? 'Tampilkan: Rinci Ukuran (S/M/L)' : 'Tampilkan: Gabung per Jenis'}</span>
              </button>

              {/* Urutan */}
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 px-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="backlog">Sisa Backlog Terbanyak</option>
                  <option value="gap">Defisit GAP Terbesar</option>
                  <option value="target">Target Harian Tertinggi</option>
                  <option value="name">Nama Jenis (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Pencarian Jenis Daisha */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jenis daisha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-48 focus:outline-hidden focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Grouped Bar Chart: Target Harian vs Real Actual per Jenis Daisha */}
          <div className="h-64 sm:h-72 w-full pt-1">
            {filteredAndSortedJenis.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Tidak ada data jenis daisha yang sesuai pencarian
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredAndSortedJenis.slice(0, 16)} // Tampilkan 16 jenis paling relevan di grafik
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                  barGap={4}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="nama"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#475569', fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={35}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomJenisTooltip />} />

                  {/* Bar 1: Target Wajib Harian */}
                  <Bar
                    dataKey="dailyTarget"
                    name="Target Harian"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />

                  {/* Bar 2: Real Actual Pengerjaan Hari Ini */}
                  <Bar
                    dataKey="realActual"
                    name="Real Actual Hari Ini"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Footer Legend Grafik */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                <span>Target Harian</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Real Actual Hari Ini</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Arahkan kursor ke grafik untuk melihat sisa backlog & GAP unit</span>
              </span>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              Menampilkan {Math.min(filteredAndSortedJenis.length, 16)} dari {jenisDataList.length} jenis daisha
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          TAMPILAN 2: TREN HARIAN 14 HARI (WAKTU KE WAKTU)
          ============================================================================ */}
      {viewMode === 'TREND' && (
        <div className="space-y-4">
          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                barGap={3}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                      const pData = payload[0].payload as DailyTrendItem;
                      const targetVal = pData.target || 0;
                      const actualVal = pData.actual || 0;
                      const diff = actualVal - targetVal;
                      const isAchieved = actualVal >= targetVal && targetVal > 0;

                      return (
                        <div className="bg-white text-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-2 min-w-[220px]">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="font-bold text-slate-900">{pData.dateLabel}</span>
                            {pData.isWeekend ? (
                              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Akhir Pekan
                              </span>
                            ) : isAchieved ? (
                              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Target Tercapai</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Kurang {Math.abs(diff)} Unit</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 pt-0.5 tabular-nums">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
                                <span>Target Wajib:</span>
                              </span>
                              <span className="font-bold text-slate-900">{targetVal} unit</span>
                            </div>

                            <div className="flex items-center justify-between text-slate-900 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                                <span>Aktual Pengerjaan:</span>
                              </span>
                              <span className={actualVal >= targetVal ? 'text-emerald-600' : 'text-slate-900'}>
                                {actualVal} unit
                              </span>
                            </div>

                            <div className="pl-4 text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-1">
                              <div className="flex justify-between">
                                <span>- PM Rutin:</span>
                                <span className="text-emerald-700 font-medium">{pData.rutin} unit</span>
                              </div>
                              <div className="flex justify-between">
                                <span>- Repair Perbaikan:</span>
                                <span className="text-sky-700 font-medium">{pData.repair} unit</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Bar 1: Target Wajib Harian */}
                <Bar
                  dataKey="target"
                  name="Target Harian"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />

                {/* Bar 2: Aktual Maintenance Rutin */}
                <Bar
                  dataKey="rutin"
                  name="Aktual PM Rutin"
                  fill="#10b981"
                  stackId="actual"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={22}
                />

                {/* Bar 3: Aktual Repair Perbaikan */}
                <Bar
                  dataKey="repair"
                  name="Aktual Repair"
                  fill="#0284c7"
                  stackId="actual"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
                <span>Target Harian</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>PM Rutin Selesai</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                <span>Repair Selesai</span>
              </span>
            </div>
            <div className="font-semibold text-slate-700 tabular-nums">
              Akumulasi 14 Hari Terakhir
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
