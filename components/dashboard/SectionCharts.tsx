'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Info, Calendar, Layers, Tag, CheckCircle } from 'lucide-react';
import type { SeksiJenisBreakdown } from '@/hooks/useDashboardAnalytics';

interface SectionChartsProps {
  chartSeksiStacked: {
    seksi: string;
    Open: number;
    Progress: number;
    Done: number;
    Scrap: number;
    Total: number;
    totalPcs?: number;
  }[];
  seksiJenisMonthly?: Record<string, SeksiJenisBreakdown[]>;
  seksiJenisAll?: SeksiJenisBreakdown[];
  availableMonths?: { key: string; label: string }[];
  chartPelapor?: { pelapor: string; seksi: string; total: number }[];
  onSelectSeksi?: (seksi: string) => void;
  selectedSeksi?: string;
}

export default function SectionCharts({
  chartSeksiStacked,
  seksiJenisMonthly = {},
  seksiJenisAll = [],
  availableMonths = [],
  onSelectSeksi,
  selectedSeksi,
}: SectionChartsProps) {
  // Mode tampilan grafik (murni chart tanpa tabel):
  // 'model' (Stacked Bar per Model/Jenis Daisha) vs 'status' (Stacked Bar per Status Open/Progress/Done/Scrap)
  const [chartMode, setChartMode] = useState<'model' | 'status'>('model');
  // Pilihan Bulan: 'all' (Seluruh Riwayat) atau key bulan tertentu ('YYYY-MM')
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Ambil data aktif sesuai pilihan bulan (Poin 1: seberapa banyak daisha per seksi & jenisnya apa)
  const activeSeksiList = useMemo(() => {
    if (selectedMonth === 'all') {
      return seksiJenisAll.length > 0
        ? seksiJenisAll
        : chartSeksiStacked.map((s) => ({
            seksi: s.seksi,
            total: s.Total,
            totalPcs: s.totalPcs || s.Total,
            jenisList: [],
          }));
    }
    return seksiJenisMonthly[selectedMonth] || [];
  }, [selectedMonth, seksiJenisAll, seksiJenisMonthly, chartSeksiStacked]);

  // Siapkan daftar unik seluruh model/jenis daisha untuk grafik stacked model
  const uniqueModels = useMemo(() => {
    const set = new Set<string>();
    activeSeksiList.forEach((s) => {
      s.jenisList.forEach((j) => set.add(j.jenis));
    });
    return Array.from(set);
  }, [activeSeksiList]);

  // Palette warna elegan untuk model/jenis daisha
  const modelColors = [
    '#2563eb', // Royal Blue
    '#0d9488', // Teal
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#ea580c', // Orange
    '#475569', // Slate
    '#10b981', // Emerald
    '#6366f1', // Indigo
  ];

  // Format data untuk BarChart Stacked Model
  const chartModelData = useMemo(() => {
    return activeSeksiList.map((s) => {
      const row: Record<string, string | number> = {
        seksi: s.seksi,
        Total: s.total,
      };
      s.jenisList.forEach((j) => {
        row[j.jenis] = j.count;
      });
      return row;
    });
  }, [activeSeksiList]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full">
      {/* 1. Header Card dengan Filter Bulan & Toggle Tipe Grafik */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span>
              {chartMode === 'model'
                ? 'DISTRIBUSI DAISHA PER SEKSI (BERDASARKAN MODEL)'
                : 'DISTRIBUSI DAISHA PER SEKSI (BERDASARKAN STATUS)'}
            </span>
            <span title="Visualisasi grafik jumlah daisha yang masuk dari berbagai seksi plant">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {chartMode === 'model'
              ? 'Volume unit masuk per seksi plant dengan rincian komposisi model/jenis daisha'
              : 'Status progres perbaikan unit daisha (Antre, Dikerjakan, Selesai, Afkir) per seksi'}
          </p>
        </div>

        {/* Kontrol Kanan: Pemilih Bulan + Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown Filter Bulan (Poin 1) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 text-[11px] hidden sm:inline">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Pilih Periode Bulan Rekapitulasi"
              className="bg-transparent text-slate-800 font-extrabold focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Periode</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Tipe Grafik: Model vs Status */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartMode('model')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'model'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Model Daisha</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('status')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'status'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Status Pengerjaan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visualisasi Grafik Utama (Murni Chart) */}
      <div style={{ height: Math.min(400, Math.max(160, (chartMode === 'model' ? chartModelData.length : chartSeksiStacked.length) * 52 + 60)) }} className="w-full">
        {chartMode === 'model' ? (
          /* Grafik 1: Stacked Bar per Model Daisha (Poin 1 & 7) */
          chartModelData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartModelData}
                margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                onClick={(state) => {
                  if (state && state.activeLabel && onSelectSeksi) {
                    onSelectSeksi(String(state.activeLabel));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="seksi"
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: unknown, name) => [`${val} Unit`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                {uniqueModels.map((model, idx) => {
                  const isLast = idx === uniqueModels.length - 1;
                  return (
                    <Bar
                      key={model}
                      dataKey={model}
                      stackId="seksiModelStack"
                      fill={modelColors[idx % modelColors.length]}
                      name={model}
                      radius={isLast ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    >
                      {isLast && (
                        <LabelList
                          dataKey="Total"
                          position="top"
                          fill="#0f172a"
                          fontSize={11}
                          fontWeight={700}
                          formatter={(val: unknown) => `${val} Unit`}
                        />
                      )}
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data daisha per seksi
            </div>
          )
        ) : (
          /* Grafik 2: Stacked Bar per Status (Open, Progress, Done, Scrap) */
          chartSeksiStacked.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartSeksiStacked}
                margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                onClick={(state) => {
                  if (state && state.activeLabel && onSelectSeksi) {
                    onSelectSeksi(String(state.activeLabel));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="seksi"
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: unknown, name) => [`${val} Unit`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="Open" stackId="seksiStatusStack" fill="#f59e0b" name="Antre (Open)" />
                <Bar dataKey="Progress" stackId="seksiStatusStack" fill="#3b82f6" name="Dikerjakan (Progress)" />
                <Bar dataKey="Done" stackId="seksiStatusStack" fill="#10b981" name="Selesai (Done)" />
                <Bar
                  dataKey="Scrap"
                  stackId="seksiStatusStack"
                  fill="#e11d48"
                  name="Afkir (Scrap)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    dataKey="Total"
                    position="top"
                    fill="#0f172a"
                    fontSize={11}
                    fontWeight={700}
                    formatter={(val: unknown) => `${val} Unit`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data status seksi
            </div>
          )
        )}
      </div>

      {/* 3. TINGKAT PENYELESAIAN PER SEKSI */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            TINGKAT PENYELESAIAN PER SEKSI
          </h3>
          <span title="Persentase tiket yang sudah berstatus Done dibanding total tiket masuk per seksi">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Efektivitas penyelesaian perbaikan tiap seksi — semakin tinggi % Done semakin baik
        </p>

        {chartSeksiStacked.length > 0 ? (() => {
          const completionData = chartSeksiStacked
            .filter(s => s.Total > 0)
            .map(s => ({
              seksi: s.seksi,
              pctDone: s.Total > 0 ? Math.round((s.Done / s.Total) * 100) : 0,
              pctScrap: s.Total > 0 ? Math.round((s.Scrap / s.Total) * 100) : 0,
              pctOpen: s.Total > 0 ? Math.round(((s.Open + s.Progress) / s.Total) * 100) : 0,
              done: s.Done,
              total: s.Total,
            }))
            .sort((a, b) => b.pctDone - a.pctDone);

          return (
            <div style={{ height: Math.min(400, Math.max(120, completionData.length * 52 + 50)) }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={completionData}
                  layout="vertical"
                  margin={{ top: 5, right: 70, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="seksi"
                    type="category"
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                    width={70}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: unknown) => [`${val}%`, '% Selesai (Done)'] as [string, string]}
                    labelFormatter={(label, payload) => {
                      const row = payload?.[0]?.payload as { done?: number; total?: number } | undefined;
                      return row ? `${label} — ${row.done}/${row.total} tiket selesai` : label;
                    }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="pctDone" stackId="compl" fill="#10b981" name="% Selesai (Done)" radius={[0, 0, 0, 0]}>
                    {completionData.map((entry, idx) => (
                      <Cell
                        key={`cell-done-${idx}`}
                        fill={entry.pctDone >= 70 ? '#10b981' : entry.pctDone >= 40 ? '#f59e0b' : '#e11d48'}
                      />
                    ))}
                    <LabelList
                      dataKey="pctDone"
                      position="right"
                      fill="#0f172a"
                      fontSize={11}
                      fontWeight={700}
                      formatter={(v: unknown) => `${v}%`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })() : (
          <div className="h-20 flex items-center justify-center text-xs text-slate-400">
            Belum ada data penyelesaian
          </div>
        )}
      </div>
    </div>
  );
}
