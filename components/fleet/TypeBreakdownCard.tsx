'use client';

import React, { useState } from 'react';
import { DaishaTypeFleetSummary } from '@/hooks/useFleetAnalytics';
import { Layers, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

interface TypeBreakdownCardProps {
  typeSummaries: DaishaTypeFleetSummary[];
  selectedType: string;
  onSelectType: (typeName: string) => void;
}

export default function TypeBreakdownCard({
  typeSummaries,
  selectedType,
  onSelectType,
}: TypeBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTypes = typeSummaries.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.seksi.toLowerCase().includes(q) ||
      (t.codePrefix && t.codePrefix.toLowerCase().includes(q))
    );
  });

  const displayedTypes = isExpanded || search.trim() ? filteredTypes : filteredTypes.slice(0, 9);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Distribusi Kuantitas per Jenis Daisha ({typeSummaries.length} Tipe Terdaftar)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rincian jumlah unit fisik, kode prefix, varian (S/M/L, susunan), dan status pemeliharaan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari jenis daisha..."
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 text-slate-800 placeholder-slate-400"
            />
          </div>

          {selectedType && (
            <button
              type="button"
              onClick={() => onSelectType('')}
              className="h-8 px-2.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <span>Varian: <b>{selectedType}</b></span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedTypes.map((item) => {
            const isSelected = selectedType.toUpperCase() === item.name.toUpperCase();

            return (
              <div
                key={item.id}
                onClick={() => onSelectType(isSelected ? '' : item.name)}
                className={`
                  p-4 rounded-lg border transition cursor-pointer flex flex-col justify-between
                  ${
                    isSelected
                      ? 'bg-red-50/20 border-[#E60012] ring-1 ring-[#E60012]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.codePrefix && (
                          <span className="text-xs font-bold font-mono text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                            {item.codePrefix}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-500">
                          Seksi {item.seksi}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                        {item.name}
                      </h3>

                      {item.rangeLabel && item.rangeLabel !== '-' && (
                        <p className="text-xs text-slate-600 font-mono mt-1">
                          Nomor: <span className="font-semibold text-slate-800">{item.rangeLabel}</span>
                        </p>
                      )}

                      {/* Rincian Varian (S/M/L, Susun, dsb) */}
                      {item.hasVariants && item.variants && item.variants.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.variants.map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200"
                            >
                              <span>{v.name}:</span>
                              <strong className="font-mono">{v.totalUnits}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                      <span className="text-xl font-extrabold text-slate-900 block leading-tight font-mono">
                        {item.registeredUnits.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Fisik</span>
                    </div>
                  </div>
                </div>

                {/* Status Maintenance */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-800 font-medium">
                      Aman: <strong className="font-mono">{item.healthyCount}</strong>
                    </span>
                    {item.dueSoonCount > 0 && (
                      <span className="text-amber-800 font-medium">
                        Mendekati: <strong className="font-mono">{item.dueSoonCount}</strong>
                      </span>
                    )}
                    {item.overdueCount > 0 && (
                      <span className="text-rose-800 font-bold">
                        Overdue: <strong className="font-mono">{item.overdueCount}</strong>
                      </span>
                    )}
                  </div>

                  <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#E60012]' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Terpilih' : 'Filter →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {!search.trim() && typeSummaries.length > 9 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition cursor-pointer"
            >
              <span>
                {isExpanded
                  ? 'Tampilkan Lebih Sedikit'
                  : `Tampilkan Semua (${typeSummaries.length} Tipe Daisha)`}
              </span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
