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
        {/* 1. Header Utama */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/daisha"
              className="p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Pelacakan & Antrean Daisha
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Tracking unit & live queue perbaikan bengkel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle View Mode */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Papan Antrean"
              >
                <Columns3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Papan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Daftar List"
              >
                <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                <span>List</span>
              </button>
            </div>

            <Link
              href="/input"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lapor</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-slate-200 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Bengkel</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              title="Refresh antrean"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition disabled:opacity-50 cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Pelacakan Cepat Unit Daisha */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <form onSubmit={handleManualSearch} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                list="daisha-numbers-list"
                value={trackerInput}
                onChange={(e) => setTrackerInput(e.target.value)}
                placeholder="Cari nomor Daisha (contoh: S3 034, D-102)..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
              />
              {trackerInput && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackerInput('');
                    setTrackedDaisha('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <datalist id="daisha-numbers-list">
                {availableDaishaNumbers.map((d) => (
                  <option key={d.noDaisha} value={d.noDaisha}>
                    {d.name} ({d.seksi})
                  </option>
                ))}
              </datalist>
            </form>

            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-red-400" />
              <span>Scan Barcode / QR</span>
            </button>
          </div>

          {/* Quick chips unit */}
          {availableDaishaNumbers.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5 text-xs">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Unit:</span>
              {availableDaishaNumbers.slice(0, 10).map((item) => (
                <button
                  key={item.noDaisha}
                  type="button"
                  onClick={() => {
                    setTrackerInput(item.noDaisha);
                    setTrackedDaisha(item.noDaisha);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition shrink-0 border cursor-pointer ${
                    trackedDaisha === item.noDaisha
                      ? 'bg-red-700 text-white border-red-700 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.noDaisha}
                </button>
              ))}
            </div>
          )}
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800">Unit &quot;{trackedDaisha}&quot; belum ada riwayat servis</h3>
            <p className="text-xs text-slate-400">
              Belum tercatat laporan perbaikan untuk nomor unit ini.
            </p>
            <div className="pt-1 flex items-center justify-center gap-2">
              <Link
                href={`/input`}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Buat Laporan</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTrackedDaisha('');
                  setTrackerInput('');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* 4. Indikator Antrean (KPI Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Menunggu</p>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">{counts.waiting} <span className="text-xs font-bold text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-sm font-bold">
              ⏳
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-blue-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Dikerjakan</p>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">{counts.inProgress} <span className="text-xs font-bold text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-sm font-bold">
              ⚙️
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Siap Ambil</p>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">{counts.done} <span className="text-xs font-bold text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-sm font-bold">
              
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Antrean</p>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">{counts.activeInWorkshop} <span className="text-xs font-bold text-slate-400">unit</span></h3>
            </div>
            <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center text-sm font-bold">
              📋
            </span>
          </div>
        </div>

        {/* 5. Filter & Pencarian */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {/* Filter Seksi */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Seksi
              </label>
              <select
                value={selectedSeksi}
                onChange={(e) => {
                  setSelectedSeksi(e.target.value);
                  setSelectedDaisha('all');
                }}
                className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Jenis Daisha
              </label>
              <select
                value={selectedDaisha}
                onChange={(e) => setSelectedDaisha(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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

            {/* Filter Ukuran Daisha */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Ukuran
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
              >
                <option value="all">Semua Ukuran</option>
                <option value="Small">Small (S)</option>
                <option value="Medium">Medium (M)</option>
                <option value="Large">Large (L)</option>
              </select>
            </div>

            {/* Tombol Reset Filter */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>✕ Reset Filter</span>
                </button>
              ) : (
                <div className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-400 font-medium text-center select-none">
                  Default
                </div>
              )}
            </div>
          </div>

          {/* Search Box & Sort (Sort hanya muncul di List mode) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari tiket, seksi, atau pelapor..."
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
            onDiagnose={(t) => setTicketToEdit(t)}
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
