'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, X } from 'lucide-react';

interface FleetMasterOverviewProps {
  currentSeksi: string;
  onClearSeksi: () => void;
  globalDonutData: { name: string; value: number; color: string }[];
  globalStats: {
    total: number;
    ready: number;
    broken: number;
    pctReady: number;
    pctBroken: number;
    totalSeksi: number;
    totalJenis: number;
    recurringUnitsCount: number;
  };
  isSeksiLocked?: boolean;
}

export default function FleetMasterOverview({
  currentSeksi,
  onClearSeksi,
  globalDonutData,
  globalStats,
  isSeksiLocked = false,
}: FleetMasterOverviewProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <PieIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentSeksi && currentSeksi !== 'all'
                  ? `KPI Jumlah Daisha - Seksi ${currentSeksi}`
                  : 'KPI Jumlah Seluruh Daisha di Bridgestone'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Data populasi armada fisik dan 2 status utama (OKE vs NG) diambil dari data perbaikan daisha dan seksi
              </p>
            </div>
          </div>
        </div>

        {currentSeksi && currentSeksi !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="h-9 px-3 text-xs sm:text-sm font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-2">
              <span>
                Seksi: <strong>{currentSeksi}</strong>
              </span>
              {!isSeksiLocked && (
                <button
                  type="button"
                  onClick={onClearSeksi}
                  className="text-amber-700 hover:text-amber-900 cursor-pointer p-0.5 rounded hover:bg-amber-100"
                  title="Kembali ke semua seksi"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-center">
        {/* Master Donut Chart - DIBESARKAN & DILEBARKAN */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="h-[300px] sm:h-[320px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={globalDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={128}
                  paddingAngle={globalStats.broken > 0 ? 3 : 0}
                  dataKey="value"
                >
                  {globalDonutData.map((entry, index) => (
                    <Cell key={`cell-global-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown, name: unknown) => [
                    `${Number(val || 0).toLocaleString('id-ID')} Unit (${(
                      (Number(val || 0) / (globalStats.total || 1)) *
                      100
                    ).toFixed(1)}%)`,
                    String(name || ''),
                  ]}
                  contentStyle={{ borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Angka di tengah donat - FONT BESAR & JELAS */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums tracking-tight">
                {globalStats.pctReady.toFixed(1)}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wide mt-0.5">Kondisi OKE</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {globalStats.total.toLocaleString('id-ID')} Total Unit
              </span>
            </div>
          </div>
        </div>

        {/* 2 KARTU UTAMA: OKE & NG - ANGKA & FONT DIBESARKAN PADAT */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* KARTU 1: OKE */}
          <div className="p-5 sm:p-6 rounded-xl bg-emerald-50/80 border-2 border-emerald-300 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">OKE</span>
              </div>
              <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Siap Operasi
              </span>
            </div>
            <div className="my-3 sm:my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-emerald-700 tabular-nums tracking-tight">
                  {globalStats.ready.toLocaleString('id-ID')}
                </span>
                <span className="text-base font-bold text-emerald-600">Unit</span>
              </div>
              <div className="text-xs sm:text-sm text-emerald-800 font-semibold mt-1">
                {globalStats.pctReady.toFixed(1)}% dari total populasi armada
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200 flex items-center justify-between text-xs sm:text-sm text-emerald-900 font-medium">
              <span>Kondisi Fisik</span>
              <span className="font-bold">Normal / Siap Pakai</span>
            </div>
          </div>

          {/* KARTU 2: NG */}
          <div
            className={`p-5 sm:p-6 rounded-xl border-2 flex flex-col justify-between shadow-xs ${
              globalStats.broken > 0
                ? 'bg-red-50/80 border-red-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    globalStats.broken > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    globalStats.broken > 0 ? 'text-red-950' : 'text-slate-800'
                  }`}
                >
                  NG
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${
                  globalStats.broken > 0
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {globalStats.broken > 0 ? 'Perlu Servis' : 'Nol Rusak'}
              </span>
            </div>
            <div className="my-3 sm:my-4">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tight ${
                    globalStats.broken > 0 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {globalStats.broken.toLocaleString('id-ID')}
                </span>
                <span className="text-base font-bold text-slate-500">Unit</span>
              </div>
              <div
                className={`text-xs sm:text-sm font-semibold mt-1 ${
                  globalStats.broken > 0 ? 'text-red-800' : 'text-slate-500'
                }`}
              >
                {globalStats.pctBroken.toFixed(1)}% dari total populasi armada
              </div>
            </div>
            <div
              className={`pt-3 border-t flex items-center justify-between text-xs sm:text-sm ${
                globalStats.broken > 0
                  ? 'border-red-200 text-red-900 font-medium'
                  : 'border-slate-200 text-slate-600 font-medium'
              }`}
            >
              <span>Kondisi Fisik</span>
              <span className="font-bold">
                {globalStats.broken > 0 ? 'Di Bengkel / Rusak' : 'Semua Unit Baik'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
