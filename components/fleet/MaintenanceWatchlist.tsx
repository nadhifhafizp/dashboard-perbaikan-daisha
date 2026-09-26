'use client';

import React from 'react';
import { FleetUnitItem } from '@/hooks/useFleetAnalytics';
import { AlertTriangle, Clock, ArrowRight, Wrench, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface MaintenanceWatchlistProps {
  urgentUnits: FleetUnitItem[];
  onViewAllNeedService: () => void;
  onSelectUnit: (unit: FleetUnitItem) => void;
}

export default function MaintenanceWatchlist({
  urgentUnits,
  onViewAllNeedService,
  onSelectUnit,
}: MaintenanceWatchlistProps) {
  if (urgentUnits.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-emerald-200/80 p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Semua Jadwal Servis Terkendali
            </h3>
            <p className="text-[11px] text-slate-500">
              Tidak ada daisha yang melewati batas waktu pemeliharaan bulanan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ambil maksimal 4 unit paling mendesak untuk quick-action
  const priorityList = urgentUnits.slice(0, 4);

  return (
    <div className="bg-white rounded-lg border border-rose-200 shadow-2xs p-4 space-y-3">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-rose-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Prioritas Penarikan Servis
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {urgentUnits.length} Unit Perlu Ditarik
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Unit telah melampaui siklus 30 hari atau mendekati jatuh tempo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAllNeedService}
          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
        >
          <span>Buka semua di tabel</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid Quick Cards Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {priorityList.map((unit) => {
          const isOverdue = unit.daysUntilDue !== null && unit.daysUntilDue < 0;
          const daysText = isOverdue
            ? `Terlewat ${Math.abs(unit.daysUntilDue!)} hari`
            : unit.daysUntilDue === 0
            ? 'Hari ini'
            : `Sisa ${unit.daysUntilDue} hari`;

          return (
            <div
              key={unit.noDaisha}
              className="p-3 rounded-lg border border-slate-200 hover:border-rose-300 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectUnit(unit)}
                    className="font-mono font-bold text-sm text-slate-900 hover:text-rose-600 transition text-left cursor-pointer"
                  >
                    {unit.noDaisha}
                  </button>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {unit.namaDaisha}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                  {unit.seksi}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                <span
                  className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                    isOverdue ? 'text-rose-700' : 'text-amber-700'
                  }`}
                >
                  {isOverdue ? (
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                  ) : (
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                  )}
                  <span>{daysText}</span>
                </span>

                <Link
                  href={`/input?noDaisha=${encodeURIComponent(unit.noDaisha)}&seksi=${encodeURIComponent(
                    unit.seksi
                  )}&namaDaisha=${encodeURIComponent(unit.namaDaisha)}`}
                  className="h-6 px-2 text-[11px] font-bold bg-[#E60012] hover:bg-[#CC0010] text-white rounded transition inline-flex items-center gap-1 shadow-2xs"
                  title="Tarik unit ini ke bengkel"
                >
                  <Wrench className="w-2.5 h-2.5" />
                  <span>Tarik</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
