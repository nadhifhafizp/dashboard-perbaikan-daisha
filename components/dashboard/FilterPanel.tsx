'use client';

import React from 'react';
import { DAFTAR_SEKSI } from '@/lib/masterData';

interface FilterPanelProps {
  search: string;
  setSearch: (v: string) => void;
  filterSeksi: string;
  setFilterSeksi: (v: string) => void;
  filterDaisha: string;
  setFilterDaisha: (v: string) => void;
  filterNoDaisha: string;
  setFilterNoDaisha: (v: string) => void;
  filterKerusakan: string;
  setFilterKerusakan: (v: string) => void;
  filterDetail: string;
  setFilterDetail: (v: string) => void;
  filterPelapor: string;
  setFilterPelapor: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  filterHanyaBerulang: boolean;
  setFilterHanyaBerulang: (v: boolean) => void;
  pilihanDaishaFiltered: string[];
  pilihanKomponenFiltered: string[];
  pilihanDetailFiltered: string[];
  pilihanNoDaisha: string[];
  pilihanPelapor: string[];
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
  filterNoDaisha,
  setFilterNoDaisha,
  filterKerusakan,
  setFilterKerusakan,
  filterDetail,
  setFilterDetail,
  filterPelapor,
  setFilterPelapor,
  filterStatus,
  setFilterStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filterHanyaBerulang,
  setFilterHanyaBerulang,
  pilihanDaishaFiltered,
  pilihanKomponenFiltered,
  pilihanDetailFiltered,
  pilihanNoDaisha,
  pilihanPelapor,
  handleQuickPreset,
  handleResetFilter,
  filteredCount,
  totalCount,
}: FilterPanelProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎛️</span>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Panel Filter & Pencarian Lengkap
            </h2>
            <p className="text-[11px] text-slate-600">
              Saring visualisasi berdasarkan 10 kriteria presisi
            </p>
          </div>
        </div>

        {/* Quick Date Presets & Quick Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">Preset Cepat:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset(0)}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(7)}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(30)}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setFilterHanyaBerulang(!filterHanyaBerulang)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
              filterHanyaBerulang 
                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {filterHanyaBerulang ? '✓ Unit Berulang (>1x)' : 'Unit Berulang (>1x)'}
          </button>
          <button
            type="button"
            onClick={handleResetFilter}
            className="px-3 py-1 text-[11px] font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      </div>

      {/* Grid 10 Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Pencarian Teks Bebas */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            🔍 Pencarian Global
          </label>
          <input
            type="text"
            placeholder="Cari ID tiket, unit, nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
          />
        </div>

        {/* 2. Filter Seksi */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            🏢 Seksi Asal
          </label>
          <select
            value={filterSeksi}
            onChange={(e) => {
              setFilterSeksi(e.target.value);
              setFilterDaisha('');
              setFilterKerusakan('');
              setFilterDetail('');
            }}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
          >
            <option value="">Semua Seksi</option>
            {DAFTAR_SEKSI.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* 3. Filter Jenis Daisha */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            🛒 Jenis Daisha
          </label>
          <select
            value={filterDaisha}
            onChange={(e) => {
              setFilterDaisha(e.target.value);
              setFilterKerusakan('');
              setFilterDetail('');
            }}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
          >
            <option value="">Semua Jenis Daisha ({pilihanDaishaFiltered.length})</option>
            {pilihanDaishaFiltered.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* 4. Filter Nomor Unit Fisik */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            🏷️ No. Unit Daisha
          </label>
          <select
            value={filterNoDaisha}
            onChange={(e) => setFilterNoDaisha(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
          >
            <option value="">Semua Nomor Unit ({pilihanNoDaisha.length})</option>
            {pilihanNoDaisha.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* 5. Filter Komponen Rusak */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            ⚙️ Komponen Rusak
          </label>
          <select
            value={filterKerusakan}
            onChange={(e) => {
              setFilterKerusakan(e.target.value);
              setFilterDetail('');
            }}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
          >
            <option value="">Semua Komponen ({pilihanKomponenFiltered.length})</option>
            {pilihanKomponenFiltered.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* 6. Filter Detail Gejala Spesifik */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            ⚠️ Detail Gejala Spesifik
          </label>
          <select
            value={filterDetail}
            onChange={(e) => setFilterDetail(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
          >
            <option value="">Semua Gejala ({pilihanDetailFiltered.length})</option>
            {pilihanDetailFiltered.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* 7. Filter Pelapor */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            👤 Nama Pelapor
          </label>
          <select
            value={filterPelapor}
            onChange={(e) => setFilterPelapor(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
          >
            <option value="">Semua Pelapor ({pilihanPelapor.length})</option>
            {pilihanPelapor.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* 8. Filter Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            🚦 Status Servis
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
          >
            <option value="">Semua Status</option>
            <option value="Open">Antre (Open)</option>
            <option value="Progress">Dikerjakan (Progress)</option>
            <option value="Done">Selesai (Done)</option>
            <option value="Scrap">Afkir (Scrap)</option>
          </select>
        </div>

        {/* 9. Tanggal Dari */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            📅 Dari Tanggal
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
          />
        </div>

        {/* 10. Tanggal Sampai */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            📅 Sampai Tanggal
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 font-medium">
        <span>Menampilkan <b>{filteredCount}</b> dari total <b>{totalCount}</b> laporan</span>
        {filteredCount < totalCount && (
          <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
            ⚡ Filter aktif ({totalCount - filteredCount} disaring)
          </span>
        )}
      </div>
    </div>
  );
}
