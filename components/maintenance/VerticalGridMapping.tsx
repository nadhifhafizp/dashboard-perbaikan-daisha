'use client';

import React, { useState, useMemo } from 'react';
import {
  Grid,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

export interface GridDaishaUnit {
  id: string;
  nomor_daisha: string;
  serial_number: number;
  jenis: string;
  ukuran: string;
  last_maintenance_date: string | null;
  is_maintained: boolean;
  days_since_last: number | null;
}

interface VerticalGridMappingProps {
  units: GridDaishaUnit[];
  currentYear: number;
  onSelectUnit: (unit: GridDaishaUnit) => void;
  onQuickMaintenance: (unit: GridDaishaUnit) => void;
}

export default function VerticalGridMapping({
  units,
  currentYear,
  onSelectUnit,
  onQuickMaintenance,
}: VerticalGridMappingProps) {
  const [selectedUkuran, setSelectedUkuran] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>('SMALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MAINTAINED' | 'UNMAINTAINED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Filter units by selected Ukuran (Small/Medium/Large)
  const verticalUnitsForSize = useMemo(() => {
    return units
      .filter((u) => u.jenis === 'VERTICAL' && u.ukuran === selectedUkuran)
      .sort((a, b) => a.serial_number - b.serial_number);
  }, [units, selectedUkuran]);

  // Hitung jumlah sudah & belum
  const totalInSize = verticalUnitsForSize.length;
  const maintainedCount = verticalUnitsForSize.filter((u) => u.is_maintained).length;
  const unmaintainedCount = totalInSize - maintainedCount;
  const percentMaintained = totalInSize > 0 ? Math.round((maintainedCount / totalInSize) * 100) : 0;

  // 2. Filter berdasarkan status & search query
  const displayedUnits = useMemo(() => {
    return verticalUnitsForSize.filter((u) => {
      // Status filter
      if (statusFilter === 'MAINTAINED' && !u.is_maintained) return false;
      if (statusFilter === 'UNMAINTAINED' && u.is_maintained) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesNomor = u.nomor_daisha.toLowerCase().includes(query);
        const matchesSerial = String(u.serial_number).includes(query);
        return matchesNomor || matchesSerial;
      }
      return true;
    });
  }, [verticalUnitsForSize, statusFilter, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* 1. Header & Size Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Visual Grid Mapping Daisha Vertical
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                1 s.d {totalInSize || 200}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pantau status pemeliharaan tahun {currentYear} berdasarkan warna kotak nomor unit
            </p>
          </div>
        </div>

        {/* Tab Selector Ukuran Vertical */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedUkuran('SMALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedUkuran === 'SMALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Small (1-200)
          </button>
          <button
            type="button"
            onClick={() => setSelectedUkuran('MEDIUM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedUkuran === 'MEDIUM'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Medium (1-200)
          </button>
          <button
            type="button"
            onClick={() => setSelectedUkuran('LARGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedUkuran === 'LARGE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Large (1-200)
          </button>
        </div>
      </div>

      {/* 2. Controls & Legend Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua ({totalInSize})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('UNMAINTAINED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'UNMAINTAINED'
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Belum Maintenance ({unmaintainedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('MAINTAINED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'MAINTAINED'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sudah Maintenance ({maintainedCount})</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor daisha (contoh: 45 atau S-045)..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Visual Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600 flex items-center justify-center text-[10px] text-white font-bold font-mono">
              ✓
            </div>
            <span className="font-semibold text-emerald-800">
              Hijau = Sudah Maintenance / Repair Tahun {currentYear} ({maintainedCount} Unit - {percentMaintained}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-rose-500 border border-rose-600 flex items-center justify-center text-[10px] text-white font-bold font-mono">
              !
            </div>
            <span className="font-semibold text-rose-800">
              Merah = Belum Disentuh Tahun {currentYear} ({unmaintainedCount} Unit)
            </span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          💡 Klik kotak nomor untuk melihat detail riwayat atau mencatat servis
        </span>
      </div>

      {/* 4. The 200-Box Interactive Grid */}
      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
        {displayedUnits.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada unit yang cocok dengan filter atau pencarian &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-16 xl:grid-cols-20 gap-1.5">
            {displayedUnits.map((unit) => {
              const isDone = unit.is_maintained;
              const formattedDate = unit.last_maintenance_date
                ? new Date(unit.last_maintenance_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Belum ada';

              return (
                <div
                  key={unit.id}
                  onClick={() => onSelectUnit(unit)}
                  title={`${unit.nomor_daisha}: ${isDone ? `Sudah dimaintenance (${formattedDate})` : `Belum dimaintenance tahun ${currentYear}`}`}
                  className={`
                    relative group aspect-square rounded-md flex flex-col items-center justify-center p-0.5 cursor-pointer transition-all duration-200 select-none
                    ${
                      isDone
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-xs hover:scale-105 hover:z-10 ring-1 ring-emerald-600'
                        : 'bg-rose-500 hover:bg-rose-400 text-white shadow-xs hover:scale-105 hover:z-10 ring-1 ring-rose-600'
                    }
                  `}
                >
                  {/* Serial Number Display */}
                  <span className="text-[11px] font-mono font-bold leading-none tracking-tight">
                    {unit.serial_number || unit.nomor_daisha}
                  </span>

                  {/* Micro Indicator dot */}
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isDone ? 'bg-white/90' : 'bg-white/50'}`} />

                  {/* Hover Floating Mini Card */}
                  <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                    <div className="bg-slate-950 text-white text-[10px] py-1 px-2 rounded-md shadow-2xl whitespace-nowrap border border-slate-700 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <span>{unit.nomor_daisha}</span>
                        <span className={`text-[9px] px-1 rounded ${isDone ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'}`}>
                          {isDone ? 'Sudah' : 'Belum'}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[9px]">
                        Tgl: {formattedDate}
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-slate-950 rotate-45 -mt-0.5 border-r border-b border-slate-700" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
