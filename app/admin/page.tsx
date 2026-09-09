'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Ticket, UpdateTicketPayload, DeleteTicketPayload, TicketStatus } from '@/types/ticket';
import { useTickets, broadcastTicketChange } from '@/hooks/useTickets';

import { parseTicketDamageDetail } from '@/lib/damageParser';
import { exportTicketsToExcel } from '@/lib/excelExport';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import StatusBadge from '@/components/common/StatusBadge';
import AdminTicketForm from '@/components/admin/AdminTicketForm';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import UserManager from '@/components/admin/UserManager';
import CatalogManager from '@/components/admin/CatalogManager';
import { detectDaishaSize } from '@/lib/daishaSize';
import { DAFTAR_SEKSI, getDaishaBySeksi, DAFTAR_SEMUA_DAISHA } from '@/lib/masterData';
import { Card } from '@/components/ui/card';
import { ClipboardList, Clock, Wrench, CheckCircle2, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortOption, SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';
import PaginationControl from '@/components/common/PaginationControl';

const API_URL = '/api/repair';

export default function AdminPage() {
  const { tickets, loading, refresh, setTickets } = useTickets();

  const [adminTab, setAdminTab] = useState<'tickets' | 'catalog' | 'users'>('tickets');
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('input_desc');
  const [filterTab, setFilterTab] = useState<'all' | 'Open' | 'Progress' | 'Done' | 'Scrap'>('all');
  const [selectedSeksi, setSelectedSeksi] = useState<string>('all');
  const [selectedDaisha, setSelectedDaisha] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // Pagination State (10 / 20 / 30 / dst)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Selected Ticket Edit Form State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Modal Cetak Tag Fisik Daisha
  const [ticketForTag, setTicketForTag] = useState<Ticket | null>(null);

  // Modal Delete State
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    detail?: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showFeedback = (type: FeedbackType, title: string, message: string, detail?: string) => {
    setFeedback({ isOpen: true, type, title, message, detail });
  };

  const handleUpdate = async (data: {
    status: string;
    waktuKeluar: string;
    catatan: string;
  }) => {
    if (!selectedTicket) return;

    if (data.status === 'Open') {
      showFeedback(
        'error',
        'Aksi Tidak Diizinkan',
        'Tiket yang sedang atau sudah diproses tidak dapat dikembalikan ke status Open.'
      );
      return;
    }

    setIsProcessing(true);

    const payload: UpdateTicketPayload = {
      action: 'UPDATE',
      idTiket: selectedTicket.idTiketAsli,
      status: data.status,
      waktuKeluar: data.waktuKeluar,
      catatan: data.catatan,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        setTickets((prev) =>

          prev.map((t) =>
            t.idTiketAsli === selectedTicket.idTiketAsli
              ? {
                  ...t,
                  status: data.status as TicketStatus,
                  tglKeluar: data.waktuKeluar,
                  reason: data.catatan,
                }
              : t
          )
        );

        showFeedback(
          'success',
          'Status Berhasil Diperbarui',
          `Tiket ${selectedTicket.noTiket || selectedTicket.idTiketAsli} telah diubah menjadi status ${data.status}.`,
          `Waktu Selesai: ${data.waktuKeluar}`
        );
        setSelectedTicket(null);
        refresh(true);
        broadcastTicketChange();
      } else {
        showFeedback(
          'error',
          'Gagal Memperbarui Tiket',
          resData.error || 'Terjadi kesalahan saat memproses data ke server.'
        );
      }
    } catch (error) {
      console.error('Gagal update tiket:', error);
      showFeedback('error', 'Gangguan Koneksi', 'Gagal menghubungi server. Periksa koneksi internet Anda.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;

    setIsDeleting(true);

    const payload: DeleteTicketPayload = {
      action: 'DELETE',
      idTiket: ticketToDelete.idTiketAsli,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        const deletedId = ticketToDelete.idTiketAsli;
        const deletedNo = ticketToDelete.noTiket || ticketToDelete.idTiketAsli;

        setTickets((prev) => prev.filter((t) => t.idTiketAsli !== deletedId));
        if (selectedTicket?.idTiketAsli === deletedId) {
          setSelectedTicket(null);
        }

        setTicketToDelete(null);
        showFeedback('success', 'Data Berhasil Dihapus', `Tiket ${deletedNo} telah dihapus dari sistem.`);
        refresh(true);
        broadcastTicketChange();
      } else {
        showFeedback(
          'error',
          'Gagal Menghapus Data',
          resData.error || 'Terjadi kesalahan pada server saat menghapus data.'
        );
      }
    } catch (error) {
      console.error('Gagal hapus tiket:', error);
      showFeedback('error', 'Gangguan Koneksi', 'Gagal menghubungi server saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Daftar Seksi yang tersedia (master data + riwayat tiket)
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
    selectedSize !== 'all' ||
    filterTab !== 'all' ||
    sortBy !== 'input_desc' ||
    Boolean(search.trim());

  const resetAllFilters = () => {
    setSelectedSeksi('all');
    setSelectedDaisha('all');
    setSelectedSize('all');
    setFilterTab('all');
    setSortBy('input_desc');
    setSearch('');
    setCurrentPage(1);
  };

  // Hitung KPI status dinamis berdasarkan filter Seksi, Daisha, Ukuran, dan Pencarian
  const countStats = useMemo(() => {
    const scopedTickets = tickets.filter((t) => {
      if (selectedSeksi !== 'all' && t.seksi?.toLowerCase() !== selectedSeksi.toLowerCase()) {
        return false;
      }
      if (selectedDaisha !== 'all' && t.namaDaisha?.toLowerCase() !== selectedDaisha.toLowerCase()) {
        return false;
      }
      if (selectedSize !== 'all') {
        const size = detectDaishaSize(t.noDaisha)?.size;
        if (size !== selectedSize) return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.noTiket?.toLowerCase().includes(q) ||
        t.idTiketAsli?.toLowerCase().includes(q) ||
        t.noDaisha?.toLowerCase().includes(q) ||
        t.namaDaisha?.toLowerCase().includes(q) ||
        t.pelapor?.toLowerCase().includes(q) ||
        t.seksi?.toLowerCase().includes(q) ||
        t.detail?.toLowerCase().includes(q)
      );
    });

    const openOnly = scopedTickets.filter((t) => t.status === 'Open').length;
    const progressOnly = scopedTickets.filter((t) => t.status === 'Progress').length;

    return {
      all: scopedTickets.length,
      open: openOnly + progressOnly,
      progress: progressOnly,
      done: scopedTickets.filter((t) => t.status === 'Done').length,
      scrap: scopedTickets.filter((t) => t.status === 'Scrap').length,
    };
  }, [tickets, selectedSeksi, selectedDaisha, selectedSize, search]);

  const filteredTickets = useMemo(() => {
    const list = tickets.filter((t) => {
      if (filterTab === 'Open') {
        if (t.status !== 'Open' && t.status !== 'Progress') return false;
      } else if (filterTab !== 'all' && t.status !== filterTab) {
        return false;
      }

      if (selectedSeksi !== 'all' && t.seksi?.toLowerCase() !== selectedSeksi.toLowerCase()) {
        return false;
      }

      if (selectedDaisha !== 'all' && t.namaDaisha?.toLowerCase() !== selectedDaisha.toLowerCase()) {
        return false;
      }

      if (selectedSize !== 'all') {
        const size = detectDaishaSize(t.noDaisha)?.size;
        if (size !== selectedSize) return false;
      }

      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.noTiket?.toLowerCase().includes(q) ||
        t.idTiketAsli?.toLowerCase().includes(q) ||
        t.noDaisha?.toLowerCase().includes(q) ||
        t.namaDaisha?.toLowerCase().includes(q) ||
        t.pelapor?.toLowerCase().includes(q) ||
        t.seksi?.toLowerCase().includes(q) ||
        t.detail?.toLowerCase().includes(q)
      );
    });

    return sortTickets(list, sortBy);
  }, [tickets, filterTab, selectedSeksi, selectedDaisha, selectedSize, search, sortBy]);

  // Reset ke halaman 1 saat filter atau jumlah data berubah
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets.length, sortBy, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const paginatedTickets = itemsPerPage === -1 ? filteredTickets : filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (ascOption: SortOption, descOption: SortOption) => {
    setSortBy((prev) => (prev === ascOption ? descOption : ascOption));
    setCurrentPage(1);
  };

  const getSortIcon = (ascOption: SortOption, descOption: SortOption) => {
    if (sortBy === ascOption) return <ArrowUp className="w-3.5 h-3.5 text-blue-600 inline ml-1" />;
    if (sortBy === descOption) return <ArrowDown className="w-3.5 h-3.5 text-blue-600 inline ml-1" />;
    return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ⚙️ Panel Tindakan Admin Workshop
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Alur proses perbaikan bertahap: Antrean (Open) ➔ Dikerjakan (Progress) ➔ Selesai (Done)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Tombol Ekspor Excel Berdasarkan Filter Aktif */}
          <button
            type="button"
            onClick={() =>
              exportTicketsToExcel(
                filteredTickets,
                `Admin_Rekap_Daisha_${filterTab !== 'all' ? filterTab : 'Semua'}`
              )
            }
            disabled={filteredTickets.length === 0}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh data Excel (.xlsx) sesuai filter yang sedang aktif"
          >
            <span>📥</span>
            <span>Ekspor Excel ({filteredTickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>

          <Link
            href="/"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <span>📊</span>
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Tab Navigasi Admin Panel */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-full sm:w-fit border border-slate-300/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => setAdminTab('tickets')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === 'tickets'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📋</span>
          <span>Rekap Tiket & Status</span>
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('catalog')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === 'catalog'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🗂️</span>
          <span>Katalog Daisha (Auto-Pilot)</span>
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('users')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === 'users'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>👥</span>
          <span>Manajemen Pengguna</span>
        </button>
      </div>

      {/* Tampilan Tab 2: Katalog Daisha Auto-Pilot */}
      {adminTab === 'catalog' && <CatalogManager />}

      {/* Tampilan Tab 3: Manajemen Akun Pengguna */}
      {adminTab === 'users' && <UserManager />}

      {/* Tampilan Tab 1: Rekap Tiket & Status */}
      {adminTab === 'tickets' && (
        <>
      {/* KPI Cards Ringkas (4 Status Pipeline) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Total Tiket */}
        <Card
          onClick={() => setFilterTab('all')}
          className={`p-4 cursor-pointer transition-all flex flex-col justify-between group ${
            filterTab === 'all'
              ? 'ring-2 ring-red-600 shadow-md scale-[1.02] !bg-white border-red-500'
              : 'hover:shadow-md hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${filterTab === 'all' ? 'text-red-700' : 'text-slate-500'}`}>
              Total Tiket
            </span>
            <div className={`p-1.5 rounded-lg transition ${
              filterTab === 'all' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600 group-hover:bg-red-50 group-hover:text-red-600'
            }`}>
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-2xl font-black transition ${
            filterTab === 'all' ? 'text-red-700' : 'text-slate-900 group-hover:text-red-600'
          }`}>
            {countStats.all}
          </div>
          <div className="text-[10px] font-medium text-slate-500 mt-1">Semua Tiket Masuk</div>
        </Card>

        {/* 2. Open / Sedang Dikerjakan */}
        <Card
          onClick={() => setFilterTab('Open')}
          className={`p-4 cursor-pointer border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/40 hover:shadow-md transition-all flex flex-col justify-between group ${
            filterTab === 'Open'
              ? 'ring-2 ring-amber-500 shadow-md scale-[1.02] !bg-white !border-amber-500'
              : ''
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Open / Dikerjakan</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 group-hover:scale-105 transition">{countStats.open}</div>
          <div className="text-[10px] font-medium text-amber-600/80 mt-1">Antre & Sedang Diproses</div>
        </Card>

        {/* 3. Selesai (Done) */}
        <Card
          onClick={() => setFilterTab('Done')}
          className={`p-4 cursor-pointer border-emerald-200/80 bg-emerald-50/20 hover:bg-emerald-50/40 hover:shadow-md transition-all flex flex-col justify-between group ${
            filterTab === 'Done'
              ? 'ring-2 ring-emerald-500 shadow-md scale-[1.02] !bg-white !border-emerald-500'
              : ''
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Selesai (Done)</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 group-hover:scale-105 transition">{countStats.done}</div>
          <div className="text-[10px] font-medium text-emerald-600/80 mt-1">
            Rate: {countStats.all > 0 ? Math.round((countStats.done / countStats.all) * 100) : 0}%
          </div>
        </Card>

        {/* 4. Rusak / Afkir (Scrap) */}
        <Card
          onClick={() => setFilterTab('Scrap')}
          className={`p-4 cursor-pointer border-rose-200/80 bg-rose-50/20 hover:bg-rose-50/40 hover:shadow-md transition-all flex flex-col justify-between group ${
            filterTab === 'Scrap'
              ? 'ring-2 ring-rose-500 shadow-md scale-[1.02] !bg-white !border-rose-500'
              : ''
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Rusak (Scrap)</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 group-hover:scale-105 transition">{countStats.scrap}</div>
          <div className="text-[10px] font-medium text-rose-600/80 mt-1">
            Rate: {countStats.all > 0 ? Math.round((countStats.scrap / countStats.all) * 100) : 0}%
          </div>
        </Card>
      </div>

      {/* Tabel Tiket Antrean & Riwayat (Lebar Penuh) */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <span>📋</span> Daftar Tiket Antrean Bengkel
            </h2>
            <span className="text-[11px] text-gray-500 font-medium">
              Menampilkan {paginatedTickets.length} dari {filteredTickets.length} tiket ({filterTab === 'all' ? 'Semua Status' : filterTab})
            </span>
          </div>
        </div>

        {/* Toolbar Filter & Kontrol */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/70 space-y-3">
          {/* Filter Baris 1: Seksi Asal, Jenis Daisha, Ukuran Daisha, & Reset Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {/* Filter Seksi */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                🏢 Seksi Asal
              </label>
              <select
                value={selectedSeksi}
                onChange={(e) => {
                  setSelectedSeksi(e.target.value);
                  setSelectedDaisha('all');
                }}
                className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                🛞 Jenis Daisha
              </label>
              <select
                value={selectedDaisha}
                onChange={(e) => setSelectedDaisha(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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

            {/* Filter Ukuran Daisha (S / M / L) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                📐 Ukuran Daisha (S/M/L)
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
              >
                <option value="all">Semua Ukuran (S, M, L)</option>
                <option value="Small">🟢 Small (S) - Unit Kecil</option>
                <option value="Medium">🔵 Medium (M) - Unit Sedang</option>
                <option value="Large">🟣 Large (L) - Unit Besar</option>
              </select>
            </div>

            {/* Tombol Reset Filter */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Kembalikan semua filter ke default"
                >
                  <span>✕</span>
                  <span>Reset Filter</span>
                </button>
              ) : (
                <div className="w-full py-2 px-3 bg-white border border-dashed border-gray-200 rounded-xl text-[11px] text-gray-400 font-semibold text-center select-none">
                  Filter Standar
                </div>
              )}
            </div>
          </div>

          {/* Search, Sort, Items per page */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-gray-200">
            <input
              type="text"
              placeholder="🔍 Cari Unit / Pelapor / Gejala..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:flex-1 p-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:ring-2 focus:ring-red-600 outline-none"
            />

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300">
                <span className="text-gray-500 text-[11px]">🔃 Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer border-none py-0.5 text-xs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300">
                <span className="text-gray-500 text-[11px]">📄 Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer border-none py-0.5 text-xs"
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
        <div className="p-3 space-y-3 md:hidden">
          {loading && !tickets.length ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold text-xs">
              Tidak ada tiket yang sesuai kriteria.
            </div>
          ) : (
            paginatedTickets.map((t) => {
              const parsed = parseTicketDamageDetail(t.detail);
              const sizeInfo = detectDaishaSize(t.noDaisha);

              return (
                <div
                  key={t.id}
                  className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-gray-900 text-xs">
                          {t.idTiketAsli || t.noTiket}
                        </span>
                        <span className="text-[10px] text-gray-400">• {t.tglMasuk}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="font-black text-sm text-red-700">{t.noDaisha}</span>
                        {sizeInfo && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                          >
                            {sizeInfo.code}
                          </span>
                        )}
                        <span className="text-xs font-bold text-gray-700">
                          {t.namaDaisha} ({t.seksi})
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  {/* Kerusakan */}
                  <div className="text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {parsed.items.length > 0 ? (
                      <div className="space-y-1">
                        {parsed.items.map((it, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-1 text-[11px]">
                            <span className="text-gray-700">
                              • {it.komponen ? `[${it.komponen}] ` : ''}{it.gejala}
                              {it.qty > 1 && ` (${it.qty}x)`}
                            </span>
                            {it.tindakan && (
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded shrink-0 ${
                                it.tindakan === 'Ganti' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {it.tindakan === 'Ganti' ? '🔄 Ganti' : '🔨 Repair'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-600">
                        {t.jenisKerusakan || 'Kerusakan umum'}
                      </span>
                    )}
                    {t.reason && t.reason !== '-' && t.reason.trim() !== '' && (
                      <div className="text-[10px] text-emerald-700 mt-1 pt-1 border-t border-gray-200">
                        Catatan: {t.reason}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Proses 🛠️</span>
                    </button>
                    <button
                      onClick={() => setTicketForTag(t)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1"
                      title="Cetak Tag Fisik Daisha"
                    >
                      <span>🏷️ Tag</span>
                    </button>
                    <button
                      onClick={() => setTicketToDelete(t)}
                      disabled={isProcessing}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                      title="Hapus Tiket"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tampilan Desktop: Tabel Tiket Lengkap */}
        <div className="overflow-x-auto flex-1 hidden md:block">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200 select-none">
                <th
                  onClick={() => toggleSort('input_asc', 'input_desc')}
                  className="p-3 cursor-pointer hover:bg-gray-200/70 transition"
                  title="Klik untuk urutkan tanggal masuk (terbaru / terlama)"
                >
                  <div className="flex items-center gap-1">
                    <span>ID & Masuk</span>
                    {getSortIcon('input_asc', 'input_desc')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('unit_asc', 'unit_desc')}
                  className="p-3 cursor-pointer hover:bg-gray-200/70 transition"
                  title="Klik untuk urutkan nomor unit daisha"
                >
                  <div className="flex items-center gap-1">
                    <span>Unit Daisha</span>
                    {getSortIcon('unit_asc', 'unit_desc')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('daisha_asc', 'daisha_desc')}
                  className="p-3 cursor-pointer hover:bg-gray-200/70 transition"
                  title="Klik untuk urutkan jenis daisha"
                >
                  <div className="flex items-center gap-1">
                    <span>Kerusakan & Jenis</span>
                    {getSortIcon('daisha_asc', 'daisha_desc')}
                  </div>
                </th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi Proses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !tickets.length ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="p-3">
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="p-3">
                      <div className="h-6 bg-gray-200 rounded w-20 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">
                    Tidak ada tiket yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">
                      <span className="font-mono font-bold text-gray-900 block">
                        {t.idTiketAsli || t.noTiket}
                      </span>
                      <span className="text-[11px] text-gray-500">{t.tglMasuk}</span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-red-700">{t.noDaisha}</span>
                        {(() => {
                          const sizeInfo = detectDaishaSize(t.noDaisha);
                          return sizeInfo ? (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                              title={sizeInfo.description}
                            >
                              {sizeInfo.code}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <span className="text-[11px] text-gray-500 block">
                        {t.namaDaisha} ({t.seksi})
                      </span>
                    </td>

                    <td className="p-3 min-w-[240px] max-w-sm whitespace-normal">
                      {(() => {
                        const parsed = parseTicketDamageDetail(t.detail);
                        if (parsed.items.length > 0) {
                          return (
                            <div className="space-y-1.5 py-0.5">
                              {parsed.items.map((it, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start justify-between gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-200/70 text-[11px]"
                                  >
                                    <div className="flex items-start gap-1 leading-snug">
                                      <span className="text-gray-400 font-bold">•</span>
                                      <div>
                                        {it.komponen && it.komponen !== 'Umum' && (
                                          <span className="font-bold text-gray-800 mr-1">
                                            [{it.komponen}]
                                          </span>
                                        )}
                                        <span className="text-gray-700">{it.gejala.replace(/^[•\s-]+/, '')}</span>
                                        {it.qty > 1 && (
                                          <span className="ml-1 text-[10px] font-black text-slate-800 bg-slate-200/80 px-1.5 py-0.2 rounded">
                                            {it.qty} pcs
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {it.tindakan && (
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[9px] font-black shrink-0 ${
                                          it.tindakan === 'Ganti'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}
                                      >
                                        {it.tindakan === 'Ganti' ? '🔄 Ganti' : '🔨 Repair'}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {parsed.catatan && (
                                  <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    📌 Posisi: {parsed.catatan}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="text-[11px] text-gray-600">
                              <span className="font-semibold text-gray-900 block">{t.jenisKerusakan}</span>
                              <span>{t.detail && t.detail !== '-' ? t.detail : 'Kerusakan umum'}</span>
                            </div>
                          );
                        })()}
                        {t.reason && t.reason !== '-' && t.reason.trim() !== '' && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                            Catatan: {t.reason}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <StatusBadge status={t.status} />
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setTicketForTag(t)}
                            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1"
                            title="Cetak Tag Fisik Daisha untuk digantungkan di unit"
                          >
                            <span>🏷️</span>
                            <span>Tag</span>
                          </button>
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                            title="Proses / Update Status Tiket"
                          >
                            Proses 🛠️
                          </button>
                          <button
                            onClick={() => setTicketToDelete(t)}
                            disabled={isProcessing}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                            title="Hapus Data Tiket"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="p-3 sm:px-4 sm:py-3 border-t border-gray-200 bg-gray-50/50">
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredTickets.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemLabel="tiket"
              variant="plain"
            />
          </div>
        </div>

        </>
      )}

      {/* Modal Popup Update Status Pengerjaan (Muncul di tengah layar saat klik Proses) */}
      <AdminTicketForm
        isOpen={!!selectedTicket}
        selectedTicket={selectedTicket}
        isProcessing={isProcessing}
        onCancel={() => setSelectedTicket(null)}
        onSubmit={handleUpdate}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!ticketToDelete}
        isDestructive={true}
        title="Hapus Data Tiket Perbaikan"
        message="Apakah Anda yakin ingin menghapus data tiket ini secara permanen? Data yang telah dihapus tidak dapat dikembalikan."
        detail={
          ticketToDelete
            ? `ID: ${ticketToDelete.noTiket || ticketToDelete.idTiketAsli} | Unit: ${ticketToDelete.noDaisha} (${ticketToDelete.namaDaisha} - ${ticketToDelete.seksi})`
            : undefined
        }
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        isLoading={isDeleting}
        loadingText="Menghapus tiket dari database..."
        onConfirm={confirmDeleteTicket}
        onCancel={() => !isDeleting && setTicketToDelete(null)}
      />

      {/* Interactive Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        detail={feedback.detail}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}