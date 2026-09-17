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

  // Data untuk model Cermin Kiri-Kanan (Horizontal Butterfly / Mirror):
  // MasukNeg bernilai negatif agar sayap Masuk memanjang ke KIRI (⬅️)
  // SelesaiPos bernilai positif agar sayap Selesai memanjang ke KANAN (➡️)
  const horizontalMirrorData = useMemo(() => {
    return activeTimelineData.map((d) => ({
      ...d,
      MasukNeg: d.Masuk > 0 ? -d.Masuk : 0,
      SelesaiPos: d.Selesai > 0 ? d.Selesai : 0,
    }));
  }, [activeTimelineData]);

  // Hitung batas simetris sumbu X dengan headroom 55% agar angka di ujung sayap sangat lega
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
      {/* ================= 1. GRAFIK UTAMA: CERMIN HORIZONTAL BUTTERFLY (FULL WIDTH & SUPER LEGA) ================= */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
            <div>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>TREN UNIT MASUK VS UNIT SELESAI (CERMIN HORIZONTAL)</span>
                <span title="Model cermin butterfly: Sayap kiri untuk unit masuk dan sayap kanan untuk unit selesai dengan poros tanggal di sumbu Y">
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sumbu tengah sebagai garis cermin: Sayap kiri (⬅️) unit masuk, sayap kanan (➡️) unit selesai •{' '}
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
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTimelineScale('7days')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  timelineScale === '7days'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilkan data 7 hari kerja terakhir (1 minggu)"
              >
                <span>7 Hari (1 Minggu)</span>
              </button>
              <button
                type="button"
                onClick={() => setTimelineScale('14days')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timelineScale === '14days'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilkan data 14 hari kerja terakhir (2 minggu)"
              >
                14 Hari
              </button>
              <button
                type="button"
                onClick={() => setTimelineScale('monthly')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timelineScale === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilkan agregasi data per bulan"
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Legenda Indikator Cermin */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-bold my-3">
            <div className="flex items-center gap-2 text-blue-700 bg-blue-50/60 px-3 py-1 rounded-lg border border-blue-100">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block shadow-2xs" />
              <span>⬅️ Unit Masuk (Sayap Kiri)</span>
              <span className="text-xs text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md font-extrabold ml-1">
                {totalMasukTimeline}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/60 px-3 py-1 rounded-lg border border-emerald-100">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block shadow-2xs" />
              <span>Unit Selesai (Sayap Kanan ➡️)</span>
              <span className="text-xs text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md font-extrabold ml-1">
                {totalSelesaiTimeline}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>Garis Tengah: Batas Nol (0)</span>
            </div>
          </div>
        </div>

        {/* 1 Grafik Utuh: Cermin Horizontal Butterfly */}
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
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => String(Math.abs(val))}
                  allowDecimals={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="tanggal"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
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
                        <p className="font-extrabold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span>📅 {label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Cermin Kiri-Kanan</span>
                        </p>
                        <div className="flex items-center justify-between font-bold text-blue-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-xs bg-blue-600" />
                            <span>⬅️ Masuk (Kiri):</span>
                          </span>
                          <span>{masukVal} Unit</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-emerald-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-xs bg-emerald-500" />
                            <span>➡️ Selesai (Kanan):</span>
                          </span>
                          <span>{selesaiVal} Unit</span>
                        </div>
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                          <span>Keseimbangan:</span>
                          <span
                            className={
                              balance === 0
                                ? 'text-emerald-600 font-bold'
                                : balance > 0
                                ? 'text-amber-600 font-bold'
                                : 'text-blue-600 font-bold'
                            }
                          >
                            {balance === 0
                              ? '✓ 100% Seimbang'
                              : balance > 0
                              ? `+${balance} Unit Pending`
                              : `${Math.abs(balance)} Unit Surplus`}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="MasukNeg"
                  name="Unit Masuk"
                  fill="#2563eb"
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
                          fill="#1d4ed8"
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
          <span>Model Cermin Kiri-Kanan: Angka berada di ujung sayap luar, bebas dari tabrakan</span>
          <span className="font-semibold text-slate-600">Arahkan kursor ke baris untuk melihat detail komparasi</span>
        </div>
      </div>

      {/* ================= BARIS KEDUA: DONUT STATUS & LEAD TIME ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= 2. DIAGRAM DONAT: STATUS PIPELINE ================= */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-500" />
                <span>KOMPOSISI STATUS TIKET DAISHA</span>
                <span title="Proporsi status pengerjaan unit saat ini">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
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
                  </PieChart>
                </ResponsiveContainer>

                {/* Angka Total di Lubang Tengah Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 leading-none">{totalStatus}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Tiket</span>
                </div>
              </div>

              {/* Legenda & Rincian Kartu */}
              <div className="flex flex-col gap-2 flex-1 w-full">
                {statusData.map((st) => {
                  const pct = totalStatus > 0 ? Math.round((st.value / totalStatus) * 100) : 0;
                  return (
                    <div
                      key={st.name}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <span className="text-slate-700">{st.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{st.value}</span>
                        <span className="text-[10px] text-slate-400">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              Belum ada data status tiket
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tingkat Penyelesaian:</span>
            <span className="font-bold text-emerald-600">{completionRate}% Selesai</span>
          </div>
        </div>

        {/* ================= 3. BATANG HORIZONTAL: DURASI PERBAIKAN / LEAD TIME ================= */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>DURASI PERBAIKAN UNIT (LEAD TIME SERVIS)</span>
                  <span title="Distribusi durasi pengerjaan dari unit dilaporkan hingga berstatus selesai">
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grafik batang horizontal durasi penyelesaian perbaikan berdasarkan kelompok waktu
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
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="rentang"
                      type="category"
                      tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                      width={85}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      formatter={(val: unknown, _, item) => [
                        `${val} Unit (${(item?.payload as { persen: number })?.persen || 0}%)`,
                        'Jumlah Selesai',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="total" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={18}>
                      <LabelList
                        dataKey="total"
                        position="right"
                        fill="#0f172a"
                        fontSize={11}
                        fontWeight={800}
                        formatter={(val: any) => `${val} unit`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Belum ada data durasi perbaikan
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Standar Kecepatan Servis</span>
            <span className="font-semibold text-slate-600">Optimal: &lt; 24 Jam</span>
          </div>
        </div>
      </div>
    </div>
  );
}
