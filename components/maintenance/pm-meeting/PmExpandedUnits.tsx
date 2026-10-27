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
      <td colSpan={11} className="p-0 bg-slate-50 border-y border-slate-200">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Mapping Unit Fisik: {item.nama}</span>
                <span className="text-xs font-normal text-slate-500">
                  ({item.units.length} total unit di pabrik)
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Status kesiapan fisik (OK/Rusak) dan kepatuhan PM tahun {currentYear} untuk setiap nomor armada
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Status Unit */}
              <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-white text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setUnitStatusFilter('all')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    unitStatusFilter === 'unmaintained'
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Belum PM ({item.unmaintained})
                </button>
                <button
                  type="button"
                  onClick={() => setUnitStatusFilter('maintained')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    unitStatusFilter === 'maintained'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Sudah PM ({item.maintained})
                </button>
                {item.rusakCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUnitStatusFilter('rusak')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      unitStatusFilter === 'rusak'
                        ? 'bg-rose-800 text-white font-semibold'
                        : 'text-rose-800 font-bold hover:bg-rose-50'
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
                className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md w-40 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          {/* Grid Unit Kartu */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto pr-1">
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
                    className={`p-2.5 rounded-lg border text-left transition ${
                      isDamaged
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                        : isDone
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 tracking-tight">
                        {u.nomor_daisha}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isDamaged
                            ? 'bg-rose-600'
                            : isDone
                            ? 'bg-emerald-500'
                            : 'bg-amber-400'
                        }`}
                      />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate">{u.seksi || 'Pabrik'}</span>
                      <span
                        className={`font-semibold ${
                          isDamaged ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {isDamaged ? 'RUSAK' : 'OK'}
                      </span>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span
                        className={
                          isDone
                            ? 'text-emerald-700 font-semibold'
                            : 'text-slate-500 font-medium'
                        }
                      >
                        {isDone ? 'Sudah PM' : 'Belum PM'}
                      </span>
                      {dateStr && <span className="text-slate-400">{dateStr}</span>}
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
