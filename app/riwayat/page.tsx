'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Ticket } from '@/types/ticket';
import { useTickets } from '@/hooks/useTickets';
import DetailTicketModal from '@/components/riwayat/DetailTicketModal';
import RiwayatTicketCard from '@/components/riwayat/RiwayatTicketCard';
import QueueKanbanBoard from '@/components/riwayat/QueueKanbanBoard';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import PaginationControl from '@/components/common/PaginationControl';
import { useAuth } from '@/context/AuthContext';
import { detectDaishaSize } from '@/lib/daishaSize';
import { matchesAgingFilter } from '@/lib/date';
import { DAFTAR_SEKSI, getDaishaBySeksi, DAFTAR_SEMUA_DAISHA } from '@/lib/masterData';
import { SortOption, SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  RefreshCw, 
  Columns3, 
  ListFilter, 
  Eye, 
  Search, 
  X,
  History,
  Activity,
  RotateCcw,
  CheckCircle2,
  ClipboardList,
  Wrench,
  ArrowUpDown,
  Inbox,
  FileText,
  Clock
} from 'lucide-react';

export default function RiwayatLaporanPage() {
  const { isAdmin } = useAuth();
  const { tickets, loading, refresh, setTickets } = useTickets();

  // View Mode: 'kanban' (default) atau 'list'
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Done' | 'Scrap'>('all');
  const [selectedSeksi, setSelectedSeksi] = useState<string>('all');
  const [selectedDaisha, setSelectedDaisha] = useState<string>('all');
  const [selectedAging, setSelectedAging] = useState<string>('all');

  // Sorting State (Default: Input Terbaru)
  const [sortBy, setSortBy] = useState<SortOption>('input_desc');

  // Pagination State (Default: 10 data)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal Detail State (Cross-check)
  const [ticketForDetail, setTicketForDetail] = useState<Ticket | null>(null);

  // Modal Cetak Tag Fisik Langsung
  const [ticketForTag, setTicketForTag] = useState<Ticket | null>(null);

  // Daftar Seksi yang tersedia (Master data + Tiket)
  const seksiList = useMemo(() => {
    const fromMaster = DAFTAR_SEKSI.filter((s) => s.toLowerCase() !== 'all seksi');
    const fromTickets = tickets.map((t) => t.seksi).filter(Boolean);
    return Array.from(new Set([...fromMaster, ...fromTickets])).sort();
  }, [tickets]);

  // Daftar Jenis Daisha yang tersedia (dinamis menyesuaikan jika Seksi dipilih)
  const daishaList = useMemo(() => {
    if (selectedSeksi !== 'all') {
      const bySeksi = getDaishaBySeksi(selectedSeksi);
      const fromTickets = tickets
        .filter((t) => t.seksi?.toLowerCase() === selectedSeksi.toLowerCase())
        .map((t) => t.namaDaisha)
        .filter(Boolean);
      return Array.from(new Set([...bySeksi, ...fromTickets])).sort();
    }
    const fromTickets = tickets.map((t) => t.namaDaisha).filter(Boolean);
    return Array.from(new Set([...DAFTAR_SEMUA_DAISHA, ...fromTickets])).sort();
  }, [selectedSeksi, tickets]);

  const hasActiveFilters =
    selectedSeksi !== 'all' ||
    selectedDaisha !== 'all' ||
    selectedAging !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'input_desc' ||
    Boolean(search.trim());

  const resetAllFilters = () => {
    setSelectedSeksi('all');
    setSelectedDaisha('all');
    setSelectedAging('all');
    setStatusFilter('all');
    setSortBy('input_desc');
    setSearch('');
    setCurrentPage(1);
  };

  // Statistik Dinamis berdasarkan filter saat ini
  const counts = useMemo(() => {
    const scopedTickets = tickets.filter((t) => {
      if (selectedSeksi !== 'all' && t.seksi?.toLowerCase() !== selectedSeksi.toLowerCase()) {
        return false;
      }
      if (selectedDaisha !== 'all' && t.namaDaisha?.toLowerCase() !== selectedDaisha.toLowerCase()) {
        return false;
      }
      if (!matchesAgingFilter(t.tglMasuk, selectedAging)) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        t.noDaisha?.toLowerCase().includes(q) ||
        t.namaDaisha?.toLowerCase().includes(q) ||
        t.seksi?.toLowerCase().includes(q) ||
        t.pelapor?.toLowerCase().includes(q) ||
        t.detail?.toLowerCase().includes(q) ||
        t.idTiketAsli?.toLowerCase().includes(q)
      );
    });

    const openOnly = scopedTickets.filter((t) => t.status === 'Open').length;
    const progressOnly = scopedTickets.filter((t) => t.status === 'Progress').length;
    const doneOnly = scopedTickets.filter((t) => t.status === 'Done').length;
    const scrapOnly = scopedTickets.filter((t) => t.status === 'Scrap').length;

    return {
      all: scopedTickets.length,
      open: openOnly + progressOnly,
      waiting: openOnly,
      inProgress: progressOnly,
      done: doneOnly,
      scrap: scrapOnly,
      activeInWorkshop: openOnly + progressOnly,
    };
  }, [tickets, selectedSeksi, selectedDaisha, selectedAging, search]);

  // Filter dan Pengurutan Data
  const filteredTickets = useMemo(() => {
    const list = tickets.filter((t) => {
      // 1. Status Filter
      if (statusFilter === 'Open') {
        if (t.status !== 'Open' && t.status !== 'Progress') return false;
      } else if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }

      // 2. Seksi Filter
      if (selectedSeksi !== 'all' && t.seksi?.toLowerCase() !== selectedSeksi.toLowerCase()) {
        return false;
      }

      // 3. Daisha Filter
      if (selectedDaisha !== 'all' && t.namaDaisha?.toLowerCase() !== selectedDaisha.toLowerCase()) {
        return false;
      }

      // 4. Durasi Menginap (Aging) Filter
      if (!matchesAgingFilter(t.tglMasuk, selectedAging)) {
        return false;
      }

      // 5. Pencarian Cepat
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        t.noDaisha?.toLowerCase().includes(q) ||
        t.namaDaisha?.toLowerCase().includes(q) ||
        t.seksi?.toLowerCase().includes(q) ||
        t.pelapor?.toLowerCase().includes(q) ||
        t.detail?.toLowerCase().includes(q) ||
        t.idTiketAsli?.toLowerCase().includes(q)
      );
    });

    return sortTickets(list, sortBy);
  }, [tickets, statusFilter, selectedSeksi, selectedDaisha, selectedAging, search, sortBy]);

  // Reset ke halaman 1 saat filter atau itemsPerPage berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets.length, sortBy, itemsPerPage]);

  // Data Pagination untuk tampilan List
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto pb-24 md:pb-8">
      <div className="w-full space-y-4">
        {/* 1. Header Utama */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/daisha"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Pelacakan & Antrean Daisha
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                Pelacakan unit & live antrean status pengerjaan bengkel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle View Mode */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Papan Antrean Kanban"
              >
                <Columns3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Daftar Tabel"
              >
                <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                <span>Tabel</span>
              </button>
            </div>

            <Link
              href="/input"
              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lapor Rusak</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Panel Admin</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              title="Refresh antrean"
              className="h-8 w-8 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition disabled:opacity-50 cursor-pointer border border-slate-300 shadow-2xs flex items-center justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Indikator Antrean (KPI Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-amber-700">Menunggu</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.waiting} <span className="text-xs font-normal text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Clock className="w-4 h-4" />
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-blue-700">Dikerjakan</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.inProgress} <span className="text-xs font-normal text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
              <Wrench className="w-4 h-4" />
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-emerald-700">Siap Ambil</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.done} <span className="text-xs font-normal text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500">Total Antrean</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.activeInWorkshop} <span className="text-xs font-normal text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* 5. Filter & Pencarian */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Filter Seksi */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Seksi
              </label>
              <select
                value={selectedSeksi}
                onChange={(e) => {
                  setSelectedSeksi(e.target.value);
                  setSelectedDaisha('all');
                }}
                className="w-full h-8 px-2.5 border border-slate-300 rounded-md text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer transition"
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

            {/* Filter Jenis Daisha */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Jenis Daisha
              </label>
              <select
                value={selectedDaisha}
                onChange={(e) => setSelectedDaisha(e.target.value)}
                className="w-full h-8 px-2.5 border border-slate-300 rounded-md text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer transition"
              >
                <option value="all">
                  {selectedSeksi !== 'all' ? `Semua Jenis (${selectedSeksi})` : 'Semua Jenis'}
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

            {/* Filter Durasi Menginap */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Durasi Menginap</span>
              </label>
              <select
                value={selectedAging}
                onChange={(e) => setSelectedAging(e.target.value)}
                className="w-full h-8 px-2.5 border border-slate-300 rounded-md text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer transition"
              >
                <option value="all">Semua Durasi</option>
                <option value="today">Hari Ini (&lt; 24 Jam)</option>
                <option value="overdue">Menginap (&ge; 24 Jam)</option>
                <option value="critical">Tertunda Lama (&ge; 3 Hari)</option>
              </select>
            </div>

            {/* Tombol Reset Filter */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="w-full h-8 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              ) : (
                <div className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-400 font-normal flex items-center justify-center select-none">
                  Default
                </div>
              )}
            </div>
          </div>

          {/* Search Box & Sort (Sort hanya muncul di List mode) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari tiket, seksi, atau pelapor..."
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-normal placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {viewMode === 'list' && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="text-slate-500 font-medium">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-white font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="text-slate-500 font-medium">Tampilkan:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                  >
                    <option value={10}>10 data</option>
                    <option value={20}>20 data</option>
                    <option value={30}>30 data</option>
                    <option value={50}>50 data</option>
                    <option value={-1}>Semua ({filteredTickets.length})</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Konten Utama: Papan Antrean Kanban ATAU Daftar Tabel */}
        {loading && tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat status antrean...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-200 p-6 shadow-2xs">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">Tidak ada tiket laporan ditemukan</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {search
                ? `Tidak ada tiket yang cocok dengan kata kunci "${search}". Coba periksa ejaan atau bersihkan filter pencarian.`
                : selectedSeksi !== 'all'
                ? `Belum ada tiket laporan kerusakan aktif untuk seksi ${selectedSeksi}.`
                : 'Belum ada tiket laporan kerusakan dalam antrean bengkel saat ini.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            ) : (
              <Link
                href="/input"
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Buat Laporan Daisha Baru</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'kanban' ? (
          /* TAMPILAN 1: KANBAN LIVE QUEUE BOARD */
          <QueueKanbanBoard
            tickets={filteredTickets}
            onViewDetail={(t) => setTicketForDetail(t)}
            onPrintTag={(t) => setTicketForTag(t)}
          />
        ) : (
          /* TAMPILAN 2: DAFTAR KARTU / LIST */
          <div className="space-y-4">
            <div className="space-y-2.5">
              {paginatedTickets.map((ticket) => (
                <RiwayatTicketCard
                  key={ticket.idTiketAsli}
                  ticket={ticket}
                  onViewDetail={(t) => setTicketForDetail(t)}
                />
              ))}
            </div>

            {filteredTickets.length > 0 && (
              <PaginationControl
                currentPage={currentPage}
                totalItems={filteredTickets.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemLabel="tiket"
              />
            )}
          </div>
        )}
      </div>

      {/* Modal Detail Tiket (Tampilan Baca-Saja & Log Pemeriksaan) */}
      <DetailTicketModal
        isOpen={!!ticketForDetail}
        ticket={ticketForDetail}
        onClose={() => setTicketForDetail(null)}
      />

      {/* Modal Cetak Tag Fisik Daisha */}
      <PrintTicketTagModal
        isOpen={!!ticketForTag}
        ticket={
          ticketForTag
            ? {
                idTiket: String(ticketForTag.idTiketAsli || ticketForTag.noTiket || ticketForTag.id),
                noDaisha: ticketForTag.noDaisha,
                namaDaisha: ticketForTag.namaDaisha,
                seksi: ticketForTag.seksi,
                namaPelapor: ticketForTag.pelapor,
                waktuMasuk: ticketForTag.tglMasuk,
                status: ticketForTag.status,
                detail: ticketForTag.detail,
                catatanTeknisi: ticketForTag.reason,
              }
            : null
        }
        onClose={() => setTicketForTag(null)}
      />
    </div>
  );
}
