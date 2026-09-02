'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Ticket, UpdateTicketPayload, DeleteTicketPayload, TicketStatus } from '@/types/ticket';
import { setStatusOverride } from '@/lib/ticketParser';
import { useTickets } from '@/hooks/useTickets';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { exportTicketsToExcel } from '@/lib/excelExport';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import StatusBadge from '@/components/common/StatusBadge';
import AdminTicketForm from '@/components/admin/AdminTicketForm';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import { detectDaishaSize } from '@/lib/daishaSize';
import { DAFTAR_SEKSI, getDaishaBySeksi, DAFTAR_SEMUA_DAISHA } from '@/lib/masterData';

const API_URL = '/api/repair';

export default function AdminPage() {
  const { tickets, loading, refresh, setTickets } = useTickets();

  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'Open' | 'Progress' | 'Done' | 'Scrap'>('all');
  const [selectedSeksi, setSelectedSeksi] = useState<string>('all');
  const [selectedDaisha, setSelectedDaisha] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');

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
        setStatusOverride(
          selectedTicket.idTiketAsli,
          data.status as TicketStatus,
          data.waktuKeluar,
          data.catatan
        );

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
    Boolean(search.trim());

  const resetAllFilters = () => {
    setSelectedSeksi('all');
    setSelectedDaisha('all');
    setSelectedSize('all');
    setFilterTab('all');
    setSearch('');
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

    return {
      all: scopedTickets.length,
      open: scopedTickets.filter((t) => t.status === 'Open').length,
      progress: scopedTickets.filter((t) => t.status === 'Progress').length,
      done: scopedTickets.filter((t) => t.status === 'Done').length,
      scrap: scopedTickets.filter((t) => t.status === 'Scrap').length,
    };
  }, [tickets, selectedSeksi, selectedDaisha, selectedSize, search]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filterTab !== 'all' && t.status !== filterTab) return false;

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
  }, [tickets, filterTab, selectedSeksi, selectedDaisha, selectedSize, search]);

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

      {/* KPI Cards Ringkas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => setFilterTab('all')}
          className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-gray-300 transition cursor-pointer"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Total Tiket
          </span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{countStats.all}</span>
        </div>

        <div
          onClick={() => setFilterTab('Open')}
          className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs hover:border-red-300 transition cursor-pointer"
        >
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Antrean
          </span>
          <span className="text-2xl font-black text-red-700 mt-1 block">{countStats.open}</span>
        </div>

        <div
          onClick={() => setFilterTab('Progress')}
          className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs hover:border-blue-300 transition cursor-pointer"
        >
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Dikerjakan
          </span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{countStats.progress}</span>
        </div>

        <div
          onClick={() => setFilterTab('Done')}
          className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition cursor-pointer"
        >
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{countStats.done}</span>
        </div>

        <div
          onClick={() => setFilterTab('Scrap')}
          className="bg-white p-4 rounded-2xl border border-gray-300 shadow-xs hover:border-gray-400 transition cursor-pointer col-span-2 sm:col-span-1"
        >
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span> Scrap
          </span>
          <span className="text-2xl font-black text-gray-800 mt-1 block">{countStats.scrap}</span>
        </div>
      </div>

      {/* Tabel Tiket Antrean & Riwayat (Lebar Penuh) */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Daftar Tiket Antrean Bengkel</h2>
                <span className="text-[11px] text-gray-500">
                  Menampilkan {filteredTickets.length} tiket
                </span>
              </div>

              <input
                type="text"
                placeholder="🔍 Cari Unit / Pelapor / Gejala..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 p-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            {/* Filter Baris 2: Seksi Asal, Jenis Daisha, Ukuran Daisha, & Reset Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2 pb-1 border-t border-gray-100">
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
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
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
                  <div className="w-full py-2 px-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-[11px] text-gray-400 font-semibold text-center select-none">
                    Filter Standar
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Semua ({countStats.all})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Open')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  filterTab === 'Open'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-100'
                }`}
              >
                <span>🔴 Antrean ({countStats.open})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Progress')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  filterTab === 'Progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100'
                }`}
              >
                <span>🔵 Dikerjakan ({countStats.progress})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Done')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  filterTab === 'Done'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100'
                }`}
              >
                <span>🟢 Selesai ({countStats.done})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Scrap')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  filterTab === 'Scrap'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>⚫ Scrap ({countStats.scrap})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="p-3">ID & Masuk</th>
                  <th className="p-3">Unit Daisha</th>
                  <th className="p-3">Kerusakan</th>
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
                  filteredTickets.map((t) => (
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
                                        <span className="text-gray-700">{it.gejala}</span>
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
                        {t.reason && (
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
        </div>

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