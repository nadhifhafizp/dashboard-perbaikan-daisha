'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

interface FleetSeksiFilterBarProps {
  currentSeksi: string;
  totalUnitsCount: number;
  availableSeksiList: { name: string; count: number }[];
  onSelectSeksi: (seksi: string) => void;
}

export default function FleetSeksiFilterBar({
  currentSeksi,
  totalUnitsCount,
  availableSeksiList,
  onSelectSeksi,
}: FleetSeksiFilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <Building2 className="w-4 h-4 text-red-600" />
        <span className="text-xs font-bold text-slate-800">Filter Seksi:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
        <button
          type="button"
          onClick={() => onSelectSeksi('')}
          className={`h-10 min-h-[40px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            !currentSeksi || currentSeksi === 'all'
              ? 'bg-slate-900 text-white font-bold'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <span>Semua Seksi</span>
          <span className="text-xs opacity-75 tabular-nums">
            ({totalUnitsCount.toLocaleString('id-ID')})
          </span>
        </button>
        {availableSeksiList.map((s) => {
          const isSelected = currentSeksi.toLowerCase() === s.name.toLowerCase();
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => onSelectSeksi(s.name)}
              className={`h-10 min-h-[40px] px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>Seksi {s.name}</span>
              <span className="text-xs opacity-75 tabular-nums">
                ({s.count.toLocaleString('id-ID')})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
