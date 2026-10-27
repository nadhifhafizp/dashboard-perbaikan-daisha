'use client';

import React from 'react';
import { Boxes, Target, Check, Zap } from 'lucide-react';
import { ColorCodedVariantGroup } from './types';

interface HandoverVisualGridProps {
  showVisualGrid: boolean;
  setShowVisualGrid: (show: boolean) => void;
  selectedUnits: string[];
  variantGroups: ColorCodedVariantGroup[];
  expandedCards: Record<string, boolean>;
  setExpandedCards: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSelectVariant: (group: ColorCodedVariantGroup, count?: number) => void;
  onToggleUnit: (noDaisha: string) => void;
}

export default function HandoverVisualGrid({
  showVisualGrid,
  setShowVisualGrid,
  selectedUnits,
  variantGroups,
  expandedCards,
  setExpandedCards,
  onSelectVariant,
  onToggleUnit,
}: HandoverVisualGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Pemetaan Visual Armada per Varian (Opsional / Drill-down)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Warna chip: <span className="text-rose-600 font-bold">Merah</span> = Belum
            PM • <span className="text-amber-600 font-bold">Kuning</span> = Di Staging
            • <span className="text-emerald-600 font-bold">Hijau</span> = Selesai PM.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedUnits.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
              {selectedUnits.length} Daisha Dipilih
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowVisualGrid(!showVisualGrid)}
            className="h-10 px-3.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5 text-slate-500" />
            <span>{showVisualGrid ? 'Tutup Grid' : 'Buka Grid'}</span>
          </button>
        </div>
      </div>

      {showVisualGrid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {variantGroups.map((g) => {
            const allDueSelected =
              g.dueUnits.length > 0 &&
              g.dueUnits.every((u) =>
                selectedUnits.includes(u.nomor_daisha.toUpperCase())
              );
            const isExpanded = Boolean(expandedCards[g.key]);
            const visibleDueUnits = isExpanded
              ? g.dueUnits
              : g.dueUnits.slice(0, 12);
            const remainingCount = g.dueUnits.length - 12;

            return (
              <div
                key={g.key}
                className="p-4 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300/80 transition flex flex-col justify-between gap-3"
              >
                {/* Header Varian & Counter */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {g.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {g.ukuran !== 'Standar' ? `Ukuran: ${g.ukuran}` : 'Standar'}
                        {g.prefix && ` • Prefix: ${g.prefix}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {g.totalUnits} Unit
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-mono">
                        <Target className="w-2.5 h-2.5 text-amber-600" />
                        <span>{g.dailyTarget} / Hari</span>
                      </span>
                    </div>
                  </div>

                  {/* Stacked 3-Color Indicator Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 transition-[width] duration-300"
                        style={{ width: `${g.pctDone}%` }}
                        title={`Sudah PM: ${g.doneUnits.length} unit (${g.pctDone}%)`}
                      />
                      <div
                        className="bg-amber-400 transition-[width] duration-300"
                        style={{ width: `${g.pctStaged}%` }}
                        title={`Di Staging: ${g.stagedUnits.length} unit (${g.pctStaged}%)`}
                      />
                      <div
                        className="bg-rose-500 transition-[width] duration-300"
                        style={{ width: `${g.pctDue}%` }}
                        title={`Belum PM: ${g.dueUnits.length} unit (${g.pctDue}%)`}
                      />
                    </div>

                    {/* Ringkasan Angka 3 Warna */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        <span>{g.doneUnits.length} Selesai</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{g.stagedUnits.length} Staging</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{g.dueUnits.length} Belum PM</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid Nomor Unit Berwarna */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Daftar Armada:</span>
                    <div className="flex items-center gap-2">
                      {g.dueUnits.length > 0 && g.dailyTarget > 0 && (
                        <button
                          type="button"
                          onClick={() => onSelectVariant(g, g.dailyTarget)}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer transition hover:underline"
                          title="Pilih sejumlah target harian otomatis"
                        >
                          <Zap className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                          <span>Kuota ({g.dailyTarget})</span>
                        </button>
                      )}
                      {g.dueUnits.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onSelectVariant(g)}
                          className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer transition hover:underline"
                        >
                          {allDueSelected ? 'Batal' : `Semua (${g.dueUnits.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50/60 rounded-xl flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                    {/* Unit Di Staging */}
                    {g.stagedUnits.map(({ unit, lokasi }) => (
                      <span
                        key={unit.nomor_daisha}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-amber-50 text-amber-900"
                        title={`Di Staging: ${lokasi}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{unit.nomor_daisha}</span>
                      </span>
                    ))}

                    {/* Unit Belum PM */}
                    {visibleDueUnits.map((u) => {
                      const isSelected = selectedUnits.includes(
                        u.nomor_daisha.toUpperCase()
                      );
                      return (
                        <button
                          key={u.nomor_daisha}
                          type="button"
                          onClick={() => onToggleUnit(u.nomor_daisha)}
                          className={`px-2 py-0.5 rounded-md text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium'
                          }`}
                          title={
                            isSelected
                              ? 'Klik untuk batal pilih'
                              : 'Belum PM (Klik untuk siapkan)'
                          }
                        >
                          {isSelected ? (
                            <Check className="w-2.5 h-2.5" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          )}
                          <span>{u.nomor_daisha}</span>
                        </button>
                      );
                    })}

                    {/* Unit Selesai PM */}
                    {(isExpanded || g.dueUnits.length === 0) &&
                      g.doneUnits.map((u) => (
                        <span
                          key={u.nomor_daisha}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-emerald-50 text-emerald-800"
                          title="Sudah Selesai PM"
                        >
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{u.nomor_daisha}</span>
                        </span>
                      ))}
                  </div>

                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCards((prev) => ({
                          ...prev,
                          [g.key]: !prev[g.key],
                        }))
                      }
                      className="w-full text-center py-1 text-xs font-medium text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-md transition cursor-pointer"
                    >
                      {isExpanded
                        ? 'Tampilkan Lebih Sedikit'
                        : `+ Tampilkan ${remainingCount} armada lainnya`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-slate-400" />
            <span>
              Grid kotak nomor disembunyikan agar tampilan ringkas. Anda dapat
              langsung memilih kuota pada tabel di atas.
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowVisualGrid(true)}
            className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
          >
            Buka Grid Nomor Unit
          </button>
        </div>
      )}
    </div>
  );
}
