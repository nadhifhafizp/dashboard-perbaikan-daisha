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
  LabelList,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle2,
  Clock,
  Trash2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
} from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { aggregateMonthlyDaisha } from '@/lib/monthlyDaishaAnalytics';

interface MonthlyIncomingDaishaChartProps {
  tickets: Ticket[];
  filteredTickets?: Ticket[];
  isAdmin?: boolean;
}

export default function MonthlyIncomingDaishaChart({
  tickets,
  filteredTickets,
  isAdmin = true,
}: MonthlyIncomingDaishaChartProps) {
  // Mode data source: 'all' (semua tiket) vs 'filtered' (sesuai filter aktif di panel)
  const [dataSource, setDataSource] = useState<'all' | 'filtered'>('all');

  // Pilihan Tahun
  const [selectedYear, setSelectedYear] = useState<string>('CURRENT_YEAR');

  // Mode Tampilan Batang: 'total' (batang tunggal total) vs 'status' (stacked status pengerjaan)
  const [chartViewMode, setChartViewMode] = useState<'total' | 'status'>('total');

  // State tabel rincian
  const [showTable, setShowTable] = useState(false);

  // Sumber data aktif
  const activeTickets = useMemo(() => {
    if (dataSource === 'filtered' && filteredTickets && filteredTickets.length > 0) {
      return filteredTickets;
    }
    return tickets;
  }, [dataSource, filteredTickets, tickets]);

  // Agregasi bulanan
  const summary = useMemo(() => {
    return aggregateMonthlyDaisha(activeTickets, selectedYear);
  }, [activeTickets, selectedYear]);

  // Hitung batas sumbu Y dengan headroom agar label angka tidak terpotong
  const yMaxDomain = useMemo(() => {
    let max = 5;
    for (const d of summary.monthlyData) {
      if (d.totalMasuk > max) max = d.totalMasuk;
    }
    return Math.ceil(max * 1.3);
  }, [summary.monthlyData]);

  // Ekspor ringkasan bulanan ke CSV
  const handleExportCSV = () => {
    const headers = ['Bulan', 'Tahun', 'Total Daisha Masuk', 'Selesai (Done)', 'Sedang Proses', 'Scrap', '% Selesai', 'Top Seksi'];
    const rows = summary.monthlyData.map((d) => [
      d.monthName,
      d.year,
      d.totalMasuk,
      d.selesai,
      d.proses,
      d.scrap,
      `${d.completionRate}%`,
      `"${d.topSeksi}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Total_Daisha_Masuk_Bulanan_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-5">
      {/* 1. Header Komponen */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="t-section text-slate-900 tracking-tight flex items-center gap-2">
              <span>Total Seluruh Daisha Masuk per Bulan</span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white tracking-wide uppercase">
                  Role Admin
                </span>
              )}
            </h3>
          </div>
          <p className="t-caption text-slate-500 max-w-2xl">
            Diagram batang volume seluruh armada daisha yang masuk ke bengkel perbaikan setiap bulannya untuk evaluasi beban kerja &amp; tren operasional.
          </p>
        </div>

        {/* 2. Controls & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Toggle Sumber Data (jika filter aktif diterapkan) */}
          {filteredTickets && filteredTickets.length !== tickets.length && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDataSource('all')}
                className={`px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                  dataSource === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan total seluruh tiket tanpa batasan filter tanggal panel"
              >
                Semua ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setDataSource('filtered')}
                className={`px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                  dataSource === 'filtered'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan berdasarkan filter tanggal & kriteria aktif di panel"
              >
                Tersaring ({filteredTickets.length})
              </button>
            </div>
          )}

          {/* Selector Tahun */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer pr-1"
            >
              <option value="CURRENT_YEAR">Tahun Berjalan ({new Date().getFullYear()})</option>
              <option value="LAST_12_MONTHS">12 Bulan Terakhir</option>
              <option value="ALL">Semua Periode</option>
              {summary.availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Mode Batang */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartViewMode('total')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                chartViewMode === 'total'
                  ? 'bg-red-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Total Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('status')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                chartViewMode === 'status'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Komposisi Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Ringkasan Eksekutif (4 Kartu Metrik) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 block">Total Daisha Masuk</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {summary.totalMasuk}
            </span>
            <span className="text-xs font-semibold text-slate-500">Unit</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Periode {selectedYear === 'CURRENT_YEAR' ? new Date().getFullYear() : selectedYear === 'LAST_12_MONTHS' ? '12 Bulan' : selectedYear}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 block">Rata-rata per Bulan</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {summary.avgMonthly}
            </span>
            <span className="text-xs font-semibold text-slate-500">Unit / bln</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Kapasitas acuan bengkel
          </span>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 block">Bulan Puncak (Tertinggi)</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
              {summary.peakMonth?.total || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">Unit</span>
          </div>
          <span className="text-[10px] text-slate-600 font-medium truncate block mt-0.5">
            {summary.peakMonth?.label || '-'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 block">Tingkat Selesai (Done)</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              {summary.totalMasuk > 0 ? Math.round((summary.totalSelesai / summary.totalMasuk) * 100) : 0}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({summary.totalSelesai}/{summary.totalMasuk})
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Telah kembali ke seksi
          </span>
        </div>
      </div>

      {/* 4. Diagram Batang (BarChart Recharts) */}
      <div className="w-full h-[370px] sm:h-[420px] pt-2">
        {summary.monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.monthlyData}
              margin={{ top: 25, right: 25, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 700 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                dy={6}
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
                cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload as (typeof summary.monthlyData)[0];
                  return (
                    <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3.5 shadow-lg text-xs space-y-2 min-w-[220px]">
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-bold text-slate-900 text-sm">{d.monthName} {d.year}</p>
                        <p className="text-[11px] text-slate-500 font-medium">Rekapitulasi Daisha Masuk</p>
                      </div>

                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-xs bg-red-600 inline-block" />
                          <span>Total Daisha Masuk:</span>
                        </span>
                        <span className="text-sm text-red-600 font-black">{d.totalMasuk} Unit</span>
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                        <div className="flex justify-between items-center text-emerald-700 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <span>Selesai (Done):</span>
                          </span>
                          <span className="font-bold">{d.selesai} Unit ({d.completionRate}%)</span>
                        </div>

                        <div className="flex justify-between items-center text-amber-700 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                            <span>Sedang Dikerjakan / Open:</span>
                          </span>
                          <span className="font-bold">{d.proses} Unit</span>
                        </div>

                        {d.scrap > 0 && (
                          <div className="flex justify-between items-center text-rose-700 font-medium">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                              <span>Scrap / Afkir:</span>
                            </span>
                            <span className="font-bold">{d.scrap} Unit</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Top Seksi:</span>
                        <span className="font-bold text-slate-800">{d.topSeksi} ({d.topSeksiCount} unit)</span>
                      </div>

                      {d.momGrowth !== null && (
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Tren vs Bln Lalu:</span>
                          <span
                            className={`font-bold inline-flex items-center gap-0.5 ${
                              d.momDiff > 0
                                ? 'text-red-600'
                                : d.momDiff < 0
                                ? 'text-emerald-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {d.momDiff > 0 ? (
                              <>
                                <TrendingUp className="w-3 h-3" />
                                <span>+{d.momDiff} unit (+{d.momGrowth}%)</span>
                              </>
                            ) : d.momDiff < 0 ? (
                              <>
                                <TrendingDown className="w-3 h-3" />
                                <span>{d.momDiff} unit ({d.momGrowth}%)</span>
                              </>
                            ) : (
                              <span>Tetap (0%)</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              {/* Garis Acuan Rata-rata */}
              {summary.avgMonthly > 0 && (
                <ReferenceLine
                  y={summary.avgMonthly}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              )}

              {chartViewMode === 'total' ? (
                /* Mode 1: Batang Total Masuk */
                <Bar
                  dataKey="totalMasuk"
                  name="Total Daisha Masuk"
                  fill="#E60012"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
                  <LabelList
                    dataKey="totalMasuk"
                    position="top"
                    formatter={(val: any) => (Number(val) > 0 ? String(val) : '')}
                    style={{ fontSize: 12, fill: '#0f172a', fontWeight: 800 }}
                  />
                </Bar>
              ) : (
                /* Mode 2: Stacked Bar Komposisi Status */
                <>
                  <Bar
                    dataKey="selesai"
                    name="Selesai (Done)"
                    stackId="a"
                    fill="#10b981"
                    maxBarSize={48}
                  />
                  <Bar
                    dataKey="proses"
                    name="Sedang Dikerjakan / Open"
                    stackId="a"
                    fill="#f59e0b"
                    maxBarSize={48}
                  />
                  <Bar
                    dataKey="scrap"
                    name="Scrap"
                    stackId="a"
                    fill="#dc2626"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  >
                    <LabelList
                      dataKey="totalMasuk"
                      position="top"
                      formatter={(val: any) => (Number(val) > 0 ? String(val) : '')}
                      style={{ fontSize: 12, fill: '#0f172a', fontWeight: 800 }}
                    />
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Belum ada data riwayat daisha masuk pada rentang waktu terpilih.
          </div>
        )}
      </div>

      {/* 5. Legenda & Keterangan Bawah */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          {chartViewMode === 'total' ? (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-red-600" />
              <span className="font-semibold text-slate-800">Batang Merah:</span>
              <span>Total Unit Daisha Masuk per Bulan</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span>Selesai (Done)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500" />
                <span>Sedang Proses / Open</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-600" />
                <span>Scrap</span>
              </div>
            </>
          )}

          {summary.avgMonthly > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-4 h-0.5 bg-slate-400 inline-block border-t border-dashed" />
              <span>Garis Putus-putus: Rata-rata ({summary.avgMonthly} Unit/Bulan)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer"
            title="Unduh data tabel bulanan ke file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showTable ? 'Tutup Rincian Tabel' : 'Lihat Rincian Tabel'}</span>
          </button>
        </div>
      </div>

      {/* 6. Tabel Rincian Data Bulanan (Collapsible) */}
      {showTable && (
        <div className="pt-2 animate-scale-up space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Bulan</th>
                  <th className="p-3 text-center">Total Daisha Masuk</th>
                  <th className="p-3 text-center">Selesai (Done)</th>
                  <th className="p-3 text-center">Sedang Proses</th>
                  <th className="p-3 text-center">Scrap</th>
                  <th className="p-3 text-center">Tingkat Selesai (%)</th>
                  <th className="p-3 text-center">Tren MoM</th>
                  <th className="p-3">Seksi Terbanyak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {summary.monthlyData.map((d) => (
                  <tr key={d.monthKey} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">
                      {d.monthName} {d.year}
                    </td>
                    <td className="p-3 text-center font-bold text-red-600">
                      {d.totalMasuk} Unit
                    </td>
                    <td className="p-3 text-center text-emerald-700 font-semibold">
                      {d.selesai} Unit
                    </td>
                    <td className="p-3 text-center text-amber-700 font-semibold">
                      {d.proses} Unit
                    </td>
                    <td className="p-3 text-center text-rose-700 font-semibold">
                      {d.scrap > 0 ? `${d.scrap} Unit` : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, d.completionRate)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{d.completionRate}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {d.momGrowth !== null ? (
                        <span
                          className={`font-semibold inline-flex items-center gap-0.5 text-xs ${
                            d.momDiff > 0
                              ? 'text-red-600'
                              : d.momDiff < 0
                              ? 'text-emerald-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {d.momDiff > 0 ? `+${d.momDiff} (+${d.momGrowth}%)` : d.momDiff < 0 ? `${d.momDiff} (${d.momGrowth}%)` : '0%'}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">
                      {d.topSeksi !== '-' ? `${d.topSeksi} (${d.topSeksiCount} unit)` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
