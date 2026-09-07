'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Info, Timer } from 'lucide-react';

interface ThroughputChartsProps {
  chartTrenHarian: { tanggal: string; Masuk: number; Selesai: number; Pcs?: number }[];
  chartTrenBulanan?: { bulan: string; monthKey: string; Tiket: number; Pcs: number; Selesai: number }[];
  chartLeadTime: { rentang: string; total: number; persen: number }[];
  avgLeadTimeHours: number;
  // Status pipeline data untuk Donut & Stacked Bar Bulanan
  statusData?: { name: string; value: number; color: string }[];
  chartSeksiStacked?: { seksi: string; Open: number; Progress: number; Done: number; Scrap: number; Total: number }[];
}

export default function ThroughputCharts({
  chartTrenHarian,
  chartTrenBulanan = [],
  chartLeadTime,
  avgLeadTimeHours,
  statusData = [],
  chartSeksiStacked = [],
}: ThroughputChartsProps) {
  // Mode skala waktu kartu timeline: 'daily' vs 'monthly'
  const [timelineScale, setTimelineScale] = useState<'daily' | 'monthly'>('daily');

  // Siapkan data timeline bulanan jika mode bulanan dipilih
  const timelineMonthlyData = chartTrenBulanan.map((b) => ({
    tanggal: b.bulan,
    Masuk: b.Tiket,
    Selesai: b.Selesai,
  }));

  const activeTimelineData = timelineScale === 'daily' ? chartTrenHarian : timelineMonthlyData;

  // Hitung total untuk donut label persentase
  const totalStatus = statusData.reduce((s, d) => s + d.value, 0);

  // Custom tooltip untuk Donut
  const DonutTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0;
      return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 14px', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          <p style={{ fontWeight: 700, color: item.payload.color, marginBottom: 2 }}>{item.name}</p>
          <p style={{ color: '#0f172a' }}><strong>{item.value}</strong> tiket &nbsp;·&nbsp; <strong>{pct}%</strong></p>
        </div>
      );
    }
    return null;
  };

  // Warna status bulanan stacked bar
  const statusColors = { Open: '#f59e0b', Progress: '#3b82f6', Done: '#10b981', Scrap: '#e11d48' };

  return (
    <div className="space-y-6">
      {/* BARIS ATAS: Timeline + Lead Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. TIMELINE HARIAN & BULANAN DAISHA MASUK */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>TIMELINE DAISHA MASUK</span>
                <span title="Aliran unit masuk bengkel vs unit yang berhasil diselesaikan">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
              </h3>

              {/* Toggle Harian vs Bulanan */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTimelineScale('daily')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    timelineScale === 'daily'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Harian
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineScale('monthly')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    timelineScale === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                <span>Unit Masuk (Lapor)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Unit Selesai (Siap)</span>
              </div>
            </div>
          </div>

          {/* Timeline Area Chart */}
          <div className="h-68 w-full">
            {activeTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeTimelineData}
                  margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="timelineMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="timelineSelesai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} axisLine={false} />
                  <Tooltip
                    formatter={(val: unknown, name) => [`${val} Unit`, name]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Masuk"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#timelineMasuk)"
                    name="Unit Masuk"
                    dot={{ r: 3, fill: '#2563eb', strokeWidth: 1, stroke: '#ffffff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Selesai"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#timelineSelesai)"
                    name="Unit Selesai"
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data timeline
              </div>
            )}
          </div>
        </div>

        {/* 2. DURASI PERBAIKAN / LEAD TIME */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>DURASI PERBAIKAN (LEAD TIME)</span>
                <span title="Distribusi berapa lama pengerjaan servis sejak unit dilaporkan hingga selesai">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span className="font-semibold">Bracket Durasi Servis</span>
              {avgLeadTimeHours > 0 ? (
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-purple-600" />
                  <span>Rata-rata: {avgLeadTimeHours} Jam</span>
                </span>
              ) : (
                <span className="text-slate-400">Rata-rata: &lt; 1 Jam</span>
              )}
            </div>
          </div>

          {/* Vertical Bar Chart Distribusi Lead Time */}
          <div className="h-68 w-full">
            {chartLeadTime.some((d) => d.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartLeadTime}
                  margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="rentang"
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} axisLine={false} />
                  <Tooltip
                    formatter={(val: unknown, _, item) => [
                      `${val} Unit (${(item?.payload as { persen: number })?.persen || 0}%)`,
                      'Jumlah Diselesaikan',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={32}>
                    <LabelList
                      dataKey="total"
                      position="top"
                      fill="#0f172a"
                      fontSize={11}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data durasi servis
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BARIS BAWAH: Donut Status Pipeline + Tren Status Bulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. DONUT STATUS PIPELINE SAAT INI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span>STATUS PIPELINE SAAT INI</span>
              <span title="Komposisi tiket aktif berdasarkan status pengerjaan">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Snapshot proporsi tiket Open, Progress, Done, dan Scrap dari filter aktif
            </p>
          </div>

          {totalStatus > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              {/* Donut Chart */}
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {statusData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-status-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Stats kanan */}
              <div className="flex flex-col gap-2.5 flex-1 w-full">
                {statusData.map((item) => {
                  const pct = totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs font-semibold text-slate-700 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-900">{item.value}</span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: `${item.color}20`, color: item.color }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Total */}
                <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">TOTAL</span>
                  <span className="text-sm font-black text-slate-900">{totalStatus} Tiket</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Belum ada data status
            </div>
          )}
        </div>

        {/* 4. TREN STATUS BULANAN (Stacked Bar) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span>TREN STATUS BULANAN</span>
              <span title="Komposisi Open, Progress, Done, Scrap per bulan — lihat apakah backlog menumpuk atau berkurang">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi status perbaikan per bulan untuk evaluasi backlog dan kapasitas bengkel
            </p>
          </div>

          <div className="h-52 w-full flex-1">
            {chartTrenBulanan.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartTrenBulanan}
                  margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="bulan"
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
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
                    formatter={(val: unknown, name) => [`${val} Tiket`, name]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  {/* Selesai sebagai proxy Done (data trenBulanan hanya punya Selesai) */}
                  <Bar dataKey="Selesai" stackId="bulananStack" fill={statusColors.Done} name="Selesai (Done)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Tiket" stackId="bulananStack" fill={statusColors.Open} name="Total Masuk"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="Tiket"
                      position="top"
                      fill="#0f172a"
                      fontSize={10}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data tren bulanan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
