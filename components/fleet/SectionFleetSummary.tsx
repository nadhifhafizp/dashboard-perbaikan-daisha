'use client';

import React from 'react';
import { SectionFleetSummary } from '@/hooks/useFleetAnalytics';
import { SECTION_METAS } from '@/lib/daishaVariants';
import { Factory, ArrowRight, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';

interface SectionFleetSummaryProps {
  sectionSummaries: SectionFleetSummary[];
  selectedSeksi: string;
  onSelectSeksi: (seksi: string) => void;
}

export default function SectionFleetSummaryCards({
  sectionSummaries,
  selectedSeksi,
  onSelectSeksi,
}: SectionFleetSummaryProps) {
  // Border color top stripe berdasarkan warna seksi resmi
  const SECTION_TOP_ACCENTS: Record<string, string> = {
    'Bead': 'bg-amber-400',
    'Banbury': 'bg-emerald-500',
    'Cutt/Cal': 'bg-cyan-500',
    'Extruding': 'bg-stone-500',
    'Building': 'bg-red-600',
    'Poly Film': 'bg-slate-400',
    'All seksi': 'bg-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header Seksi & Filter Active Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-slate-700 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Populasi Fisik Daisha per Seksi Pabrik
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesuai dokumen registri master fisik pabrik. Klik kartu seksi untuk menyaring unit di tabel.
          </p>
        </div>

        {selectedSeksi && (
          <button
            type="button"
            onClick={() => onSelectSeksi('')}
            className="self-start sm:self-auto h-8 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Seksi Terpilih: <b>{selectedSeksi}</b></span>
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Grid 7 Seksi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sectionSummaries.map((item) => {
          const isSelected = selectedSeksi.toUpperCase() === item.seksi.toUpperCase();
          const meta = SECTION_METAS[item.seksi] || {
            colorName: 'Lainnya',
            badgeBg: 'bg-slate-100',
            textColor: 'text-slate-800',
            borderColor: 'border-slate-300',
          };
          const topAccent = SECTION_TOP_ACCENTS[item.seksi] || 'bg-slate-300';

          return (
            <div
              key={item.seksi}
              onClick={() => onSelectSeksi(isSelected ? '' : item.seksi)}
              className={`
                relative overflow-hidden rounded-lg border transition cursor-pointer flex flex-col justify-between p-4
                ${
                  isSelected
                    ? 'border-[#E60012] bg-red-50/20 ring-1 ring-[#E60012]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }
              `}
            >
              {/* Top Accent Strip 3px */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${topAccent}`} />

              <div className="space-y-3">
                {/* Header: Nama Seksi & Total Unit */}
                <div className="flex items-start justify-between gap-2 pt-0.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        Seksi {item.seksi}
                      </h3>
                      <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded text-slate-600 bg-slate-100 border border-slate-200">
                        {meta.colorName.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {item.typeCount} Tipe Daisha
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-slate-900 block leading-none font-mono tracking-tight">
                      {item.totalUnits.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Unit Fisik
                    </span>
                  </div>
                </div>

                {/* Model / Jenis Daisha dalam Seksi */}
                <div className="text-xs text-slate-700 leading-relaxed line-clamp-2 bg-slate-50 p-2.5 rounded border border-slate-100 font-normal">
                  {item.types.length > 0 ? item.types.join(' · ') : 'Belum ada model terdaftar'}
                </div>

                {/* Status Maintenance Unit */}
                <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-emerald-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Aman: <strong className="font-mono">{item.healthyCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Mendekati: <strong className="font-mono">{item.dueSoonCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>Overdue: <strong className="font-mono">{item.overdueCount}</strong></span>
                  </div>
                </div>
              </div>

              {/* Status Seleksi */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className={isSelected ? 'text-[#E60012] font-bold' : 'text-slate-500'}>
                  {isSelected ? '✓ Filter Aktif' : 'Klik untuk menyaring'}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#E60012] translate-x-0.5' : 'text-slate-400'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
