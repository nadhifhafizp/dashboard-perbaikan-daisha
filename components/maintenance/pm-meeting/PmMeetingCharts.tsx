'use client';

import React, { useMemo, useState } from 'react';
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
  LabelList,
  ReferenceLine,
} from 'recharts';
import { Truck, TrendingUp, PieChart as PieIcon, ArrowUpDown } from 'lucide-react';
import { CHART, DONUT } from '@/lib/chart-colors';
import { DailyTrendItem } from '../TargetVsActualChart';
import { UnifiedMatrixItem } from '@/lib/pmAnalytics';
import { ChartViewType } from './PmMeetingHeader';

interface PmMeetingChartsProps {
  chartView: ChartViewType;
  jenisList: UnifiedMatrixItem[];
  dailyTrend: DailyTrendItem[];
  totalPopulasi: number;
  totalMaintained: number;
  totalUnmaintained: number;
  okUnitsCount: number;
  rusakUnitsCount: number;
  currentYear: number;
}

export default function PmMeetingCharts({
  chartView,
  jenisList,
  dailyTrend,
  totalPopulasi,
  totalMaintained,
  totalUnmaintained,
  okUnitsCount,
  rusakUnitsCount,
  currentYear,
}: PmMeetingChartsProps) {
  const [chartOrientation, setChartOrientation] = useState<'opposing' | 'sideBySide'>('opposing');

  const chartJenisData = useMemo(() => {
    return [...jenisList]
      .sort((a, b) => b.total - a.total)
      .slice(0, 14)
      .map((item) => ({
        name: item.nama,
        maintained: item.maintained,
        maintainedNeg: -item.maintained,
        unmaintained: item.unmaintained,
        total: item.total,
        percentage: item.percentage,
        dailyTarget: item.dailyTarget,
        todayActual: item.todayActual,
      }));
  }, [jenisList]);

  // Hitung headroom batas sumbu Y agar LabelList angka tidak terpotong
  const maxUnm = useMemo(
    () => Math.max(...chartJenisData.map((d) => d.unmaintained), 10),
    [chartJenisData]
  );
  const maxMain = useMemo(
    () => Math.max(...chartJenisData.map((d) => d.maintained), 10),
    [chartJenisData]
  );
  const yOpposingDomain = useMemo(
    () => Math.ceil(Math.max(maxUnm, maxMain) * 1.2),
    [maxUnm, maxMain]
  );
  const yMaxDomain = useMemo(
    () => Math.ceil(Math.max(maxUnm, maxMain) * 1.2),
    [maxUnm, maxMain]
  );

  // Headroom untuk Tren 14 Hari
  const maxDailyVal = useMemo(
    () => Math.max(...dailyTrend.map((d) => Math.max(d.target, d.actual)), 10),
    [dailyTrend]
  );
  const yDailyDomain = useMemo(
    () => Math.ceil(maxDailyVal * 1.2),
    [maxDailyVal]
  );

  const pmDonutData = useMemo(
    () => [
      { name: 'Sudah di-PM', value: totalMaintained, color: '#059669' },
      { name: 'Belum di-PM', value: totalUnmaintained, color: '#f43f5e' },
    ],
    [totalMaintained, totalUnmaintained]
  );

  const conditionDonutData = useMemo(
    () => [
      { name: 'Siap Pakai (OK)', value: okUnitsCount, color: '#059669' },
      { name: 'Perlu Perbaikan (RUSAK)', value: rusakUnitsCount, color: '#dc2626' },
    ],
    [okUnitsCount, rusakUnitsCount]
  );

  return (
    <div className="space-y-6">
      {/* Visual Charts: Bar Stacked & Tren 14 Hari */}
      {(chartView === 'ALL' || chartView === 'JENIS' || chartView === 'TREND') && (
        <div
          className={`grid gap-6 ${
            chartView === 'ALL' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* CHART 1: Realisasi PM per Jenis Daisha (Style Flow Throughput Masuk vs Keluar tanpa Garis Backlog) */}
          {(chartView === 'ALL' || chartView === 'JENIS') && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-slate-700 shrink-0" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Realisasi PM per Jenis Daisha
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        {chartOrientation === 'opposing'
                          ? 'Belum di-PM (Atas ↑) vs Sudah di-PM (Bawah ↓)'
                          : 'Belum di-PM vs Sudah di-PM (Berdampingan)'}
                      </p>
                    </div>
                  </div>

                  {/* Kontrol Toggle Orientasi */}
                  <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setChartOrientation('opposing')}
                      className={`px-2.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        chartOrientation === 'opposing'
                          ? 'bg-white text-slate-900 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Belum di-PM di Atas, Sudah di-PM di Bawah"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                      <span>Belum ↑ / Sudah ↓</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartOrientation('sideBySide')}
                      className={`px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                        chartOrientation === 'sideBySide'
                          ? 'bg-white text-slate-900 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Batang Belum dan Sudah PM Berdampingan"
                    >
                      <span>Berdampingan</span>
                    </button>
                  </div>
                </div>

                {/* Legenda Indikator Makna Warna & Total Angka */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-600 my-2 pt-1 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-red-600 inline-block" />
                    <span>Belum di-PM:</span>
                    <span className="text-red-700 font-bold">{totalUnmaintained.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                    <span>Sudah di-PM:</span>
                    <span className="text-emerald-700 font-bold">
                      {totalMaintained.toLocaleString('id-ID')} ({totalPopulasi > 0 ? Math.round((totalMaintained / totalPopulasi) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-slate-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Total Populasi: {totalPopulasi.toLocaleString('id-ID')} Daisha</span>
                  </div>
                </div>

                <div className="h-[440px] sm:h-[480px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartJenisData}
                      stackOffset={chartOrientation === 'opposing' ? 'sign' : 'none'}
                      margin={{
                        top: 25,
                        right: 20,
                        left: -10,
                        bottom: chartOrientation === 'opposing' ? 32 : 24,
                      }}
                      barCategoryGap="16%"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tick={({ x, y, payload }) => {
                          const text = String(payload.value || '');
                          const isLong = text.length > 11;
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text
                                x={0}
                                y={chartOrientation === 'opposing' ? 14 : 6}
                                dy={4}
                                textAnchor={isLong ? 'end' : 'middle'}
                                transform={isLong ? 'rotate(-18)' : undefined}
                                fill="#0f172a"
                                fontSize={11}
                                fontWeight={800}
                              >
                                {text.length > 15 ? text.slice(0, 13) + '…' : text}
                              </text>
                            </g>
                          );
                        }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        height={chartOrientation === 'opposing' ? 58 : 48}
                      />
                      <YAxis
                        type="number"
                        domain={
                          chartOrientation === 'opposing'
                            ? [-yOpposingDomain, yOpposingDomain]
                            : [0, yMaxDomain]
                        }
                        tick={{ fontSize: 12, fill: '#334155', fontWeight: 700 }}
                        allowDecimals={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        tickFormatter={(val: number) => String(Math.abs(val))}
                      />
                      <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                      <Tooltip
                        cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-2 min-w-[210px]">
                                <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between">
                                  <span className="text-sm">{d.name}</span>
                                  <span className="text-xs text-slate-500 font-semibold">{d.total} Unit</span>
                                </p>
                                <div className="flex items-center justify-between font-bold text-red-700">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
                                    <span>Belum di-PM:</span>
                                  </span>
                                  <span className="text-sm font-black">{d.unmaintained} Unit</span>
                                </div>
                                <div className="flex items-center justify-between font-bold text-emerald-700">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                                    <span>Sudah di-PM:</span>
                                  </span>
                                  <span className="text-sm font-black">
                                    {d.maintained} Unit ({d.percentage}%)
                                  </span>
                                </div>
                                <div className="pt-1.5 border-t border-slate-100 space-y-1 text-xs">
                                  <div className="flex justify-between items-center text-slate-600">
                                    <span>Target Wajib:</span>
                                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {d.dailyTarget} unit / hari
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-slate-500">
                                    <span>Realisasi Hari Ini:</span>
                                    <span className="font-semibold text-slate-800">
                                      {d.todayActual} unit
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      {/* Batang Belum di-PM (Merah, di atas garis 0) */}
                      <Bar
                        dataKey="unmaintained"
                        name="Belum di-PM"
                        fill="#dc2626"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={55}
                        stackId={chartOrientation === 'opposing' ? 'pmRealFlow' : undefined}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="unmaintained"
                          position="top"
                          offset={6}
                          formatter={(val: unknown) => (Number(val) > 0 ? String(val) : '')}
                          style={{ fontSize: 12, fontWeight: 900, fill: '#dc2626' }}
                        />
                      </Bar>

                      {/* Batang Sudah di-PM (Hijau, di bawah garis 0 saat opposing / sejajar saat sideBySide) */}
                      <Bar
                        dataKey={chartOrientation === 'opposing' ? 'maintainedNeg' : 'maintained'}
                        name="Sudah di-PM"
                        fill="#059669"
                        radius={chartOrientation === 'opposing' ? [0, 0, 4, 4] : [4, 4, 0, 0]}
                        maxBarSize={55}
                        stackId={chartOrientation === 'opposing' ? 'pmRealFlow' : undefined}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey={chartOrientation === 'opposing' ? 'maintainedNeg' : 'maintained'}
                          content={(props: any) => {
                            const vx = props.viewBox || {};
                            const rawVal =
                              props.value ??
                              props.payload?.[
                                chartOrientation === 'opposing' ? 'maintainedNeg' : 'maintained'
                              ] ??
                              props.payload?.maintained;
                            const num = Math.abs(Number(rawVal));
                            if (!num || isNaN(num)) return null;

                            const rawY = Number(props.y ?? vx.y ?? 0);
                            const rawX = Number(props.x ?? vx.x ?? 0);
                            const rawW = Number(props.width ?? vx.width ?? 0);
                            const centerX = rawX + rawW / 2;

                            if (chartOrientation === 'opposing') {
                              return (
                                <text
                                  x={centerX}
                                  y={rawY + 15}
                                  fill="#059669"
                                  textAnchor="middle"
                                  fontSize={12}
                                  fontWeight={900}
                                >
                                  {num}
                                </text>
                              );
                            }

                            return (
                              <text
                                x={centerX}
                                y={rawY - 6}
                                fill="#059669"
                                textAnchor="middle"
                                fontSize={12}
                                fontWeight={900}
                              >
                                {num}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="italic text-xs">
                  Bahan evaluasi prioritas penarikan unit ke workshop (tanpa garis backlog)
                </span>
                <span className="font-semibold text-slate-700">
                  {chartJenisData.length} Kategori Armada PM
                </span>
              </div>
            </div>
          )}

          {/* CHART 2: Tren 14 Hari Target vs Aktual Harian dengan Angka Jelas */}
          {(chartView === 'ALL' || chartView === 'TREND') && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                      <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 shrink-0" />
                      <span>Tren Kinerja Harian Workshop (14 Hari)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Konsistensi target harian wajib vs realisasi pengerjaan aktual bengkel
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Harian
                  </span>
                </div>

                <div className="h-[440px] sm:h-[480px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyTrend}
                      margin={{ top: 25, right: 20, left: -10, bottom: 20 }}
                      barGap={4}
                      barCategoryGap="8%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={CHART.grid}
                      />
                      <XAxis
                        dataKey="dateLabel"
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 800 }}
                        dy={6}
                      />
                      <YAxis
                        type="number"
                        domain={[0, yDailyDomain]}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
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
                                  <span className="font-bold text-slate-900">
                                    {p.dateLabel}
                                  </span>
                                  {p.isWeekend ? (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      Weekend
                                    </span>
                                  ) : isMet ? (
                                    <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                                      Target Tercapai
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.5 rounded">
                                      Kurang {p.target - p.actual} unit
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>Target Wajib:</span>
                                  <span className="font-semibold text-slate-900">
                                    {p.target} unit
                                  </span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900">
                                  <span>Realisasi Aktual:</span>
                                  <span
                                    className={
                                      p.actual >= p.target
                                        ? 'text-emerald-600'
                                        : 'text-slate-900'
                                    }
                                  >
                                    {p.actual} unit
                                  </span>
                                </div>
                                <div className="pt-1 border-t border-slate-100 text-xs text-slate-500 space-y-0.5">
                                  <div className="flex justify-between">
                                    <span>- PM Rutin:</span>
                                    <span className="text-emerald-700 font-medium">
                                      {p.rutin} unit
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>- Repair / Perbaikan:</span>
                                    <span className="text-sky-700 font-medium">
                                      {p.repair} unit
                                    </span>
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
                        wrapperStyle={{ fontSize: '13px', fontWeight: 700, paddingBottom: '10px' }}
                      />
                      {/* Bar Target Harian dengan Angka */}
                      <Bar
                        dataKey="target"
                        name="Target Harian"
                        fill="#94a3b8"
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="target"
                          position="top"
                          offset={4}
                          formatter={(val: unknown) => (Number(val) > 0 ? String(val) : '')}
                          style={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }}
                        />
                      </Bar>

                      {/* Bar PM Rutin */}
                      <Bar
                        dataKey="rutin"
                        name="PM Rutin"
                        stackId="act"
                        fill="#059669"
                        radius={[0, 0, 0, 0]}
                        barSize={28}
                        isAnimationActive={false}
                      >
                        {/* Jika repair == 0, tampilkan total aktual di atas rutin */}
                        <LabelList
                          dataKey="rutin"
                          content={(props: any) => {
                            const p = props.payload as DailyTrendItem;
                            if (!p || p.actual <= 0 || p.repair > 0) return null;
                            const vx = props.viewBox || {};
                            const rawX = Number(props.x ?? vx.x ?? 0);
                            const rawY = Number(props.y ?? vx.y ?? 0);
                            const rawW = Number(props.width ?? vx.width ?? 0);
                            const centerX = rawX + rawW / 2;
                            return (
                              <text
                                x={centerX}
                                y={rawY - 4}
                                fill="#059669"
                                textAnchor="middle"
                                fontSize={11}
                                fontWeight={900}
                              >
                                {p.actual}
                              </text>
                            );
                          }}
                        />
                      </Bar>

                      {/* Bar Repair */}
                      <Bar
                        dataKey="repair"
                        name="Repair"
                        stackId="act"
                        fill="#0284c7"
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                        isAnimationActive={false}
                      >
                        {/* Jika repair > 0, tampilkan total aktual di atas repair */}
                        <LabelList
                          dataKey="repair"
                          content={(props: any) => {
                            const p = props.payload as DailyTrendItem;
                            if (!p || p.repair <= 0) return null;
                            const vx = props.viewBox || {};
                            const rawX = Number(props.x ?? vx.x ?? 0);
                            const rawY = Number(props.y ?? vx.y ?? 0);
                            const rawW = Number(props.width ?? vx.width ?? 0);
                            const centerX = rawX + rawW / 2;
                            return (
                              <text
                                x={centerX}
                                y={rawY - 4}
                                fill="#0284c7"
                                textAnchor="middle"
                                fontSize={11}
                                fontWeight={900}
                              >
                                {p.actual}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="italic text-xs">
                  Target dihitung proporsional terhadap sisa hari kerja aktif
                </span>
                <span className="font-semibold text-slate-700">
                  {dailyTrend.length} Hari Kerja Terakhir
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Donut Indicators */}
      {(chartView === 'ALL' || chartView === 'DONUT') && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <PieIcon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
                <span>Indikator Donat Proporsi PM & Kesehatan Armada</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-0.5">
                Rasio visual capaian kepatuhan tahun berjalan dan persentase kesiapan fisik armada pabrik
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
              Persentase Pabrik
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-center">
            {/* DONUT 1: Progres PM Tahunan - DIBESARKAN */}
            <div className="flex flex-col sm:flex-row items-center gap-5 py-3">
              <div className="relative h-56 w-56 sm:h-64 sm:w-64 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pmDonutData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pmDonutData
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`pm-cell-${index}`}
                            fill={entry.color}
                            stroke="transparent"
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0];
                          const pct =
                            totalPopulasi > 0
                              ? Math.round(
                                  ((d.value as number) / totalPopulasi) * 100
                                )
                              : 0;
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs">
                              <p className="font-bold text-slate-900 text-sm">
                                {d.name}
                              </p>
                              <p className="text-slate-700 font-semibold mt-0.5">
                                {Number(d.value).toLocaleString('id-ID')} unit ({pct}
                                %)
                              </p>
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
                      className="fill-slate-900 font-black text-3xl sm:text-4xl"
                    >
                      {totalPopulasi > 0
                        ? Math.round((totalMaintained / totalPopulasi) * 100)
                        : 0}
                      %
                    </text>
                    <text
                      x="50%"
                      y="59%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-600 font-bold text-xs uppercase tracking-wide"
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
                    {totalMaintained.toLocaleString('id-ID')} unit (
                    {totalPopulasi > 0
                      ? Math.round((totalMaintained / totalPopulasi) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Belum di-PM:</span>
                  </span>
                  <span className="font-bold text-rose-700 tabular-nums">
                    {totalUnmaintained.toLocaleString('id-ID')} unit (
                    {totalPopulasi > 0
                      ? Math.round((totalUnmaintained / totalPopulasi) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between text-slate-500 text-xs">
                  <span>Total Populasi:</span>
                  <span className="font-semibold text-slate-800">
                    {totalPopulasi.toLocaleString('id-ID')} Unit
                  </span>
                </div>
              </div>
            </div>

            {/* DONUT 2: Kesiapan Fisik Armada - DIBESARKAN */}
            <div className="flex flex-col sm:flex-row items-center gap-5 py-3">
              <div className="relative h-56 w-56 sm:h-64 sm:w-64 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conditionDonutData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {conditionDonutData
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cond-cell-${index}`}
                            fill={entry.color}
                            stroke="transparent"
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0];
                          const pct =
                            totalPopulasi > 0
                              ? (
                                  (Number(d.value) / totalPopulasi) *
                                  100
                                ).toFixed(1)
                              : '100';
                          return (
                            <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200 text-xs">
                              <p className="font-bold text-slate-900 text-sm">
                                {d.name}
                              </p>
                              <p className="text-slate-700 font-semibold mt-0.5">
                                {Number(d.value).toLocaleString('id-ID')} unit ({pct}
                                %)
                              </p>
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
                      className="fill-slate-900 font-black text-3xl sm:text-4xl"
                    >
                      {totalPopulasi > 0
                        ? ((okUnitsCount / totalPopulasi) * 100).toFixed(1)
                        : 100}
                      %
                    </text>
                    <text
                      x="50%"
                      y="59%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-600 font-bold text-xs uppercase tracking-wide"
                    >
                      Armada OKE
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
                    {okUnitsCount.toLocaleString('id-ID')} unit (
                    {totalPopulasi > 0
                      ? ((okUnitsCount / totalPopulasi) * 100).toFixed(1)
                      : 100}
                    %)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span>Perlu Perbaikan (RUSAK):</span>
                  </span>
                  <span className="font-bold text-rose-700 tabular-nums">
                    {rusakUnitsCount.toLocaleString('id-ID')} unit (
                    {totalPopulasi > 0
                      ? ((rusakUnitsCount / totalPopulasi) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between text-slate-500 text-xs">
                  <span>Total Dipantau:</span>
                  <span className="font-semibold text-slate-800">
                    {totalPopulasi.toLocaleString('id-ID')} Unit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
