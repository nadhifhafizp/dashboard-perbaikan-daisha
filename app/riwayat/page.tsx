'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Ticket } from '@/types/ticket';
import { useTickets } from '@/hooks/useTickets';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import EditTicketModal from '@/components/riwayat/EditTicketModal';
import DetailTicketModal from '@/components/riwayat/DetailTicketModal';
import RiwayatTicketCard from '@/components/riwayat/RiwayatTicketCard';
import SeksiDropdownSelector from '@/components/riwayat/SeksiDropdownSelector';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import { parseToTimestamp } from '@/lib/date';

const API_URL = '/api/repair';

export default function RiwayatLaporanPage() {
  const { tickets, loading, refresh, setTickets } = useTickets();

  // Mode Tampilan: 'seksi' (Dropdown per Seksi) atau 'terbaru' (Raw Data / Feed Terkini)
  const [viewMode, setViewMode] = useState<'seksi' | 'terbaru'>('seksi');

  // Filter State
  const [selectedSeksi, setSelectedSeksi] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Progress' | 'Done'>('all');

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

  // Filter Data
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        // 1. Filter Seksi (jika mode Seksi aktif dan seksi dipilih)
        if (viewMode === 'seksi' && selectedSeksi && selectedSeksi !== 'All seksi') {
          if (t.seksi.toLowerCase() !== selectedSeksi.toLowerCase()) return false;
        }

        // 2. Filter Status
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;

        // 3. Filter Pencarian Cepat
        const q = search.toLowerCase().trim();
        if (q) {
          const match =
            t.noDaisha.toLowerCase().includes(q) ||
            t.namaDaisha.toLowerCase().includes(q) ||
            t.seksi.toLowerCase().includes(q) ||
            t.pelapor.toLowerCase().includes(q) ||
            t.detail.toLowerCase().includes(q) ||
            t.idTiketAsli.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = parseToTimestamp(a.tglMasuk);
        const timeB = parseToTimestamp(b.tglMasuk);
        return timeB - timeA;
      });
  }, [tickets, viewMode, selectedSeksi, statusFilter, search]);

  // Statistik Dinamis
  const counts = useMemo(() => {
    const baseTickets =
      viewMode === 'seksi' && selectedSeksi
        ? tickets.filter((t) => t.seksi.toLowerCase() === selectedSeksi.toLowerCase())
        : tickets;

    return {
      all: baseTickets.length,
      open: baseTickets.filter((t) => t.status === 'Open').length,
      progress: baseTickets.filter((t) => t.status === 'Progress').length,
      done: baseTickets.filter((t) => t.status === 'Done').length,
    };
  }, [tickets, viewMode, selectedSeksi]);

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 md:p-8 flex justify-center pb-24 md:pb-10">
      <div className="w-full max-w-5xl space-y-4">
        {/* 1. Header Ringkas */}
        <div className="bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
              <span>📋</span> Riwayat & Status Laporan Daisha
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Pantau status penanganan perbaikan unit secara cepat dan terorganisir
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
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <span>➕</span>
              <span>Lapor Baru</span>
            </Link>
          </div>
        </div>

        {/* 2. Toolbar Filter Terpadu (Clean & Ringkas) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          {/* Baris Atas Toolbar: Mode Switcher & Dropdown Seksi */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('seksi')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  viewMode === 'seksi'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏢</span>
                <span>Per Seksi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('terbaru');
                  setSelectedSeksi('');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  viewMode === 'terbaru'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚡</span>
                <span>Raw Data Terbaru</span>
              </button>
            </div>

            {/* Dropdown Seksi Terpadu (Compact, tidak memenuhi layar) */}
            {viewMode === 'seksi' ? (
              <SeksiDropdownSelector
                selectedSeksi={selectedSeksi}
                onSelectSeksi={(seksi) => setSelectedSeksi(seksi)}
                tickets={tickets}
              />
            ) : (
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 px-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Feed laporan terbaru seluruh seksi</span>
              </div>
            )}
          </div>

          {/* Baris Bawah Toolbar: Search Box & Status Filter Tabs */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
            {/* Search Box Ringkas */}
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

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({counts.all})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('Open')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === 'Open'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
                }`}
              >
                🟡 Antre ({counts.open})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('Progress')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === 'Progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 border border-blue-200/80 hover:bg-blue-100'
                }`}
              >
                🔵 Diproses ({counts.progress})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('Done')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === 'Done'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
                }`}
              >
                🟢 Selesai ({counts.done})
              </button>
            </div>
          </div>
        </div>

        {/* 3. Daftar Kartu Laporan */}
        {loading && tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Memuat riwayat...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-xs">
            <span className="text-3xl block mb-1">📭</span>
            <p className="text-xs font-bold text-slate-700">Tidak ada tiket laporan ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {search
                ? 'Coba cari dengan kata kunci lain.'
                : selectedSeksi
                ? `Belum ada tiket laporan untuk seksi ${selectedSeksi}.`
                : 'Belum ada tiket dalam kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTickets.map((ticket) => (
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
