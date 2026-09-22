'use client';

import React from 'react';
import {
  FileText,
  Search,
  Wrench,
  RefreshCw,
  MapPin,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import { CreateTicketPayload } from '@/types/ticket';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';

interface ReviewTicketModalProps {
  isOpen: boolean;
  payload: CreateTicketPayload | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReviewTicketModal({
  isOpen,
  payload,
  isLoading,
  onConfirm,
  onCancel,
}: ReviewTicketModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen || !payload) return null;

  const parsed = parseTicketDamageDetail(payload.detail);
  const sizeInfo = detectDaishaSize(payload.noDaisha);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden transform transition-all animate-scale-up">
        <div className="p-5 space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100" aria-hidden="true">
              <FileText className="w-5 h-5" />
            </div>
            <h3 id="review-dialog-title" className="text-sm font-semibold text-slate-900 tracking-tight">
              Periksa Kembali Laporan Anda
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Pastikan nomor unit dan data kerusakan sudah sesuai sebelum dikirim ke antrean bengkel.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Nomor Unit Daisha:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-sm text-red-700 bg-red-100/80 px-2.5 py-0.5 rounded border border-red-200">
                  {payload.noDaisha}
                </span>
                {sizeInfo && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                  >
                    {sizeInfo.label}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Jenis Daisha & Seksi:</span>
              <span className="font-semibold text-slate-800">
                {payload.namaDaisha} ({payload.seksi})
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Nama Pelapor:</span>
              <span className="font-semibold text-slate-800">{payload.namaPelapor}</span>
            </div>

            {/* Rincian Titik Kerusakan Berstruktur */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-500 font-medium">
                  {parsed.isWaitingDiagnosis
                    ? 'Status Diagnosa Unit:'
                    : `Rincian Titik Kerusakan (${parsed.items.length} Titik / ${parsed.totalQtyAll} pcs):`}
                </span>
                {parsed.isWaitingDiagnosis && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Search className="w-3 h-3 text-amber-700" />
                    <span>Cek di Bengkel</span>
                  </span>
                )}
              </div>

              {parsed.isWaitingDiagnosis ? (
                <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                    <Search className="w-3.5 h-3.5 text-amber-700" />
                    <span>Menunggu Diagnosa Bengkel</span>
                  </div>
                  <p className="text-slate-600 font-normal leading-relaxed">
                    Kerusakan belum diidentifikasi di lapangan. Unit akan segera diangkut ke bengkel dan diinspeksi oleh teknisi.
                  </p>
                  {parsed.catatan && (
                    <div className="p-2 bg-white rounded border border-amber-300/80 text-xs font-medium text-amber-900 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>Catatan Gejala: {parsed.catatan}</span>
                    </div>
                  )}
                </div>
              ) : parsed.items.length > 0 ? (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {parsed.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-200 tabular-nums">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                          {item.komponen && item.komponen !== 'Umum' && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.komponen}
                            </span>
                          )}
                          <span className="font-medium text-slate-900">{item.gejala}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200 tabular-nums">
                          {item.qty} pcs
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 flex items-center gap-1 ${
                            item.tindakan === 'Ganti'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.tindakan === 'Ganti' ? (
                            <RefreshCw className="w-3 h-3 text-blue-600" />
                          ) : (
                            <Wrench className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{item.tindakan === 'Ganti' ? 'Ganti' : 'Repair'}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                  {parsed.catatan && (
                    <div className="p-2 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>Catatan Lokasi: {parsed.catatan}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-normal text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {payload.detail}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="w-full h-9 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Koreksi Lagi</span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full h-9 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              {isLoading ? (
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
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ya, Kirim Laporan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
