'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { GridDaishaUnit } from './VerticalGridMapping';

interface NagaraFilterListProps {
  units: GridDaishaUnit[];
  currentYear: number;
  onSelectUnit: (unit: GridDaishaUnit) => void;
  onQuickMaintenance: (unit: GridDaishaUnit) => void;
}

export default function NagaraFilterList({
  units,
  currentYear,
  onSelectUnit,
  onQuickMaintenance,
}: NagaraFilterListProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MAINTAINED' | 'UNMAINTAINED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const nagaraUnits = useMemo(() => {
    return units
      .filter((u) => u.jenis === 'NAGARA_FILTER')
      .sort((a, b) => a.serial_number - b.serial_number);
  }, [units]);

  const totalNagara = nagaraUnits.length;
  const maintainedCount = nagaraUnits.filter((u) => u.is_maintained).length;
  const unmaintainedCount = totalNagara - maintainedCount;
  const percentage = totalNagara > 0 ? Math.round((maintainedCount / totalNagara) * 100) : 0;

  const filteredList = useMemo(() => {
    return nagaraUnits.filter((u) => {
      if (statusFilter === 'MAINTAINED' && !u.is_maintained) return false;
      if (statusFilter === 'UNMAINTAINED' && u.is_maintained) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return u.nomor_daisha.toLowerCase().includes(q) || String(u.serial_number).includes(q);
      }
      return true;
    });
  }, [nagaraUnits, statusFilter, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Pemantauan Daisha Nagara Filter
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                1 Varian ({totalNagara} Unit)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sesuai spesifikasi PRD: Nagara Filter tidak menggunakan mapping visual grid, namun tetap masuk perhitungan target tahunan
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 font-mono">
              {maintainedCount} / {totalNagara} Selesai ({percentage}%)
            </div>
            <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua ({totalNagara})
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
            <span>Belum ({unmaintainedCount})</span>
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
            <span>Sudah ({maintainedCount})</span>
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor daisha..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Grid Cards of Nagara Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredList.map((unit) => {
          const isDone = unit.is_maintained;
          const formattedDate = unit.last_maintenance_date
            ? new Date(unit.last_maintenance_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '-';

          return (
            <div
              key={unit.id}
              className={`p-3 rounded-lg border transition flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                  : 'bg-red-50/50 border-red-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {unit.nomor_daisha}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Sudah Maintenance
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      Belum Maintenance
                    </>
                  )}
                </span>
              </div>

              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengerjaan Terakhir:</span>
                  <span className="font-medium text-slate-800">{formattedDate}</span>
                </div>
                {unit.days_since_last !== null && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Durasi:</span>
                    <span className="text-slate-600">{unit.days_since_last} hari lalu</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectUnit(unit)}
                  className="flex-1 py-1 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
                >
                  Detail
                </button>
                <button
                  type="button"
                  onClick={() => onQuickMaintenance(unit)}
                  className="flex-1 py-1 text-center text-xs font-bold text-white bg-slate-900 hover:bg-black rounded transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Wrench className="w-3 h-3" />
                  <span>+ Servis</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
