'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, RawTicketData, UpdateTicketPayload, DeleteTicketPayload, TicketStatus } from '@/types/ticket';
import { getInitialDateTime, cleanInputDateTime } from '@/lib/date';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import { processRawTicketData, setStatusOverride, normalizeStatus } from '@/lib/ticketParser';

const API_URL = "/api/repair";

let cachedAdminTickets: Ticket[] | null = null;

export default function AdminPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(() => cachedAdminTickets || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedAdminTickets);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'Open' | 'Progress' | 'Done' | 'Scrap'>('all');
  
  // Selected Ticket Edit Form State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formStatus, setFormStatus] = useState('Progress');
  const [formWaktuKeluar, setFormWaktuKeluar] = useState(getInitialDateTime());
  const [formReason, setFormReason] = useState('');

  // Interactive Modal States
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const fetchTiket = useCallback(async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Gagal mengambil data server");

      const data = await response.json();
      const hasilData: RawTicketData[] = data.value || data;

      if (Array.isArray(hasilData)) {
        const processed = processRawTicketData(hasilData);
        cachedAdminTickets = processed;
        setTickets(processed);
      }
    } catch (error) {
      console.error("Error saat fetch tiket:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Gagal mengambil data server");

        const data = await response.json();
        const hasilData: RawTicketData[] = data.value || data;

        if (Array.isArray(hasilData) && !ignore) {
          const processed = processRawTicketData(hasilData);
          cachedAdminTickets = processed;
          setTickets(processed);
        }
      } catch (error) {
        if (!ignore) console.error("Error saat fetch tiket:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  // Logic Alur Pengerjaan (State Machine Transition)
  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const cleanStatus = normalizeStatus(ticket.status);
    
    // Alur Status Searah:
    // Open -> Progress (Mulai Proses)
    // Progress -> Done (Selesai Diperbaiki)
    // Done / Scrap -> Status Terkunci
    if (cleanStatus === 'Open') {
      setFormStatus('Progress');
    } else if (cleanStatus === 'Progress') {
      setFormStatus('Done');
    } else {
      setFormStatus(cleanStatus);
    }

    setFormReason(ticket.reason || '');

    // Set waktu selesai default ke saat ini
    if (ticket.tglKeluar && ticket.tglKeluar !== '-') {
      const formatted = ticket.tglKeluar.replace(' ', 'T').slice(0, 16);
      setFormWaktuKeluar(formatted || getInitialDateTime());
    } else {
      setFormWaktuKeluar(getInitialDateTime());
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    // Strict Guard: Tidak boleh ada status Open yang terkirim di form update
    if (formStatus === 'Open') {
      showFeedback('error', 'Aksi Tidak Diizinkan', 'Tiket yang sedang atau sudah diproses tidak dapat dikembalikan ke status Open.');
      return;
    }

    setIsProcessing(true);

    let finalWaktuKeluar = '-';
    if (formStatus === 'Done' || formStatus === 'Scrap') {
      finalWaktuKeluar = cleanInputDateTime(formWaktuKeluar);
    }

    const payload: UpdateTicketPayload = {
      action: "UPDATE",
      idTiket: selectedTicket.idTiketAsli,
      status: formStatus,
      waktuKeluar: finalWaktuKeluar,
      catatan: formReason
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (response.ok) {
        // Catat override lokal agar delay sync cloud Excel tidak merevert ke status Open
        setStatusOverride(
          selectedTicket.idTiketAsli,
          formStatus as TicketStatus,
          finalWaktuKeluar,
          formReason
        );

        // Optimistic UI Update seketika agar status langsung terupdate di layar
        const updated = tickets.map(t =>
          t.idTiketAsli === selectedTicket.idTiketAsli
            ? { ...t, status: formStatus as TicketStatus, tglKeluar: finalWaktuKeluar, reason: formReason }
            : t
        );
        setTickets(updated);
        cachedAdminTickets = updated;

        showFeedback(
          'success', 
          'Status Berhasil Diperbarui', 
          `Tiket ${selectedTicket.noTiket} telah diubah menjadi status ${formStatus}.`,
          `Waktu Selesai: ${finalWaktuKeluar}`
        );
        setSelectedTicket(null);
        fetchTiket();
      } else {
        showFeedback(
          'error', 
          'Gagal Memperbarui Tiket', 
          resData.error || 'Terjadi kesalahan saat memproses data ke server.'
        );
      }
    } catch (error) {
      console.error("Gagal update tiket:", error);
      showFeedback('error', 'Gangguan Koneksi', 'Gagal menghubungi server. Periksa koneksi internet Anda.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Konfirmasi & Eksekusi Hapus Tiket
  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;

    setIsDeleting(true);

    const payload: DeleteTicketPayload = {
      action: "DELETE",
      idTiket: ticketToDelete.idTiketAsli
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (response.ok) {
        const deletedId = ticketToDelete.idTiketAsli;
        const deletedNo = ticketToDelete.noTiket;
        
        // Optimistic UI update
        const updated = tickets.filter(t => t.idTiketAsli !== deletedId);
        setTickets(updated);
        cachedAdminTickets = updated;
        if (selectedTicket?.idTiketAsli === deletedId) {
          setSelectedTicket(null);
        }

        setTicketToDelete(null);
        showFeedback('success', 'Data Berhasil Dihapus', `Tiket ${deletedNo} telah dihapus dari sistem.`);
        fetchTiket();
      } else {
        showFeedback('error', 'Gagal Menghapus Data', resData.error || 'Terjadi kesalahan pada server saat menghapus data.');
      }
    } catch (error) {
      console.error("Gagal hapus tiket:", error);
      showFeedback('error', 'Gangguan Koneksi', 'Gagal menghubungi server saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const executeLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  // Hitung jumlah tiket per kategori status
  const countStats = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    progress: tickets.filter(t => t.status === 'Progress').length,
    done: tickets.filter(t => t.status === 'Done').length,
    scrap: tickets.filter(t => t.status === 'Scrap').length,
  };

  const filteredTickets = tickets.filter(t => {
    // Filter tab status
    if (filterTab !== 'all' && t.status !== filterTab) return false;

    // Filter teks search
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.noTiket?.toLowerCase().includes(q) ||
      t.noDaisha?.toLowerCase().includes(q) ||
      t.namaDaisha?.toLowerCase().includes(q) ||
      t.namaPelapor?.toLowerCase().includes(q) ||
      t.seksi?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Clean & Simple */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ⚙️ Panel Tindakan Admin Workshop
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Alur proses perbaikan bertahap: Antrean (Open) ➔ Dikerjakan (Progress) ➔ Selesai (Done)
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchTiket}
            disabled={loading || isProcessing}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>🔄</span>
            <span>{loading ? "Memuat..." : "Refresh"}</span>
          </button>
          
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Request Perbaikan (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Filter Status Tabs & Search Box */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-sm font-bold text-gray-900">
                Daftar Tiket ({filteredTickets.length})
              </h2>
              <input
                type="text"
                placeholder="🔍 Cari Unit / Pelapor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 p-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  filterTab === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Semua ({countStats.all})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Open')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  filterTab === 'Open' ? 'bg-red-600 text-white' : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-100'
                }`}
              >
                <span>🔴 Antrean ({countStats.open})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Progress')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  filterTab === 'Progress' ? 'bg-blue-600 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100'
                }`}
              >
                <span>🔵 Dikerjakan ({countStats.progress})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Done')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  filterTab === 'Done' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100'
                }`}
              >
                <span>🟢 Selesai ({countStats.done})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('Scrap')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  filterTab === 'Scrap' ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
                      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="p-3"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                      <td className="p-3"><div className="h-6 bg-gray-200 rounded w-20 mx-auto"></div></td>
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
                        <span className="font-mono font-bold text-gray-900 block">{t.noTiket}</span>
                        <span className="text-[11px] text-gray-500">{t.tglMasuk}</span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-red-700 block">{t.noDaisha}</span>
                        <span className="text-[11px] text-gray-500">{t.namaDaisha} ({t.seksi})</span>
                      </td>

                      <td className="p-3 max-w-xs">
                        <span className="font-semibold text-gray-900 block">{t.kategori}</span>
                        <span className="text-[11px] text-gray-500 truncate block" title={t.detail}>{t.detail}</span>
                      </td>

                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          t.status === 'Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          t.status === 'Scrap' ? 'bg-gray-800 text-white border-gray-900' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {t.status === 'Open' ? '🔴 Open' :
                           t.status === 'Progress' ? '🔵 Progress' :
                           t.status === 'Done' ? '🟢 Done' : '⚫ Scrap'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Tombol Proses Kontekstual Sesuai Alur */}
                          {t.status === 'Open' ? (
                            <button
                              onClick={() => handleEdit(t)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1"
                              title="Mulai Pengerjaan Unit"
                            >
                              <span>Mulai ⚙️</span>
                            </button>
                          ) : t.status === 'Progress' ? (
                            <button
                              onClick={() => handleEdit(t)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1"
                              title="Selesaikan Perbaikan Unit"
                            >
                              <span>Selesaikan 🛠️</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(t)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1"
                              title="Lihat / Edit Catatan"
                            >
                              <span>Catatan 📝</span>
                            </button>
                          )}

                          <button
                            onClick={() => setTicketToDelete(t)}
                            disabled={isProcessing}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
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

        {/* Form Update Pekerjaan (1 Kolom) */}
        <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
            Form Update Perbaikan
          </h2>

          {!selectedTicket ? (
            <div className="py-12 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center">
              <span className="text-2xl mb-2 block">👆</span>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Pilih tiket di tabel lalu klik tombol aksi <span className="text-blue-700 font-bold">&quot;Mulai ⚙️&quot;</span> atau <span className="text-emerald-700 font-bold">&quot;Selesaikan 🛠️&quot;</span> untuk memproses unit.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              
              {/* Unit Info Box & Status Form */}
              {(() => {
                const currentStatus = normalizeStatus(selectedTicket.status);
                return (
                  <>
                    <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-100 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-red-800 font-mono">{selectedTicket.noTiket}</span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${
                          currentStatus === 'Done' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          currentStatus === 'Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          currentStatus === 'Scrap' ? 'bg-gray-200 text-gray-800 border-gray-300' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          Status Saat Ini: {currentStatus}
                        </span>
                      </div>
                      <p className="font-extrabold text-gray-900 pt-1">
                        Unit {selectedTicket.noDaisha} ({selectedTicket.namaDaisha})
                      </p>
                      <p className="text-gray-600">Seksi: {selectedTicket.seksi} • Pelapor: {selectedTicket.namaPelapor}</p>
                      <p className="text-gray-600 truncate">Keluhan: {selectedTicket.detail}</p>
                    </div>

                    {/* Kontrol Status Dinamis Sesuai Alur Proses (State Machine) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Status Pengerjaan *
                      </label>

                      {currentStatus === 'Open' ? (
                        <div>
                          <select
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                          >
                            <option value="Progress">🔵 Mulai Kerjakan (Progress)</option>
                            <option value="Scrap">⚫ Unit Rusak Berat (Scrap)</option>
                          </select>
                          <span className="text-[10px] text-blue-700 block mt-1">
                            *Unit dalam antrean. Klik simpan untuk menandai pengerjaan sedang berlangsung.
                          </span>
                        </div>
                      ) : currentStatus === 'Progress' ? (
                        <div>
                          <select
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                          >
                            <option value="Done">🟢 Selesai Diperbaiki (Done)</option>
                            <option value="Scrap">⚫ Tidak Bisa Diperbaiki (Scrap)</option>
                          </select>
                          <div className="mt-1.5 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5 font-semibold">
                            <span>🚫</span>
                            <span>Tiket sedang dikerjakan. Tidak dapat dikembalikan ke antrean (Open).</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                            currentStatus === 'Done'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}>
                            <span>Status: {currentStatus === 'Done' ? '🟢 Selesai Diperbaiki (Done)' : '⚫ Unit Afkir (Scrap)'}</span>
                            <span className="text-[10px] bg-white/90 px-2 py-0.5 rounded font-mono shadow-sm">🔒 Status Terkunci</span>
                          </div>
                          <span className="text-[10px] text-gray-500 block">
                            *Tiket telah selesai dan tidak dapat dikembalikan ke status Open atau Progress.
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Input Waktu Selesai (Hanya muncul jika Done atau Scrap) */}
              {(formStatus === 'Done' || formStatus === 'Scrap') && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    Waktu Selesai Servis (Tanggal & Jam) *
                  </label>
                  <input
                    type="datetime-local"
                    value={formWaktuKeluar}
                    onChange={(e) => setFormWaktuKeluar(e.target.value)}
                    required
                    className="w-full p-2 border border-emerald-300 rounded-lg text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                  <span className="text-[10px] text-emerald-700 block mt-1">
                    *Waktu ini akan tercatat resmi sebagai Waktu Selesai unit bengkel.
                  </span>
                </div>
              )}

              {/* Catatan Tindakan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan Tindakan Teknisi {formStatus === 'Done' || formStatus === 'Scrap' ? '*' : '(Opsional)'}
                </label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  placeholder={
                    formStatus === 'Done'
                      ? "Jelaskan perbaikan yang dilakukan (contoh: Penggantian bearing roda dan pelumasan bearing selesai)..."
                      : formStatus === 'Scrap'
                      ? "Alasan unit tidak dapat diperbaiki (contoh: Sasis patah bengkok parah)..."
                      : "Catatan awal teknisi..."
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white focus:ring-2 focus:ring-red-600 outline-none"
                  required={formStatus === 'Done' || formStatus === 'Scrap'}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                    formStatus === 'Done' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : formStatus === 'Progress'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-red-700 hover:bg-red-800'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Menyimpan ke Server...</span>
                    </>
                  ) : formStatus === 'Done' ? (
                    "✅ Selesaikan & Simpan Servis"
                  ) : formStatus === 'Progress' ? (
                    "⚙️ Mulai Pengerjaan (Set Progress)"
                  ) : (
                    "💾 Simpan Perubahan"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  disabled={isProcessing}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

      {/* Interactive Confirm Delete Modal with Loading Buffering */}
      <ConfirmModal
        isOpen={!!ticketToDelete}
        isDestructive={true}
        title="Hapus Data Tiket Perbaikan"
        message={`Apakah Anda yakin ingin menghapus data tiket ini secara permanen? Data yang telah dihapus tidak dapat dikembalikan.`}
        detail={ticketToDelete ? `ID: ${ticketToDelete.noTiket} | Unit: ${ticketToDelete.noDaisha} (${ticketToDelete.namaDaisha} - ${ticketToDelete.seksi})` : undefined}
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        isLoading={isDeleting}
        loadingText="Menghapus tiket dari database..."
        onConfirm={confirmDeleteTicket}
        onCancel={() => !isDeleting && setTicketToDelete(null)}
      />

      {/* Interactive Logout Confirm Modal */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Konfirmasi Keluar (Logout)"
        message="Apakah Anda yakin ingin mengakhiri sesi Admin Panel?"
        confirmText="Ya, Keluar"
        cancelText="Tetap Masuk"
        isLoading={isLoggingOut}
        loadingText="Keluar dari sesi..."
        onConfirm={executeLogout}
        onCancel={() => !isLoggingOut && setIsLogoutConfirmOpen(false)}
      />

      {/* Interactive Feedback Modal (Success/Error/Info) */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        detail={feedback.detail}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}