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

interface ThroughputChartsProps {
  chartTrenHarian: { tanggal: string; Masuk: number; Selesai: number; Pcs?: number }[];
  chartTrenBulanan?: { bulan: string; monthKey: string; Tiket: number; Pcs: number; Selesai: number }[];
  chartLeadTime: { rentang: string; total: number; persen: number }[];
  avgLeadTimeHours: number;
  statusData?: { name: string; value: number; color: string }[];
  chartSeksiStacked?: { seksi: string; Open: number; Progress: number; Done: number; Scrap: number; Total: number }[];
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

  // Data untuk model komparasi bilateral (inflow vs outflow):
  // MasukNeg bernilai negatif agar bar Masuk memanjang ke sisi kiri (negatif X)
  // SelesaiPos bernilai positif agar bar Selesai memanjang ke sisi kanan (positif X)
  const horizontalMirrorData = useMemo(() => {
    return activeTimelineData.map((d) => ({
      ...d,
      MasukNeg: d.Masuk > 0 ? -d.Masuk : 0,
      SelesaiPos: d.Selesai > 0 ? d.Selesai : 0,
    }));
  }, [activeTimelineData]);

  // Hitung batas simetris sumbu X dengan headroom 55% agar label angka di ujung bar tidak terpotong
  const mirrorXMaxDomain = useMemo(() => {
    let max = 4;
    for (const d of activeTimelineData) {
      if ((d.Masuk || 0) > max) max = d.Masuk;
      if ((d.Selesai || 0) > max) max = d.Selesai;
    }
    return Math.ceil(max * 1.55);
  }, [activeTimelineData]);

  // Tinggi chart dinamis agar pas dan proporsional dengan jumlah baris yang tampil
  const mirrorChartHeight = useMemo(() => {
    return Math.max(340, horizontalMirrorData.length * 42);
  }, [horizontalMirrorData.length]);

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

  // Custom tooltip untuk Donut Status
  const DonutTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0;
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-md">
          <p className="font-extrabold" style={{ color: item.payload.color }}>{item.name}</p>
          <p className="text-slate-800 font-semibold mt-0.5">
            <strong>{item.value}</strong> Unit ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. GRAFIK UTAMA: KOMPARASI VOLUME MASUK VS SELESAI ================= */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <span>Tren Komparasi Unit Masuk vs Selesai</span>
                <span title="Grafik komparasi dua arah: Menampilkan volume unit masuk di sisi kiri dan unit selesai di sisi kanan berdasarkan tanggal">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Komparasi harian: Unit masuk (kiri) vs unit selesai diperbaiki (kanan) •{' '}
                <span className="font-semibold text-slate-700">
                  {timelineScale === '7days'
                    ? 'Rentang: 7 hari kerja terakhir (1 minggu)'
                    : timelineScale === '14days'
                    ? 'Rentang: 14 hari kerja terakhir'
                    : 'Rentang: Agregasi per bulan'}
                </span>
              </p>
            </div>

            {/* Toggle Rentang Waktu: 7 Hari (1 Minggu) vs 14 Hari vs Bulanan */}
            <div className="flex items-center p-0.5 bg-slate-100/90 rounded-lg text-xs font-semibold w-full sm:w-auto overflow-x-auto shrink-0 justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setTimelineScale('7days')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  timelineScale === '7days'
                    ? 'bg-white text-slate-900 shadow-xs'
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
                    ? 'bg-white text-slate-900 shadow-xs'
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
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan agregasi data per bulan"
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Legenda Indikator Makna Warna & Simbol */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium my-3">
            <div className="flex items-center gap-2 text-red-700 bg-red-50/70 px-3 py-1 rounded-lg border border-red-200/80">
              <span className="w-3 h-3 rounded-xs bg-red-600 inline-block shadow-2xs" />
              <span>📥 Unit Masuk (Beban Antrean)</span>
              <span className="text-xs text-red-900 bg-red-100 px-2 py-0.5 rounded-md font-bold ml-1">
                {totalMasukTimeline}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/60 px-3 py-1 rounded-lg border border-emerald-100">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block shadow-2xs" />
              <span>✅ Unit Selesai (Output Bengkel)</span>
              <span className="text-xs text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md font-bold ml-1">
                {totalSelesaiTimeline}
              </span>
            </div>

            {/* Indikator Net Balance Arus */}
            {(() => {
              const netDiff = totalMasukTimeline - totalSelesaiTimeline;
              if (netDiff > 0) {
                return (
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Status Arus: <strong>+{netDiff} Antrean Bertambah</strong></span>
                  </div>
                );
              }
              if (netDiff < 0) {
                return (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Status Arus: <strong>{Math.abs(netDiff)} Unit Surplus Selesai</strong></span>
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Status Arus: <strong>Seimbang (1:1)</strong></span>
                </div>
              );
            })()}

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-normal ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>Poros Netral (0)</span>
            </div>
          </div>
        </div>

        {/* 1 Grafik Utuh: Komparasi Bilateral Unit Masuk vs Selesai */}
        <div className="w-full my-2" style={{ height: `${mirrorChartHeight}px` }}>
          {horizontalMirrorData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={horizontalMirrorData}
                layout="vertical"
                margin={{ top: 12, right: 45, left: 20, bottom: 12 }}
                stackOffset="sign"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1.5} />
                <XAxis
                  type="number"
                  domain={[-mirrorXMaxDomain, mirrorXMaxDomain]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => String(Math.abs(val))}
                  allowDecimals={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="tanggal"
                  interval={0}
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const masukRaw = payload.find((p) => p.dataKey === 'MasukNeg')?.value;
                    const masukVal = Math.abs(Number(masukRaw || 0));
                    const selesaiVal = Number(payload.find((p) => p.dataKey === 'SelesaiPos')?.value || 0);
                    const balance = masukVal - selesaiVal;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[190px]">
                        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span>{label}</span>
                          <span className="text-xs text-slate-500 font-normal">Komparasi Harian</span>
                        </p>
                        <div className="flex items-center justify-between font-semibold text-red-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-xs bg-red-600" />
                            <span>Unit Masuk:</span>
                          </span>
                          <span>{masukVal} Unit</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold text-emerald-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-xs bg-emerald-500" />
                            <span>Unit Selesai:</span>
                          </span>
                          <span>{selesaiVal} Unit</span>
                        </div>
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                          <span>Status Arus:</span>
                          <span
                            className={
                              balance === 0
                                ? 'text-emerald-600 font-bold'
                                : balance > 0
                                ? 'text-amber-600 font-bold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            {balance === 0
                              ? 'Seimbang (0 Unit)'
                              : balance > 0
                              ? `+${balance} Unit Pending`
                              : `${Math.abs(balance)} Unit Selesai Bersih`}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="MasukNeg"
                  name="Unit Masuk"
                  fill="#E60012"
                  stackId="h-mirror"
                  radius={[5, 0, 0, 5]}
                  barSize={18}
                >
                  <LabelList
                    dataKey="MasukNeg"
                    content={(props: any) => {
                      const { x, y, width, height, value } = props;
                      if (!value || Number(value) === 0) return null;
                      const leftTip = Math.min(x, x + (width || 0));
                      return (
                        <text
                          x={leftTip - 8}
                          y={y + (height || 18) / 2 + 1}
                          fill="#B3000E"
                          textAnchor="end"
                          dominantBaseline="central"
                          fontSize={11.5}
                          fontWeight={800}
                        >
                          {Math.abs(Number(value))}
                        </text>
                      );
                    }}
                  />
                </Bar>
                <Bar
                  dataKey="SelesaiPos"
                  name="Unit Selesai"
                  fill="#10b981"
                  stackId="h-mirror"
                  radius={[0, 5, 5, 0]}
                  barSize={18}
                >
                  <LabelList
                    dataKey="SelesaiPos"
                    content={(props: any) => {
                      const { x, y, width, height, value } = props;
                      if (!value || Number(value) === 0) return null;
                      const rightTip = Math.max(x, x + (width || 0));
                      return (
                        <text
                          x={rightTip + 8}
                          y={y + (height || 18) / 2 + 1}
                          fill="#047857"
                          textAnchor="start"
                          dominantBaseline="central"
                          fontSize={11.5}
                          fontWeight={800}
                        >
                          {Number(value)}
                        </text>
                      );
                    }}
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

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>Komparasi Bilateral: Data unit masuk (kiri) dan selesai (kanan) terpetakan pada sumbu tanggal</span>
          <span className="font-semibold text-slate-600">Arahkan kursor ke grafik untuk rincian harian</span>
        </div>
      </div>

      {/* ================= BARIS KEDUA: DONUT STATUS & LEAD TIME ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= 2. DIAGRAM DONAT: STATUS PIPELINE ================= */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-slate-600" />
                <span>Komposisi Status Tiket Daisha</span>
                <span title="Proporsi status pengerjaan unit saat ini">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Diagram donat proporsi tiket Antre, Dikerjakan, Selesai, dan Scrap
            </p>
          </div>

          {totalStatus > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 py-2">
              {/* Diagram Donat dengan KPI Total di Tengah */}
              <div className="relative h-48 w-48 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={84}
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
                    <Tooltip content={<DonutTooltip />} />
                    <text
                      x="50%"
                      y="47%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-900 font-extrabold text-2xl"
                    >
                      {totalStatus}
                    </text>
                    <text
                      x="50%"
                      y="61%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-500 font-medium text-xs"
                    >
                      Total Tiket
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda & Rincian Kartu Status */}
              <div className="flex flex-col gap-2 flex-1 w-full">
                {statusData.map((st) => {
                  const pct = totalStatus > 0 ? Math.round((st.value / totalStatus) * 100) : 0;
                  const getMeaning = (name: string) => {
                    if (name === 'Open' || name.toLowerCase().includes('antre'))
                      return { title: 'Antre', sub: 'Menunggu penanganan teknisi' };
                    if (name === 'Progress' || name.toLowerCase().includes('kerja'))
                      return { title: 'Dikerjakan', sub: 'Dalam proses perbaikan fisik' };
                    if (name === 'Done' || name.toLowerCase().includes('selesai'))
                      return { title: 'Selesai', sub: 'Siap kembali ke seksi' };
                    if (name === 'Scrap' || name.toLowerCase().includes('afkir'))
                      return { title: 'Afkir (Scrap)', sub: 'Unit tidak layak pakai' };
                    return { title: name, sub: '' };
                  };
                  const meaning = getMeaning(st.name);

                  return (
                    <div
                      key={st.name}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <div>
                          <span className="text-slate-800 font-bold block">{meaning.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{meaning.sub}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-right">
                        <span className="font-extrabold text-slate-900">{st.value} Unit</span>
                        <span className="text-xs text-slate-500">({pct}%)</span>
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

        {/* ================= 3. BATANG HORIZONTAL: DURASI PERBAIKAN / LEAD TIME ================= */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Durasi Perbaikan Unit (Lead Time Servis)</span>
                  <span title="Distribusi durasi pengerjaan dari unit dilaporkan hingga berstatus selesai">
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Grafik durasi penyelesaian perbaikan berdasarkan target SLA bengkel
                </p>
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
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 mb-2">
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

            {/* Batang Horizontal Lead Time */}
            <div className="h-56 w-full">
              {chartLeadTime.some((d) => d.total > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartLeadTime}
                    layout="vertical"
                    margin={{ top: 5, right: 40, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="rentang"
                      type="category"
                      tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                      width={85}
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
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${slaInfo.cls}`}>
                                {slaInfo.badge}
                              </span>
                            </p>
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-500">Jumlah Selesai:</span>
                              <span className="text-slate-950 font-extrabold text-sm">
                                {item?.total || 0} Unit ({item?.persen || 0}%)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{slaInfo.label}</p>
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
                        formatter={(val: any) => `${val} unit`}
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
