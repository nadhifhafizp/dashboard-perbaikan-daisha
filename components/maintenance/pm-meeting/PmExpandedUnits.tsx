'use client';

import React from 'react';
import { UnifiedMatrixItem } from '@/lib/pmAnalytics';

interface PmExpandedUnitsProps {
  item: UnifiedMatrixItem;
  currentYear: number;
  unitStatusFilter: 'all' | 'unmaintained' | 'maintained' | 'rusak';
  setUnitStatusFilter: (filter: 'all' | 'unmaintained' | 'maintained' | 'rusak') => void;
  unitSearch: string;
  setUnitSearch: (search: string) => void;
}

export default function PmExpandedUnits({
  item,
  currentYear,
  unitStatusFilter,
  setUnitStatusFilter,
  unitSearch,
  setUnitSearch,
}: PmExpandedUnitsProps) {
  const filteredUnits = item.units.filter((u) => {
    if (unitStatusFilter === 'maintained' && !u.is_maintained) return false;
    if (unitStatusFilter === 'unmaintained' && u.is_maintained) return false;
    if (unitStatusFilter === 'rusak' && (u.last_condition || 'OK') !== 'RUSAK') return false;
    if (unitSearch.trim()) {
      const q = unitSearch.toLowerCase();
      const matchNo = u.nomor_daisha.toLowerCase().includes(q);
      const matchSeksi = (u.seksi || '').toLowerCase().includes(q);
      const matchJenis = (u.jenis || '').toLowerCase().includes(q);
      return matchNo || matchSeksi || matchJenis;
    }
    return true;
  });

  return (
    <tr>
      <td colSpan={7} className="p-0 bg-slate-50/60 border-y border-slate-200">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Rincian Unit: {item.nama}</span>
                <span className="font-normal text-slate-500">
                  ({item.units.length} total unit di pabrik)
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Nomor armada, seksi operasional, status fisik, dan waktu pemeliharaan tahun {currentYear}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Status Unit Segmented */}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setUnitStatusFilter('all')}
                  className={`h-7 px-2.5 rounded-md transition cursor-pointer ${
                    unitStatusFilter === 'all'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({item.units.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUnitStatusFilter('unmaintained')}
                  className={`h-7 px-2.5 rounded-md transition cursor-pointer ${
                    unitStatusFilter === 'unmaintained'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum PM ({item.unmaintained})
                </button>
                <button
                  type="button"
                  onClick={() => setUnitStatusFilter('maintained')}
                  className={`h-7 px-2.5 rounded-md transition cursor-pointer ${
                    unitStatusFilter === 'maintained'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah PM ({item.maintained})
                </button>
                {item.rusakCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUnitStatusFilter('rusak')}
                    className={`h-7 px-2.5 rounded-md transition cursor-pointer ${
                      unitStatusFilter === 'rusak'
                        ? 'bg-rose-700 text-white font-semibold'
                        : 'text-rose-700 font-medium hover:bg-rose-50'
                    }`}
                  >
                    Rusak ({item.rusakCount})
                  </button>
                )}
              </div>

              {/* Cari Unit */}
              <input
                type="text"
                placeholder="Cari No. Unit / Seksi..."
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="h-8 px-2.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-md w-44 focus:outline-hidden focus:border-red-600 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Grid Unit Kartu Precision */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
            {filteredUnits.length === 0 ? (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                Tidak ada unit yang cocok dengan kriteria filter.
              </div>
            ) : (
              filteredUnits.map((u) => {
                const isDone = u.is_maintained;
                const isDamaged = (u.last_condition || 'OK') === 'RUSAK';
                const dateStr = u.last_maintenance_date
                  ? new Date(u.last_maintenance_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : null;

                return (
                  <div
                    key={u.id || u.nomor_daisha}
                    className={`p-2.5 rounded-lg border text-left bg-white transition ${
                      isDamaged
                        ? 'border-rose-300'
                        : isDone
                        ? 'border-slate-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-slate-900 tracking-tight font-mono">
                        {u.nomor_daisha}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDamaged
                            ? 'bg-rose-600'
                            : isDone
                            ? 'bg-emerald-600'
                            : 'bg-amber-400'
                        }`}
                        title={isDamaged ? 'Rusak' : isDone ? 'Sudah PM' : 'Belum PM'}
                      />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">{u.seksi || 'Pabrik'}</span>
                      <span
                        className={`font-medium ${
                          isDamaged ? 'text-rose-700' : 'text-slate-600'
                        }`}
                      >
                        {isDamaged ? 'RUSAK' : 'OK'}
                      </span>
                    </div>

                    <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span
                        className={
                          isDone
                            ? 'text-emerald-700 font-medium'
                            : 'text-slate-400'
                        }
                      >
                        {isDone ? 'Sudah PM' : 'Belum PM'}
                      </span>
                      {dateStr ? (
                        <span className="text-slate-400 tabular-nums">{dateStr}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
