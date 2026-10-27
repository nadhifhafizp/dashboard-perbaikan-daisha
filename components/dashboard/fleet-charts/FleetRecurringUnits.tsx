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
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <div>
            <h4 className="t-section text-slate-900">Unit Paling Sering Servis</h4>
            <p className="t-caption text-slate-500">
              Armada dengan frekuensi perbaikan berulang tertinggi
            </p>
          </div>
        </div>
        <span className="h-6 px-2.5 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center">
          {recurringUnitsCount} Unit Berulang
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
        {topRecurringUnits.slice(0, 5).map((u, idx) => (
          <div
            key={u.noDaisha}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                #{idx + 1}
              </span>
              <span className="h-6 px-2 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center">
                {u.repairCount}x Masuk
              </span>
            </div>

            <div>
              <div className="font-bold text-slate-900 truncate">{u.noDaisha}</div>
              <span className="text-xs text-slate-500 block truncate">{u.namaDaisha}</span>
              <span className="text-xs text-slate-400 block truncate">Seksi: {u.seksi}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Status:</span>
              {u.activeInWorkshop ? (
                <span className="h-6 px-2 rounded-full text-xs font-semibold bg-red-100 text-red-700 inline-flex items-center">
                  Di Bengkel
                </span>
              ) : (
                <span className="h-6 px-2 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 inline-flex items-center">
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
