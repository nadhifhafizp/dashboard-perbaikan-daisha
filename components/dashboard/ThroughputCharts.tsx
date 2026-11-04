'use client';

import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
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
import { Info, Timer, TrendingUp, PieChart as PieIcon, Clock, ArrowUpDown } from 'lucide-react';
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
  // Orientasi batang: 'opposing' (Masuk di atas, Selesai di bawah) vs 'sideBySide' (berdampingan)
  const [chartOrientation, setChartOrientation] = useState<'opposing' | 'sideBySide'>('opposing');

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

  // Hitung akumulasi backlog dinamis & nilai bar negatif untuk orientasi atas vs bawah
  const processedTimelineData = useMemo(() => {
    let runningBacklog = 0;
    return activeTimelineData.map((d) => {
      const masuk = Number(d.Masuk) || 0;
      const selesai = Number(d.Selesai) || 0;
      const awal = runningBacklog;
      const net = masuk - selesai;
      const akhir = Math.max(0, awal + net);
      runningBacklog = akhir;

      return {
        ...d,
        Masuk: masuk,
        Selesai: selesai,
        SelesaiNeg: -selesai,
        net,
        backlogAwal: awal,
        backlogAkhir: akhir,
        rumusBacklog: `${awal} + ${masuk} - ${selesai} = ${akhir}`,
      };
    });
  }, [activeTimelineData]);

  // Hitung batas maksimum sumbu Y dengan headroom agar label angka tidak terpotong
  const yMaxDomain = useMemo(() => {
    let max = 4;
    for (const d of activeTimelineData) {
      if ((d.Masuk || 0) > max) max = d.Masuk;
      if ((d.Selesai || 0) > max) max = d.Selesai;
    }
    return Math.ceil(max * 1.3);
  }, [activeTimelineData]);

  // Batas domain simetris untuk batang atas (masuk) vs bawah (selesai)
  const yOpposingDomain = useMemo(() => {
    let max = 3;
    for (const d of processedTimelineData) {
      if (d.Masuk > max) max = d.Masuk;
      if (d.Selesai > max) max = d.Selesai;
    }
    return Math.ceil(max * 1.4);
  }, [processedTimelineData]);

  // Batas domain untuk sumbu backlog (garis ungu di sisi kanan)
  const yBacklogDomain = useMemo(() => {
    let max = 4;
    for (const d of processedTimelineData) {
      if (d.backlogAkhir > max) max = d.backlogAkhir;
    }
    return Math.ceil(max * 1.35);
  }, [processedTimelineData]);

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
      {/* 1. Grafik Utama: Komparasi volume masuk vs selesai & Backlog Akumulasi */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/60 shadow-2xs">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Data Servis Masuk, Servis Selesai, dan Backlog (Akumulasi)
                </h3>
                <span className="text-xs text-slate-400 font-normal">
                  {timelineScale === '7days' ? '7 Hari Terakhir' : timelineScale === '14days' ? '14 Hari Terakhir' : 'Akumulasi Bulanan'} • Grafik Masuk (Atas) vs Selesai (Bawah)
                </span>
              </div>
            </div>

            {/* Kontrol Toolbar: Pilihan Periode, Orientasi Grafik, dan Toggle Tabel */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Orientasi: Atas-Bawah (Default) vs Berdampingan */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setChartOrientation('opposing')}
                  className={`px-2.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    chartOrientation === 'opposing'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Batang Masuk di Atas, Selesai di Bawah"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Masuk ↑ / Selesai ↓</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartOrientation('sideBySide')}
                  className={`px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                    chartOrientation === 'sideBySide'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Batang Masuk dan Selesai Berdampingan"
                >
                  <span>Berdampingan</span>
                </button>
              </div>

              {/* Toggle Rentang Waktu: 7 Hari (1 Minggu) vs 14 Hari vs Bulanan */}
              <div className="flex items-center p-0.5 bg-slate-100/90 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTimelineScale('7days')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    timelineScale === '7days'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilkan rentang 7 hari kerja terakhir (1 minggu)"
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineScale('14days')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    timelineScale === '14days'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
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
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilkan agregasi data per bulan"
                >
                  Bulanan
                </button>
              </div>
            </div>
          </div>

          {/* Legenda Indikator Makna Warna & Simbol */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 my-2 pt-1 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-red-600 inline-block" />
              <span>Servis Masuk (Di Atas):</span>
              <span className="text-slate-900 font-bold">{totalMasukTimeline}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
              <span>Servis Keluar/Selesai (Di Bawah):</span>
              <span className="text-slate-900 font-bold">{totalSelesaiTimeline}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-purple-600 rounded-full inline-block" />
              <span className="w-2 h-2 rounded-full bg-purple-600 inline-block -ml-2" />
              <span>Backlog Akumulasi:</span>
              <span className="text-purple-700 font-black">
                {processedTimelineData.length > 0 ? processedTimelineData[processedTimelineData.length - 1].backlogAkhir : 0} Mesin
              </span>
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
              <span>Sumbu Kiri: Unit (Masuk ↑ / Selesai ↓) • Sumbu Kanan: Backlog (Mesin)</span>
            </div>
          </div>
        </div>

        {/* 1 Grafik: Komparasi Volume Masuk vs Selesai & Backlog (ComposedChart) */}
        <div className="w-full my-2 h-[400px] sm:h-[450px]">
          {processedTimelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={processedTimelineData}
                stackOffset={chartOrientation === 'opposing' ? 'sign' : 'none'}
                margin={{ top: 25, right: 35, left: -5, bottom: chartOrientation === 'opposing' ? 28 : 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 800 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  dy={chartOrientation === 'opposing' ? 14 : 6}
                />
                {/* Sumbu Y Kiri: Volume Daisha (Atas Masuk ↑, Bawah Selesai ↓) */}
                <YAxis
                  yAxisId="left"
                  type="number"
                  domain={chartOrientation === 'opposing' ? [-yOpposingDomain, yOpposingDomain] : [0, yMaxDomain]}
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 700 }}
                  allowDecimals={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(val: number) => String(Math.abs(val))}
                />
                {/* Sumbu Y Kanan: Backlog Mesin Akumulasi (Titik 0 Sejajar di Garis Tengah, Garis Berada di Separuh Atas) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  type="number"
                  domain={chartOrientation === 'opposing' ? [-yBacklogDomain, yBacklogDomain] : [0, yBacklogDomain]}
                  tick={{ fontSize: 12, fill: '#7c3aed', fontWeight: 800 }}
                  allowDecimals={false}
                  axisLine={{ stroke: '#e9d5ff' }}
                  tickLine={false}
                  tickFormatter={(val: number) => (val >= 0 ? String(val) : '')}
                />
                {/* Garis Tengah Baseline 0 */}
                <ReferenceLine
                  y={0}
                  yAxisId="left"
                  stroke="#64748b"
                  strokeWidth={1.5}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0]?.payload;
                    const masukVal = item?.Masuk ?? 0;
                    const selesaiVal = item?.Selesai ?? 0;
                    const backlogVal = item?.backlogAkhir ?? 0;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-2 min-w-[200px]">
                        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span className="text-sm">{label}</span>
                          <span className="text-xs text-slate-500 font-semibold">Arus & Backlog</span>
                        </p>
                        <div className="flex items-center justify-between font-bold text-red-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
                            <span>Servis Masuk:</span>
                          </span>
                          <span className="text-sm font-black">{masukVal} Unit</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-emerald-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                            <span>Servis Selesai:</span>
                          </span>
                          <span className="text-sm font-black">{selesaiVal} Unit</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-purple-700 border-t border-slate-100 pt-1.5">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            <span>Backlog Akumulasi:</span>
                          </span>
                          <span className="text-sm font-black">{backlogVal} Mesin</span>
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Batang Daisha Masuk (Di Atas Garis 0) */}
                <Bar
                  yAxisId="left"
                  dataKey="Masuk"
                  name="Servis Masuk"
                  fill="#dc2626"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={65}
                  stackId={chartOrientation === 'opposing' ? 'opposingFlow' : undefined}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="Masuk"
                    position="top"
                    offset={6}
                    formatter={(val: unknown) => (Number(val) > 0 ? String(val) : '')}
                    style={{ fontSize: 13, fontWeight: 900, fill: '#dc2626' }}
                  />
                </Bar>

                {/* Batang Selesai Perbaikan (Di Bawah Garis 0 saat opposing, sejajar lurus dengan batang merah) */}
                <Bar
                  yAxisId="left"
                  dataKey={chartOrientation === 'opposing' ? 'SelesaiNeg' : 'Selesai'}
                  name="Servis Keluar"
                  fill="#059669"
                  radius={chartOrientation === 'opposing' ? [0, 0, 4, 4] : [4, 4, 0, 0]}
                  maxBarSize={65}
                  stackId={chartOrientation === 'opposing' ? 'opposingFlow' : undefined}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey={chartOrientation === 'opposing' ? 'SelesaiNeg' : 'Selesai'}
                    content={(props: any) => {
                      const vx = props.viewBox || {};
                      const rawVal =
                        props.value ??
                        props.payload?.[chartOrientation === 'opposing' ? 'SelesaiNeg' : 'Selesai'] ??
                        props.payload?.Selesai;
                      const num = Math.abs(Number(rawVal));
                      if (!num || isNaN(num)) return null;

                      const rawY = Number(props.y ?? vx.y ?? 0);
                      const rawX = Number(props.x ?? vx.x ?? 0);
                      const rawW = Number(props.width ?? vx.width ?? 0);
                      const centerX = rawX + rawW / 2;

                      if (chartOrientation === 'opposing') {
                        // Di Recharts, props.y / vx.y pada bar negatif di SVG sudah merupakan ujung terbawah batang
                        // Tambahkan 15px agar teks label berada tepat di bawah ujung batang hijau
                        return (
                          <text
                            x={centerX}
                            y={rawY + 15}
                            fill="#059669"
                            textAnchor="middle"
                            fontSize={13}
                            fontWeight={900}
                          >
                            {num}
                          </text>
                        );
                      }

                      // Mode Berdampingan (naik ke atas): posisi label di atas batang
                      return (
                        <text
                          x={centerX}
                          y={rawY - 6}
                          fill="#059669"
                          textAnchor="middle"
                          fontSize={13}
                          fontWeight={900}
                        >
                          {num}
                        </text>
                      );
                    }}
                  />
                </Bar>

                {/* Garis Backlog Akumulasi (Akhir Bulan/Hari) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="backlogAkhir"
                  name="Backlog Akumulasi"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, stroke: '#7c3aed', strokeWidth: 2, fill: '#ffffff' }}
                >
                  <LabelList
                    dataKey="backlogAkhir"
                    position="top"
                    offset={8}
                    formatter={(val: unknown) => (Number(val) > 0 ? String(val) : '0')}
                    style={{ fontSize: 12, fontWeight: 900, fill: '#6d28d9' }}
                  />
                </Line>
              </ComposedChart>
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
            <div className="h-72 sm:h-80 w-full">
              {chartLeadTime.some((d) => d.total > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartLeadTime}
                    layout="vertical"
                    margin={{ top: 8, right: 65, left: 35, bottom: 5 }}
                    barCategoryGap="12%"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="rentang"
                      type="category"
                      tick={{ fontSize: 13, fill: '#0f172a', fontWeight: 800 }}
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
                    <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={38}>
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
                        fontSize={13}
                        fontWeight={900}
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
