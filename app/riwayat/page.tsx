'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket } from '@/types/ticket';
import { useTickets } from '@/hooks/useTickets';
import DetailTicketModal from '@/components/riwayat/DetailTicketModal';
import RiwayatTicketCard from '@/components/riwayat/RiwayatTicketCard';
import QueueKanbanBoard from '@/components/riwayat/QueueKanbanBoard';
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
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function RiwayatLaporanPage() {
  const router = useRouter();
  const { isAdmin, isSeksi, isOperator, currentUser, isLoading: authLoading } = useAuth();
  const { tickets, loading, error, refresh, setTickets } = useTickets();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.replace('/admin');
    }
  }, [authLoading, isAdmin, router]);

  // View Mode: 'kanban' (default) atau 'list'
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Seksi terkunci untuk user role seksi
  const userSeksi = isSeksi && currentUser?.seksi ? currentUser.seksi : null;

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Progress' | 'Done' | 'Scrap'>('all');
  const [selectedSeksi, setSelectedSeksi] = useState<string>(() => userSeksi || 'all');
  const [selectedDaisha, setSelectedDaisha] = useState<string>('all');
  const [selectedAging, setSelectedAging] = useState<string>('all');

  useEffect(() => {
    if (userSeksi) {
      setSelectedSeksi(userSeksi);
    }
  }, [userSeksi]);

  // Sorting State (Default: Input Terbaru)
  const [sortBy, setSortBy] = useState<SortOption>('input_desc');

  // Pagination State (Default: 10 data)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal Detail State (Cross-check)
  const [ticketForDetail, setTicketForDetail] = useState<Ticket | null>(null);

  // Daftar Seksi yang tersedia (Master data + Tiket)
  const seksiList = useMemo(() => {
    if (userSeksi) return [userSeksi];
    const fromMaster = DAFTAR_SEKSI.filter((s) => s.toLowerCase() !== 'all seksi');
    const fromTickets = tickets.map((t) => t.seksi).filter(Boolean);
    return Array.from(new Set([...fromMaster, ...fromTickets])).sort();
  }, [tickets, userSeksi]);

  // Daftar Jenis Daisha yang tersedia (dinamis menyesuaikan jika Seksi dipilih)
  const daishaList = useMemo(() => {
    const activeSection = userSeksi || (selectedSeksi !== 'all' ? selectedSeksi : null);
    if (activeSection) {
      const bySeksi = getDaishaBySeksi(activeSection);
      const fromTickets = tickets
        .filter((t) => t.seksi?.toLowerCase() === activeSection.toLowerCase())
        .map((t) => t.namaDaisha)
        .filter(Boolean);
      return Array.from(new Set([...bySeksi, ...fromTickets])).sort();
    }
    const fromTickets = tickets.map((t) => t.namaDaisha).filter(Boolean);
    return Array.from(new Set([...DAFTAR_SEMUA_DAISHA, ...fromTickets])).sort();
  }, [selectedSeksi, userSeksi, tickets]);

  const hasActiveFilters =
    (!userSeksi && selectedSeksi !== 'all') ||
    selectedDaisha !== 'all' ||
    selectedAging !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'input_desc' ||
    Boolean(search.trim());

  const resetAllFilters = () => {
    setSelectedSeksi(userSeksi || 'all');
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
      if (statusFilter !== 'all') {
        if (t.status !== statusFilter) return false;
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

  // Data Pagination untuk tampilan List
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTickets = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, safeCurrentPage, itemsPerPage]);

  if (authLoading || isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Mengarahkan ke Panel Tindakan Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto pb-24 md:pb-8">
      <div className="w-full space-y-4">
        {/* 1. Page Header (Flat Layout) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-200">
          <div className="space-y-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Link
                href={isSeksi ? '/lapor-rusak' : '/input'}
                className="inline-flex items-center gap-1 font-medium hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isSeksi ? 'Lapor Rusak' : 'Input Teknisi'}</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900">
                {isOperator ? 'Tindakan Bengkel' : 'Antrean'}
              </span>
            </nav>
            <h1 className="t-title text-slate-900 tracking-tight">
              {isOperator ? 'Tindakan Bengkel' : 'Antrean Perbaikan'}
            </h1>
            <p className="t-caption text-slate-500">
              {isOperator
                ? 'Status pengerjaan servis, tindakan perbaikan, dan progres daisha di bengkel'
                : 'Status pengerjaan di bengkel'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle View Mode (Khusus Desktop) */}
            <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`h-10 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Kanban"
              >
                <Columns3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`h-10 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Tabel / Kartu"
              >
                <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                <span>Tabel</span>
              </button>
            </div>

            <Link
              href={isSeksi ? '/lapor-rusak' : '/input'}
              className="h-11 sm:h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSeksi ? 'Lapor Rusak' : 'Input Kerusakan'}</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="h-11 sm:h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Panel Admin</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              title="Refresh antrean"
              aria-label="Segarkan status antrean tiket"
              className="h-11 sm:h-10 px-3 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition disabled:opacity-50 cursor-pointer border border-slate-300 flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Error Recovery Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-sm text-red-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => refresh(false, true)}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition flex items-center justify-center"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Indikator Antrean (KPI Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700">Menunggu</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.waiting} <span className="text-xs font-medium text-slate-500">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Clock className="w-4 h-4" />
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Dikerjakan</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.inProgress} <span className="text-xs font-medium text-slate-500">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
              <Wrench className="w-4 h-4" />
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700">Siap Ambil</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.done} <span className="text-xs font-medium text-slate-500">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Antrean</p>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5 tabular-nums">{counts.activeInWorkshop} <span className="text-xs font-medium text-slate-500">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* 5. Filter & Pencarian */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Filter Seksi */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Seksi
              </label>
              {userSeksi ? (
                <div className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between select-none">
                  <span className="truncate">Seksi {userSeksi}</span>
                  <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                    Terkunci
                  </span>
                </div>
              ) : (
                <select
                  value={selectedSeksi}
                  onChange={(e) => {
                    setSelectedSeksi(e.target.value);
                    setSelectedDaisha('all');
                  }}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer transition"
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
              )}
            </div>

            {/* Filter Jenis Daisha */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jenis Daisha
              </label>
              <select
                value={selectedDaisha}
                onChange={(e) => setSelectedDaisha(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer transition"
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
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Durasi Menginap</span>
              </label>
              <select
                value={selectedAging}
                onChange={(e) => setSelectedAging(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer transition"
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
                  className="w-full h-10 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              ) : (
                <div className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 font-medium flex items-center justify-center select-none">
                  Default
                </div>
              )}
            </div>
          </div>

          {/* Search Box & Sort (Sort hanya muncul di List mode) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="relative flex-1 min-w-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <input
                id="riwayat-search"
                name="search"
                type="text"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari tiket, seksi, atau pelapor…"
                aria-label="Cari tiket, seksi, atau pelapor"
                className="w-full h-10 pl-8 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-normal placeholder-slate-400 focus:bg-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Bersihkan pencarian"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 rounded"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
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
                    className="h-10 bg-white font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
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
                    className="h-10 bg-white font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
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

        {/* 4. Tab Status Cepat Khusus Layar Mobile */}
        <div className="md:hidden flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs border border-slate-200">
          <button
            type="button"
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('Open'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition flex items-center gap-1.5 ${
              statusFilter === 'Open' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Antrean ({counts.waiting})</span>
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('Progress'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition flex items-center gap-1.5 ${
              statusFilter === 'Progress' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Diproses ({counts.inProgress})</span>
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('Done'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition flex items-center gap-1.5 ${
              statusFilter === 'Done' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Selesai ({counts.done})</span>
          </button>
        </div>

        {/* 5. Konten Utama: Papan Antrean Kanban ATAU Daftar Tabel */}
        {loading && tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2 bg-white rounded-xl border border-slate-200/80">
            <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat status antrean...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-200 p-6">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="t-card text-slate-900">Belum ada tiket</p>
            <p className="t-caption text-slate-500 mt-1 max-w-md mx-auto">
              Laporan baru akan muncul di sini.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 h-10 px-4 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            ) : (
              <Link
                href="/input"
                className="mt-3 inline-flex items-center gap-1.5 h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Lapor Rusak</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* TAMPILAN MOBILE: Selalu Daftar Kartu (RiwayatTicketCard) dengan scroll vertikal alami tanpa nested scroll */}
            <div className="md:hidden space-y-4">
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
                  currentPage={safeCurrentPage}
                  totalItems={filteredTickets.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                  itemLabel="tiket"
                />
              )}
            </div>

            {/* TAMPILAN DESKTOP: Kanban Board atau Daftar Tabel Kompak */}
            <div className="hidden md:block">
              {viewMode === 'kanban' ? (
                <QueueKanbanBoard
                  tickets={filteredTickets}
                  onViewDetail={(t) => setTicketForDetail(t)}
                />
              ) : (
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
                      currentPage={safeCurrentPage}
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
          </>
        )}
      </div>

      {/* Modal Detail Tiket (Tampilan Baca-Saja & Log Pemeriksaan) */}
      <DetailTicketModal
        isOpen={!!ticketForDetail}
        ticket={ticketForDetail}
        onClose={() => setTicketForDetail(null)}
      />
    </div>
  );
}
