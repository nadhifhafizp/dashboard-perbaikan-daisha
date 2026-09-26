'use client';

import React, { useState, useMemo } from 'react';
import { FleetUnitItem } from '@/hooks/useFleetAnalytics';
import {
  Search,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface FleetMaintenanceTableProps {
  units: FleetUnitItem[];
  onSelectUnit: (unit: FleetUnitItem) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedSeksi?: string;
  onSelectSeksi?: (seksi: string) => void;
}

export default function FleetMaintenanceTable({
  units,
  onSelectUnit,
  selectedFilter,
  onFilterChange,
  selectedType,
  onTypeChange,
  selectedSeksi: controlledSeksi,
  onSelectSeksi: controlledSetSeksi,
}: FleetMaintenanceTableProps) {
  const [search, setSearch] = useState('');
  const [internalSeksi, setInternalSeksi] = useState('');
  const selectedSeksi = controlledSeksi !== undefined ? controlledSeksi : internalSeksi;
  const setSelectedSeksi = controlledSetSeksi || setInternalSeksi;
  const [sortKey, setSortKey] = useState<'due_asc' | 'due_desc' | 'unit_asc' | 'repairs_desc'>('due_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const needServiceCount = useMemo(() => {
    return units.filter((u) => u.status === 'OVERDUE' || u.status === 'DUE_SOON').length;
  }, [units]);

  const inWorkshopCount = useMemo(() => {
    return units.filter((u) => u.status === 'IN_WORKSHOP').length;
  }, [units]);

  const seksiList = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.seksi) set.add(u.seksi);
    });
    return Array.from(set).sort();
  }, [units]);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      if (search.trim()) {
        const q = search.trim().toUpperCase();
        const matchNo = unit.noDaisha.toUpperCase().includes(q);
        const matchName = unit.namaDaisha.toUpperCase().includes(q);
        const matchSeksi = unit.seksi.toUpperCase().includes(q);
        if (!matchNo && !matchName && !matchSeksi) return false;
      }

      // Quick filter
      if (selectedFilter && selectedFilter !== 'ALL') {
        if (selectedFilter === 'NEED_SERVICE') {
          if (unit.status !== 'OVERDUE' && unit.status !== 'DUE_SOON') return false;
        } else {
          if (unit.status !== selectedFilter) return false;
        }
      }

      if (selectedType) {
        if (unit.namaDaisha.toUpperCase() !== selectedType.toUpperCase()) return false;
      }

      if (selectedSeksi) {
        if (unit.seksi.toUpperCase() !== selectedSeksi.toUpperCase()) return false;
      }

      return true;
    });
  }, [units, search, selectedFilter, selectedType, selectedSeksi]);

  const sortedUnits = useMemo(() => {
    const list = [...filteredUnits];
    switch (sortKey) {
      case 'due_asc':
        return list.sort((a, b) => (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999));
      case 'due_desc':
        return list.sort((a, b) => (b.daysUntilDue ?? -999) - (a.daysUntilDue ?? -999));
      case 'repairs_desc':
        return list.sort((a, b) => b.totalRepairs - a.totalRepairs);
      case 'unit_asc':
      default:
        return list.sort((a, b) =>
          a.noDaisha.localeCompare(b.noDaisha, undefined, { numeric: true, sensitivity: 'base' })
        );
    }
  }, [filteredUnits, sortKey]);

  const totalPages = Math.ceil(sortedUnits.length / pageSize) || 1;
  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUnits.slice(start, start + pageSize);
  }, [sortedUnits, currentPage]);

  const formatDateShort = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const hasFilter = search || selectedSeksi || selectedFilter !== 'ALL' || selectedType;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Toolbar with Fast Status Tabs */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        {/* Quick Tabs: Semua vs Perlu Servis vs Di Bengkel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => {
              onFilterChange('ALL');
              setCurrentPage(1);
            }}
            className={`h-7 px-2.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Semua Unit</span>
            <span className="text-[10px] font-mono opacity-80">
              {units.length.toLocaleString('id-ID')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onFilterChange('NEED_SERVICE');
              setSortKey('due_asc');
              setCurrentPage(1);
            }}
            className={`h-7 px-2.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFilter === 'NEED_SERVICE' || selectedFilter === 'OVERDUE' || selectedFilter === 'DUE_SOON'
                ? 'bg-[#E60012] text-white shadow-2xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Perlu Servis</span>
            <span className="text-[10px] font-mono font-bold bg-white/20 px-1 py-0.2 rounded">
              {needServiceCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onFilterChange('IN_WORKSHOP');
              setCurrentPage(1);
            }}
            className={`h-7 px-2.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFilter === 'IN_WORKSHOP'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <Wrench className="w-3 h-3" />
            <span>Di Bengkel</span>
            <span className="text-[10px] font-mono font-bold bg-white/20 px-1 py-0.2 rounded">
              {inWorkshopCount}
            </span>
          </button>
        </div>

        {/* Search, Seksi, & Sort Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[150px] sm:min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari no / seksi..."
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder-slate-400"
            />
          </div>

          <select
            value={selectedSeksi}
            onChange={(e) => {
              setSelectedSeksi(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 px-2 text-xs bg-white border border-slate-300 rounded focus:outline-none text-slate-700 cursor-pointer font-medium"
          >
            <option value="">Semua Seksi</option>
            {seksiList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="h-8 px-2 text-xs bg-white border border-slate-300 rounded focus:outline-none text-slate-700 cursor-pointer font-medium"
          >
            <option value="due_asc">Jatuh Tempo Terdekat</option>
            <option value="due_desc">Jatuh Tempo Terlama</option>
            <option value="repairs_desc">Servis Terbanyak</option>
            <option value="unit_asc">Nomor Daisha (A-Z)</option>
          </select>

          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedSeksi('');
                onFilterChange('ALL');
                onTypeChange('');
                setCurrentPage(1);
              }}
              className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 font-semibold rounded border border-red-200 transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              <th className="p-2.5 pl-4">No. Daisha</th>
              <th className="p-2.5">Jenis & Seksi</th>
              <th className="p-2.5">Servis Terakhir</th>
              <th className="p-2.5">Jadwal Servis</th>
              <th className="p-2.5 text-center">Total Servis</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5 pr-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUnits.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400">
                  <p className="font-semibold text-slate-600">Tidak ada unit yang cocok</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ubah pencarian atau reset filter</p>
                </td>
              </tr>
            ) : (
              paginatedUnits.map((unit) => {
                return (
                  <tr
                    key={unit.noDaisha}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onSelectUnit(unit)}
                  >
                    {/* No. Daisha */}
                    <td className="p-2.5 pl-4">
                      <span className="font-mono font-bold text-slate-900">
                        {unit.noDaisha}
                      </span>
                    </td>

                    {/* Jenis & Seksi */}
                    <td className="p-2.5">
                      <div className="font-medium text-slate-800 line-clamp-1">{unit.namaDaisha}</div>
                      <span className="text-[11px] text-slate-400">{unit.seksi}</span>
                    </td>

                    {/* Servis Terakhir */}
                    <td className="p-2.5 whitespace-nowrap text-slate-700 font-mono">
                      {unit.lastRepairDate ? formatDateShort(unit.lastRepairDate) : '-'}
                    </td>

                    {/* Jadwal Servis */}
                    <td className="p-2.5 whitespace-nowrap">
                      {unit.nextDueDate ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-800">{formatDateShort(unit.nextDueDate)}</span>
                          {unit.daysUntilDue !== null && unit.daysUntilDue < 0 ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                              +{Math.abs(unit.daysUntilDue)}h
                            </span>
                          ) : unit.daysUntilDue !== null && unit.daysUntilDue <= 7 ? (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                              {unit.daysUntilDue}h
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-700">
                              Aman
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Total Servis */}
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-semibold text-xs text-slate-700">
                        {unit.totalRepairs}x
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-2.5 whitespace-nowrap">
                      {unit.status === 'IN_WORKSHOP' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Wrench className="w-3 h-3" />
                          <span>Di Bengkel</span>
                        </span>
                      )}
                      {unit.status === 'OVERDUE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue</span>
                        </span>
                      )}
                      {unit.status === 'DUE_SOON' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Mendekati</span>
                        </span>
                      )}
                      {unit.status === 'HEALTHY' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aman</span>
                        </span>
                      )}
                      {unit.status === 'DORMANT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Belum Servis</span>
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="p-2.5 pr-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectUnit(unit)}
                          className="h-6 px-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded font-medium text-[11px] transition cursor-pointer"
                        >
                          Riwayat
                        </button>
                        <Link
                          href={`/input?noDaisha=${encodeURIComponent(unit.noDaisha)}&seksi=${encodeURIComponent(
                            unit.seksi
                          )}&namaDaisha=${encodeURIComponent(unit.namaDaisha)}`}
                          className="h-6 px-2 bg-white hover:bg-red-50 text-[#E60012] border border-red-200 rounded font-semibold text-[11px] transition inline-flex items-center"
                        >
                          + Servis
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span>
          {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, sortedUnits.length)} dari {sortedUnits.length.toLocaleString('id-ID')} unit
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-0.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
          >
            Prev
          </button>
          <span className="font-mono text-slate-700">
            {currentPage}/{totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-0.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
