'use client';

import React, { useMemo } from 'react';
import {
  PieChart as PieIcon,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { SeksiSummaryItem } from './SectionPopulationChart';
import { PmStagingRecord } from './SectionPmHandover';

interface AdminSectionDonutGridProps {
  seksiSummaries: SeksiSummaryItem[];
  stagingRecords?: PmStagingRecord[];
  remainingWorkDays: number;
  totalUnits: number;
  maintainedUnits: number;
  unmaintainedUnits: number;
  selectedSeksi?: string;
  onSelectSeksi: (seksi: string) => void;
}

export default function AdminSectionDonutGrid({
  seksiSummaries,
  stagingRecords = [],
  remainingWorkDays = 50,
  totalUnits,
  maintainedUnits,
  unmaintainedUnits,
  selectedSeksi,
  onSelectSeksi,
}: AdminSectionDonutGridProps) {
  // Hitung jumlah unit di staging per seksi
  const stagingPerSeksi = useMemo(() => {
    const map = new Map<string, number>();
    stagingRecords
      .filter((r) => r.status === 'WAITING_PICKUP' || r.status === 'PICKED_UP')
      .forEach((r) => {
        const count = r.units?.length || 0;
        map.set(r.seksi, (map.get(r.seksi) || 0) + count);
      });
    return map;
  }, [stagingRecords]);

  // Total staging pabrik
  const totalStaging = useMemo(() => {
    return Array.from(stagingPerSeksi.values()).reduce((a, b) => a + b, 0);
  }, [stagingPerSeksi]);

  // Total pabrik persentase
  const totalPct = totalUnits > 0 ? Math.round((maintainedUnits / totalUnits) * 100) : 0;
  const totalDailyTarget = Math.ceil(unmaintainedUnits / Math.max(1, remainingWorkDays));

  // Urutkan seksi dari populasi terbesar
  const sortedSections = useMemo(() => {
    return [...seksiSummaries]
      .filter((s) => s.total > 0 && s.seksi !== 'Unknown')
      .sort((a, b) => b.total - a.total);
  }, [seksiSummaries]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 font-sans space-y-4">
      {/* 1. Header Panel Diagram Donut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-red-600" aria-hidden="true" />
            <span>Diagram Donut Kepatuhan PM Seluruh Seksi Pabrik</span>
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Visualisasi target 1 tahun 1x PM untuk total pabrik dan perbandingan per seksi operasional
          </p>
        </div>

        {/* Legend Warna Fungsional & Reset Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>Sudah PM</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" aria-hidden="true" />
              <span>Belum PM</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
              <span>Di Staging</span>
            </span>
          </div>

          {selectedSeksi && (
            <button
              type="button"
              onClick={() => onSelectSeksi('')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tutup Rincian ({selectedSeksi})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Grid Donut Besar: Hero Total Pabrik + Donut Tiap Seksi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-1">
        {/* HERO DONUT: Total Seluruh Pabrik */}
        <div
          onClick={() => onSelectSeksi('')}
          className={`p-3.5 rounded-xl border flex flex-col justify-between transition cursor-pointer ${
            !selectedSeksi
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
          title="Klik untuk melihat data seluruh pabrik"
        >
          {/* Top Label */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-xs font-bold truncate">Total Pabrik</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                !selectedSeksi ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'
              }`}
            >
              {totalUnits.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Large Donut SVG */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Belum PM (Rose) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3.6"
                />
                {/* Sudah PM (Emerald) */}
                {totalPct > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.6"
                    strokeDasharray={`${totalPct} ${100 - totalPct}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                )}
              </svg>

              {/* Teks Tengah Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                <span className={`text-2xl sm:text-3xl font-black font-mono leading-none ${!selectedSeksi ? 'text-white' : 'text-slate-900'}`}>
                  {totalPct}%
                </span>
                <span className={`text-[10px] font-medium mt-0.5 tabular-nums ${!selectedSeksi ? 'text-slate-300' : 'text-slate-500'}`}>
                  {maintainedUnits.toLocaleString('id-ID')} unit
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className={`pt-2 border-t text-[11px] space-y-0.5 ${!selectedSeksi ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
            <div className="flex justify-between tabular-nums">
              <span>Target:</span>
              <span className="font-semibold">{totalDailyTarget}/hari</span>
            </div>
            <div className="flex justify-between tabular-nums">
              <span>Sisa:</span>
              <span className="font-semibold">{unmaintainedUnits.toLocaleString('id-ID')} unit</span>
            </div>
          </div>
        </div>

        {/* DONUT TIAP SEKSI OPERASIONAL */}
        {sortedSections.map((s) => {
          const isSelected = selectedSeksi === s.seksi;
          const pct = s.total > 0 ? Math.round((s.maintained / s.total) * 100) : 0;
          const dailyTarget = Math.ceil(s.unmaintained / Math.max(1, remainingWorkDays));
          const staged = stagingPerSeksi.get(s.seksi) || 0;

          // Evaluasi status badge
          let statusBadge = (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Perlu Percepatan</span>
            </span>
          );
          if (pct >= 100) {
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>100% Selesai</span>
              </span>
            );
          } else if (pct >= 50) {
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                <TrendingUp className="w-2.5 h-2.5" />
                <span>On Track</span>
              </span>
            );
          } else if (pct >= 25) {
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                <Clock className="w-2.5 h-2.5" />
                <span>Dalam Proses</span>
              </span>
            );
          }

          return (
            <div
              key={s.seksi}
              onClick={() => onSelectSeksi(isSelected ? '' : s.seksi)}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition cursor-pointer ${
                isSelected
                  ? 'bg-red-50/60 border-red-500 ring-2 ring-red-500/30 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-400 hover:bg-slate-50/70 shadow-2xs'
              }`}
              title={`Klik untuk memfilter armada Seksi ${s.seksi}`}
            >
              {/* Header Seksi */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <h3 className="text-xs font-bold text-slate-900 truncate">
                  {s.seksi}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                  {s.total.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Large Donut SVG */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {/* Belum PM (Rose) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="3.6"
                    />
                    {/* Sudah PM (Emerald) */}
                    {pct > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.6"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>

                  {/* Teks Tengah Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono leading-none">
                      {pct}%
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 mt-0.5 tabular-nums">
                      {s.maintained.toLocaleString('id-ID')} unit
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Meta & Staging Badge */}
              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 tabular-nums">Target:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{dailyTarget}/hari</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 tabular-nums">Sisa:</span>
                  <span className="font-semibold text-rose-700 tabular-nums">{s.unmaintained.toLocaleString('id-ID')}</span>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                  {staged > 0 ? (
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 tabular-nums">
                      {staged} Di Staging
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      0 Staging
                    </span>
                  )}
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isSelected ? 'text-red-600' : 'text-slate-600'}`}>
                    <span>{isSelected ? 'Tutup' : 'Rincian'}</span>
                    <ArrowRight className={`w-2.5 h-2.5 transition-transform ${isSelected ? 'rotate-90 text-red-600' : ''}`} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
