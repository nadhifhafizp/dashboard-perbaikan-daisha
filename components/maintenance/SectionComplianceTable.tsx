'use client';

import React from 'react';
import {
  ChevronDown,
  RotateCcw,
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
          <h2 className="text-sm font-semibold text-slate-900">
            Kepatuhan PM per Seksi Operasional
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Monitoring target tahunan, progres kepatuhan, dan armada di area penjemputan per seksi
          </p>
        </div>

        {selectedSeksi && (
          <button
            type="button"
            onClick={() => onSelectSeksi('')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer self-start sm:self-auto hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tutup Rincian ({selectedSeksi})</span>
          </button>
        )}
      </div>

      {/* Tabel Utama (Table-first) */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th scope="col" className="py-2.5 px-3.5">Seksi Operasional</th>
              <th scope="col" className="py-2.5 px-3 text-right">Populasi</th>
              <th scope="col" className="py-2.5 px-3">Realisasi PM</th>
              <th scope="col" className="py-2.5 px-3 text-right">Sisa Belum PM</th>
              <th scope="col" className="py-2.5 px-3 text-right">Target Harian</th>
              <th scope="col" className="py-2.5 px-3 text-center">Di Staging</th>
              <th scope="col" className="py-2.5 px-3 text-center">Status</th>
              <th scope="col" className="py-2.5 px-3.5 text-center">Rincian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seksiSummaries.map((item) => {
              const pct = item.total > 0 ? Math.round((item.maintained / item.total) * 100) : 0;
              const dailyTarget = Math.ceil(item.unmaintained / Math.max(1, remainingWorkDays));
              const staged = stagingPerSeksi.get(item.seksi) || 0;
              const isSelected = selectedSeksi === item.seksi;

              // Evaluasi status kepatuhan operasional
              let statusText = 'Selesai 100%';
              let statusStyle = 'text-emerald-700 bg-emerald-50 border-emerald-200';

              if (pct < 100) {
                if (pct >= 50) {
                  statusText = 'On Track';
                  statusStyle = 'text-slate-700 bg-slate-100 border-slate-200';
                } else if (pct >= 25) {
                  statusText = 'Dalam Proses';
                  statusStyle = 'text-amber-700 bg-amber-50 border-amber-200';
                } else {
                  statusText = 'Perlu Akselerasi';
                  statusStyle = 'text-rose-700 bg-rose-50 border-rose-200';
                }
              }

              return (
                <tr
                  key={item.seksi}
                  className={`transition hover:bg-slate-50/70 ${
                    isSelected ? 'bg-slate-50 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        Seksi {item.seksi}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-medium">
                          Terpilih
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
                        <span className="text-slate-400 tabular-nums">
                          {item.maintained.toLocaleString('id-ID')} unit
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-700 tabular-nums">
                    <span className={item.unmaintained > 0 ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                      {item.unmaintained.toLocaleString('id-ID')}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-800 tabular-nums">
                    {dailyTarget} /hari
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    {staged > 0 ? (
                      <span className="inline-flex items-center text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
                        {staged} Unit
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${statusStyle}`}>
                      {statusText}
                    </span>
                  </td>

                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectSeksi(isSelected ? '' : item.seksi)}
                      className={`h-7 px-2.5 text-xs font-medium rounded-md transition cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{isSelected ? 'Tutup' : 'Lihat'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 inline transition-transform ${
                          isSelected ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200">
            <tr>
              <td className="py-2.5 px-3.5">Total Seluruh Pabrik</td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {totals.total.toLocaleString('id-ID')}
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="tabular-nums font-bold">{totalPercentage}%</span>
                  <span className="text-slate-400 tabular-nums">
                    {totals.maintained.toLocaleString('id-ID')} unit
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {totals.unmaintained.toLocaleString('id-ID')}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {totalDailyTarget} /hari
              </td>
              <td className="py-2.5 px-3 text-center tabular-nums">
                {Array.from(stagingPerSeksi.values()).reduce((a, b) => a + b, 0)} Unit
              </td>
              <td className="py-2.5 px-3 text-center text-slate-500 text-xs font-normal">
                Sisa {remainingWorkDays} hari kerja
              </td>
              <td className="py-2.5 px-3.5 text-center text-xs text-slate-300">
                -
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
