'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Ticket } from '@/types/ticket';
import { useTickets, broadcastTicketChange } from '@/hooks/useTickets';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import EditTicketModal from '@/components/riwayat/EditTicketModal';
import DetailTicketModal from '@/components/riwayat/DetailTicketModal';
import RiwayatTicketCard from '@/components/riwayat/RiwayatTicketCard';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import PaginationControl from '@/components/common/PaginationControl';
import { detectDaishaSize } from '@/lib/daishaSize';
import { DAFTAR_SEKSI, getDaishaBySeksi, DAFTAR_SEMUA_DAISHA } from '@/lib/masterData';
import { SortOption, SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';

const API_URL = '/api/repair';

export default function RiwayatLaporanPage() {
  const { tickets, loading, refresh, setTickets } = useTickets();

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Done' | 'Scrap'>('all');
  const [selectedSeksi, setSelectedSeksi] = useState<string>('all');
  const [selectedDaisha, setSelectedDaisha] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // Sorting State (Default: Input Terbaru)
  const [sortBy, setSortBy] = useState<SortOption>('input_desc');

  // Pagination State (Default: 10 data)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal Detail State (Cross-check)
  const [ticketForDetail, setTicketForDetail] = useState<Ticket | null>(null);

  // Modal Cetak Tag Fisik Langsung
  const [ticketForTag, setTicketForTag] = useState<Ticket | null>(null);

  // Modal Cancel State
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Modal Edit State
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  // Simpan Hasil Koreksi / Edit
  const handleSaveEdit = async (data: {
    waktuMasuk: string;
    noDaisha: string;
    seksi: string;
    namaDaisha: string;
    jenisKerusakan: string;
    detail: string;
  }) => {
    if (!ticketToEdit) return;

    const trimmedNo = data.noDaisha.trim().toUpperCase();
    if (!trimmedNo) {
      showFeedback('error', 'Nomor Daisha Kosong', 'Nomor unit Daisha wajib diisi.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_TICKET',
          idTiket: ticketToEdit.idTiketAsli,
          noDaisha: trimmedNo,
          seksi: data.seksi,
          namaDaisha: data.namaDaisha,
          kategori: data.jenisKerusakan,
          detail: data.detail,
          namaPelapor: ticketToEdit.pelapor,
          waktuMasuk: data.waktuMasuk || ticketToEdit.tglMasuk,
        }),
      });

      const resJson = await res.json().catch(() => ({}));

      if (res.ok) {
        showFeedback(
          'success',
          'Koreksi Disimpan',
          `Data laporan unit ${trimmedNo} (${data.jenisKerusakan}) telah berhasil diperbarui di bengkel.`
        );
        setTickets((prev) =>
          prev.map((t) => {
            if (t.idTiketAsli === ticketToEdit.idTiketAsli) {
              return {
                ...t,
                noDaisha: trimmedNo,
                seksi: data.seksi,
                namaDaisha: data.namaDaisha,
                jenisKerusakan: data.jenisKerusakan,
                detail: data.detail,
                tglMasuk: data.waktuMasuk || t.tglMasuk,
              };
            }
            return t;
          })
        );
        setTicketToEdit(null);
        refresh(true);
        broadcastTicketChange();
      } else {
        showFeedback('error', 'Gagal Mengubah', resJson.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err) {
      console.error('Save edit error:', err);
      showFeedback('error', 'Gangguan Jaringan', 'Gagal menghubungi server untuk menyimpan koreksi.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Eksekusi Pembatalan
  const executeCancelTicket = async () => {
    if (!ticketToCancel) return;
    setIsCancelling(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          idTiket: ticketToCancel.idTiketAsli,
        }),
      });

      const resJson = await res.json().catch(() => ({}));

      if (res.ok) {
        showFeedback(
          'success',
          'Laporan Dibatalkan',
          `Unit ${ticketToCancel.noDaisha} telah dihapus dari antrean bengkel.`
        );
        setTickets((prev) => prev.filter((t) => t.idTiketAsli !== ticketToCancel.idTiketAsli));
        setTicketToCancel(null);
        refresh(true);
        broadcastTicketChange();
      } else {
        showFeedback('error', 'Gagal Membatalkan', resJson.error || 'Gagal membatalkan tiket.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Gangguan Jaringan', 'Gagal menghubungi server.');
    } finally {
      setIsCancelling(false);
    }
  };

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
    selectedSize !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'input_desc' ||
    Boolean(search.trim());

  const resetAllFilters = () => {
    setSelectedSeksi('all');
    setSelectedDaisha('all');
    setSelectedSize('all');
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
      if (selectedSize !== 'all') {
        const size = detectDaishaSize(t.noDaisha)?.size;
        if (size !== selectedSize) return false;
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

    return {
      all: scopedTickets.length,
      open: openOnly + progressOnly,
      done: scopedTickets.filter((t) => t.status === 'Done').length,
      scrap: scopedTickets.filter((t) => t.status === 'Scrap').length,
    };
  }, [tickets, selectedSeksi, selectedDaisha, selectedSize, search]);

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

      // 4. Ukuran Daisha Filter
      if (selectedSize !== 'all') {
        const size = detectDaishaSize(t.noDaisha)?.size;
        if (size !== selectedSize) return false;
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
  }, [tickets, statusFilter, selectedSeksi, selectedDaisha, selectedSize, search, sortBy]);

  // Reset ke halaman 1 saat filter atau itemsPerPage berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets.length, sortBy, itemsPerPage]);

  // Data terpaginasi
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const paginatedTickets = itemsPerPage === -1 ? filteredTickets : filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 md:p-8 flex justify-center pb-24 md:pb-12">
      <div className="w-full max-w-5xl space-y-4">
        {/* 1. Header Ringkas & Bersih */}
        <div className="bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
              <span>📋</span> Riwayat & Status Laporan Daisha
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Pantau alur penanganan tiket perbaikan Daisha secara real-time dan terorganisir
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refresh()}
              disabled={loading}
              title="Segarkan data"
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/input"
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>➕</span>
              <span>Lapor Baru</span>
            </Link>
          </div>
        </div>

        {/* 1b. Summary Strip — Hitungan Status (clickable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-[11px]">📋</span>
            <span>Semua</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Open')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              statusFilter === 'Open'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="text-[11px]">⏳</span>
            <span>Menunggu / Dikerjakan</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === 'Open' ? 'bg-white/20' : 'bg-amber-100 text-amber-700'}`}>
              {counts.open}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Done')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              statusFilter === 'Done'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="text-[11px]">✅</span>
            <span>Selesai</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === 'Done' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700'}`}>
              {counts.done}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Scrap')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              statusFilter === 'Scrap'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="text-[11px]">⚫</span>
            <span>Scrap</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === 'Scrap' ? 'bg-white/20' : 'bg-rose-100 text-rose-700'}`}>
              {counts.scrap}
            </span>
          </button>
        </div>

        {/* 2. Toolbar Filter & Kontrol */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          {/* Filter Dropdowns (Seksi, Daisha, Ukuran) + Reset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* 1. Filter Seksi */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                🏢 Seksi Asal
              </label>
              <select
                value={selectedSeksi}
                onChange={(e) => {
                  setSelectedSeksi(e.target.value);
                  setSelectedDaisha('all');
                }}
                className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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

            {/* 2. Filter Jenis Daisha (Dinamis sesuai seksi) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                🛞 Jenis Daisha
              </label>
              <select
                value={selectedDaisha}
                onChange={(e) => setSelectedDaisha(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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

            {/* 3. Filter Ukuran Daisha (S / M / L) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                📐 Ukuran Daisha
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
              >
                <option value="all">Semua Ukuran (S, M, L)</option>
                <option value="Small">🟢 Small (S) - Unit Kecil</option>
                <option value="Medium">🔵 Medium (M) - Unit Sedang</option>
                <option value="Large">🟣 Large (L) - Unit Besar</option>
              </select>
            </div>

            {/* 4. Tombol Reset Filter */}
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
                <div className="w-full py-2 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400 font-semibold text-center select-none">
                  Filter Standar
                </div>
              )}
            </div>
          </div>

          {/* Baris 3 Toolbar: Search Input + Pengurutan Data + Tampilkan Baris */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            {/* Search Box */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor unit daisha, pelapor, rincian kerusakan..."
                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Sort Buttons: Terbaru vs Terlama */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSortBy('input_desc')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    sortBy === 'input_desc'
                      ? 'bg-white text-slate-900 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Urutkan dari tiket masuk terbaru"
                >
                  <span>🕒</span>
                  <span>Masuk Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('done_desc')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    sortBy === 'done_desc'
                      ? 'bg-white text-slate-900 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Urutkan dari tiket selesai terbaru"
                >
                  <span>✅</span>
                  <span>Selesai Baru</span>
                </button>
              </div>

              {/* Selector Urutan Data Lengkap */}
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
                <span className="text-slate-400 text-[11px]">🔃</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer border-none py-0.5 text-xs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Jumlah Baris per Halaman (10/20/30/dst) */}
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
                <span className="text-slate-400 text-[11px]">📄</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer border-none py-0.5 text-xs"
                >
                  <option value={10}>10 data</option>
                  <option value={20}>20 data</option>
                  <option value={30}>30 data</option>
                  <option value={50}>50 data</option>
                  <option value={100}>100 data</option>
                  <option value={-1}>Semua ({filteredTickets.length})</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Daftar Kartu Laporan Langsung di Atas */}
        {loading && tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Memuat riwayat...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-2xs">
            <span className="text-3xl block mb-1">📭</span>
            <p className="text-xs font-bold text-slate-700">Tidak ada tiket laporan ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {search
                ? 'Coba cari dengan kata kunci lain atau bersihkan filter di atas.'
                : selectedSeksi !== 'all'
                ? `Belum ada tiket laporan untuk seksi ${selectedSeksi}.`
                : 'Belum ada tiket dalam kategori ini.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-slate-800 transition cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {paginatedTickets.map((ticket) => (
              <RiwayatTicketCard
                key={ticket.idTiketAsli}
                ticket={ticket}
                onViewDetail={(t) => setTicketForDetail(t)}
                onEdit={(t) => setTicketToEdit(t)}
                onCancel={(t) => setTicketToCancel(t)}
                onPrintTag={(t) => setTicketForTag(t)}
              />
            ))}
          </div>
        )}

        {/* 4. Pagination Controls Footer */}
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

      {/* Modal Detail Tiket (Cross-check Lengkap) */}
      <DetailTicketModal
        isOpen={!!ticketForDetail}
        ticket={ticketForDetail}
        onClose={() => setTicketForDetail(null)}
        onEdit={(t) => setTicketToEdit(t)}
      />

      {/* Modal Cetak Tag Fisik Daisha Langsung */}
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

      {/* Modal Edit / Koreksi Laporan */}
      <EditTicketModal
        isOpen={!!ticketToEdit}
        ticket={ticketToEdit}
        isLoading={isSavingEdit}
        onSave={handleSaveEdit}
        onClose={() => setTicketToEdit(null)}
      />

      {/* Modal Batal Cepat */}
      <ConfirmModal
        isOpen={!!ticketToCancel}
        title="Batalkan Laporan Ini?"
        message="Laporan unit ini akan dihapus dari antrean bengkel jika terjadi salah input."
        detail={
          ticketToCancel
            ? `Unit: ${ticketToCancel.noDaisha} (${ticketToCancel.namaDaisha})`
            : undefined
        }
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
        isDestructive={true}
        isLoading={isCancelling}
        loadingText="Membatalkan..."
        onConfirm={executeCancelTicket}
        onCancel={() => setTicketToCancel(null)}
      />

      {/* Feedback Alert */}
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
