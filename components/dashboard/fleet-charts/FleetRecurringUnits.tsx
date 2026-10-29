'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { RecurringUnitItem } from './types';

interface FleetRecurringUnitsProps {
  recurringUnitsCount: number;
  topRecurringUnits: RecurringUnitItem[];
}

export default function FleetRecurringUnits({
  recurringUnitsCount,
  topRecurringUnits,
}: FleetRecurringUnitsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-5 h-5 text-amber-600" />
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">Unit Paling Sering Servis</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Armada dengan frekuensi perbaikan berulang tertinggi
            </p>
          </div>
        </div>
        <span className="h-7 px-3 text-xs sm:text-sm font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center">
          {recurringUnitsCount} Unit Berulang
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4">
        {topRecurringUnits.slice(0, 5).map((u, idx) => (
          <div
            key={u.noDaisha}
            className="p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2.5 hover:border-amber-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-black flex items-center justify-center text-xs">
                #{idx + 1}
              </span>
              <span className="h-6 px-2.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center">
                {u.repairCount}x Masuk
              </span>
            </div>

            <div>
              <div className="font-black text-slate-900 text-sm sm:text-base truncate">{u.noDaisha}</div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 block truncate mt-0.5">{u.namaDaisha}</span>
              <span className="text-xs text-slate-500 font-medium block truncate">Seksi: {u.seksi}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-slate-500">Status:</span>
              {u.activeInWorkshop ? (
                <span className="h-6 px-2.5 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200 inline-flex items-center">
                  Di Bengkel
                </span>
              ) : (
                <span className="h-6 px-2.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center">
                  Selesai
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
