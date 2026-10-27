'use client';

import React from 'react';
import { Target, CheckCircle2, Check, Clock, Zap } from 'lucide-react';
import { ColorCodedVariantGroup } from './types';

interface HandoverTargetTableProps {
  seksi: string;
  totalSectionDailyTarget: number;
  totalSectionStagedToday: number;
  remainingWorkDays: number;
  totalUnits: number;
  dueCount: number;
  variantGroups: ColorCodedVariantGroup[];
  selectedUnits: string[];
  onSelectVariant: (group: ColorCodedVariantGroup, count?: number) => void;
}

export default function HandoverTargetTable({
  seksi,
  totalSectionDailyTarget,
  totalSectionStagedToday,
  remainingWorkDays,
  totalUnits,
  dueCount,
  variantGroups,
  selectedUnits,
  onSelectVariant,
}: HandoverTargetTableProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                Target Penyiapan PM Harian per Varian: Seksi {seksi}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-mono">
                <Target className="w-3 h-3 text-red-700" />
                <span>Target: 1 Thn 1x PM (100%)</span>
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                Kuota Hari Ini: {totalSectionDailyTarget} Unit / Hari
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Komitmen pabrik: 1 tahun seluruh armada wajib ter-PM 100%. Target
              harian dihitung dari sisa armada belum PM dibagi {remainingWorkDays}{' '}
              hari kerja di tahun {new Date().getFullYear()}. Klik tombol
              &quot;Siapkan Kuota&quot; untuk langsung memilih unit target hari
              ini.
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
              {totalSectionStagedToday} Unit
            </span>
          </span>
        </div>
      </div>

      {/* Tabel Rincian Target per Varian */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3.5">Jenis / Varian Daisha</th>
              <th className="py-2.5 px-3 text-center">Populasi Seksi</th>
              <th className="py-2.5 px-3 text-center">Belum PM</th>
              <th className="py-2.5 px-3.5 text-center bg-amber-50/70 border-x border-amber-200/60 text-amber-900">
                Target Harian
              </th>
              <th className="py-2.5 px-3 text-center">Di Staging (Siap)</th>
              <th className="py-2.5 px-3.5 text-center">Status Kuota Hari Ini</th>
              <th className="py-2.5 px-3.5 text-center">Aksi Cepat Penyiapan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {variantGroups.map((g) => {
              const isSelectedInBatch =
                g.dailyTarget > 0 &&
                g.dueUnits.length > 0 &&
                g.dueUnits
                  .slice(0, g.dailyTarget)
                  .every((u) =>
                    selectedUnits.includes(u.nomor_daisha.toUpperCase())
                  );

              return (
                <tr
                  key={g.key}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* 1. Nama Varian */}
                  <td className="py-3 px-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <div>
                        <p className="text-slate-900 font-bold">{g.name}</p>
                        <p className="text-xs text-slate-500 font-normal">
                          {g.ukuran !== 'Standar'
                            ? `Ukuran: ${g.ukuran}`
                            : 'Standar'}
                          {g.prefix && ` • Prefix: ${g.prefix}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Total Populasi */}
                  <td className="py-3 px-3 text-center text-slate-700 font-semibold tabular-nums font-mono">
                    {g.totalUnits} unit
                  </td>

                  {/* 3. Belum PM */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{g.dueUnits.length} unit</span>
                    </span>
                  </td>

                  {/* 4. Target Harian */}
                  <td className="py-3 px-3.5 text-center bg-amber-50/40 border-x border-amber-200/50">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                      <Target className="w-3 h-3 text-amber-700" />
                      <span>{g.dailyTarget} Unit / Hari</span>
                    </span>
                  </td>

                  {/* 5. Di Staging */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                        g.stagedUnits.length > 0
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'text-slate-400 bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {g.stagedUnits.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      <span>{g.stagedUnits.length} unit</span>
                    </span>
                  </td>

                  {/* 6. Status Kuota Hari Ini */}
                  <td className="py-3 px-3.5 text-center">
                    {g.dueUnits.length === 0 && g.stagedUnits.length === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>100% Selesai PM</span>
                      </span>
                    ) : g.isTargetFulfilled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>
                          Kuota Terpenuhi ({g.stagedTodayCount}/{g.dailyTarget})
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <Clock className="w-3 h-3 text-rose-500" />
                        <span>Kurang {g.remainingTarget} Unit</span>
                      </span>
                    )}
                  </td>

                  {/* 7. Tombol Aksi Cepat */}
                  <td className="py-3 px-3.5 text-center">
                    {g.dueUnits.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        Tidak ada antrean
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectVariant(g, g.dailyTarget)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer border ${
                          isSelectedInBatch
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                        }`}
                        title={`Pilih ${g.dailyTarget} unit belum PM untuk disiapkan`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {isSelectedInBatch
                            ? `Batal (${g.dailyTarget})`
                            : `Siapkan Kuota (${g.dailyTarget} Unit)`}
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
