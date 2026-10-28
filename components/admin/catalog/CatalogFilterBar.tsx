'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface CatalogFilterBarProps {
  selectedSeksi: string;
  setSelectedSeksi: (seksi: string) => void;
  uniqueSeksiList: string[];
  seksiCounts: Record<string, number>;
  totalTreeCount: number;
  search: string;
  setSearch: (search: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export default function CatalogFilterBar({
  selectedSeksi,
  setSelectedSeksi,
  uniqueSeksiList,
  seksiCounts,
  totalTreeCount,
  search,
  setSearch,
  onExpandAll,
  onCollapseAll,
}: CatalogFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
      {/* Seksi Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">
          Filter Seksi:
        </span>
        <button
          type="button"
          onClick={() => setSelectedSeksi('all')}
          className={`h-8 sm:h-9 px-3 rounded text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            selectedSeksi === 'all'
              ? 'bg-[#E60012] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>Semua Seksi</span>
          <span
            className={`text-xs px-1.5 py-0.2 rounded tabular-nums ${
              selectedSeksi === 'all'
                ? 'bg-[#B3000E] text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {totalTreeCount}
          </span>
        </button>

        {uniqueSeksiList.map((s) => {
          const count = seksiCounts[s] || 0;
          const isSelected = selectedSeksi.toLowerCase() === s.toLowerCase();
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSeksi(s)}
              className={`h-8 sm:h-9 px-3 rounded text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#E60012] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{s}</span>
              <span
                className={`text-xs px-1.5 py-0.2 rounded tabular-nums ${
                  isSelected
                    ? 'bg-[#B3000E] text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search input & Collapse controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama daisha, kode prefix, komponen, gejala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded text-xs text-slate-900 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onExpandAll}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition cursor-pointer"
          >
            Buka Semua
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition cursor-pointer"
          >
            Tutup Semua
          </button>
        </div>
      </div>
    </div>
  );
}
