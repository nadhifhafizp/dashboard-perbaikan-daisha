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
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <PieIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="t-section text-slate-900 tracking-tight">
                {currentSeksi && currentSeksi !== 'all'
                  ? `KPI Jumlah Daisha - Seksi ${currentSeksi}`
                  : 'KPI Jumlah Seluruh Daisha di Bridgestone'}
              </h3>
              <p className="t-caption text-slate-500">
                Data populasi armada fisik dan 2 status utama (OKE vs NG) diambil dari data perbaikan daisha dan seksi
              </p>
            </div>
          </div>
        </div>

        {currentSeksi && currentSeksi !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="h-8 px-2.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
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
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-center">
        {/* Master Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="h-[260px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={globalDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={112}
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
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Angka di tengah donat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {globalStats.pctReady.toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-emerald-700">Kondisi OKE</span>
              <span className="text-xs text-slate-500 mt-0.5">
                {globalStats.total.toLocaleString('id-ID')} Unit
              </span>
            </div>
          </div>
        </div>

        {/* 2 KARTU UTAMA: OKE & NG */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* KARTU 1: OKE */}
          <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-emerald-900 tracking-tight">OKE</span>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Siap Operasi
              </span>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-emerald-700 tabular-nums">
                  {globalStats.ready.toLocaleString('id-ID')}
                </span>
                <span className="text-sm font-semibold text-emerald-600">Unit</span>
              </div>
              <div className="text-xs text-emerald-700/90 font-medium mt-1">
                {globalStats.pctReady.toFixed(1)}% dari total armada
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800">
              <span>Status</span>
              <span className="font-semibold">Normal / Siap Pakai</span>
            </div>
          </div>

          {/* KARTU 2: NG */}
          <div
            className={`p-5 rounded-xl border flex flex-col justify-between ${
              globalStats.broken > 0
                ? 'bg-red-50/70 border-red-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    globalStats.broken > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span
                  className={`text-sm font-bold tracking-tight ${
                    globalStats.broken > 0 ? 'text-red-900' : 'text-slate-800'
                  }`}
                >
                  NG
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                  globalStats.broken > 0
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {globalStats.broken > 0 ? 'Perlu Servis' : 'Nol Rusak'}
              </span>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-extrabold tabular-nums ${
                    globalStats.broken > 0 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {globalStats.broken.toLocaleString('id-ID')}
                </span>
                <span className="text-sm font-semibold text-slate-500">Unit</span>
              </div>
              <div
                className={`text-xs font-medium mt-1 ${
                  globalStats.broken > 0 ? 'text-red-700/90' : 'text-slate-500'
                }`}
              >
                {globalStats.pctBroken.toFixed(1)}% dari total armada
              </div>
            </div>
            <div
              className={`pt-3 border-t flex items-center justify-between text-xs ${
                globalStats.broken > 0
                  ? 'border-red-200/60 text-red-800'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <span>Status</span>
              <span className="font-semibold">
                {globalStats.broken > 0 ? 'Di Bengkel / Rusak' : 'Semua Unit Baik'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
