'use client';

import React from 'react';
import {
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
            <th scope="col" className="py-2.5 px-4">
              {groupingMode === 'JENIS' ? 'Kategori Armada' : 'Seksi Operasional'}
            </th>
            <th scope="col" className="py-2.5 px-3 text-right">
              Populasi
            </th>
            <th scope="col" className="py-2.5 px-3 text-center">
              Kondisi Fisik
            </th>
            <th scope="col" className="py-2.5 px-4 text-left w-52">
              Realisasi PM ({currentYear})
            </th>
            <th scope="col" className="py-2.5 px-3 text-right">
              Belum PM
            </th>
            <th scope="col" className="py-2.5 px-3 text-center">
              Hari Ini / Target
            </th>
            <th scope="col" className="py-2.5 px-4 text-center">
              Rincian
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {activeMatrixList.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                Tidak ada data armada yang sesuai kriteria filter.
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
                      isExpanded ? 'bg-slate-50 font-medium' : ''
                    }`}
                  >
                    {/* 1. Nama Kategori & Ukuran */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">
                          {item.nama}
                        </span>
                        {item.subLabel && groupingMode === 'JENIS' && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium border border-slate-200">
                            {item.subLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Total Populasi */}
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 tabular-nums">
                      {item.total.toLocaleString('id-ID')}
                    </td>

                    {/* 3. Kondisi Fisik Ringkas (OK vs Rusak) */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <span className="text-slate-700 font-medium tabular-nums">
                          {item.okCount.toLocaleString('id-ID')} OK
                        </span>
                        {item.rusakCount > 0 ? (
                          <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 tabular-nums">
                            {item.rusakCount} Rusak
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* 4. Progres PM Bersih (Persen + Progress Bar + Angka) */}
                    <td className="py-2.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs tabular-nums">
                          <span className="font-bold text-slate-900">
                            {item.percentage}%
                          </span>
                          <span className="text-slate-400 font-normal">
                            {item.maintained}/{item.total} unit
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
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 5. Sisa Belum di-PM (Backlog) */}
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {item.unmaintained > 0 ? (
                        <span className="font-bold text-slate-900">
                          {item.unmaintained.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Tuntas
                        </span>
                      )}
                    </td>

                    {/* 6. Target vs Hari Ini Ringkas */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 text-xs tabular-nums font-medium">
                        <span className={item.todayActual > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                          {item.todayActual}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400" title="Target Harian">
                          {item.dailyTarget}
                        </span>
                        {item.percentage >= 100 ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" title="Selesai 100%" />
                        ) : isMetToday ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" title="Target hari ini tercapai" />
                        ) : item.todayActual > 0 ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1" title="Dalam pengerjaan" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" title="Belum ada pengerjaan hari ini" />
                        )}
                      </div>
                    </td>

                    {/* 7. Aksi Buka Rincian Unit */}
                    <td className="py-2.5 px-4 text-center">
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
                        className={`h-7 px-2.5 text-xs font-medium rounded-md border transition inline-flex items-center gap-1 cursor-pointer ${
                          isExpanded
                            ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isExpanded ? 'Tutup' : 'Lihat'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
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
