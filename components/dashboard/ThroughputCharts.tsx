'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
} from 'recharts';
import { Info, Timer, TrendingUp, PieChart as PieIcon, Clock } from 'lucide-react';
import { CHART, DONUT } from '@/lib/chart-colors';

interface ThroughputChartsProps {
  chartTrenHarian: { tanggal: string; Masuk: number; Selesai: number; Pcs?: number }[];
  chartTrenBulanan?: { bulan: string; monthKey: string; Tiket: number; Pcs: number; Selesai: number }[];
  chartLeadTime: { rentang: string; total: number; persen: number }[];
  avgLeadTimeHours: number;
  statusData?: { name: string; value: number; color: string }[];
  chartSeksiStacked?: { seksi: string; Open: number; Progress: number; Done: number; Scrap: number; Total: number }[];
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: readonly { name?: string | number; value?: string | number; payload?: { color: string } }[];
  totalStatus?: number;
}

function DonutTooltip({ active, payload, totalStatus = 0 }: DonutTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const val = Number(item.value) || 0;
    const pct = totalStatus > 0 ? Math.round((val / totalStatus) * 100) : 0;
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-md">
        <p className="font-extrabold" style={{ color: item.payload?.color }}>{item.name}</p>
        <p className="text-slate-800 font-semibold mt-0.5">
          <strong>{val}</strong> Unit ({pct}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function ThroughputCharts({
  chartTrenHarian,
  chartTrenBulanan = [],
  chartLeadTime,
  avgLeadTimeHours,
  statusData = [],
}: ThroughputChartsProps) {
  // Mode rentang waktu: '7days' (1 minggu terakhir - default), '14days' (2 minggu), 'monthly' (bulanan)
  const [timelineScale, setTimelineScale] = useState<'7days' | '14days' | 'monthly'>('7days');

  // Siapkan data timeline bulanan jika mode bulanan dipilih
  const timelineMonthlyData = chartTrenBulanan.map((b) => ({
    tanggal: b.bulan,
    Masuk: b.Tiket,
    Selesai: b.Selesai,
  }));

  // Filter rentang data sesuai pilihan (default 7 hari = 1 minggu terakhir)
  const activeTimelineData = useMemo(() => {
    if (timelineScale === '7days') {
      return chartTrenHarian.slice(-7);
    }
    if (timelineScale === '14days') {
      return chartTrenHarian.slice(-14);
    }
    return timelineMonthlyData;
  }, [timelineScale, chartTrenHarian, timelineMonthlyData]);

  // Hitung batas maksimum sumbu Y dengan headroom agar label angka tidak terpotong
  const yMaxDomain = useMemo(() => {
    let max = 4;
    for (const d of activeTimelineData) {
      if ((d.Masuk || 0) > max) max = d.Masuk;
      if ((d.Selesai || 0) > max) max = d.Selesai;
    }
    return Math.ceil(max * 1.3);
  }, [activeTimelineData]);

  const totalMasukTimeline = useMemo(
    () => activeTimelineData.reduce((acc, d) => acc + (d.Masuk || 0), 0),
    [activeTimelineData]
  );

  const totalSelesaiTimeline = useMemo(
    () => activeTimelineData.reduce((acc, d) => acc + (d.Selesai || 0), 0),
    [activeTimelineData]
  );

  // Hitung total untuk donut status
  const totalStatus = statusData.reduce((s, d) => s + d.value, 0);
  const doneCount = statusData.find(d => d.name === 'Selesai' || d.name === 'Done')?.value || 0;
  const completionRate = totalStatus > 0 ? Math.round((doneCount / totalStatus) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Grafik Utama: Komparasi volume masuk vs selesai */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/60">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Masuk vs Selesai
                </h3>
                <span className="text-xs text-slate-400 font-normal">
                  {timelineScale === '7days' ? '7 Hari Terakhir' : timelineScale === '14days' ? '14 Hari Terakhir' : 'Akumulasi Bulanan'}
                </span>
              </div>
            </div>

            {/* Toggle Rentang Waktu: 7 Hari (1 Minggu) vs 14 Hari vs Bulanan */}
            <div className="flex items-center p-0.5 bg-slate-100/90 rounded-lg text-xs font-semibold w-full sm:w-auto overflow-x-auto shrink-0 justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setTimelineScale('7days')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  timelineScale === '7days'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan rentang 7 hari kerja terakhir (1 minggu)"
              >
                7 Hari (1 Minggu)
              </button>
              <button
                type="button"
                onClick={() => setTimelineScale('14days')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  timelineScale === '14days'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan rentang 14 hari kerja terakhir"
              >
                14 Hari
              </button>
              <button
                type="button"
                onClick={() => setTimelineScale('monthly')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  timelineScale === 'monthly'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan agregasi data per bulan"
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Legenda Indikator Makna Warna & Simbol (Tanpa Kotak Berlebih) */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 my-2 pt-1 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
              <span>Unit Masuk:</span>
              <span className="text-slate-900 font-semibold">{totalMasukTimeline}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Unit Selesai:</span>
              <span className="text-slate-900 font-semibold">{totalSelesaiTimeline}</span>
            </div>

            {/* Indikator Net Balance Arus */}
            {(() => {
              const netDiff = totalMasukTimeline - totalSelesaiTimeline;
              if (netDiff > 0) {
                return (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Net: <strong className="font-semibold">+{netDiff} Antrean Bertambah</strong></span>
                  </div>
                );
              }
              if (netDiff < 0) {
                return (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Net: <strong className="font-semibold">{Math.abs(netDiff)} Surplus Selesai</strong></span>
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Net: <strong className="font-semibold">Seimbang (1:1)</strong></span>
                </div>
              );
            })()}

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-normal ml-auto">
              <span>Sumbu Horizontal: Tanggal</span>
            </div>
          </div>
        </div>

        {/* 1 Grafik: Komparasi Volume Masuk vs Selesai (DIPERBESAR & DIPERLEBAR) */}
        <div className="w-full my-2 h-[370px] sm:h-[420px]">
          {activeTimelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeTimelineData}
                margin={{ top: 25, right: 25, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 700 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  domain={[0, yMaxDomain]}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                  allowDecimals={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const masukVal = Number(payload.find((p) => p.dataKey === 'Masuk')?.value || 0);
                    const selesaiVal = Number(payload.find((p) => p.dataKey === 'Selesai')?.value || 0);
                    const balance = masukVal - selesaiVal;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3.5 shadow-lg text-xs space-y-2 min-w-[210px]">
                        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span className="text-sm">{label}</span>
                          <span className="text-xs text-slate-500 font-semibold">Komparasi Harian</span>
                        </p>
                        <div className="flex items-center justify-between font-bold text-red-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
                            <span>Unit Masuk:</span>
                          </span>
                          <span className="text-sm font-black">{masukVal} Unit</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-emerald-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                            <span>Unit Selesai:</span>
                          </span>
                          <span className="text-sm font-black">{selesaiVal} Unit</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>Status Arus:</span>
                          <span
                            className={
                              balance === 0
                                ? 'text-emerald-600 font-bold'
                                : balance > 0
                                ? 'text-amber-600 font-bold'
                                : 'text-emerald-700 font-bold'
                            }
                          >
                            {balance === 0
                              ? 'Seimbang (0 Unit)'
                              : balance > 0
                              ? `+${balance} Unit Pending`
                              : `${Math.abs(balance)} Surplus Selesai`}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="Masuk"
                  name="Unit Masuk"
                  fill="#dc2626"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={40}
                >
                  <LabelList
                    dataKey="Masuk"
                    position="top"
                    formatter={(val: unknown) => (Number(val) > 0 ? String(val) : '')}
                    style={{ fontSize: 13, fontWeight: 800, fill: '#dc2626' }}
                  />
                </Bar>
                <Bar
                  dataKey="Selesai"
                  name="Unit Selesai"
                  fill="#059669"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={40}
                >
                  <LabelList
                    dataKey="Selesai"
                    position="top"
                    formatter={(val: unknown) => (Number(val) > 0 ? String(val) : '')}
                    style={{ fontSize: 13, fontWeight: 800, fill: '#059669' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data timeline
            </div>
          )}
        </div>
      </div>

      {/* Baris kedua: Donut status & lead time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 2. Diagram Donat: Status pipeline */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <PieIcon className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Status Tiket
            </h3>
          </div>

          {totalStatus > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 py-3">
              {/* Diagram Donat dengan KPI Total di Tengah - DIBESARKAN */}
              <div className="relative h-56 w-56 sm:h-64 sm:w-64 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {statusData
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip totalStatus={totalStatus} />} />
                    <text
                      x="50%"
                      y="46%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-900 font-black text-3xl sm:text-4xl"
                    >
                      {totalStatus}
                    </text>
                    <text
                      x="50%"
                      y="59%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-500 font-bold text-xs uppercase tracking-wide"
                    >
                      Total Tiket
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda & Rincian Kartu Status (Clean List Rows, No Nested Cards) */}
              <div className="flex flex-col flex-1 w-full divide-y divide-slate-100">
                {statusData.map((st) => {
                  const pct = totalStatus > 0 ? Math.round((st.value / totalStatus) * 100) : 0;
                  const getMeaning = (name: string) => {
                    if (name === 'Open' || name.toLowerCase().includes('antre'))
                      return { title: 'Antre', sub: 'Menunggu teknisi' };
                    if (name === 'Progress' || name.toLowerCase().includes('kerja'))
                      return { title: 'Dikerjakan', sub: 'Proses fisik' };
                    if (name === 'Done' || name.toLowerCase().includes('selesai'))
                      return { title: 'Selesai', sub: 'Siap kembali' };
                    if (name === 'Scrap' || name.toLowerCase().includes('afkir'))
                      return { title: 'Afkir (Scrap)', sub: 'Tidak layak' };
                    return { title: name, sub: '' };
                  };
                  const meaning = getMeaning(st.name);

                  return (
                    <div
                      key={st.name}
                      className="flex items-center justify-between py-2 text-xs font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <div>
                          <span className="text-slate-800 font-semibold block">{meaning.title}</span>
                          <span className="text-xs text-slate-400 font-normal">{meaning.sub}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-right">
                        <span className="font-bold text-slate-900 tabular-nums">{st.value} Unit</span>
                        <span className="text-xs text-slate-400">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              Belum ada data status tiket
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tingkat Penyelesaian:</span>
            <span className="font-bold text-emerald-600">{completionRate}% Selesai</span>
          </div>
        </div>

        {/* 3. Batang Horizontal: Durasi perbaikan / lead time */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-3 mb-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Durasi Perbaikan
                </h3>
              </div>

              {avgLeadTimeHours > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold">
                  <Timer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Rata-rata: {avgLeadTimeHours} Jam</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">
                  <span>Rata-rata: &lt; 1 Jam</span>
                </div>
              )}
            </div>

            {/* Legenda Makna Warna SLA */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 mb-2">
              <span className="font-semibold text-slate-900">Makna Warna SLA:</span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" /> &lt;4j (Prima)
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-sky-800">
                  <span className="w-2 h-2 rounded-full bg-[#0284c7]" /> &lt;24j (Target)
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> 1-3h (Standar)
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-rose-800">
                  <span className="w-2 h-2 rounded-full bg-[#e11d48]" /> &gt;3h (Tertunda)
                </span>
              </div>
            </div>

            {/* Batang Horizontal Lead Time - DIBESARKAN */}
            <div className="h-64 sm:h-72 w-full">
              {chartLeadTime.some((d) => d.total > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartLeadTime}
                    layout="vertical"
                    margin={{ top: 8, right: 45, left: 35, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="rentang"
                      type="category"
                      tick={{ fontSize: 13, fill: '#0f172a', fontWeight: 700 }}
                      width={95}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const item = payload[0]?.payload as { total: number; persen: number; rentang: string };
                        const getSla = (rentangStr: string) => {
                          if (rentangStr.includes('< 4')) return { label: 'SLA Prima (< 4 Jam)', badge: 'Prima', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
                          if (rentangStr.includes('4 - 12')) return { label: 'Shift Sama (4 - 12 Jam)', badge: 'Cepat', cls: 'text-teal-700 bg-teal-50 border-teal-200' };
                          if (rentangStr.includes('12 - 24')) return { label: 'Target Optimal (< 24 Jam)', badge: 'On Target', cls: 'text-sky-700 bg-sky-50 border-sky-200' };
                          if (rentangStr.includes('1 - 3')) return { label: 'Standar Wajar (1 - 3 Hari)', badge: 'Standar', cls: 'text-amber-700 bg-amber-50 border-amber-200' };
                          return { label: 'Tertunda / Over SLA (> 3 Hari)', badge: 'Over SLA', cls: 'text-rose-700 bg-rose-50 border-rose-200' };
                        };
                        const slaInfo = getSla(String(label));

                        return (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-lg space-y-1.5 min-w-[200px]">
                            <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                              <span>Rentang: {label}</span>
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${slaInfo.cls}`}>
                                {slaInfo.badge}
                              </span>
                            </p>
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-500">Jumlah Selesai:</span>
                              <span className="text-slate-950 font-extrabold text-sm">
                                {item?.total || 0} Unit ({item?.persen || 0}%)
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{slaInfo.label}</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={18}>
                      {chartLeadTime.map((entry, idx) => {
                        let barColor = '#0d9488';
                        if (entry.rentang.includes('< 4')) barColor = '#10b981';
                        else if (entry.rentang.includes('4 - 12')) barColor = '#0d9488';
                        else if (entry.rentang.includes('12 - 24')) barColor = '#0284c7';
                        else if (entry.rentang.includes('1 - 3')) barColor = '#f59e0b';
                        else barColor = '#e11d48';

                        return <Cell key={`cell-lead-${idx}`} fill={barColor} />;
                      })}
                      <LabelList
                        dataKey="total"
                        position="right"
                        fill="#0f172a"
                        fontSize={12}
                        fontWeight={800}
                        formatter={(val: unknown) => `${val ?? 0} unit`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Belum ada data durasi perbaikan
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar Kecepatan Servis</span>
            <span className="font-semibold text-slate-600">Optimal: &lt; 24 Jam</span>
          </div>
        </div>
      </div>
    </div>
  );
}
