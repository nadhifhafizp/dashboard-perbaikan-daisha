'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';
import {
  Truck,
  RotateCcw,
  ArrowUpDown,
  PieChart as PieIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  X,
  Layers,
  Wrench,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { FleetUnit } from '@/components/maintenance/FleetExplorer';
import { Ticket } from '@/types/ticket';
import { CHART, DONUT } from '@/lib/chart-colors';

interface FleetHealthChartsProps {
  units: FleetUnit[];
  tickets: Ticket[];
  selectedSeksi?: string;
  onSelectSeksi?: (seksi: string) => void;
}

interface JenisHealthItem {
  nama: string;
  total: number;
  ready: number;
  broken: number;
  pctReady: number;
  pctBroken: number;
  seksiList: string[];
}

interface BreakdownItem {
  label: string;
  seksi?: string;
  jenis?: string;
  total: number;
  oke: number;
  ng: number;
  pctOke: number;
  pctNg: number;
}

export default function FleetHealthCharts({
  units,
  tickets,
  selectedSeksi = '',
  onSelectSeksi,
}: FleetHealthChartsProps) {
  const [currentSeksi, setCurrentSeksi] = useState<string>(selectedSeksi || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HAS_BROKEN' | 'ALL_READY'>('ALL');
  const [sortOrder, setSortOrder] = useState<'TOTAL' | 'BROKEN'>('TOTAL');

  useEffect(() => {
    setCurrentSeksi(selectedSeksi || '');
  }, [selectedSeksi]);

  const handleSeksiChange = (seksi: string) => {
    setCurrentSeksi(seksi);
    if (onSelectSeksi) {
      onSelectSeksi(seksi);
    }
  };

  // Daftar seksi yang tersedia dengan jumlah unit armada
  const availableSeksiList = useMemo(() => {
    const map: Record<string, number> = {};
    units.forEach((u) => {
      if (u.seksi) {
        map[u.seksi] = (map[u.seksi] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [units]);

  // Set nomor daisha yang saat ini SEDANG dalam antrean servis / perbaikan bengkel (tiket Open / Progress)
  const activeRepairNoDaishaSet = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending') {
        if (t.noDaisha && t.noDaisha.trim() && t.noDaisha !== '-') {
          set.add(t.noDaisha.trim().toUpperCase());
        }
      }
    });
    return set;
  }, [tickets]);

  // Filter unit berdasarkan seksi jika ada seleksi aktif
  const targetUnits = useMemo(() => {
    if (!currentSeksi || currentSeksi === 'all') return units;
    return units.filter((u) => (u.seksi || '').toLowerCase() === currentSeksi.toLowerCase());
  }, [units, currentSeksi]);

  // 1. STATISTIK KESEHATAN ARMADA (2 POIN UTAMA: OKE VS NG)
  const globalStats = useMemo(() => {
    const total = targetUnits.length;
    let ready = 0;
    let broken = 0;
    const seksiSet = new Set<string>();
    const jenisSet = new Set<string>();

    targetUnits.forEach((u) => {
      if (u.seksi) seksiSet.add(u.seksi);
      if (u.jenis) jenisSet.add(u.jenis);

      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';

      if (isNG) {
        broken++;
      } else {
        ready++;
      }
    });

    const pctReady = total > 0 ? (ready / total) * 100 : 100;
    const pctBroken = total > 0 ? (broken / total) * 100 : 0;

    // Unit bolak-balik bengkel dari tiket repair
    const unitTicketMap: Record<string, number> = {};
    tickets.forEach((t) => {
      if (currentSeksi && currentSeksi !== 'all' && (t.seksi || '').toLowerCase() !== currentSeksi.toLowerCase()) {
        return;
      }
      if (t.noDaisha && t.noDaisha !== '-') {
        unitTicketMap[t.noDaisha] = (unitTicketMap[t.noDaisha] || 0) + 1;
      }
    });

    const recurringUnitsCount = Object.values(unitTicketMap).filter((cnt) => cnt > 1).length;

    return {
      total,
      ready,
      broken,
      pctReady,
      pctBroken,
      totalSeksi: seksiSet.size,
      totalJenis: jenisSet.size,
      recurringUnitsCount,
    };
  }, [targetUnits, tickets, activeRepairNoDaishaSet, currentSeksi]);

  // Breakdown KPI Jumlah Daisha dari Setiap Seksi (Total, OKE, NG)
  const seksiBreakdownList = useMemo<BreakdownItem[]>(() => {
    const map: Record<string, { label: string; seksi: string; total: number; oke: number; ng: number }> = {};
    units.forEach((u) => {
      const s = u.seksi && u.seksi.trim() ? u.seksi.trim() : 'Lainnya';
      if (!map[s]) {
        map[s] = { label: s, seksi: s, total: 0, oke: 0, ng: 0 };
      }
      map[s].total++;
      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';
      if (isNG) {
        map[s].ng++;
      } else {
        map[s].oke++;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        pctOke: item.total > 0 ? (item.oke / item.total) * 100 : 100,
        pctNg: item.total > 0 ? (item.ng / item.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [units, activeRepairNoDaishaSet]);

  // Breakdown saat seksi difilter: menampilkan Daisha (berdasarkan Jenis) yang ada di seksi yang dipilih
  const jenisInSeksiBreakdownList = useMemo<BreakdownItem[]>(() => {
    if (!currentSeksi || currentSeksi === 'all') return [];

    const map: Record<string, { label: string; jenis: string; total: number; oke: number; ng: number }> = {};
    targetUnits.forEach((u) => {
      const j = u.jenis && u.jenis.trim() ? u.jenis.trim() : 'LAINNYA';
      if (!map[j]) {
        map[j] = { label: j, jenis: j, total: 0, oke: 0, ng: 0 };
      }
      map[j].total++;
      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';
      if (isNG) {
        map[j].ng++;
      } else {
        map[j].oke++;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        pctOke: item.total > 0 ? (item.oke / item.total) * 100 : 100,
        pctNg: item.total > 0 ? (item.ng / item.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [targetUnits, currentSeksi, activeRepairNoDaishaSet]);

  const isSeksiFiltered = Boolean(currentSeksi && currentSeksi !== 'all');
  const activeBreakdownList: BreakdownItem[] = isSeksiFiltered ? jenisInSeksiBreakdownList : seksiBreakdownList;

  // Data donat master
  const globalDonutData = useMemo(() => [
    { name: 'OKE (Siap Operasi)', value: globalStats.ready, color: '#059669' },
    { name: 'NG (Perlu Servis/Bengkel)', value: globalStats.broken, color: '#dc2626' },
  ], [globalStats.ready, globalStats.broken]);

  // 2. DATA PER JENIS DAISHA: SETIAP JENIS MEMILIKI DIAGRAM DONAT SENDIRI
  const perJenisData = useMemo(() => {
    const map: Record<string, { nama: string; total: number; ready: number; broken: number; seksiSet: Set<string> }> = {};

    targetUnits.forEach((u) => {
      const j = u.jenis ? u.jenis.trim() : 'LAINNYA';
      if (!map[j]) {
        map[j] = { nama: j, total: 0, ready: 0, broken: 0, seksiSet: new Set() };
      }
      map[j].total++;
      if (u.seksi) map[j].seksiSet.add(u.seksi);

      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';

      if (isNG) {
        map[j].broken++;
      } else {
        map[j].ready++;
      }
    });

    const list: JenisHealthItem[] = Object.values(map).map((item) => ({
      nama: item.nama,
      total: item.total,
      ready: item.ready,
      broken: item.broken,
      pctReady: item.total > 0 ? (item.ready / item.total) * 100 : 100,
      pctBroken: item.total > 0 ? (item.broken / item.total) * 100 : 0,
      seksiList: Array.from(item.seksiSet),
    }));

    return list;
  }, [targetUnits, activeRepairNoDaishaSet]);

  // Filter & Sort per jenis daisha
  const filteredJenisData = useMemo(() => {
    let result = [...perJenisData];

    // Filter status
    if (statusFilter === 'HAS_BROKEN') {
      result = result.filter((j) => j.broken > 0);
    } else if (statusFilter === 'ALL_READY') {
      result = result.filter((j) => j.broken === 0);
    }

    // Filter search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (j) =>
          j.nama.toLowerCase().includes(q) ||
          j.seksiList.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortOrder === 'BROKEN') {
      result.sort((a, b) => b.broken - a.broken || b.total - a.total);
    } else {
      result.sort((a, b) => b.total - a.total);
    }

    return result;
  }, [perJenisData, statusFilter, searchTerm, sortOrder]);

  const countHasBroken = useMemo(() => perJenisData.filter((j) => j.broken > 0).length, [perJenisData]);
  const countAllReady = useMemo(() => perJenisData.filter((j) => j.broken === 0).length, [perJenisData]);

  // 3. TOP UNIT BOLAK-BALIK BENGKEL (PARETO RECURRING REPAIR)
  const topRecurringUnits = useMemo(() => {
    const unitMap: Record<
      string,
      {
        noDaisha: string;
        namaDaisha: string;
        seksi: string;
        repairCount: number;
        activeInWorkshop: boolean;
      }
    > = {};

    tickets.forEach((t) => {
      if (currentSeksi && currentSeksi !== 'all' && (t.seksi || '').toLowerCase() !== currentSeksi.toLowerCase()) {
        return;
      }
      if (t.noDaisha && t.noDaisha !== '-') {
        if (!unitMap[t.noDaisha]) {
          unitMap[t.noDaisha] = {
            noDaisha: t.noDaisha,
            namaDaisha: t.namaDaisha || 'Daisha',
            seksi: t.seksi || '-',
            repairCount: 0,
            activeInWorkshop: t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending',
          };
        }
        unitMap[t.noDaisha].repairCount++;
        if (t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending') {
          unitMap[t.noDaisha].activeInWorkshop = true;
        }
      }
    });

    return Object.values(unitMap)
      .filter((u) => u.repairCount > 1)
      .sort((a, b) => b.repairCount - a.repairCount)
      .slice(0, 10);
  }, [tickets, currentSeksi]);

  return (
    <div className="space-y-4">
      {/* =========================================================================
          0. FILTER SEKSI BAR (BISA FILTER PER SEKSI)
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Building2 className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-slate-800">Filter Seksi:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleSeksiChange('')}
            className={`h-10 min-h-[40px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              !currentSeksi || currentSeksi === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>Semua Seksi</span>
            <span className="text-xs opacity-75 tabular-nums">({units.length.toLocaleString('id-ID')})</span>
          </button>
          {availableSeksiList.map((s) => {
            const isSelected = currentSeksi.toLowerCase() === s.name.toLowerCase();
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => handleSeksiChange(s.name)}
                className={`h-10 min-h-[40px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>Seksi {s.name}</span>
                <span className="text-xs opacity-75 tabular-nums">({s.count.toLocaleString('id-ID')})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          1. MASTER DONUT & 2 POIN UTAMA: OKE VS NG
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <PieIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="t-section text-slate-900 tracking-tight">
                  {currentSeksi && currentSeksi !== 'all'
                    ? `KPI Jumlah Daisha — Seksi ${currentSeksi}`
                    : 'KPI Jumlah Seluruh Daisha di Bridgestone'}
                </h3>
                <p className="t-caption text-slate-500">
                  Data populasi armada fisik dan 2 status utama (OKE vs NG) diambil dari data perbaikan daisha dan seksi
                </p>
              </div>
            </div>
          </div>

          {currentSeksi && currentSeksi !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="h-8 px-2.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <span>Seksi: <strong>{currentSeksi}</strong></span>
                <button
                  type="button"
                  onClick={() => handleSeksiChange('')}
                  className="text-amber-700 hover:text-amber-900 cursor-pointer p-0.5 rounded hover:bg-amber-100"
                  title="Kembali ke semua seksi"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-center">
          {/* Master Donut Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="h-[260px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={globalDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={112}
                    paddingAngle={globalStats.broken > 0 ? 3 : 0}
                    dataKey="value"
                  >
                    {globalDonutData.map((entry, index) => (
                      <Cell key={`cell-global-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${Number(val || 0).toLocaleString('id-ID')} Unit (${(
                        (Number(val || 0) / (globalStats.total || 1)) *
                        100
                      ).toFixed(1)}%)`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Angka di tengah donat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {globalStats.pctReady.toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-emerald-700">Kondisi OKE</span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {globalStats.total.toLocaleString('id-ID')} Unit
                </span>
              </div>
            </div>
          </div>

          {/* 2 KARTU UTAMA: OKE & NG */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* KARTU 1: OKE */}
            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-emerald-900 tracking-tight">OKE</span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Siap Operasi
                </span>
              </div>
              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-emerald-700 tabular-nums">
                    {globalStats.ready.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">Unit</span>
                </div>
                <div className="text-xs text-emerald-700/90 font-medium mt-1">
                  {globalStats.pctReady.toFixed(1)}% dari total armada
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800">
                <span>Status</span>
                <span className="font-semibold">Normal / Siap Pakai</span>
              </div>
            </div>

            {/* KARTU 2: NG */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${
              globalStats.broken > 0 
                ? 'bg-red-50/70 border-red-200' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${globalStats.broken > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span className={`text-sm font-bold tracking-tight ${globalStats.broken > 0 ? 'text-red-900' : 'text-slate-800'}`}>
                    NG
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                  globalStats.broken > 0
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {globalStats.broken > 0 ? 'Perlu Servis' : 'Nol Rusak'}
                </span>
              </div>
              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold tabular-nums ${globalStats.broken > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {globalStats.broken.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">Unit</span>
                </div>
                <div className={`text-xs font-medium mt-1 ${globalStats.broken > 0 ? 'text-red-700/90' : 'text-slate-500'}`}>
                  {globalStats.pctBroken.toFixed(1)}% dari total armada
                </div>
              </div>
              <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                globalStats.broken > 0 ? 'border-red-200/60 text-red-800' : 'border-slate-200 text-slate-600'
              }`}>
                <span>Status</span>
                <span className="font-semibold">{globalStats.broken > 0 ? 'Di Bengkel / Rusak' : 'Semua Unit Baik'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BREAKDOWN KPI JUMLAH DAISHA DARI SETIAP SEKSI (TABEL & GRAFIK KOMPARASI)
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="t-section text-slate-900 tracking-tight">
                  KPI Jumlah Daisha dari Setiap Seksi
                </h3>
                <p className="t-caption text-slate-500">
                  Perbandingan total populasi armada, rasio unit OKE (siap pakai) dan NG (dalam perbaikan) per seksi
                </p>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
            {seksiBreakdownList.length} Seksi Terdaftar
          </span>
        </div>

        {/* Sub-header info grafik saat filter seksi aktif */}
        {isSeksiFiltered && (
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-700">
              Menampilkan grafik daisha untuk <strong>Seksi {currentSeksi}</strong> ({targetUnits.length.toLocaleString('id-ID')} Unit):
            </span>
            <button
              type="button"
              onClick={() => handleSeksiChange('')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              title="Tampilkan grafik semua seksi"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Grafik Semua Seksi</span>
            </button>
          </div>
        )}

        {/* Grafik Komparasi (HANYA GRAFIK YANG BERUBAH: Stacked Bar OKE vs NG dengan Angka di atas Bar) */}
        <div className="w-full pt-1 pb-2">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeBreakdownList}
                margin={{ top: 25, right: 15, left: -10, bottom: 25 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.12)]}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${Number(val || 0).toLocaleString('id-ID')} Unit`,
                    name,
                  ]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                />
                <Bar
                  dataKey="oke"
                  name="OKE (Siap Pakai)"
                  stackId="a"
                  fill="#059669"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={30}
                  minPointSize={8}
                >
                  <LabelList
                    content={(props: any) => {
                      const { x, y, width, height, index } = props;
                      const item = activeBreakdownList[index];
                      if (!item || !item.total) return null;
                      // Jika ada unit NG di atas OKE, hitung offset ketinggiannya
                      const ngHeight = item.oke > 0 && item.ng > 0 ? (height / item.oke) * item.ng : 0;
                      const labelY = y - ngHeight - 6;
                      return (
                        <text
                          x={x + width / 2}
                          y={labelY}
                          fill="#0f172a"
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={700}
                        >
                          {item.total.toLocaleString('id-ID')}
                        </text>
                      );
                    }}
                  />
                </Bar>
                <Bar
                  dataKey="ng"
                  name="NG (Dalam Perbaikan)"
                  stackId="a"
                  fill="#dc2626"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                  minPointSize={4}
                >
                  <LabelList
                    content={(props: any) => {
                      const { x, y, width, index } = props;
                      const item = activeBreakdownList[index];
                      // Hanya render dari bar NG jika unit OKE === 0 (seluruh unit rusak)
                      if (!item || !item.total || item.oke > 0) return null;
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 6}
                          fill="#0f172a"
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={700}
                        >
                          {item.total.toLocaleString('id-ID')}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabel Rincian Seksi (Tetap Utuh Menampilkan Daftar Seksi) */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-3">Nama Seksi</th>
                <th className="px-3.5 py-3 text-right">Total Daisha</th>
                <th className="px-3.5 py-3 text-right">Jumlah OKE</th>
                <th className="px-3.5 py-3 text-left w-36">Kesiapan OKE (%)</th>
                <th className="px-3.5 py-3 text-right">Jumlah NG</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                <th className="px-3.5 py-3 text-center">Aksi Filter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {seksiBreakdownList.map((row) => {
                const isSelected = currentSeksi.toLowerCase() === (row.seksi || '').toLowerCase();
                return (
                  <tr
                    key={row.label}
                    className={`hover:bg-slate-50 transition ${isSelected ? 'bg-red-50/50 font-semibold' : ''}`}
                  >
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">
                      Seksi {row.seksi}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-800 tabular-nums">
                      {row.total.toLocaleString('id-ID')} unit
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-semibold text-emerald-700 tabular-nums">
                      {row.oke.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, row.pctOke))}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 font-medium w-9 text-right tabular-nums">
                          {row.pctOke.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums">
                      {row.ng > 0 ? (
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {row.ng} unit
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      {row.ng > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>{row.ng} Di Bengkel</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>100% Siap</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleSeksiChange(isSelected ? '' : (row.seksi || ''))}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                          isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Batal Filter' : 'Filter Seksi'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          2. KOLEKSI DIAGRAM DONAT PER JENIS DAISHA
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        {/* Header Section Kontrol & Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="t-section text-slate-900 tracking-tight">
                  Kondisi per Jenis Daisha
                </h3>
                <p className="t-caption text-slate-500">
                  {currentSeksi && currentSeksi !== 'all'
                    ? `Proporsi siap operasi vs dalam perbaikan jenis armada Seksi ${currentSeksi}`
                    : 'Proporsi siap operasi vs dalam perbaikan per kategori armada'}
                </p>
              </div>
            </div>
          </div>

          {/* Baris Pencarian, Filter Status & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Input Pencarian Jenis */}
            <div className="relative min-w-[190px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jenis armada..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 min-h-[40px] pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Filter Tab Status */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold h-10 min-h-[40px]">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`h-full px-3 rounded-md transition cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Semua ({perJenisData.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('HAS_BROKEN')}
                className={`h-full px-3 rounded-md transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'HAS_BROKEN' ? 'bg-white text-red-700 font-bold' : 'text-slate-600'
                }`}
              >
                <span>Perlu Servis</span>
                {countHasBroken > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                )}
                <span>({countHasBroken})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ALL_READY')}
                className={`h-full px-3 rounded-md transition cursor-pointer ${
                  statusFilter === 'ALL_READY' ? 'bg-white text-emerald-800 font-bold' : 'text-slate-600'
                }`}
              >
                Semua Siap ({countAllReady})
              </button>
            </div>

            {/* Sorting Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'TOTAL' ? 'BROKEN' : 'TOTAL')}
              className="h-10 min-h-[40px] px-3.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition inline-flex items-center gap-1 cursor-pointer"
              title="Urutkan berdasarkan jumlah populasi atau jumlah unit yang sedang diservis"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === 'TOTAL' ? 'Populasi Terbesar' : 'Perbaikan Terbanyak'}</span>
            </button>
          </div>
        </div>

        {/* Grid Kartu Diagram Donat untuk SETIAP JENIS DAISHA */}
        {filteredJenisData.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Tidak ditemukan jenis daisha yang sesuai dengan filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
            {filteredJenisData.map((item) => {
              const donutData = [
                { name: 'Siap Operasi', value: item.ready, color: '#059669' },
                { name: 'Dalam Perbaikan', value: item.broken, color: '#dc2626' },
              ];

              return (
                <div
                  key={item.nama}
                  className={`bg-white rounded-xl border p-4 transition flex flex-col justify-between ${
                    item.broken > 0 ? 'border-red-200' : 'border-slate-200'
                  }`}
                >
                  {/* Header Kartu Donat Jenis */}
                  <div>
                    <div className="flex items-start justify-between gap-1 pb-2 border-b border-slate-100">
                      <div className="min-w-0 pr-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={item.nama}>
                          {item.nama}
                        </h4>
                        <span className="text-xs text-slate-400 block truncate">
                          {item.seksiList.join(', ') || 'Semua Seksi'}
                        </span>
                      </div>

                      {item.broken > 0 ? (
                        <span className="h-6 px-2.5 rounded-full text-xs font-bold bg-red-100 text-red-700 shrink-0 inline-flex items-center">
                          {item.broken} Rusak
                        </span>
                      ) : (
                        <span className="h-6 px-2.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shrink-0 inline-flex items-center">
                          100% Siap
                        </span>
                      )}
                    </div>

                    {/* Donut Chart Khusus untuk Jenis Daisha Ini */}
                    <div className="h-[150px] w-full relative flex items-center justify-center mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={60}
                            paddingAngle={item.broken > 0 ? 3 : 0}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {donutData.map((entry, index) => (
                              <Cell key={`cell-${item.nama}-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val: any, name: any) => [
                              `${Number(val || 0).toLocaleString('id-ID')} Unit (${(
                                (Number(val || 0) / (item.total || 1)) *
                                100
                              ).toFixed(1)}%)`,
                              name,
                            ]}
                            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Angka & Persentase di Tengah Donat */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-base font-bold text-slate-900 tabular-nums">
                          {item.pctReady.toFixed(0)}%
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {item.total.toLocaleString('id-ID')} Unit
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Rincian Siap Operasi vs Dalam Perbaikan */}
                  <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 text-xs mt-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100/80 text-center">
                      <span className="text-xs text-emerald-700 block font-medium">Siap Operasi</span>
                      <span className="font-bold text-emerald-800 tabular-nums">
                        {item.ready.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div
                      className={`p-1.5 rounded-lg text-center border ${
                        item.broken > 0
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}
                    >
                      <span className="text-xs block font-medium">Perbaikan</span>
                      <span className={`font-bold tabular-nums ${item.broken > 0 ? 'text-red-700' : 'text-slate-600'}`}>
                        {item.broken.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          3. RINCIAN NOMOR UNIT YANG PALING SERING BOLAK-BALIK BENGKEL
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <div>
              <h4 className="t-section text-slate-900">
                Unit Paling Sering Servis
              </h4>
              <p className="t-caption text-slate-500">
                Armada dengan frekuensi perbaikan berulang tertinggi
              </p>
            </div>
          </div>
          <span className="h-6 px-2.5 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center">
            {globalStats.recurringUnitsCount} Unit Berulang
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {topRecurringUnits.slice(0, 5).map((u, idx) => (
            <div
              key={u.noDaisha}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                  #{idx + 1}
                </span>
                <span className="h-6 px-2 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center">
                  {u.repairCount}x Masuk
                </span>
              </div>

              <div>
                <div className="font-bold text-slate-900 truncate">{u.noDaisha}</div>
                <span className="text-xs text-slate-500 block truncate">{u.namaDaisha}</span>
                <span className="text-xs text-slate-400 block truncate">Seksi: {u.seksi}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">Status:</span>
                {u.activeInWorkshop ? (
                  <span className="h-6 px-2 rounded-full text-xs font-semibold bg-red-100 text-red-700 inline-flex items-center">
                    Di Bengkel
                  </span>
                ) : (
                  <span className="h-6 px-2 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 inline-flex items-center">
                    Selesai
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
