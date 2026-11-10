'use client';

import React from 'react';
import { CalendarClock, ArrowUpRight, CheckCircle2, Target, CalendarDays, ShieldAlert } from 'lucide-react';

export interface NextYearMonthlySchedule {
  monthKey: string;
  monthName: string;
  year: number;
  month: number;
  count: number;
  types: Record<string, number>;
}

export interface NextYearJenisBreakdown {
  jenis: string;
  total: number;
  alreadyScheduled: number;
  projectedTargetDaily: number;
}

export interface NextYearProjectionData {
  targetYear: number;
  totalScheduledNextYear: number;
  totalFleetTarget: number;
  totalRemainingToSchedule: number;
  projectedDailyTarget: number;
  projectedWorkDays: number;
  monthlySchedule: NextYearMonthlySchedule[];
  breakdownByJenis: NextYearJenisBreakdown[];
}

interface PmNextYearForecastProps {
  currentYear: number;
  projection?: NextYearProjectionData | null;
  totalFleetCount?: number;
}

export default function PmNextYearForecast({
  currentYear,
  projection,
  totalFleetCount = 3543,
}: PmNextYearForecastProps) {
  const nextYear = currentYear + 1;
  const scheduledCount = projection?.totalScheduledNextYear || 0;
  const targetFleet = projection?.totalFleetTarget || totalFleetCount || 3543;
  const dailyTarget = projection?.projectedDailyTarget || 15;
  const workDays = projection?.projectedWorkDays || 237;
  const monthlyList = projection?.monthlySchedule || [];
  const jenisBreakdown = projection?.breakdownByJenis || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* 1. Header Card */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Perencanaan Siklus Masa Depan</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>Proyeksi & Jadwal PM Tahun Depan (Siklus {nextYear})</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Kalkulasi armada yang wajib di-PM kembali pada tahun {nextYear} setelah masa berlaku sertifikasi PM 1 tahun (12 bulan) berakhir.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/10 shrink-0">
          <div className="text-right">
            <span className="text-[11px] text-slate-300 block font-medium">Sudah Terjadwal di {nextYear}</span>
            <span className="text-xl font-black text-emerald-400 tabular-nums">
              {scheduledCount} <span className="text-xs font-semibold text-slate-300">/ {targetFleet} Unit</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
            {targetFleet > 0 ? Math.round((scheduledCount / targetFleet) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* 2. Top Metric Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
        <div className="p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Terkunci Jadwal {nextYear}
          </span>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {scheduledCount} <span className="text-xs font-normal text-slate-500">unit</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">
            Unit yang tuntas PM tahun ini & otomatis jatuh tempo di bulan sama tahun depan.
          </p>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-sky-600" />
            Total Armada Siklus {nextYear}
          </span>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {targetFleet} <span className="text-xs font-normal text-slate-500">unit</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">
            Total seluruh 6 kategori Daisha resmi yang wajib PM tiap 12 bulan.
          </p>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
            Target Harian Siklus {nextYear}
          </span>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {dailyTarget} <span className="text-xs font-normal text-slate-500">unit / hari</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">
            Kapasitas kerja bengkel dengan proyeksi {workDays} hari aktif (Senin–Jumat).
          </p>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            Antrean Menunggu PM {currentYear}
          </span>
          <p className="text-2xl font-black text-rose-600 tabular-nums">
            {Math.max(0, targetFleet - scheduledCount)} <span className="text-xs font-normal text-slate-500">unit</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">
            Akan masuk jadwal {nextYear} segera setelah diselesaikan pada siklus berjalan.
          </p>
        </div>
      </div>

      {/* 3. Sebaran Jatuh Tempo per Bulan di Tahun Depan */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
            <span>Estimasi Sebaran Bulan Jatuh Tempo di Tahun {nextYear}</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Berdasarkan realisasi PM per bulan yang sudah dicatat
          </span>
        </div>

        {monthlyList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
            {monthlyList.map((m) => {
              const share = targetFleet > 0 ? Math.round((m.count / targetFleet) * 100) : 0;
              return (
                <div
                  key={m.monthKey}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{m.monthName}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {share}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900 tabular-nums">
                      {m.count}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      unit jatuh tempo
                    </span>
                  </div>
                  {/* Mini type badges */}
                  <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px] text-slate-600">
                    {Object.entries(m.types).map(([k, count]) => (
                      <span key={k} className="bg-white border border-slate-200 px-1 py-0.2 rounded font-medium">
                        {k}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>Belum ada data unit yang tuntas PM di tahun {currentYear} untuk diproyeksikan ke {nextYear}.</span>
            <span className="text-slate-400 font-mono">0 unit</span>
          </div>
        )}
      </div>

      {/* 4. Rekomendasi Target Harian per Jenis Daisha di Tahun Depan */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-slate-500" />
            <span>Target Harian & Beban Kerja per Kategori Daisha (Siklus {nextYear})</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Pedoman alokasi kapasitas teknisi bengkel
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Kategori Daisha</th>
                <th className="py-2.5 px-3 text-right">Total Populasi</th>
                <th className="py-2.5 px-3 text-right">Terjadwal {nextYear}</th>
                <th className="py-2.5 px-3 text-right">Target Harian {nextYear}</th>
                <th className="py-2.5 px-3">Keterangan Ritme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {jenisBreakdown.length > 0 ? (
                jenisBreakdown.map((j) => (
                  <tr key={j.jenis} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{j.jenis}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">{j.total} unit</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {j.alreadyScheduled} unit
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900">
                      {j.projectedTargetDaily} unit / hari
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {j.projectedTargetDaily >= 4
                        ? 'Prioritas throughput tertinggi harian'
                        : j.projectedTargetDaily >= 2
                        ? 'Throughput rutin stabil harian'
                        : '1 unit tiap 1–2 hari kerja aktif'}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Vertical (Small, Med, Large)</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">1.875 unit</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        76 unit
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900">8 unit / hari</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">Prioritas throughput tertinggi harian (5 Medium, 2 Small, 1 Large)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Ply</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">518 unit</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        31 unit
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900">2 unit / hari</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">Throughput rutin stabil harian</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Slide B-Truck</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">474 unit</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        0 unit
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900">2 unit / hari</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">Throughput rutin stabil harian</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">GT Ring</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">286 unit</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        41 unit
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900">1 unit / hari</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">Rata-rata 1 unit per hari kerja aktif</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Inner Liner</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">260 unit</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        0 unit
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900">1 unit / hari</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">Rata-rata 1 unit per hari kerja aktif</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">A-Truck Nagara Filler</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-semibold">130 unit</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        13 unit
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900">1 unit / 2 hari</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">Target 0.5 unit / hari (1 unit tiap 2 hari kerja)</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

