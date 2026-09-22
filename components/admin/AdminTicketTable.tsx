'use client';

import React, { useState, useMemo } from 'react';
import { Ticket } from '@/types/ticket';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';
import { DAFTAR_SEKSI, getDaishaBySeksi, DAFTAR_SEMUA_DAISHA } from '@/lib/masterData';
import { SortOption, SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';
import PaginationControl from '@/components/common/PaginationControl';
import StatusBadge from '@/components/common/StatusBadge';
import QrScannerModal from '@/components/input/QrScannerModal';
import { matchesAgingFilter } from '@/lib/date';
import {
  ClipboardList,
  Wrench,
  Search,
  RotateCcw,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Trash2,
  ScanLine,
  Clock,
} from 'lucide-react';

interface AdminTicketTableProps {
  tickets: Ticket[];
  loading: boolean;
  filterTab: 'all' | 'Open' | 'Progress' | 'Done' | 'Scrap';
  onSelectTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onTagTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  isProcessing: boolean;
}

function AdminTicketTableComponent({
  tickets,
  loading,
  filterTab,
  onSelectTicket,
  onEditTicket,
  onTagTicket,
  onDeleteTicket,
  isProcessing,
}: AdminTicketTableProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('input_desc');
  const [selectedSeksi, setSelectedSeksi] = useState<string>('all');
  const [selectedDaisha, setSelectedDaisha] = useState<string>('all');
  const [selectedAging, setSelectedAging] = useState<string>('all');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Pagination State (10 / 20 / 30 / dst)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Dynamic dropdown options
  const seksiList = useMemo(() => {
    const fromMaster = DAFTAR_SEKSI.filter((s) => s.toLowerCase() !== 'all');
    const fromData = Array.from(new Set(tickets.map((t) => t.seksi).filter(Boolean)));
    const merged = Array.from(new Set([...fromMaster, ...fromData]));
    return merged.sort((a, b) => a.localeCompare(b));
  }, [tickets]);

  const daishaList = useMemo(() => {
    if (selectedSeksi !== 'all') {
      const fromMaster = getDaishaBySeksi(selectedSeksi);
      const fromData = Array.from(
        new Set(
          tickets
            .filter((t) => t.seksi?.toLowerCase() === selectedSeksi.toLowerCase())
            .map((t) => t.namaDaisha)
            .filter(Boolean)
        )
      );
      return Array.from(new Set([...fromMaster, ...fromData])).sort((a, b) =>
        a.localeCompare(b)
      );
    }
    const fromData = Array.from(new Set(tickets.map((t) => t.namaDaisha).filter(Boolean)));
    return Array.from(new Set([...DAFTAR_SEMUA_DAISHA, ...fromData])).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [tickets, selectedSeksi]);

  // Handle barcode/QR scan success
  const handleScanSuccess = (decoded: string) => {
    setIsQrScannerOpen(false);
    const cleaned = decoded.trim().toUpperCase();
    setSearch(cleaned);
    setCurrentPage(1);

    // Otomatis buka modal proses tindakan jika ditemukan tiket aktif
    const matchedTicket = tickets.find(
      (t) =>
        (t.noDaisha?.toUpperCase() === cleaned ||
          t.idTiketAsli?.toUpperCase() === cleaned ||
          t.noTiket?.toUpperCase() === cleaned) &&
        (t.status === 'Open' || t.status === 'Progress')
    );

    if (matchedTicket) {
      onSelectTicket(matchedTicket);
    }
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearch('');
    setSelectedSeksi('all');
    setSelectedDaisha('all');
    setSelectedAging('all');
    setSortBy('input_desc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedSeksi !== 'all' ||
    selectedDaisha !== 'all' ||
    selectedAging !== 'all' ||
    sortBy !== 'input_desc';

  // Toggle table header sorting
  const toggleSort = (ascOption: SortOption, descOption: SortOption) => {
    if (sortBy === descOption) {
      setSortBy(ascOption);
    } else {
      setSortBy(descOption);
    }
    setCurrentPage(1);
  };

  // Helper sort icon in header
  const getSortIcon = (ascOption: SortOption, descOption: SortOption) => {
    if (sortBy === descOption) {
      return <ArrowDown className="w-3 h-3 text-red-600 inline-block shrink-0" />;
    }
    if (sortBy === ascOption) {
      return <ArrowUp className="w-3 h-3 text-red-600 inline-block shrink-0" />;
    }
    return <ArrowUpDown className="w-3 h-3 text-slate-400 inline-block shrink-0" />;
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    const list = tickets.filter((t) => {
      // 1. Status Filter Tab
      if (filterTab === 'Open' && t.status !== 'Open' && t.status !== 'Progress') return false;
      if (filterTab === 'Done' && t.status !== 'Done') return false;
      if (filterTab === 'Scrap' && t.status !== 'Scrap') return false;

      // 2. Seksi Asal Filter
      if (
        selectedSeksi !== 'all' &&
        t.seksi?.toLowerCase() !== selectedSeksi.toLowerCase()
      ) {
        return false;
      }

      // 3. Jenis Daisha Filter
      if (
        selectedDaisha !== 'all' &&
        t.namaDaisha?.toLowerCase() !== selectedDaisha.toLowerCase()
      ) {
        return false;
      }

      // 4. Durasi Menginap (Aging) Filter
      if (!matchesAgingFilter(t.tglMasuk, selectedAging)) {
        return false;
      }

      // 5. Search Text Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.noDaisha?.toLowerCase().includes(q) ||
          t.namaDaisha?.toLowerCase().includes(q) ||
          t.pelapor?.toLowerCase().includes(q) ||
          t.detail?.toLowerCase().includes(q) ||
          t.jenisKerusakan?.toLowerCase().includes(q) ||
          t.seksi?.toLowerCase().includes(q) ||
          t.idTiketAsli?.toLowerCase().includes(q) ||
          t.noTiket?.toLowerCase().includes(q)
        );
      }

      return true;
    });

    return sortTickets(list, sortBy);
  }, [tickets, filterTab, selectedSeksi, selectedDaisha, selectedAging, search, sortBy]);

  // Paginated tickets
  const totalPages =
    itemsPerPage === -1 ? 1 : Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const paginatedTickets = useMemo(() => {
    if (itemsPerPage === -1) return filteredTickets;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, startIndex, itemsPerPage]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
      {/* Header Info */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-700" />
            <span>Daftar Tiket Antrean Bengkel (Raw Data)</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-normal">
            Menampilkan {paginatedTickets.length} dari {filteredTickets.length} tiket (
            {filterTab === 'all' ? 'Semua Status' : filterTab})
          </span>
        </div>
      </div>

      {/* Toolbar Filter & Kontrol */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/30 space-y-3">
        {/* Filter Baris 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label htmlFor="admin-filter-seksi" className="block text-[11px] font-medium text-slate-600 mb-1">
              Seksi Asal
            </label>
            <select
              id="admin-filter-seksi"
              value={selectedSeksi}
              onChange={(e) => {
                setSelectedSeksi(e.target.value);
                setSelectedDaisha('all');
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Seksi ({tickets.length})</option>
              {seksiList.map((s) => {
                const count = tickets.filter((t) => t.seksi?.toLowerCase() === s.toLowerCase()).length;
                return (
                  <option key={s} value={s}>
                    {s} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="admin-filter-daisha" className="block text-[11px] font-medium text-slate-600 mb-1">
              Jenis Daisha
            </label>
            <select
              id="admin-filter-daisha"
              value={selectedDaisha}
              onChange={(e) => {
                setSelectedDaisha(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">
                {selectedSeksi !== 'all' ? `Semua Jenis (${selectedSeksi})` : 'Semua Jenis Daisha'}
              </option>
              {daishaList.map((d) => {
                const count = tickets.filter((t) => {
                  const matchSeksi =
                    selectedSeksi === 'all' ||
                    t.seksi?.toLowerCase() === selectedSeksi.toLowerCase();
                  return matchSeksi && t.namaDaisha?.toLowerCase() === d.toLowerCase();
                }).length;
                return (
                  <option key={d} value={d}>
                    {d} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="admin-filter-aging" className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Durasi Menginap</span>
            </label>
            <select
              id="admin-filter-aging"
              value={selectedAging}
              onChange={(e) => {
                setSelectedAging(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Durasi</option>
              <option value="today">Hari Ini (&lt; 24 Jam)</option>
              <option value="overdue">Menginap (&ge; 24 Jam)</option>
              <option value="critical">Tertunda Lama (&ge; 3 Hari)</option>
            </select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="w-full h-8 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                title="Kembalikan semua filter ke default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            ) : (
              <div className="w-full h-8 px-3 text-[11px] text-slate-400 font-normal flex items-center justify-center select-none">
                Filter Standar
              </div>
            )}
          </div>
        </div>

        {/* Filter Baris 2: Search + Scan Barcode Kamera, Sort, Items per page */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Ketik No Daisha (Cth: M00287) / Cari Tiket / Pelapor..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-8 pl-8 pr-7 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none placeholder:text-slate-400 shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 w-4 h-4 rounded-full flex items-center justify-center text-xs transition cursor-pointer"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              title="Scan Barcode / QR Tag Fisik Daisha dengan Kamera"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label htmlFor="admin-sort-select" className="text-[11px] text-slate-500 shrink-0 font-medium">
                Urutkan:
              </label>
              <select
                id="admin-sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="admin-per-page-select" className="text-[11px] text-slate-500 shrink-0 font-medium">
                Tampilkan:
              </label>
              <select
                id="admin-per-page-select"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
              >
                <option value={10}>10 baris</option>
                <option value={20}>20 baris</option>
                <option value={30}>30 baris</option>
                <option value={50}>50 baris</option>
                <option value={100}>100 baris</option>
                <option value={-1}>Semua ({filteredTickets.length})</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tampilan Mobile: Kartu Tiket Admin Responsif */}
      <div className="divide-y divide-slate-100 md:hidden">
        {loading && !tickets.length ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-slate-50 border border-slate-200 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium text-xs">
            Tidak ada tiket yang sesuai kriteria.
          </div>
        ) : (
          paginatedTickets.map((t) => {
            const parsed = parseTicketDamageDetail(t.detail);
            const sizeInfo = detectDaishaSize(t.noDaisha);

            return (
              <div key={t.id} className="p-4 bg-white hover:bg-slate-50/60 transition space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      #{t.idTiketAsli || t.noTiket}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-slate-900">{t.noDaisha}</span>
                      {sizeInfo && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                          title={sizeInfo.description}
                        >
                          {sizeInfo.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                {/* Nama Daisha & Seksi */}
                <div className="text-xs font-medium text-slate-700 flex items-center gap-2 flex-wrap">
                  <span className="text-slate-900 font-semibold">{t.namaDaisha}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-normal">{t.seksi}</span>
                </div>

                {/* Kerusakan */}
                <div className="border-l-2 border-slate-200 pl-3 py-1 space-y-1">
                  <div className="text-[11px] font-medium text-slate-500 mb-0.5 uppercase tracking-wider">
                    Rincian Kerusakan:
                  </div>
                  {parsed.isWaitingDiagnosis ? (
                    <div className="space-y-1 py-0.5">
                      <span className="text-[11px] font-medium text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Search className="w-3 h-3 text-amber-800" />
                        <span>Menunggu Diagnosa</span>
                      </span>
                      <p className="text-[11px] text-slate-600 font-normal">
                        {parsed.catatan ? `Gejala: ${parsed.catatan}` : 'Kerusakan belum diidentifikasi di lapangan'}
                      </p>
                    </div>
                  ) : parsed.items.length > 0 ? (
                    <div className="space-y-1">
                      {parsed.items.map((it, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-1.5 text-xs py-0.5">
                          <div className="flex items-center gap-1.5 leading-relaxed text-slate-700 flex-wrap">
                            {it.komponen && it.komponen !== 'Umum' && (
                              <span className="font-semibold text-slate-900">{it.komponen}:</span>
                            )}
                            <span className="text-slate-700">{it.gejala.replace(/^[•\s-]+/, '')}</span>
                            {it.qty > 1 && (
                              <span className="text-slate-500 font-medium tabular-nums text-[11px]">
                                ({it.qty}x)
                              </span>
                            )}
                          </div>
                          {it.tindakan && (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${
                                it.tindakan === 'Ganti'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                              }`}
                            >
                              {it.tindakan}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-slate-800 text-xs">{t.jenisKerusakan || 'Kerusakan umum'}</div>
                      <div className="text-xs text-slate-500">{t.detail}</div>
                    </div>
                  )}
                  {parsed.catatan && !parsed.isWaitingDiagnosis && (
                    <div className="text-[11px] text-amber-800 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>Posisi: {parsed.catatan}</span>
                    </div>
                  )}
                  {t.reason && t.reason !== '-' && t.reason.trim() !== '' && (
                    <p className="text-[11px] text-emerald-800 mt-1 font-normal">Catatan: {t.reason}</p>
                  )}
                </div>

                {/* Info Pelapor & Waktu */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-1">
                  <div>
                    <span>Pelapor: </span>
                    <strong className="text-slate-700 font-semibold">{t.pelapor}</strong>
                  </div>
                  <div className="text-xs">
                    <span>Masuk: {t.tglMasuk}</span>
                    {t.tglKeluar && <span> • Selesai: {t.tglKeluar}</span>}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  {parsed.isWaitingDiagnosis && t.status !== 'Done' && t.status !== 'Scrap' && (
                    <button
                      onClick={() => onEditTicket(t)}
                      className="h-8 px-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Diagnosa & Input Titik Kerusakan di Bengkel"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Diagnosa</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectTicket(t)}
                    className="flex-1 h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Proses</span>
                  </button>
                  <button
                    onClick={() => onTagTicket(t)}
                    className="h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1"
                    title="Cetak Tag Fisik Daisha"
                  >
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tag</span>
                  </button>
                  <button
                    onClick={() => onDeleteTicket(t)}
                    disabled={isProcessing}
                    className="h-8 w-8 bg-white hover:bg-rose-50 text-rose-600 hover:border-rose-200 border border-slate-200 text-xs font-medium rounded-lg shadow-2xs transition disabled:opacity-50 cursor-pointer flex items-center justify-center"
                    title="Hapus Tiket"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tampilan Desktop: Tabel Tiket Sederhana & Lengkap (8 Kolom: Tiket, No, Nama, Seksi, Kerusakan, Pelapor, Status, Aksi) */}
      <div className="overflow-x-auto flex-1 hidden md:block">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/80 select-none">
              <th scope="col" className="py-3 px-3.5">
                Tiket
              </th>
              <th scope="col" className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('unit_asc', 'unit_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  title="Klik untuk urutkan nomor unit daisha"
                >
                  <span>No</span>
                  {getSortIcon('unit_asc', 'unit_desc')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('daisha_asc', 'daisha_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  title="Klik untuk urutkan nama daisha"
                >
                  <span>Nama</span>
                  {getSortIcon('daisha_asc', 'daisha_desc')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('seksi_asc', 'seksi_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  title="Klik untuk urutkan seksi asal"
                >
                  <span>Seksi</span>
                  {getSortIcon('seksi_asc', 'seksi_desc')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5">
                Kerusakan
              </th>
              <th scope="col" className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('pelapor_asc', 'pelapor_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  title="Klik untuk urutkan nama pelapor"
                >
                  <span>Pelapor</span>
                  {getSortIcon('pelapor_asc', 'pelapor_desc')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5 text-center">
                Status
              </th>
              <th scope="col" className="py-3 px-3.5 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && !tickets.length ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-3 px-4 text-center text-slate-400 font-medium">
                    Memuat data tiket perbaikan...
                  </td>
                </tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                  Tidak ada tiket yang sesuai kriteria.
                </td>
              </tr>
            ) : (
              paginatedTickets.map((t) => {
                const parsed = parseTicketDamageDetail(t.detail);
                const sizeInfo = detectDaishaSize(t.noDaisha);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3.5 font-mono font-medium text-slate-600 text-xs tabular-nums">
                      #{t.idTiketAsli || t.noTiket}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-xs">
                        <span>{t.noDaisha}</span>
                        {sizeInfo && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                            title={sizeInfo.description}
                          >
                            {sizeInfo.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-800 text-xs">
                      {t.namaDaisha}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                        {t.seksi}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 min-w-[260px] max-w-sm whitespace-normal">
                      {(() => {
                        if (parsed.items.length > 0) {
                          return (
                            <div className="space-y-1.5 py-0.5">
                              {parsed.items.map((it, i) => (
                                <div
                                  key={i}
                                  className="flex items-start justify-between gap-2 text-xs leading-relaxed"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                    {it.komponen && it.komponen !== 'Umum' && (
                                      <span className="font-semibold text-slate-900">
                                        {it.komponen}:
                                      </span>
                                    )}
                                    <span className="text-slate-700">{it.gejala.replace(/^[•\s-]+/, '')}</span>
                                    {it.qty > 1 && (
                                      <span className="text-slate-500 font-medium tabular-nums text-[11px]">
                                        ({it.qty}x)
                                      </span>
                                    )}
                                  </div>
                                  {it.tindakan && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${
                                        it.tindakan === 'Ganti'
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                      }`}
                                    >
                                      {it.tindakan}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {parsed.catatan && (
                                <div className="text-[11px] text-amber-800 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>Posisi: {parsed.catatan}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (parsed.isWaitingDiagnosis) {
                          return (
                            <div className="space-y-1 py-0.5">
                              <span className="text-[11px] font-medium text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <Search className="w-3 h-3 text-amber-800" />
                                <span>Menunggu Diagnosa</span>
                              </span>
                              <p className="text-[11px] text-slate-600 font-normal">
                                {parsed.catatan ? `Gejala: ${parsed.catatan}` : 'Kerusakan belum diidentifikasi di lapangan'}
                              </p>
                            </div>
                          );
                        }
                        return (
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">{t.jenisKerusakan || 'Kerusakan umum'}</span>
                            <span className="text-[11px] text-slate-600">{t.detail && t.detail !== '-' ? t.detail : '-'}</span>
                          </div>
                        );
                      })()}
                      {t.reason && t.reason !== '-' && t.reason.trim() !== '' && (
                        <p className="text-[11px] text-emerald-800 mt-1 font-normal">
                          Catatan: {t.reason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 text-xs">
                      <div className="font-medium text-slate-900">{t.pelapor || '-'}</div>
                      <div className="text-[11px] text-slate-400 font-normal tabular-nums">{t.tglMasuk || '-'}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectTicket(t)}
                          className="h-7 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Proses / Update Tindakan Tiket"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Proses</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onTagTicket(t)}
                          className="h-7 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Cetak Tag Fisik Daisha"
                        >
                          <Tag className="w-3 h-3 text-slate-500" />
                          <span>Tag</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTicket(t)}
                          disabled={isProcessing}
                          className="h-7 w-7 flex items-center justify-center bg-white hover:bg-rose-50 text-rose-600 hover:border-rose-200 border border-slate-200 rounded-md text-[11px] transition cursor-pointer disabled:opacity-50 shadow-2xs"
                          title="Hapus Tiket"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                        </button>
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
      {totalPages > 1 && (
        <div className="p-3 sm:p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 font-normal">
            Halaman {currentPage} dari {totalPages} ({filteredTickets.length} total tiket)
          </span>
          <PaginationControl
            currentPage={currentPage}
            totalItems={filteredTickets.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            variant="plain"
            showItemsPerPage={false}
          />
        </div>
      )}

      {/* Modal Scanner Kamera Barcode / QR Daisha Fisik */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={(err) => console.warn('[Admin Scanner Error]:', err)}
      />
    </div>
  );
}

export default React.memo(AdminTicketTableComponent);
