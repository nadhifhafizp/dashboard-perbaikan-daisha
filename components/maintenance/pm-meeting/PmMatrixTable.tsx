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
        <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b-2 border-slate-200 uppercase tracking-wider text-xs">
          <tr>
            <th scope="col" className="py-3.5 px-4">
              {groupingMode === 'JENIS' ? 'Jenis Armada' : 'Seksi Pabrik'}
            </th>
            <th scope="col" className="py-3.5 px-3 text-right">
              Populasi
            </th>
            <th scope="col" className="py-3.5 px-3 text-center">
              Kondisi Fisik
            </th>
            <th scope="col" className="py-3.5 px-4 text-left w-52">
              Progres PM ({currentYear})
            </th>
            <th scope="col" className="py-3.5 px-3 text-right">
              Belum PM
            </th>
            <th scope="col" className="py-3.5 px-3 text-center">
              Target vs Hari Ini
            </th>
            <th scope="col" className="py-3.5 px-4 text-center">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {activeMatrixList.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
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
                    className={`transition hover:bg-slate-50 ${
                      isExpanded ? 'bg-red-50/40 font-medium' : ''
                    }`}
                  >
                    {/* 1. Nama Kategori & Ukuran */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900 text-sm">
                          {item.nama}
                        </span>
                        {item.subLabel && groupingMode === 'JENIS' && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-bold border border-slate-200">
                            {item.subLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Total Populasi */}
                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm tabular-nums">
                      {item.total.toLocaleString('id-ID')}
                    </td>

                    {/* 3. Kondisi Fisik Ringkas (OK vs Rusak) */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.okCount.toLocaleString('id-ID')} OK
                        </span>
                        {item.rusakCount > 0 ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {item.rusakCount} Rusak
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* 4. Progres PM Bersih (Persen + Progress Bar + Angka) */}
                    <td className="py-3 px-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs tabular-nums">
                          <span className="font-extrabold text-slate-900">
                            {item.percentage}%
                          </span>
                          <span className="text-slate-500 font-medium text-xs">
                            {item.maintained} dari {item.total} unit
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
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

                    {/* 5. Sisa Belum di-PM (Fokus Utama Backlog) */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      {item.unmaintained > 0 ? (
                        <span className="font-extrabold text-rose-700 text-sm">
                          {item.unmaintained.toLocaleString('id-ID')} unit
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Selesai
                        </span>
                      )}
                    </td>

                    {/* 6. Target vs Hari Ini Ringkas */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs tabular-nums font-semibold">
                        <span className="text-slate-600">
                          {item.todayActual}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500" title="Target Harian">
                          {item.dailyTarget} hr
                        </span>
                        {item.percentage >= 100 ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="PM 100% Selesai" />
                        ) : isMetToday ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Target Hari Ini Tercapai" />
                        ) : item.todayActual > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Dalam Pengerjaan" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" title="Belum Ada Pengerjaan Hari Ini" />
                        )}
                      </div>
                    </td>

                    {/* 7. Aksi Buka Rincian Unit */}
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
                        className={`min-h-[32px] px-3 py-1 text-xs font-bold rounded-lg border transition inline-flex items-center gap-1 cursor-pointer ${
                          isExpanded
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-2xs'
                        }`}
                      >
                        <span>
                          {isExpanded ? 'Tutup' : 'Lihat Unit'}
                        </span>
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
