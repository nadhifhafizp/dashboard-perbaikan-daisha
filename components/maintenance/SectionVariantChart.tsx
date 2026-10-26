'use client';

import React from 'react';
import { Layers, Target, Calendar } from 'lucide-react';
import { CHART } from '@/lib/chart-colors';

export interface VariantTargetChartItem {
  key: string;
  name: string;
  ukuran?: string;
  displayName: string;
  total: number;
  maintained: number;
  unmaintained: number;
  dailyTarget: number;
}

interface SectionVariantChartProps {
  seksi: string;
  data: VariantTargetChartItem[];
  totalUnits: number;
  totalDailyTarget: number;
  onSelectVariant?: (item: VariantTargetChartItem) => void;
  selectedKey?: string | null;
}

export default function SectionVariantChart({
  seksi,
  data,
  totalUnits,
  totalDailyTarget,
  onSelectVariant,
  selectedKey,
}: SectionVariantChartProps) {
  const chartData = data || [];
  const totalMaintained = chartData.reduce((acc, d) => acc + d.maintained, 0);
  const totalUnmaintained = chartData.reduce((acc, d) => acc + d.unmaintained, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex flex-col gap-4 font-sans w-full">
      {/* Header Ringkas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              Kepatuhan PM seksi {seksi}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <Target className="w-3.5 h-3.5 text-rose-600" />
            1 Thn 1x PM
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Target: {totalDailyTarget}/hari
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200">
            {totalUnits.toLocaleString('id-ID')} Unit
          </span>
        </div>
      </div>

      {/* Grid Donut Bersih Tanpa Box Card Berlapis */}
      {chartData.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-slate-400">
          Tidak ada data varian untuk seksi ini
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {chartData.map((d) => {
            const pct = d.total > 0 ? Math.round((d.maintained / d.total) * 100) : 0;
            const isSelected = selectedKey === d.key;

            // Size badge
            const uk = (d.ukuran || '').toUpperCase();
            const sizeBadge =
              uk === 'SMALL' || uk === 'S' ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  S
                </span>
              ) : uk === 'MEDIUM' || uk === 'M' ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  M
                </span>
              ) : uk === 'LARGE' || uk === 'L' ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  L
                </span>
              ) : null;

            return (
              <div
                key={d.key}
                onClick={() => onSelectVariant?.(d)}
                className={`p-3 rounded-xl flex flex-col justify-between transition-colors border ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                } ${onSelectVariant ? 'cursor-pointer' : ''}`}
              >
                {/* Header Item: Nama Armada & Ukuran */}
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate" title={d.displayName}>
                    {d.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {sizeBadge}
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {d.total}
                    </span>
                  </div>
                </div>

                {/* Donut Chart Besar & Bersih */}
                <div className="flex flex-col items-center justify-center py-2 my-1">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      {/* Belum PM (Merah Status Danger #DC2626) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke={d.total === 0 ? CHART.grid : CHART.status.late}
                        strokeWidth="3.6"
                      />
                      {/* Sudah PM (Hijau Status OK #059669) */}
                      {d.total > 0 && pct > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke={CHART.status.ok}
                          strokeWidth="3.6"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>

                    {/* Teks Tengah Donut: Persentase & Rasio */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums leading-none">
                        {pct}%
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-500 mt-1 tabular-nums">
                        {d.maintained} / {d.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Item: Angka Hijau / Merah & Kuota Harian */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono font-semibold text-emerald-700 tabular-nums" title="Sudah PM">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {d.maintained}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-semibold text-rose-600 tabular-nums" title="Belum PM">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {d.unmaintained}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {d.dailyTarget}/hari
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend Bawah Ringkas */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">Sudah ({totalMaintained})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-medium text-slate-700">Belum ({totalUnmaintained})</span>
          </span>
        </div>
      </div>
    </div>
  );
}
