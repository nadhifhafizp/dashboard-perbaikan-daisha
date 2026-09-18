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
import QueueKanbanBoard from '@/components/riwayat/QueueKanbanBoard';
import DaishaTrackerCard from '@/components/riwayat/DaishaTrackerCard';
import QrScannerModal from '@/components/input/QrScannerModal';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import PaginationControl from '@/components/common/PaginationControl';
import { useAuth } from '@/context/AuthContext';
import { detectDaishaSize } from '@/lib/daishaSize';
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
  QrCode, 
  ScanLine, 
  Search, 
  X,
  History,
  Activity
} from 'lucide-react';

const API_URL = '/api/repair';

export default function RiwayatLaporanPage() {
  const { isAdmin } = useAuth();
  const { tickets, loading, refresh, setTickets } = useTickets();

  // View Mode: 'kanban' (default) atau 'list'
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // State Pelacakan Cepat Unit Daisha (Scan QR / Barcode / Ketik Manual)
  const [trackedDaisha, setTrackedDaisha] = useState<string>('');
  const [trackerInput, setTrackerInput] = useState<string>('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

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

  // Data Pagination untuk tampilan List
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  // Daftar semua nomor unit Daisha unik untuk autocomplete dan pill pencarian cepat
  const availableDaishaNumbers = useMemo(() => {
    const map = new Map<string, { count: number; name: string; seksi: string }>();
    tickets.forEach((t) => {
      const num = t.noDaisha?.trim().toUpperCase();
      if (num && num !== '-') {
        const existing = map.get(num) || { count: 0, name: t.namaDaisha, seksi: t.seksi };
        existing.count += 1;
        map.set(num, existing);
      }
    });
    return Array.from(map.entries())
      .map(([noDaisha, info]) => ({
        noDaisha,
        name: info.name,
        seksi: info.seksi,
        count: info.count,
      }))
      .sort((a, b) => b.count - a.count); // Paling sering servis di atas
  }, [tickets]);

  // Tiket khusus untuk unit yang sedang dilacak
  const trackedTickets = useMemo(() => {
    if (!trackedDaisha) return [];
    return tickets.filter(
      (t) => t.noDaisha?.trim().toUpperCase() === trackedDaisha.trim().toUpperCase()
    );
  }, [tickets, trackedDaisha]);

  const handleScanSuccess = (decoded: string) => {
    setIsQrScannerOpen(false);
    let cleaned = decoded.trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.noDaisha) cleaned = parsed.noDaisha;
      else if (parsed.no) cleaned = parsed.no;
    } catch {
      if (cleaned.includes('noDaisha=')) {
        const match = cleaned.match(/noDaisha=([^&]+)/);
        if (match) cleaned = decodeURIComponent(match[1]);
      } else if (cleaned.includes('no=')) {
        const match = cleaned.match(/no=([^&]+)/);
        if (match) cleaned = decodeURIComponent(match[1]);
      }
    }
    const finalNo = cleaned.toUpperCase();
    setTrackedDaisha(finalNo);
    setTrackerInput(finalNo);
    showFeedback('success', 'Scan Berhasil', `Unit ${finalNo} ditemukan. Memuat status & rekam medis...`);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerInput.trim()) return;
    const finalNo = trackerInput.trim().toUpperCase();
    setTrackedDaisha(finalNo);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 md:p-8 flex justify-center pb-24 md:pb-12">
      <div className="w-full max-w-7xl space-y-4">
        {/* 1. Header Utama & Quick Navigation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 transition border border-slate-200 hover:border-red-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/daisha"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 transition border border-slate-200 hover:border-red-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-red-600" />
              <span>Dashboard Daisha</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
              Pelacakan & Antrean
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
                <span>🔍</span> Pelacakan & Antrean Daisha
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                Pusat pelacakan cepat unit Daisha, riwayat rekam medis perbaikan, dan status antrean bengkel real-time
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle View Mode: Kanban vs List */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Papan Antrean Kanban"
                >
                  <Columns3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Papan Antrean</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Daftar Tabel"
                >
                  <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Daftar Tabel</span>
                </button>
              </div>

              <Link
                href="/input"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Lapor Baru</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                  title="Buka Panel Tindakan Bengkel untuk update status tiket"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-700" />
                  <span>Panel Tindakan Bengkel</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => refresh()}
                disabled={loading}
                title="Segarkan data antrean"
                className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Bar Pelacakan Cepat Unit Daisha (Scan QR / Barcode / Ketik Manual) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-slate-700/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-red-600/30 text-red-300 border border-red-500/30 mb-1.5">
                <ScanLine className="w-3.5 h-3.5 text-red-400" />
                <span>Pelacakan Unit Cepat & Rekam Medis</span>
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>🔍</span> Cek Status & Rekam Medis Daisha
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Scan QR/Barcode fisik unit atau ketik nomor Daisha untuk melihat status perbaikan & histori servis
              </p>
            </div>

            {/* Tombol Kamera Scan QR / Barcode */}
            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-red-400/30 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR / Barcode</span>
            </button>
          </div>

          {/* Form Input Nomor Daisha Cepat */}
          <form onSubmit={handleManualSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                list="daisha-numbers-list"
                value={trackerInput}
                onChange={(e) => setTrackerInput(e.target.value)}
                placeholder="Ketik Nomor Daisha (contoh: S3 034, D-102, S 396)..."
                className="w-full pl-10 pr-10 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder-slate-400 font-bold text-xs sm:text-sm rounded-2xl border border-white/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 outline-none transition"
              />
              {trackerInput && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackerInput('');
                    setTrackedDaisha('');
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <datalist id="daisha-numbers-list">
                {availableDaishaNumbers.map((d) => (
                  <option key={d.noDaisha} value={d.noDaisha}>
                    {d.name} • Seksi: {d.seksi} ({d.count}x servis)
                  </option>
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm shadow-md transition shrink-0 cursor-pointer"
            >
              Lacak Unit
            </button>
          </form>

          {/* Quick Unit Suggestions (Pills Unit yang Ada) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
            <span className="text-[11px] text-slate-400 font-bold shrink-0">Unit Tersedia:</span>
            {availableDaishaNumbers.slice(0, 8).map((item) => (
              <button
                key={item.noDaisha}
                type="button"
                onClick={() => {
                  setTrackerInput(item.noDaisha);
                  setTrackedDaisha(item.noDaisha);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition shrink-0 border cursor-pointer ${
                  trackedDaisha === item.noDaisha
                    ? 'bg-red-600 text-white border-red-500 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                }`}
              >
                {item.noDaisha}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Kartu Hasil Pelacakan Unit Daisha (Jika Ada Unit yang Dipilih) */}
        {trackedDaisha && trackedTickets.length > 0 && (
          <DaishaTrackerCard
            noDaisha={trackedDaisha}
            unitTickets={trackedTickets}
            onClose={() => {
              setTrackedDaisha('');
              setTrackerInput('');
            }}
            onViewDetail={(t) => setTicketForDetail(t)}
            onPrintTag={(t) => setTicketForTag(t)}
            isAdmin={isAdmin}
          />
        )}

        {trackedDaisha && trackedTickets.length === 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-2 animate-in fade-in">
            <span className="text-3xl block mb-1">🔍</span>
            <h3 className="text-sm font-black text-slate-800">Unit Daisha &quot;{trackedDaisha}&quot; Belum Pernah Masuk Servis</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Nomor unit ini belum tercatat memiliki riwayat kerusakan di bengkel maintenance.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <Link
                href={`/input`}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Buat Laporan Baru untuk Unit Ini</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTrackedDaisha('');
                  setTrackerInput('');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* 4. Kartu Indikator Cepat Antrean (Live Queue KPI Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">⏳ Menunggu</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{counts.waiting} <span className="text-xs font-bold text-slate-400">Unit</span></h3>
            </div>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-base font-bold">
              🕒
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">⚙️ Dikerjakan</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{counts.inProgress} <span className="text-xs font-bold text-slate-400">Unit</span></h3>
            </div>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-base font-bold">
              🛠️
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider"> Siap Ambil</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{counts.done} <span className="text-xs font-bold text-slate-400">Unit</span></h3>
            </div>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-base font-bold">
              📦
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">📋 Total Antrean Aktif</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{counts.activeInWorkshop} <span className="text-xs font-bold text-slate-400">Unit</span></h3>
            </div>
            <span className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center text-base font-bold">
              🏢
            </span>
          </div>
        </div>

        {/* 3. Toolbar Filter & Pencarian Cepat */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Filter Seksi */}
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

            {/* Filter Jenis Daisha */}
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

            {/* Filter Ukuran Daisha */}
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
                <div className="w-full py-2 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400 font-semibold text-center select-none">
                  Filter Standar
                </div>
              )}
            </div>
          </div>

          {/* Search Box & Sort (Sort hanya muncul di List mode) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor unit Daisha (cth: D-102), nama seksi, atau pelapor..."
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

            {viewMode === 'list' && (
              <div className="flex flex-wrap items-center gap-2">
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
                    <option value={-1}>Semua ({filteredTickets.length})</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Konten Utama: Papan Antrean Kanban ATAU Daftar Tabel */}
        {loading && tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat status antrean...</span>
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
                : 'Belum ada tiket dalam antrean saat ini.'}
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
        ) : viewMode === 'kanban' ? (
          /* TAMPILAN 1: KANBAN LIVE QUEUE BOARD */
          <QueueKanbanBoard
            tickets={filteredTickets}
            onViewDetail={(t) => setTicketForDetail(t)}
            onPrintTag={(t) => setTicketForTag(t)}
            isAdmin={isAdmin}
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
                  onEdit={(t) => setTicketToEdit(t)}
                  onCancel={(t) => setTicketToCancel(t)}
                  onPrintTag={(t) => setTicketForTag(t)}
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

      {/* Modal Scanner Kamera QR / Barcode Fisik Daisha */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={(err) => console.warn('[QR/Barcode Scanner Error]:', err)}
      />
    </div>
  );
}
