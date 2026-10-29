'use client';

import React, { useMemo } from 'react';
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
import { Truck, TrendingUp, PieChart as PieIcon } from 'lucide-react';
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

                <div className="h-[380px] sm:h-[420px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartJenisData}
                      layout="vertical"
                      margin={{ top: 5, right: 25, left: 25, bottom: 5 }}
                      barCategoryGap="18%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke={CHART.grid}
                      />
                      <XAxis type="number" tick={{ fill: CHART.axis, fontSize: 12, fontWeight: 600 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 700 }}
                        width={130}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-1.5 min-w-[200px]">
                                <p className="font-bold text-slate-900 pb-1 border-b border-slate-100">
                                  {d.name}
                                </p>
                                <div className="flex justify-between text-slate-600">
                                  <span>Total Populasi:</span>
                                  <span className="font-semibold text-slate-900">
                                    {d.total} unit
                                  </span>
                                </div>
                                <div className="flex justify-between text-emerald-700">
                                  <span className="font-medium">Sudah di-PM:</span>
                                  <span className="font-bold">
                                    {d.maintained} unit ({d.percentage}%)
                                  </span>
                                </div>
                                <div className="flex justify-between text-rose-700">
                                  <span className="font-medium">Belum di-PM:</span>
                                  <span className="font-bold">
                                    {d.unmaintained} unit
                                  </span>
                                </div>
                                <div className="pt-1 border-t border-slate-100 flex justify-between text-slate-500 text-xs">
                                  <span>Target / Real Hari Ini:</span>
                                  <span className="font-semibold text-slate-800">
                                    {d.todayActual} / {d.dailyTarget} unit
                                  </span>
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
                      <Bar
                        dataKey="maintained"
                        name="Sudah di-PM"
                        stackId="a"
                        fill="#059669"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="unmaintained"
                        name="Belum di-PM"
                        stackId="a"
                        fill="#f43f5e"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="italic text-xs">
                  Bahan evaluasi prioritas penarikan unit ke workshop
                </span>
                <span className="font-semibold text-slate-700">
                  Total {totalPopulasi} Daisha
                </span>
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

                <div className="h-[380px] sm:h-[420px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyTrend}
                      margin={{ top: 15, right: 20, left: -10, bottom: 10 }}
                      barGap={5}
                      barCategoryGap="22%"
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
                        tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
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
                        wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                      />
                      <Bar
                        dataKey="target"
                        name="Target Harian"
                        fill="#94a3b8"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={20}
                      />
                      <Bar
                        dataKey="rutin"
                        name="PM Rutin"
                        stackId="act"
                        fill="#059669"
                        radius={[0, 0, 0, 0]}
                        maxBarSize={20}
                      />
                      <Bar
                        dataKey="repair"
                        name="Repair"
                        stackId="act"
                        fill="#0284c7"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={20}
                      />
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
