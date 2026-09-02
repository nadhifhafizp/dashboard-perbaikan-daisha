'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types/ticket';
import { normalizeStatus } from '@/lib/ticketParser';
import { getInitialDateTime, cleanInputDateTime } from '@/lib/date';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';
import { detectDaishaSize } from '@/lib/daishaSize';

interface AdminTicketFormProps {
  isOpen: boolean;
  selectedTicket: Ticket | null;
  isProcessing: boolean;
  onCancel: () => void;
  onSubmit: (data: { status: string; waktuKeluar: string; catatan: string }) => void;
}

export default function AdminTicketForm({
  isOpen,
  selectedTicket,
  isProcessing,
  onCancel,
  onSubmit,
}: AdminTicketFormProps) {
  if (!isOpen || !selectedTicket) return null;

  return (
    <AdminTicketFormDialog
      key={selectedTicket.idTiketAsli || selectedTicket.noTiket || selectedTicket.id}
      ticket={selectedTicket}
      isProcessing={isProcessing}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

function AdminTicketFormDialog({
  ticket,
  isProcessing,
  onCancel,
  onSubmit,
}: {
  ticket: Ticket;
  isProcessing: boolean;
  onCancel: () => void;
  onSubmit: (data: { status: string; waktuKeluar: string; catatan: string }) => void;
}) {
  const currentStatus = normalizeStatus(ticket.status);
  const sizeInfo = detectDaishaSize(ticket.noDaisha);

  const [formStatus, setFormStatus] = useState<string>(() => {
    if (currentStatus === 'Open') return 'Progress';
    if (currentStatus === 'Progress') return 'Done';
    return currentStatus;
  });

  const [formWaktuKeluar, setFormWaktuKeluar] = useState<string>(() => {
    if (ticket.tglKeluar && ticket.tglKeluar !== '-') {
      const formatted = ticket.tglKeluar.replace(' ', 'T').slice(0, 16);
      return formatted || getInitialDateTime();
    }
    return getInitialDateTime();
  });

  const [formReason, setFormReason] = useState<string>(() => ticket.reason || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalWaktuKeluar = '-';
    if (formStatus === 'Done' || formStatus === 'Scrap') {
      finalWaktuKeluar = cleanInputDateTime(formWaktuKeluar);
    }

    onSubmit({
      status: formStatus,
      waktuKeluar: finalWaktuKeluar,
      catatan: formReason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto animate-scale-up">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛠️</span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Update Status Pengerjaan Tiket
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {ticket.idTiketAsli || ticket.noTiket}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition cursor-pointer"
            title="Tutup Modal"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Card Info Ringkasan Unit Daisha */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center font-bold">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-slate-900 text-xs font-black">
                  Unit {ticket.noDaisha}
                </span>
                {sizeInfo && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                  >
                    {sizeInfo.code} ({sizeInfo.label})
                  </span>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  currentStatus === 'Done'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : currentStatus === 'Progress'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : currentStatus === 'Scrap'
                    ? 'bg-gray-200 text-gray-800 border-gray-300'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                Status Saat Ini: {currentStatus}
              </span>
            </div>
            <p className="font-bold text-slate-800">
              {ticket.namaDaisha} • Seksi: {ticket.seksi}
            </p>
            <p className="text-slate-600">
              Pelapor: <span className="font-semibold text-slate-800">{ticket.pelapor}</span> • Masuk: {ticket.tglMasuk}
            </p>
            <div className="pt-1 border-t border-slate-200/80 text-slate-700">
              <span className="font-bold text-slate-800">Kerusakan: </span>
              {ticket.detail && ticket.detail !== '-' ? ticket.detail : ticket.jenisKerusakan}
            </div>
          </div>

          {/* Kontrol Status Dinamis */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ubah Status Pengerjaan *
            </label>

            {currentStatus === 'Open' ? (
              <div>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                >
                  <option value="Progress">🔵 Mulai Kerjakan (Progress)</option>
                  <option value="Scrap">⚫ Unit Rusak Berat (Scrap)</option>
                </select>
                <span className="text-[10px] text-blue-700 block mt-1">
                  *Unit dalam antrean. Klik simpan untuk menandai pengerjaan bengkel sedang berlangsung.
                </span>
              </div>
            ) : currentStatus === 'Progress' ? (
              <div>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
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
                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    currentStatus === 'Done'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  <span>
                    Status:{' '}
                    {currentStatus === 'Done'
                      ? '🟢 Selesai Diperbaiki (Done)'
                      : '⚫ Unit Afkir (Scrap)'}
                  </span>
                  <span className="text-[10px] bg-white/90 px-2 py-0.5 rounded font-mono shadow-xs">
                    🔒 Status Terkunci
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 block">
                  *Tiket telah selesai dan tidak dapat dikembalikan ke status Open atau Progress.
                </span>
              </div>
            )}
          </div>

          {/* Input Waktu Selesai (Hanya jika Done atau Scrap) */}
          {(formStatus === 'Done' || formStatus === 'Scrap') && (
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                Waktu Selesai Servis (Tanggal & Jam) *
              </label>
              <IndoDateTimeInput
                value={formWaktuKeluar}
                onChange={(val) => setFormWaktuKeluar(val)}
                required
              />
              <span className="text-[10px] text-emerald-700 block mt-1.5">
                *Waktu ini akan tercatat resmi sebagai Waktu Selesai unit bengkel.
              </span>
            </div>
          )}

          {/* Catatan Tindakan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Tindakan Teknisi{' '}
              {formStatus === 'Done' || formStatus === 'Scrap' ? '*' : '(Opsional)'}
            </label>
            <textarea
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              rows={3}
              placeholder={
                formStatus === 'Done'
                  ? 'Jelaskan perbaikan yang dilakukan (contoh: Penggantian bearing roda dan pelumasan selesai)...'
                  : formStatus === 'Scrap'
                  ? 'Alasan unit tidak dapat diperbaiki (contoh: Sasis patah bengkok parah)...'
                  : 'Catatan awal teknisi...'
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-600 outline-none"
              required={formStatus === 'Done' || formStatus === 'Scrap'}
            ></textarea>
          </div>

          {/* Action Buttons Modal */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full sm:w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer order-2 sm:order-1"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full sm:w-2/3 py-2.5 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 ${
                formStatus === 'Done'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : formStatus === 'Progress'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-700 hover:bg-red-800'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Menyimpan ke Server...</span>
                </>
              ) : formStatus === 'Done' ? (
                '✅ Selesaikan & Simpan Servis'
              ) : formStatus === 'Progress' ? (
                '⚙️ Mulai Pengerjaan (Set Progress)'
              ) : (
                '💾 Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
