'use client';

import React from 'react';
import { Building2, Layers, Search, RotateCcw } from 'lucide-react';
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
  filterUkuran,
  setFilterUkuran,
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
    <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            <span>
              Mapping PM per{' '}
              {groupingMode === 'JENIS' ? 'Jenis Daisha' : 'Seksi Pabrik'} (Tahun{' '}
              {currentYear})
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring populasi armada, kesehatan unit (OK vs RUSAK), dan kepatuhan PM dengan filter Jenis, Ukuran, dan Seksi
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Switcher Grouping Mode: Per Jenis vs Per Seksi */}
          <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setGroupingMode('JENIS');
                onClearExpanded();
              }}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                groupingMode === 'JENIS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Berdasarkan Jenis & Ukuran
            </button>
            <button
              type="button"
              onClick={() => {
                setGroupingMode('SEKSI');
                onClearExpanded();
              }}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                groupingMode === 'SEKSI'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Berdasarkan Seksi Pemilik
            </button>
          </div>

          {/* Sub-toggle splitBySize khusus mode JENIS */}
          {groupingMode === 'JENIS' && (
            <button
              type="button"
              onClick={() => setSplitBySize(!splitBySize)}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1 cursor-pointer ${
                splitBySize
                  ? 'bg-red-600 text-white border-red-600 font-bold'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Pecah varian ukuran Small / Medium / Large"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {splitBySize ? 'Rinci Ukuran (Aktif)' : 'Pisah Ukuran (S/M/L)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Baris Filter Multikriteria */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
        {/* Filter Seksi */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Seksi:</span>
          <select
            value={filterSeksi}
            onChange={(e) => setFilterSeksi(e.target.value)}
            className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
          >
            <option value="all">Semua Seksi ({seksiOptions.length})</option>
            {seksiOptions.map((s) => (
              <option key={s} value={s}>
                Seksi {s}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Jenis Daisha */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Jenis:</span>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500 max-w-[170px]"
          >
            <option value="all">Semua Jenis ({jenisOptions.length})</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>
                {formatJenisLabel(j)}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Rincian Ukuran */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Ukuran:</span>
          <select
            value={filterUkuran}
            onChange={(e) => setFilterUkuran(e.target.value)}
            className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
          >
            <option value="all">Semua Ukuran</option>
            <option value="SMALL">Small (S)</option>
            <option value="MEDIUM">Medium (M)</option>
            <option value="LARGE">Large (L)</option>
            <option value="NONE">Tanpa Ukuran</option>
          </select>
        </div>

        {/* Filter Kepatuhan PM */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Kepatuhan PM:</span>
          <select
            value={filterPmStatus}
            onChange={(e) =>
              setFilterPmStatus(e.target.value as 'all' | 'maintained' | 'unmaintained')
            }
            className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
          >
            <option value="all">Semua Status PM</option>
            <option value="maintained">Sudah di-PM</option>
            <option value="unmaintained">Belum di-PM (Backlog)</option>
          </select>
        </div>

        {/* Filter Kondisi Fisik */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Kondisi:</span>
          <select
            value={filterCondition}
            onChange={(e) =>
              setFilterCondition(e.target.value as 'all' | 'OK' | 'RUSAK')
            }
            className="h-8.5 px-2.5 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-red-500"
          >
            <option value="all">Semua Kondisi</option>
            <option value="OK">Siap Pakai (OK)</option>
            <option value="RUSAK">Perlu Servis (RUSAK)</option>
          </select>
        </div>

        {/* Pencarian */}
        <div className="relative min-w-[150px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama / no daisha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 pl-8 pr-3 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-lg w-full focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Urutkan:</span>
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
            className="h-8.5 px-2 bg-slate-50 hover:bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer focus:outline-none"
          >
            <option value="backlog">Sisa Belum PM (Terbanyak)</option>
            <option value="total">Populasi Terbesar</option>
            <option value="rusak">Kondisi Rusak Terbanyak</option>
            <option value="pct">Persentase Capaian</option>
            <option value="target">Target Harian</option>
            <option value="name">Nama Kategori (A-Z)</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-8.5 px-2.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 inline-flex items-center gap-1 cursor-pointer transition"
            title="Reset semua filter mapping PM"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
