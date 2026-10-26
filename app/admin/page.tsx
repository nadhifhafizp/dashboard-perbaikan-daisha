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
  ArrowLeft,
  LayoutDashboard,
  PlusCircle,
  Download,
  RefreshCw,
  BarChart3,
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
      {/* 1. Page Header (Flat Layout) */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-1 text-xs text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1 font-medium hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/daisha" className="font-medium hover:text-slate-900 transition">
              Perbaikan Daisha
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Panel Tindakan</span>
          </nav>
          <h1 className="t-title text-slate-900 tracking-tight">
            Tindakan Workshop
          </h1>
          <p className="t-caption text-slate-500">
            Status perbaikan dan progres tiket bengkel
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link
            href="/kpi?tab=daisha"
            className="h-11 sm:h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 border border-slate-300"
          >
            <BarChart3 className="w-4 h-4 text-red-600" />
            <span>KPI Daisha</span>
          </Link>

          <Link
            href="/input"
            className="h-11 sm:h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Baru</span>
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
            className="h-11 sm:h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh seluruh data Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="h-11 sm:h-10 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-slate-300"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </header>

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