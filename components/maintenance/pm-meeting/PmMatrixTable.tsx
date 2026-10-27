'use client';

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UnifiedMatrixItem } from '@/lib/pmAnalytics';
import PmExpandedUnits from './PmExpandedUnits';

interface PmMatrixTableProps {
  activeMatrixList: UnifiedMatrixItem[];
  groupingMode: 'JENIS' | 'SEKSI';
  currentYear: number;
  expandedKey: string | null;
  setExpandedKey: (key: string | null) => void;
  unitStatusFilter: 'all' | 'unmaintained' | 'maintained' | 'rusak';
  setUnitStatusFilter: (filter: 'all' | 'unmaintained' | 'maintained' | 'rusak') => void;
  unitSearch: string;
  setUnitSearch: (search: string) => void;
}

export default function PmMatrixTable({
  activeMatrixList,
  groupingMode,
  currentYear,
  expandedKey,
  setExpandedKey,
  unitStatusFilter,
  setUnitStatusFilter,
  unitSearch,
  setUnitSearch,
}: PmMatrixTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
          <tr>
            <th scope="col" className="py-3 px-4">
              {groupingMode === 'JENIS' ? 'Jenis Daisha' : 'Seksi Operasional'}
            </th>
            <th scope="col" className="py-3 px-3 text-right">Populasi</th>
            <th scope="col" className="py-3 px-3 text-right">Siap / OK</th>
            <th scope="col" className="py-3 px-3 text-right">Rusak (Repair)</th>
            <th scope="col" className="py-3 px-3 text-left">
              Progres PM Tahun {currentYear}
            </th>
            <th scope="col" className="py-3 px-3 text-right">Sudah di-PM</th>
            <th scope="col" className="py-3 px-3 text-right">Belum di-PM</th>
            <th scope="col" className="py-3 px-3 text-right">Target Harian</th>
            <th scope="col" className="py-3 px-3 text-right">Aktual Hari Ini</th>
            <th scope="col" className="py-3 px-3 text-center">Status PM</th>
            <th scope="col" className="py-3 px-4 text-center">Rincian Unit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {activeMatrixList.length === 0 ? (
            <tr>
              <td colSpan={11} className="py-8 text-center text-xs text-slate-400">
                Tidak ada kategori armada yang sesuai dengan kata kunci pencarian.
              </td>
            </tr>
          ) : (
            activeMatrixList.map((item) => {
              const isExpanded = expandedKey === item.key;
              const isMetToday =
                item.todayActual >= item.dailyTarget && item.dailyTarget > 0;

              return (
                <React.Fragment key={item.key}>
                  <tr
                    className={`transition hover:bg-slate-50/80 ${
                      isExpanded ? 'bg-red-50/30 font-medium' : ''
                    }`}
                  >
                    {/* Nama Kategori */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="font-semibold text-slate-900">
                          {item.nama}
                        </span>
                        {item.subLabel && groupingMode === 'JENIS' && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                            {item.subLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Populasi */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-800 tabular-nums">
                      {item.total.toLocaleString('id-ID')}
                    </td>

                    {/* Siap / OK */}
                    <td className="py-3 px-3 text-right font-semibold text-emerald-700 tabular-nums">
                      {item.okCount.toLocaleString('id-ID')}
                    </td>

                    {/* Rusak / Repair */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      {item.rusakCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>{item.rusakCount} unit</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0</span>
                      )}
                    </td>

                    {/* Progress Bar PM */}
                    <td className="py-3 px-3 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs tabular-nums">
                          <span className="font-semibold text-slate-800">
                            {item.percentage}%
                          </span>
                          <span className="text-slate-400">
                            {item.maintained}/{item.total}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              item.percentage >= 100
                                ? 'bg-emerald-600'
                                : item.percentage >= 50
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Sudah di-PM */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">
                      {item.maintained.toLocaleString('id-ID')}
                    </td>

                    {/* Belum di-PM */}
                    <td className="py-3 px-3 text-right font-bold text-rose-700 tabular-nums">
                      {item.unmaintained.toLocaleString('id-ID')}
                    </td>

                    {/* Target Harian */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-700 tabular-nums">
                      {item.dailyTarget}{' '}
                      <span className="text-xs font-normal text-slate-400">/hr</span>
                    </td>

                    {/* Aktual Hari Ini */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                      <span
                        className={
                          item.todayActual > 0
                            ? 'text-emerald-700'
                            : 'text-slate-500'
                        }
                      >
                        {item.todayActual}
                      </span>
                    </td>

                    {/* Status PM */}
                    <td className="py-3 px-3 text-center">
                      {item.percentage >= 100 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Selesai 100%</span>
                        </span>
                      ) : isMetToday ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Tercapai</span>
                        </span>
                      ) : item.todayActual > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>
                            Kurang{' '}
                            {Math.max(0, item.dailyTarget - item.todayActual)}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <span>Belum Jalan</span>
                        </span>
                      )}
                    </td>

                    {/* Aksi Rincian Unit */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedKey(null);
                          } else {
                            setExpandedKey(item.key);
                            setUnitStatusFilter('all');
                            setUnitSearch('');
                          }
                        }}
                        className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-md border transition inline-flex items-center gap-1 cursor-pointer ${
                          isExpanded
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>
                          {isExpanded
                            ? 'Tutup Unit'
                            : `Lihat Unit (${item.total})`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED ACCORDION: MAPPING SETIAP UNIT DAISHA */}
                  {isExpanded && (
                    <PmExpandedUnits
                      item={item}
                      currentYear={currentYear}
                      unitStatusFilter={unitStatusFilter}
                      setUnitStatusFilter={setUnitStatusFilter}
                      unitSearch={unitSearch}
                      setUnitSearch={setUnitSearch}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
