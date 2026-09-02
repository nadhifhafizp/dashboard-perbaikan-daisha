'use client';

import React, { useMemo } from 'react';
import { Ticket } from '@/types/ticket';

interface SeksiCardSelectorProps {
  selectedSeksi: string; // '' jika semua seksi
  onSelectSeksi: (seksi: string) => void;
  tickets: Ticket[];
}

interface SeksiMeta {
  name: string;
  label: string;
  icon: string;
  desc: string;
}

const SEKSI_METAS: SeksiMeta[] = [
  { name: '', label: 'Semua Seksi', icon: '🏢', desc: 'Seluruh Plant' },
  { name: 'Bead', label: 'Bead', icon: '⭕', desc: 'Bead Wire & Ring' },
  { name: 'Building', label: 'Building', icon: '🏗️', desc: 'Tire Assembly' },
  { name: 'Bunbury', label: 'Bunbury', icon: '🧪', desc: 'Mixing & Compound' },
  { name: 'Cutt/Cal', label: 'Cutt/Cal', icon: '✂️', desc: 'Cutting & Calendar' },
  { name: 'Extruding', label: 'Extruding', icon: '🏭', desc: 'Tread & Sidewall' },
  { name: 'Polyfilm', label: 'Polyfilm', icon: '🎞️', desc: 'Lining & Film' },
];

export default function SeksiCardSelector({
  selectedSeksi,
  onSelectSeksi,
  tickets,
}: SeksiCardSelectorProps) {
  // Hitung jumlah tiket per seksi secara dinamis
  const seksiCounts = useMemo(() => {
    const counts: Record<
      string,
      { total: number; open: number; progress: number; done: number }
    > = {};

    // Inisialisasi
    SEKSI_METAS.forEach((m) => {
      counts[m.name] = { total: 0, open: 0, progress: 0, done: 0 };
    });

    tickets.forEach((t) => {
      // Hitung untuk Semua Seksi ('')
      if (counts['']) {
        counts[''].total += 1;
        if (t.status === 'Open') counts[''].open += 1;
        if (t.status === 'Progress') counts[''].progress += 1;
        if (t.status === 'Done') counts[''].done += 1;
      }

      // Hitung per seksi spesifik
      const s = t.seksi;
      if (counts[s]) {
        counts[s].total += 1;
        if (t.status === 'Open') counts[s].open += 1;
        if (t.status === 'Progress') counts[s].progress += 1;
        if (t.status === 'Done') counts[s].done += 1;
      }
    });

    return counts;
  }, [tickets]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>🏢</span> Filter Berdasarkan Seksi Plant
        </span>
        {selectedSeksi && (
          <button
            type="button"
            onClick={() => onSelectSeksi('')}
            className="text-[11px] font-bold text-red-600 hover:text-red-800 cursor-pointer transition"
          >
            ✕ Reset (Tampilkan Semua)
          </button>
        )}
      </div>

      {/* Grid Card Seksi Responsif */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {SEKSI_METAS.map((seksi) => {
          const isSelected = selectedSeksi === seksi.name;
          const stat = seksiCounts[seksi.name] || {
            total: 0,
            open: 0,
            progress: 0,
            done: 0,
          };
          const hasActiveIssue = stat.open > 0 || stat.progress > 0;

          return (
            <div
              key={seksi.name || 'all'}
              onClick={() => onSelectSeksi(seksi.name)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between select-none group ${
                isSelected
                  ? 'bg-red-50/90 border-red-500 shadow-md ring-2 ring-red-400 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Card: Icon & Active Dot */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{seksi.icon}</span>
                  {hasActiveIssue && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                      title="Ada unit sedang antre atau dikerjakan"
                    />
                  )}
                </div>

                {/* Nama Seksi */}
                <h4
                  className={`text-xs font-black leading-tight ${
                    isSelected
                      ? 'text-red-800'
                      : 'text-slate-800 group-hover:text-red-700'
                  }`}
                >
                  {seksi.label}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {seksi.desc}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-900">
                  {stat.total}{' '}
                  <span className="text-[9px] font-medium text-slate-400">Unit</span>
                </span>

                {stat.open > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-black text-[9px]">
                    {stat.open} Antre
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
