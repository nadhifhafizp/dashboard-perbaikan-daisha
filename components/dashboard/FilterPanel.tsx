'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { DAFTAR_SEKSI } from '@/lib/masterData';

interface FilterPanelProps {
  search: string;
  setSearch: (v: string) => void;
  filterSeksi: string;
  setFilterSeksi: (v: string) => void;
  filterDaisha: string;
  setFilterDaisha: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  filterHanyaBerulang: boolean;
  setFilterHanyaBerulang: (v: boolean) => void;
  pilihanDaishaFiltered: string[];
  handleQuickPreset: (days: number) => void;
  handleResetFilter: () => void;
  filteredCount: number;
  totalCount: number;
}

export default function FilterPanel({
  search,
  setSearch,
  filterSeksi,
  setFilterSeksi,
  filterDaisha,
  setFilterDaisha,
  filterStatus,
  setFilterStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filterHanyaBerulang,
  setFilterHanyaBerulang,
  pilihanDaishaFiltered,
  handleQuickPreset,
  handleResetFilter,
  filteredCount,
  totalCount,
}: FilterPanelProps) {
  const [isMobileExpanded, setIsMobileExpanded] = React.useState(false);

  const activeFilterCount =
    (search ? 1 : 0) +
    (filterSeksi ? 1 : 0) +
    (filterDaisha ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (filterHanyaBerulang ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3.5">
      {/* Top Bar: Title, Count, Quick Presets & Actions */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <span>Filter & Pencarian Laporan</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200/60">
                  {activeFilterCount} aktif
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-500 font-normal">
              Saring menurut seksi, jenis unit daisha, status servis, dan rentang tanggal
            </p>
          </div>
        </div>

        {/* Quick Date Presets & Reset */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 font-normal hidden sm:inline mr-1">Preset:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset(0)}
            className="h-7.5 px-2.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(7)}
            className="h-7.5 px-2.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center"
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(30)}
            className="h-7.5 px-2.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center"
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setFilterHanyaBerulang(!filterHanyaBerulang)}
            className={`h-7.5 px-2.5 text-xs font-medium rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              filterHanyaBerulang 
                ? 'bg-red-600 text-white shadow-2xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {filterHanyaBerulang && <Check className="w-3.5 h-3.5" />}
            <span>Unit Berulang</span>
          </button>
          <button
            type="button"
            onClick={handleResetFilter}
            disabled={activeFilterCount === 0}
            className="h-7.5 px-2.5 text-xs font-medium rounded-md bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-300 hover:border-red-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {/* Mobile Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            aria-expanded={isMobileExpanded}
            className={`md:hidden h-7.5 px-2.5 text-xs font-medium rounded-md transition cursor-pointer flex items-center gap-1.5 ml-auto ${
              activeFilterCount > 0
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            {isMobileExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Tutup Filter</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Filter ({activeFilterCount})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid 6 Filter Controls */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 ${isMobileExpanded ? 'grid' : 'hidden md:grid'}`}>
        {/* 1. Global Search */}
        <div>
          <label htmlFor="filter-search" className="block text-[11px] font-medium text-slate-700 mb-1">
            Pencarian Bebas
          </label>
          <input
            id="filter-search"
            type="text"
            placeholder="Cari ID tiket, unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 px-2.5 border border-slate-300 rounded-md text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
          />
        </div>

        {/* 2. Seksi Filter */}
        <div>
          <label htmlFor="filter-seksi" className="block text-[11px] font-medium text-slate-700 mb-1">
            Seksi Asal
          </label>
          <select
            id="filter-seksi"
            value={filterSeksi}
            onChange={(e) => {
              setFilterSeksi(e.target.value);
              setFilterDaisha('');
            }}
            className="w-full h-8 px-2 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
          >
            <option value="">Semua Seksi</option>
            {DAFTAR_SEKSI.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* 3. Jenis Daisha Filter */}
        <div>
          <label htmlFor="filter-daisha" className="block text-[11px] font-medium text-slate-700 mb-1">
            Jenis Daisha
          </label>
          <select
            id="filter-daisha"
            value={filterDaisha}
            onChange={(e) => setFilterDaisha(e.target.value)}
            className="w-full h-8 px-2 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
          >
            <option value="">Semua Jenis ({pilihanDaishaFiltered.length})</option>
            {pilihanDaishaFiltered.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* 4. Status Filter */}
        <div>
          <label htmlFor="filter-status" className="block text-[11px] font-medium text-slate-700 mb-1">
            Status Servis
          </label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-8 px-2 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Open">Open / Antre</option>
            <option value="Done">Selesai (Done)</option>
            <option value="Scrap">Rusak (Scrap)</option>
          </select>
        </div>

        {/* 5. Date Start */}
        <div>
          <label htmlFor="filter-start-date" className="block text-[11px] font-medium text-slate-700 mb-1">
            Dari Tanggal
          </label>
          <input
            id="filter-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-8 px-2 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
          />
        </div>

        {/* 6. Date End */}
        <div>
          <label htmlFor="filter-end-date" className="block text-[11px] font-medium text-slate-700 mb-1">
            Sampai Tanggal
          </label>
          <input
            id="filter-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-8 px-2 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition cursor-pointer"
          />
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-xs text-slate-500 font-normal">
        <span>Menampilkan <strong className="font-medium text-slate-800">{filteredCount}</strong> dari total <strong className="font-medium text-slate-800">{totalCount}</strong> laporan</span>
        {filteredCount < totalCount && (
          <span className="text-red-700 font-medium bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-100">
            {totalCount - filteredCount} data difilter
          </span>
        )}
      </div>
    </div>
  );
}
