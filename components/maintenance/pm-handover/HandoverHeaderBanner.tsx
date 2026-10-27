'use client';

import React from 'react';
import { Truck } from 'lucide-react';

interface HandoverHeaderBannerProps {
  seksi: string;
  totalUnits: number;
  dueCount: number;
  stagedTodayCount: number;
}

export default function HandoverHeaderBanner({
  seksi,
  totalUnits,
  dueCount,
  stagedTodayCount,
}: HandoverHeaderBannerProps) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/90 space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Pusat Kesiapan PM Daisha: Seksi {seksi}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Siapkan unit armada di area penjemputan produksi secara fleksibel,
              catat nomor daisha yang siap dijemput, lalu kirimkan pemberitahuan ke
              bengkel Workshop.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="p-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            Populasi:{' '}
            <span className="font-bold text-slate-900">{totalUnits} Unit</span>
          </span>
          <span className="p-1.5 px-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
            Belum PM:{' '}
            <span className="font-bold text-rose-900">{dueCount} Unit</span>
          </span>
          <span className="p-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            Di Staging:{' '}
            <span className="font-bold text-amber-900">
              {stagedTodayCount} Unit
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
