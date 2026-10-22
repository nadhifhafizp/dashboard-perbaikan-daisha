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
  Truck,
  MapPin,
  Building2,
  Download,
} from 'lucide-react';
import { getSectionDaishaList } from '@/lib/masterData';

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

export interface StagedUnitInfo {
  lokasi: string;
  status: string;
  waktu?: string;
}

interface FleetExplorerProps {
  units: FleetUnit[];
  jenisList?: string[];
  seksiList?: string[];
  currentYear: number;
  isSeksiUser?: boolean;
  seksi?: string;
  stagedUnitNumbers?: Set<string>;
  stagedUnitMap?: Map<string, StagedUnitInfo>;
  onSelectUnit: (unit: FleetUnit) => void;
  onQuickInput: (unit: FleetUnit) => void;
  onStageUnit?: (unit: FleetUnit) => void;
}

export default function FleetExplorer({
  units,
  jenisList = [],
  seksiList = [],
  currentYear,
  isSeksiUser = false,
  seksi,
  stagedUnitNumbers = new Set(),
  stagedUnitMap,
  onSelectUnit,
  onQuickInput,
  onStageUnit,
}: FleetExplorerProps) {
  // Filter States
  const [search, setSearch] = useState<string>('');
  const [filterSeksi, setFilterSeksi] = useState<string>('ALL');
  const [filterJenis, setFilterJenis] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'MAINTAINED' | 'UNMAINTAINED'>('ALL');
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

  // Extract distinct jenis options matching the master catalog for the active seksi
  const availableJenis = useMemo(() => {
    const currentSeksi = (isSeksiUser || seksi) ? (seksi || units[0]?.seksi) : (filterSeksi !== 'ALL' ? filterSeksi : undefined);
    const masterTypes = getSectionDaishaList(currentSeksi);
    const s = new Set<string>(masterTypes);

    // Only include unit types matching the active seksi
    const relevantUnits = currentSeksi && currentSeksi.toLowerCase() !== 'all seksi'
      ? units.filter((u) => (u.seksi || '').toLowerCase() === currentSeksi.toLowerCase())
      : units;

    relevantUnits.forEach((u) => {
      if (u.nama_daisha) {
        s.add(u.nama_daisha);
      } else if (u.jenis) {
        if (u.jenis === 'VERTICAL') s.add('Vertical');
        else if (u.jenis === 'GT_RING') s.add('GT Ring');
        else s.add(u.jenis.replace(/_/g, ' '));
      }
    });

    return Array.from(s).sort();
  }, [isSeksiUser, seksi, filterSeksi, units]);

  // Filtered Units
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      // Filter Seksi
      if (filterSeksi !== 'ALL' && (u.seksi || 'All seksi') !== filterSeksi) return false;

      // Filter Jenis (normalized comparison so "GT Ring" matches "GT_RING", "Vertical" matches "VERTICAL", etc.)
      if (filterJenis !== 'ALL') {
        const normFilter = filterJenis.toLowerCase().replace(/[\s\-_]/g, '');
        const normJenis = (u.jenis || '').toLowerCase().replace(/[\s\-_]/g, '');
        const normNama = (u.nama_daisha || '').toLowerCase().replace(/[\s\-_]/g, '');
        if (normJenis !== normFilter && normNama !== normFilter) return false;
      }

      // Filter Status PM
      if (filterStatus === 'MAINTAINED' && !u.is_maintained) return false;
      if (filterStatus === 'UNMAINTAINED' && u.is_maintained) return false;

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
  }, [units, filterSeksi, filterJenis, filterStatus, search]);

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
    let clean = jenis;
    if (jenis === 'VERTICAL') clean = 'Vertical';
    else if (jenis === 'GT_RING') clean = 'GT Ring';
    else if (jenis === 'NAGARA_FILTER' || jenis === 'NAGARA_FILLER') clean = 'Nagara Filter';
    else clean = jenis.replace(/_/g, ' ');

    if (ukuran && ukuran !== 'NONE') {
      return `${clean} (${ukuran})`;
    }
    return clean;
  };

  const cleanNomorDaisha = (raw: string) => {
    // Normalisasi triple-dash database seperti B/P---0001 menjadi B/P-0001
    return raw.replace(/---+/g, '-').replace(/--+/g, '-');
  };

  const handleExportCsv = () => {
    if (filteredUnits.length === 0) return;

    const headers = [
      'No. Daisha',
      'Jenis Daisha',
      'Ukuran',
      'Seksi',
      `Status PM ${currentYear}`,
      'Terakhir Maintenance',
      'Status Staging',
      'Lokasi Staging',
      'Jadwal Masuk Bengkel',
      'Jadwal Keluar Bengkel',
    ];

    const rows = filteredUnits.map((u) => {
      const cleanNomor = cleanNomorDaisha(u.nomor_daisha);
      const stagingInfo = stagedUnitMap?.get(u.nomor_daisha.toUpperCase());
      const statusPM = u.is_maintained ? 'Sudah PM' : 'Belum PM';
      const statusStaging = stagingInfo ? 'Di Staging' : '-';
      const lokasiStaging = stagingInfo ? stagingInfo.lokasi : '-';
      const tglMaint = u.last_maintenance_date ? formatDate(u.last_maintenance_date) : '-';
      const tglMasuk = u.last_waktu_masuk ? formatDate(u.last_waktu_masuk) : '-';
      const tglKeluar = u.last_waktu_keluar ? formatDate(u.last_waktu_keluar) : '-';

      return [
        `"${cleanNomor}"`,
        `"${u.jenis || '-'}"`,
        `"${u.ukuran || 'Standar'}"`,
        `"${u.seksi || '-'}"`,
        `"${statusPM}"`,
        `"${tglMaint}"`,
        `"${statusStaging}"`,
        `"${lokasiStaging}"`,
        `"${tglMasuk}"`,
        `"${tglKeluar}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const targetName = `raw_data_armada_${seksi || (filterSeksi !== 'ALL' ? filterSeksi : 'all')}`;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `${targetName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              Daftar lengkap armada Daisha di pabrik beserta status pemeliharaan berkala tahun {currentYear}
            </p>
          </div>

          {/* Action Toolbar: Export Raw Data & View Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap self-end lg:self-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-8 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs"
              title="Unduh seluruh data armada yang sedang terfilter ke file CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span>Export Raw Data ({filteredUnits.length})</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
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
        </div>

        {/* 2. Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="Cari nomor daisha (mis: S-001, NF-05, M-10)..."
              className="w-full h-9 pl-8 pr-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
            />
          </div>

          {/* Filter Seksi: Terkunci Khusus untuk User Seksi agar tidak bercampur */}
          {(isSeksiUser || Boolean(seksi)) ? (
            <div className="lg:col-span-3">
              <div className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Armada Seksi {seksi || units[0]?.seksi || 'Khusus'}</span>
              </div>
            </div>
          ) : (
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
          )}

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
                <button
                  type="button"
                  key={u.id}
                  onClick={() => onSelectUnit(u)}
                  aria-label={`Pilih unit Daisha ${cleanNomor}, jenis ${u.jenis}, ${isMaintained ? 'sudah PM' : 'belum PM'}`}
                  className={`p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between gap-2.5 text-left w-full hover:shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                    isMaintained
                      ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {/* Top: Nomor & Status PM Chip */}
                  <div className="flex items-start justify-between gap-1 w-full">
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
                  <div className="text-xs text-slate-700 truncate font-medium w-full">
                    {formatJenisLabel(u.jenis, u.ukuran)}
                  </div>

                  {/* Bottom: Seksi & Timestamp */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs w-full">
                    <span className="font-semibold text-slate-700">
                      {u.seksi ? `Seksi ${u.seksi}` : 'Pabrik'}
                    </span>

                    <span className="text-slate-600 tabular-nums">
                      {u.last_maintenance_date
                        ? new Date(u.last_maintenance_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Belum PM'}
                    </span>
                  </div>
                </button>
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
                  {(!isSeksiUser && !seksi) && (
                    <th className="py-3 px-3.5">Seksi</th>
                  )}
                  <th className="py-3 px-3.5">Status PM {currentYear}</th>
                  <th className="py-3 px-3.5">Terakhir Maintenance</th>
                  <th className="py-3 px-3.5">Jadwal Masuk / Keluar</th>
                  <th className="py-3 px-3.5 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedUnits.map((u) => {
                  const cleanNomor = cleanNomorDaisha(u.nomor_daisha);
                  const cleanUpper = u.nomor_daisha.toUpperCase();
                  const stagingInfo = stagedUnitMap?.get(cleanUpper);

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
                      {(!isSeksiUser && !seksi) && (
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            <Building2 className="w-3 h-3 text-red-600" aria-hidden="true" />
                            <span>{u.seksi || 'Pabrik'}</span>
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-3.5">
                        {u.is_maintained ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sudah PM</span>
                          </span>
                        ) : stagingInfo ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>Di Staging</span>
                            </span>
                            <p className="text-[10px] text-red-600 font-medium flex items-center gap-1 truncate max-w-[170px]" title={stagingInfo.lokasi}>
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{stagingInfo.lokasi}</span>
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Belum PM</span>
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
                            title="Lihat spesifikasi dan riwayat armada ini"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Detail</span>
                          </button>

                          {/* Jika tim Workshop/Bengkel, sediakan Catat PM */}
                          {!isSeksiUser && (
                            <button
                              type="button"
                              onClick={() => onQuickInput(u)}
                              className="min-h-[36px] sm:min-h-0 h-7 px-2.5 bg-slate-900 hover:bg-black text-white rounded-md font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Catat PM</span>
                            </button>
                          )}
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
