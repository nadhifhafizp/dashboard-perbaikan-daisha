'use client';

import React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { SeksiSummaryItem } from './SectionPopulationChart';
import { PmStagingRecord } from './SectionPmHandover';

interface SectionComplianceTableProps {
  seksiSummaries: SeksiSummaryItem[];
  stagingRecords?: PmStagingRecord[];
  remainingWorkDays: number;
  selectedSeksi?: string;
  onSelectSeksi: (seksi: string) => void;
}

export default function SectionComplianceTable({
  seksiSummaries,
  stagingRecords = [],
  remainingWorkDays,
  selectedSeksi,
  onSelectSeksi,
}: SectionComplianceTableProps) {
  // Hitung jumlah armada staging per seksi
  const stagingPerSeksi = React.useMemo(() => {
    const map = new Map<string, number>();
    stagingRecords
      .filter((r) => r.status === 'WAITING_PICKUP' || r.status === 'PICKED_UP')
      .forEach((r) => {
        const count = r.units?.length || 0;
        map.set(r.seksi, (map.get(r.seksi) || 0) + count);
      });
    return map;
  }, [stagingRecords]);

  // Total pabrik
  const totals = React.useMemo(() => {
    return seksiSummaries.reduce(
      (acc, s) => {
        acc.total += s.total;
        acc.maintained += s.maintained;
        acc.unmaintained += s.unmaintained;
        acc.rusak += s.rusak || 0;
        return acc;
      },
      { total: 0, maintained: 0, unmaintained: 0, rusak: 0 }
    );
  }, [seksiSummaries]);

  const totalPercentage =
    totals.total > 0 ? Math.round((totals.maintained / totals.total) * 100) : 0;
  const totalDailyTarget = Math.ceil(
    totals.unmaintained / Math.max(1, remainingWorkDays)
  );

  return (
    <div className="space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" aria-hidden="true" />
            <span>Kepatuhan PM seksi</span>
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Realisasi target tahunan per seksi
          </p>
        </div>

        {selectedSeksi && (
          <button
            type="button"
            onClick={() => onSelectSeksi('')}
            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer self-start sm:self-auto hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tutup Rincian Seksi ({selectedSeksi})</span>
          </button>
        )}
      </div>

      {/* Tabel Utama (Table-first) */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th scope="col" className="py-2.5 px-3.5">Seksi Operasional</th>
              <th scope="col" className="py-2.5 px-3 text-right">Populasi</th>
              <th scope="col" className="py-2.5 px-3">Realisasi PM</th>
              <th scope="col" className="py-2.5 px-3 text-right">Sisa Belum PM</th>
              <th scope="col" className="py-2.5 px-3 text-right">Target Harian</th>
              <th scope="col" className="py-2.5 px-3 text-center">Di Staging</th>
              <th scope="col" className="py-2.5 px-3 text-center">Status</th>
              <th scope="col" className="py-2.5 px-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seksiSummaries.map((item) => {
              const pct = item.total > 0 ? Math.round((item.maintained / item.total) * 100) : 0;
              const dailyTarget = Math.ceil(item.unmaintained / Math.max(1, remainingWorkDays));
              const staged = stagingPerSeksi.get(item.seksi) || 0;
              const isSelected = selectedSeksi === item.seksi;

              // Evaluasi status kepatuhan operasional
              let statusBadge = (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                  <span>Selesai 100%</span>
                </span>
              );

              if (pct < 100) {
                if (pct >= 50) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <TrendingUp className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      <span>On Track</span>
                    </span>
                  );
                } else if (pct >= 25) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-600" aria-hidden="true" />
                      <span>Dalam Proses</span>
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-rose-600" aria-hidden="true" />
                      <span>Perlu Percepatan</span>
                    </span>
                  );
                }
              }

              return (
                <tr
                  key={item.seksi}
                  className={`transition hover:bg-slate-50/70 ${
                    isSelected ? 'bg-red-50/40 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                      <span className="font-semibold text-slate-900">
                        Seksi {item.seksi}
                      </span>
                      {isSelected && (
                        <span className="text-xs bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                          Rincian Terbuka ↓
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-800 tabular-nums">
                    {item.total.toLocaleString('id-ID')}
                  </td>

                  <td className="py-2.5 px-3 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {pct}%
                        </span>
                        <span className="text-slate-500 tabular-nums">
                          {item.maintained.toLocaleString('id-ID')} unit
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-[width] duration-300"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-700 tabular-nums">
                    <span className={item.unmaintained > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                      {item.unmaintained.toLocaleString('id-ID')}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-800 tabular-nums">
                    {dailyTarget} /hari
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    {staged > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300 tabular-nums">
                        {staged} Unit
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    {statusBadge}
                  </td>

                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectSeksi(isSelected ? '' : item.seksi)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer border focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                      title={isSelected ? `Tutup rincian varian Seksi ${item.seksi}` : `Buka rincian varian Seksi ${item.seksi} langsung di bawah`}
                    >
                      <span>{isSelected ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'rotate-180 text-white' : 'text-slate-500'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50/90 font-semibold text-slate-900 border-t-2 border-slate-200">
            <tr>
              <td className="py-2.5 px-3.5">Total Seluruh Pabrik</td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {totals.total.toLocaleString('id-ID')}
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="tabular-nums font-bold">{totalPercentage}%</span>
                  <span className="text-slate-500 tabular-nums">
                    {totals.maintained.toLocaleString('id-ID')} unit
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums text-rose-700">
                {totals.unmaintained.toLocaleString('id-ID')}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {totalDailyTarget} /hari
              </td>
              <td className="py-2.5 px-3 text-center tabular-nums">
                {Array.from(stagingPerSeksi.values()).reduce((a, b) => a + b, 0)} Unit
              </td>
              <td className="py-2.5 px-3 text-center text-slate-500 text-xs">
                Sisa {remainingWorkDays} Hari
              </td>
              <td className="py-2.5 px-3.5 text-center text-xs text-slate-400">
                -
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
