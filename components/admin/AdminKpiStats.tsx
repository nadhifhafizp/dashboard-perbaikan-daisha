'use client';

import React from 'react';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AdminKpiStatsProps {
  countStats: {
    all: number;
    open: number;
    done: number;
    scrap: number;
  };
  filterTab: 'all' | 'Open' | 'Progress' | 'Done' | 'Scrap';
  setFilterTab: (tab: 'all' | 'Open' | 'Progress' | 'Done' | 'Scrap') => void;
}

export default function AdminKpiStats({
  countStats,
  filterTab,
  setFilterTab,
}: AdminKpiStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Total Tiket */}
      <button
        type="button"
        onClick={() => setFilterTab('all')}
        className={`rounded-xl border p-3.5 text-left transition-all flex flex-col justify-between cursor-pointer ${
          filterTab === 'all'
            ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600 shadow-2xs'
            : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex justify-between items-center mb-1 w-full">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              filterTab === 'all' ? 'text-red-700' : 'text-slate-600'
            }`}
          >
            Total Tiket
          </span>
          <div
            className={`p-1.5 rounded-lg ${
              filterTab === 'all' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums text-slate-900 mt-0.5">
          {countStats.all}
        </div>
        <div className="text-[11px] font-normal text-slate-500 mt-0.5">Semua Tiket Masuk</div>
      </button>

      {/* 2. Open / Sedang Dikerjakan */}
      <button
        type="button"
        onClick={() => setFilterTab('Open')}
        className={`rounded-xl border p-3.5 text-left transition-all flex flex-col justify-between cursor-pointer ${
          filterTab === 'Open'
            ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 shadow-2xs'
            : 'border-amber-200/70 bg-amber-50/20 hover:bg-amber-50/40 shadow-2xs'
        }`}
      >
        <div className="flex justify-between items-center mb-1 w-full">
          <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
            Open / Dikerjakan
          </span>
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums text-amber-700 mt-0.5">
          {countStats.open}
        </div>
        <div className="text-[11px] font-normal text-amber-800/80 mt-0.5">
          Antre & Sedang Diproses
        </div>
      </button>

      {/* 3. Selesai (Done) */}
      <button
        type="button"
        onClick={() => setFilterTab('Done')}
        className={`rounded-xl border p-3.5 text-left transition-all flex flex-col justify-between cursor-pointer ${
          filterTab === 'Done'
            ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-2xs'
            : 'border-emerald-200/70 bg-emerald-50/20 hover:bg-emerald-50/40 shadow-2xs'
        }`}
      >
        <div className="flex justify-between items-center mb-1 w-full">
          <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
            Selesai (Done)
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums text-emerald-700 mt-0.5">
          {countStats.done}
        </div>
        <div className="text-[11px] font-normal text-emerald-800/80 mt-0.5">
          Rate: {countStats.all > 0 ? Math.round((countStats.done / countStats.all) * 100) : 0}%
        </div>
      </button>

      {/* 4. Rusak / Afkir (Scrap) */}
      <button
        type="button"
        onClick={() => setFilterTab('Scrap')}
        className={`rounded-xl border p-3.5 text-left transition-all flex flex-col justify-between cursor-pointer ${
          filterTab === 'Scrap'
            ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-600 shadow-2xs'
            : 'border-rose-200/70 bg-rose-50/20 hover:bg-rose-50/40 shadow-2xs'
        }`}
      >
        <div className="flex justify-between items-center mb-1 w-full">
          <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider">
            Rusak (Scrap)
          </span>
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums text-rose-700 mt-0.5">
          {countStats.scrap}
        </div>
        <div className="text-[11px] font-normal text-rose-800/80 mt-0.5">
          Rate: {countStats.all > 0 ? Math.round((countStats.scrap / countStats.all) * 100) : 0}%
        </div>
      </button>
    </div>
  );
}
