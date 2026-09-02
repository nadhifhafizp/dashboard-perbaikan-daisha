'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Ticket } from '@/types/ticket';

interface SeksiDropdownSelectorProps {
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

export default function SeksiDropdownSelector({
  selectedSeksi,
  onSelectSeksi,
  tickets,
}: SeksiDropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Hitung jumlah tiket per seksi secara dinamis
  const seksiCounts = useMemo(() => {
    const counts: Record<
      string,
      { total: number; open: number; progress: number; done: number }
    > = {};

    SEKSI_METAS.forEach((m) => {
      counts[m.name] = { total: 0, open: 0, progress: 0, done: 0 };
    });

    tickets.forEach((t) => {
      if (counts['']) {
        counts[''].total += 1;
        if (t.status === 'Open') counts[''].open += 1;
        if (t.status === 'Progress') counts[''].progress += 1;
        if (t.status === 'Done') counts[''].done += 1;
      }

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

  const activeMeta =
    SEKSI_METAS.find((m) => m.name.toLowerCase() === selectedSeksi.toLowerCase()) ||
    SEKSI_METAS[0];

  const activeCount = seksiCounts[activeMeta.name] || { total: 0, open: 0 };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button Compact */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-auto min-w-[220px] px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-between gap-2.5 shadow-xs cursor-pointer select-none ${
          selectedSeksi
            ? 'bg-red-50/90 border-red-300 text-red-900 ring-2 ring-red-400/50'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-base">{activeMeta.icon}</span>
          <div className="text-left truncate">
            <span className="block font-black truncate leading-tight">
              {activeMeta.label}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              {activeCount.total} Unit{' '}
              {activeCount.open > 0 && `• ${activeCount.open} Antre`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {activeCount.open > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
          <span className="text-[10px] transform transition-transform duration-200">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-0 sm:right-auto mt-1.5 w-full sm:w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-scale-up">
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Pilih Seksi Plant
            </span>
            {selectedSeksi && (
              <button
                type="button"
                onClick={() => {
                  onSelectSeksi('');
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="p-1.5 max-h-72 overflow-y-auto space-y-1">
            {SEKSI_METAS.map((seksi) => {
              const isSelected = selectedSeksi.toLowerCase() === seksi.name.toLowerCase();
              const stat = seksiCounts[seksi.name] || { total: 0, open: 0 };

              return (
                <button
                  key={seksi.name || 'all'}
                  type="button"
                  onClick={() => {
                    onSelectSeksi(seksi.name);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{seksi.icon}</span>
                    <div className="truncate">
                      <div className="font-black truncate">{seksi.label}</div>
                      <div
                        className={`text-[10px] font-medium truncate ${
                          isSelected ? 'text-red-100' : 'text-slate-400'
                        }`}
                      >
                        {seksi.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {stat.total}
                    </span>
                    {stat.open > 0 && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stat.open} Antre
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
