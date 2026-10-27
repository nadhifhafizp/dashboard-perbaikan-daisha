'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { StagedLocationGroup } from './types';

interface HandoverActiveLocationsProps {
  stagedByLocation: StagedLocationGroup[];
  totalStagedUnitsCount: number;
}

export default function HandoverActiveLocations({
  stagedByLocation,
  totalStagedUnitsCount,
}: HandoverActiveLocationsProps) {
  if (stagedByLocation.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-red-600" />
          <span>
            Titik Penjemputan Aktif ({stagedByLocation.length} Lokasi Staging):
          </span>
        </span>
        <span className="text-xs font-semibold text-amber-800">
          {totalStagedUnitsCount} Unit Menunggu Diambil Workshop
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {stagedByLocation.map((st, i) => (
          <div
            key={i}
            className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5 text-xs"
          >
            <div className="flex items-start justify-between gap-1">
              <p className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{st.lokasi}</span>
              </p>
              <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                {st.units.length} Unit
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {st.units.map((u) => (
                <span
                  key={u}
                  className="px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300"
                >
                  {u}
                </span>
              ))}
            </div>
            {st.catatan && (
              <p className="text-xs text-slate-500 italic truncate">
                &quot;{st.catatan}&quot;
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
