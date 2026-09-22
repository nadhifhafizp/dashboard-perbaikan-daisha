'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Ticket, UpdateTicketPayload, DeleteTicketPayload, TicketStatus } from '@/types/ticket';
import { useTickets, broadcastTicketChange } from '@/hooks/useTickets';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { exportTicketsToExcel } from '@/lib/excelExport';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import AdminTicketForm from '@/components/admin/AdminTicketForm';
import EditTicketModal from '@/components/riwayat/EditTicketModal';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import AdminTicketTable from '@/components/admin/AdminTicketTable';
import AdminKpiStats from '@/components/admin/AdminKpiStats';
import {
  ClipboardList,
  ArrowLeft,
  LayoutDashboard,
  PlusCircle,
  Download,
  RefreshCw,
} from 'lucide-react';

const API_URL = '/api/repair';

export default function AdminPage() {
  const { tickets, loading, refresh, setTickets } = useTickets();

  const [filterTab, setFilterTab] = useState<'all' | 'Open' | 'Progress' | 'Done' | 'Scrap'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Selected Ticket Edit Form State (AdminTicketForm)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Diagnosa / Edit Ticket State
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  // KPI Stats Summary
  const countStats = useMemo(() => {
    const openOnly = tickets.filter((t) => t.status === 'Open').length;
    const progressOnly = tickets.filter((t) => t.status === 'Progress').length;
    return {
      all: tickets.length,
      open: openOnly + progressOnly,
      done: tickets.filter((t) => t.status === 'Done').length,
      scrap: tickets.filter((t) => t.status === 'Scrap').length,
    };
  }, [tickets]);

  // Update Ticket Status
  const handleUpdate = async (data: {
    status: string;
    waktuKeluar: string;
    catatan: string;
    detail?: string;
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
      detail: data.detail,
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
        showFeedback('error', 'Gagal Memperbarui Tiket', resData.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server bengkel.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Diagnosa Edit
  const handleSaveEdit = async (data: {
    waktuMasuk: string;
    noDaisha: string;
    seksi: string;
    namaDaisha: string;
    jenisKerusakan: string;
    detail: string;
  }) => {
    if (!ticketToEdit) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch('/api/repair', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idTiket: ticketToEdit.idTiketAsli,
          ...data,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        showFeedback(
          'success',
          'Diagnosa Berhasil Disimpan',
          `Rincian kerusakan tiket #${ticketToEdit.noTiket || ticketToEdit.idTiketAsli} telah diperbarui.`
        );
        setTicketToEdit(null);
        refresh(true);
        broadcastTicketChange();
      } else {
        showFeedback('error', 'Gagal Menyimpan Diagnosa', json.error || 'Terjadi kesalahan pada server.');
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Delete Ticket
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
        setTickets((prev) => prev.filter((t) => t.idTiketAsli !== ticketToDelete.idTiketAsli));
        showFeedback(
          'success',
          'Tiket Berhasil Dihapus',
          `Data perbaikan tiket #${ticketToDelete.noTiket || ticketToDelete.idTiketAsli} telah dihapus permanen dari sistem.`
        );
        setTicketToDelete(null);
        refresh(true);
        broadcastTicketChange();
      } else {
        showFeedback('error', 'Gagal Menghapus Tiket', resData.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1 font-medium hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/daisha" className="font-medium hover:text-slate-900 transition">
              Dashboard Daisha
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Panel Tindakan</span>
          </nav>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Panel Tindakan Workshop
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5">
              Alur perbaikan bertahap: Antrean (Open) → Dikerjakan (Progress) → Selesai (Done)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link
            href="/daisha"
            className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 border border-slate-200 shadow-2xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/input"
            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Baru</span>
          </Link>

          <Link
            href="/riwayat"
            className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 border border-slate-200 shadow-2xs"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
            <span>Status Antrean</span>
          </Link>

          <button
            type="button"
            onClick={() =>
              exportTicketsToExcel(
                tickets,
                `Admin_Rekap_Daisha_${filterTab !== 'all' ? filterTab : 'Semua'}`
              )
            }
            disabled={tickets.length === 0}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-2xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh seluruh data Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg shadow-2xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Rekap Tiket & Status Panel Tindakan */}
      <div className="space-y-4">
        <AdminKpiStats
          countStats={countStats}
          filterTab={filterTab}
          setFilterTab={setFilterTab}
        />

        <AdminTicketTable
          tickets={tickets}
          loading={loading}
          filterTab={filterTab}
          onSelectTicket={setSelectedTicket}
          onEditTicket={setTicketToEdit}
          onTagTicket={setTicketForTag}
          onDeleteTicket={setTicketToDelete}
          isProcessing={isProcessing}
        />
      </div>

      {/* Admin Action Form Modal */}
      {selectedTicket && (
        <AdminTicketForm
          isOpen={!!selectedTicket}
          selectedTicket={selectedTicket}
          isProcessing={isProcessing}
          onSubmit={handleUpdate}
          onCancel={() => setSelectedTicket(null)}
        />
      )}

      {/* Modal Cetak Tag Fisik Daisha */}
      <PrintTicketTagModal
        isOpen={!!ticketForTag}
        ticket={
          ticketForTag
            ? {
                idTiket: ticketForTag.noTiket || ticketForTag.idTiketAsli,
                noDaisha: ticketForTag.noDaisha,
                namaDaisha: ticketForTag.namaDaisha,
                seksi: ticketForTag.seksi,
                namaPelapor: ticketForTag.pelapor,
                waktuMasuk: ticketForTag.tglMasuk,
                detail: ticketForTag.detail,
                catatanTeknisi: ticketForTag.reason,
                status: ticketForTag.status,
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
        confirmText="Hapus Tiket Permanen"
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

      {/* Modal Diagnosa / Koreksi Data Tiket Bengkel */}
      <EditTicketModal
        isOpen={!!ticketToEdit}
        ticket={ticketToEdit}
        isLoading={isSavingEdit}
        onSave={handleSaveEdit}
        onClose={() => setTicketToEdit(null)}
      />
    </div>
  );
}