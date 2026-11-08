'use client';

import React from 'react';
import { Layers, Search, RotateCcw } from 'lucide-react';
import { formatJenisLabel } from '@/lib/pmAnalytics';

interface PmMeetingFilterBarProps {
  currentYear: number;
  groupingMode: 'JENIS' | 'SEKSI';
  setGroupingMode: (mode: 'JENIS' | 'SEKSI') => void;
  splitBySize: boolean;
  setSplitBySize: (split: boolean) => void;
  filterSeksi: string;
  setFilterSeksi: (seksi: string) => void;
  filterJenis: string;
  setFilterJenis: (jenis: string) => void;
  filterUkuran: string;
  setFilterUkuran: (ukuran: string) => void;
  filterPmStatus: 'all' | 'maintained' | 'unmaintained';
  setFilterPmStatus: (status: 'all' | 'maintained' | 'unmaintained') => void;
  filterCondition: 'all' | 'OK' | 'RUSAK';
  setFilterCondition: (cond: 'all' | 'OK' | 'RUSAK') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: 'backlog' | 'total' | 'rusak' | 'pct' | 'target' | 'name';
  setSortBy: (sort: 'backlog' | 'total' | 'rusak' | 'pct' | 'target' | 'name') => void;
  seksiOptions: string[];
  jenisOptions: string[];
  hasActiveFilters: boolean;
  handleResetFilters: () => void;
  onClearExpanded: () => void;
}

export default function PmMeetingFilterBar({
  currentYear,
  groupingMode,
  setGroupingMode,
  splitBySize,
  setSplitBySize,
  filterSeksi,
  setFilterSeksi,
  filterJenis,
  setFilterJenis,
  filterPmStatus,
  setFilterPmStatus,
  filterCondition,
  setFilterCondition,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  seksiOptions,
  jenisOptions,
  hasActiveFilters,
  handleResetFilters,
  onClearExpanded,
}: PmMeetingFilterBarProps) {
  return (
    <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3.5 bg-slate-50/50">
      {/* 1. Header & Grouping Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Matriks Kepatuhan & Populasi ({currentYear})
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Daftar per {groupingMode === 'JENIS' ? 'kategori jenis & varian' : 'seksi operasional pabrik'} beserta sisa backlog target tahunan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
            <button
              type="button"
              onClick={() => {
                setGroupingMode('JENIS');
                onClearExpanded();
              }}
              className={`h-7 px-3 rounded-md transition cursor-pointer font-medium ${
                groupingMode === 'JENIS'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Jenis Daisha
            </button>
            <button
              type="button"
              onClick={() => {
                setGroupingMode('SEKSI');
                onClearExpanded();
              }}
              className={`h-7 px-3 rounded-md transition cursor-pointer font-medium ${
                groupingMode === 'SEKSI'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Seksi Pabrik
            </button>
          </div>

          {/* Sub-toggle splitBySize khusus mode JENIS */}
          {groupingMode === 'JENIS' && (
            <button
              type="button"
              onClick={() => setSplitBySize(!splitBySize)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium border transition inline-flex items-center gap-1.5 cursor-pointer ${
                splitBySize
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Pecah varian ukuran Small / Medium / Large"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{splitBySize ? 'Rinci Ukuran' : 'Pisah Ukuran (S/M/L)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Toolbar (Industrial Precision Grid) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari armada atau nomor daisha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-3 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg w-full focus:outline-hidden focus:border-red-600 font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Seksi Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 h-8">
          <span className="text-slate-400 font-medium">Seksi:</span>
          <select
            value={filterSeksi}
            onChange={(e) => setFilterSeksi(e.target.value)}
            className="bg-transparent font-medium text-slate-800 cursor-pointer focus:outline-hidden text-xs"
          >
            <option value="all">Semua ({seksiOptions.length})</option>
            {seksiOptions.map((s) => (
              <option key={s} value={s}>
                Seksi {s}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 h-8">
          <span className="text-slate-400 font-medium">Jenis:</span>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="bg-transparent font-medium text-slate-800 cursor-pointer focus:outline-hidden text-xs max-w-[140px] truncate"
          >
            <option value="all">Semua Jenis ({jenisOptions.length})</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>
                {formatJenisLabel(j)}
              </option>
            ))}
          </select>
        </div>

        {/* Status PM */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 h-8">
          <span className="text-slate-400 font-medium">PM:</span>
          <select
            value={filterPmStatus}
            onChange={(e) =>
              setFilterPmStatus(e.target.value as 'all' | 'maintained' | 'unmaintained')
            }
            className="bg-transparent font-medium text-slate-800 cursor-pointer focus:outline-hidden text-xs"
          >
            <option value="all">Semua</option>
            <option value="unmaintained">Belum PM (Backlog)</option>
            <option value="maintained">Sudah PM</option>
          </select>
        </div>

        {/* Kondisi Fisik */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 h-8">
          <span className="text-slate-400 font-medium">Kondisi:</span>
          <select
            value={filterCondition}
            onChange={(e) =>
              setFilterCondition(e.target.value as 'all' | 'OK' | 'RUSAK')
            }
            className="bg-transparent font-medium text-slate-800 cursor-pointer focus:outline-hidden text-xs"
          >
            <option value="all">Semua</option>
            <option value="OK">Siap Pakai (OK)</option>
            <option value="RUSAK">Perlu Servis (RUSAK)</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 h-8 sm:ml-auto">
          <span className="text-slate-400 font-medium">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | 'backlog'
                  | 'total'
                  | 'rusak'
                  | 'pct'
                  | 'target'
                  | 'name'
              )
            }
            className="bg-transparent font-medium text-slate-800 cursor-pointer focus:outline-hidden text-xs"
          >
            <option value="backlog">Sisa Belum PM (Terbanyak)</option>
            <option value="total">Populasi Terbesar</option>
            <option value="rusak">Kondisi Rusak</option>
            <option value="pct">Persentase Capaian</option>
            <option value="target">Target Harian</option>
            <option value="name">Nama (A-Z)</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-8 px-2.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 inline-flex items-center gap-1 cursor-pointer transition"
            title="Reset semua filter ke kondisi awal"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
