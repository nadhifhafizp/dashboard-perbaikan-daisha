'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  List,
  Eye,
  PlusCircle,
} from 'lucide-react';

export interface FleetUnit {
  id: number | string;
  nomor_daisha: string;
  serial_number?: number;
  jenis: string;
  nama_daisha?: string;
  seksi?: string;
  ukuran?: string;
  last_maintenance_date: string | null;
  last_condition?: string;
  last_repair_date?: string | null;
  last_waktu_masuk?: string | null;
  last_waktu_keluar?: string | null;
  is_maintained: boolean;
  days_since_last: number | null;
}

interface FleetExplorerProps {
  units: FleetUnit[];
  jenisList?: string[];
  seksiList?: string[];
  currentYear: number;
  onSelectUnit: (unit: FleetUnit) => void;
  onQuickInput: (unit: FleetUnit) => void;
}

export default function FleetExplorer({
  units,
  jenisList = [],
  seksiList = [],
  currentYear,
  onSelectUnit,
  onQuickInput,
}: FleetExplorerProps) {
  // Filter States
  const [search, setSearch] = useState<string>('');
  const [filterSeksi, setFilterSeksi] = useState<string>('ALL');
  const [filterJenis, setFilterJenis] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'MAINTAINED' | 'UNMAINTAINED'>('ALL');
  const [filterKondisi, setFilterKondisi] = useState<'ALL' | 'OK' | 'RUSAK'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('TABLE');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 60;

  // Extract distinct seksi options
  const availableSeksi = useMemo(() => {
    if (seksiList && seksiList.length > 0) return seksiList;
    const s = new Set<string>();
    units.forEach((u) => {
      if (u.seksi) s.add(u.seksi);
    });
    return Array.from(s).sort();
  }, [seksiList, units]);

  // Extract distinct jenis options if not provided
  const availableJenis = useMemo(() => {
    if (jenisList && jenisList.length > 0) return jenisList;
    const s = new Set<string>();
    units.forEach((u) => {
      if (u.jenis) s.add(u.jenis);
    });
    return Array.from(s).sort();
  }, [jenisList, units]);

  // Filtered Units
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      // Filter Seksi
      if (filterSeksi !== 'ALL' && (u.seksi || 'All seksi') !== filterSeksi) return false;

      // Filter Jenis
      if (filterJenis !== 'ALL' && u.jenis !== filterJenis) return false;

      // Filter Status PM
      if (filterStatus === 'MAINTAINED' && !u.is_maintained) return false;
      if (filterStatus === 'UNMAINTAINED' && u.is_maintained) return false;

      // Filter Kondisi
      const cond = (u.last_condition || 'OK').toUpperCase();
      if (filterKondisi === 'OK' && cond === 'RUSAK') return false;
      if (filterKondisi === 'RUSAK' && cond !== 'RUSAK') return false;

      // Filter Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesNomor = u.nomor_daisha.toLowerCase().includes(q);
        const matchesJenis = (u.jenis || '').toLowerCase().includes(q);
        const matchesNama = (u.nama_daisha || '').toLowerCase().includes(q);
        const matchesSeksi = (u.seksi || '').toLowerCase().includes(q);
        const matchesUkuran = (u.ukuran || '').toLowerCase().includes(q);
        if (!matchesNomor && !matchesJenis && !matchesUkuran && !matchesNama && !matchesSeksi) return false;
      }

      return true;
    });
  }, [units, filterSeksi, filterJenis, filterStatus, filterKondisi, search]);

  // Reset page when filter changes
  const handleFilterChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterSeksi('ALL');
    setFilterJenis('ALL');
    setFilterStatus('ALL');
    setFilterKondisi('ALL');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUnits.length / pageSize) || 1;
  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUnits.slice(start, start + pageSize);
  }, [filteredUnits, currentPage, pageSize]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatJenisLabel = (jenis: string, ukuran?: string) => {
    if (jenis === 'VERTICAL') {
      return `Vertical (${ukuran || 'Std'})`;
    }
    if (jenis === 'NAGARA_FILTER') {
      return 'Nagara Filter';
    }
    return `${jenis} ${ukuran && ukuran !== 'NONE' ? ukuran : ''}`.trim();
  };

  const cleanNomorDaisha = (raw: string) => {
    // Normalisasi triple-dash database seperti B/P---0001 menjadi B/P-0001
    return raw.replace(/---+/g, '-').replace(/--+/g, '-');
  };

  return (
    <section aria-labelledby="fleet-explorer-heading" className="space-y-4">
      {/* 1. Header Toolbar & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 id="fleet-explorer-heading" className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Pemantauan Visual Seluruh Armada Daisha</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                {filteredUnits.length} Unit
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Daftar lengkap semua jenis daisha di pabrik beserta status PM tahun {currentYear} & kondisi fisik terakhir
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`h-7 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel Armada</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`h-7 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Visual</span>
            </button>
          </div>
        </div>

        {/* 2. Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="Cari nomor daisha (mis: S-001, NF-05, M-10)..."
              className="w-full h-9 pl-8 pr-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
            />
          </div>

          {/* Filter Seksi */}
          <div className="lg:col-span-2">
            <select
              value={filterSeksi}
              onChange={(e) => handleFilterChange(setFilterSeksi, e.target.value)}
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Seksi</option>
              {availableSeksi.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jenis Daisha */}
          <div className="lg:col-span-3">
            <select
              value={filterJenis}
              onChange={(e) => handleFilterChange(setFilterJenis, e.target.value)}
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Jenis Daisha</option>
              {availableJenis.map((j) => (
                <option key={j} value={j}>
                  {formatJenisLabel(j)}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status PM */}
          <div className="lg:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value as any)}
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status PM</option>
              <option value="MAINTAINED">Sudah Maintenance</option>
              <option value="UNMAINTAINED">Belum Maintenance</option>
            </select>
          </div>

          {/* Filter Kondisi */}
          <div className="lg:col-span-1">
            <select
              value={filterKondisi}
              onChange={(e) => handleFilterChange(setFilterKondisi, e.target.value as any)}
              className="w-full h-9 px-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value="ALL">Kondisi</option>
              <option value="OK">OK</option>
              <option value="RUSAK">Rusak</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="lg:col-span-1 flex items-center">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
              title="Reset Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="lg:hidden">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Empty State or Content View */}
      {filteredUnits.length === 0 ? (
        <div className="py-12 px-4 text-center space-y-2 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <Filter className="w-8 h-8 text-slate-400 mx-auto mb-1" />
          <h3 className="text-sm font-bold text-slate-800">Tidak Ada Daisha yang Cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ditemukan unit yang sesuai dengan kombinasi filter atau kata kunci pencarian Anda.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seluruh Filter</span>
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* 4A. Standalone Card Grid (Non-nested cards) */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {paginatedUnits.map((u) => {
              const isOk = (u.last_condition || 'OK').toUpperCase() !== 'RUSAK';
              const isMaintained = u.is_maintained;
              const cleanNomor = cleanNomorDaisha(u.nomor_daisha);

              return (
                <div
                  key={u.id}
                  onClick={() => onSelectUnit(u)}
                  className={`p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between gap-2.5 hover:shadow-xs ${
                    isMaintained
                      ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {/* Top: Nomor & Status PM Chip */}
                  <div className="flex items-start justify-between gap-1">
                    <code className="font-mono font-bold text-xs text-slate-900 tracking-tight">
                      {cleanNomor}
                    </code>
                    {isMaintained ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300">
                        PM
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        Belum
                      </span>
                    )}
                  </div>

                  {/* Middle: Jenis Daisha */}
                  <div className="text-xs text-slate-700 truncate font-medium">
                    {formatJenisLabel(u.jenis, u.ukuran)}
                  </div>

                  {/* Bottom: Condition Badge & Timestamp */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    {isOk ? (
                      <span className="font-semibold text-emerald-700">OK</span>
                    ) : (
                      <span className="font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-red-200">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>Rusak</span>
                      </span>
                    )}

                    <span className="text-slate-600 tabular-nums">
                      {u.last_maintenance_date
                        ? new Date(u.last_maintenance_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Belum PM'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs">
              <span className="text-slate-600 tabular-nums font-medium">
                Menampilkan {(currentPage - 1) * pageSize + 1} s/d{' '}
                {Math.min(currentPage * pageSize, filteredUnits.length)} dari {filteredUnits.length} unit
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span className="font-bold text-slate-800 px-2 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 4B. Table View */
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">No. Daisha</th>
                  <th className="py-3 px-3.5">Jenis & Ukuran</th>
                  <th className="py-3 px-3.5">Status PM {currentYear}</th>
                  <th className="py-3 px-3.5">Kondisi Fisik</th>
                  <th className="py-3 px-3.5">Terakhir Maintenance</th>
                  <th className="py-3 px-3.5">Jadwal Masuk / Keluar</th>
                  <th className="py-3 px-3.5 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedUnits.map((u) => {
                  const isOk = (u.last_condition || 'OK').toUpperCase() !== 'RUSAK';
                  const cleanNomor = cleanNomorDaisha(u.nomor_daisha);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3.5">
                        <code className="font-mono font-bold text-xs text-slate-900 tracking-tight">
                          {cleanNomor}
                        </code>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium">
                        {formatJenisLabel(u.jenis, u.ukuran)}
                      </td>
                      <td className="py-3 px-3.5">
                        {u.is_maintained ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sudah PM</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Belum PM</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        {isOk ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                            Normal (OK)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>Rusak</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 tabular-nums">
                        {formatDate(u.last_maintenance_date)}
                      </td>
                      <td className="py-3 px-3.5 text-xs text-slate-600 tabular-nums">
                        {u.last_waktu_masuk || u.last_waktu_keluar ? (
                          <span>
                            {formatDate(u.last_waktu_masuk)} s/d {formatDate(u.last_waktu_keluar)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectUnit(u)}
                            className="min-h-[36px] sm:min-h-0 h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickInput(u)}
                            className="min-h-[36px] sm:min-h-0 h-7 px-2.5 bg-slate-900 hover:bg-black text-white rounded-md font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Catat PM</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs">
              <span className="text-slate-600 tabular-nums font-medium">
                Menampilkan {(currentPage - 1) * pageSize + 1} s/d{' '}
                {Math.min(currentPage * pageSize, filteredUnits.length)} dari {filteredUnits.length} unit
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span className="font-bold text-slate-800 px-2 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
