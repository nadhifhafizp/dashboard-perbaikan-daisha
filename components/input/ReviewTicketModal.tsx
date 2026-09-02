'use client';

import React from 'react';
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
  if (!isOpen || !payload) return null;

  const parsed = parseTicketDamageDetail(payload.detail);
  const sizeInfo = detectDaishaSize(payload.noDaisha);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 text-xl">
              📝
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Periksa Kembali Laporan Anda
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pastikan nomor unit dan data kerusakan sudah sesuai sebelum dikirim ke antrean bengkel.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-semibold">Nomor Unit Daisha:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-sm text-red-700 bg-red-100 px-2.5 py-0.5 rounded-lg border border-red-200">
                  {payload.noDaisha}
                </span>
                {sizeInfo && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                  >
                    {sizeInfo.label}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-semibold">Jenis Daisha & Seksi:</span>
              <span className="font-extrabold text-slate-800">
                {payload.namaDaisha} ({payload.seksi})
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-semibold">Nama Pelapor:</span>
              <span className="font-bold text-slate-800">{payload.namaPelapor}</span>
            </div>

            {/* Rincian Titik Kerusakan Berstruktur */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-500 font-semibold">
                  Rincian Titik Kerusakan ({parsed.items.length} Titik / {parsed.totalQtyAll} pcs):
                </span>
              </div>

              {parsed.items.length > 0 ? (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {parsed.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex items-center gap-1 flex-wrap">
                          {item.komponen && item.komponen !== 'Umum' && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              [{item.komponen}]
                            </span>
                          )}
                          <span className="font-bold text-slate-900">{item.gejala}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-black text-[10px] border border-slate-200">
                          {item.qty} pcs
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
                            item.tindakan === 'Ganti'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.tindakan === 'Ganti' ? '🔄 Ganti' : '🔨 Repair'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {parsed.catatan && (
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                      📌 Catatan Lokasi: {parsed.catatan}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-medium text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {payload.detail}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              ✏️ Koreksi Lagi
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-900/20 disabled:opacity-50"
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
                <span>✅ Ya, Kirim Laporan</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
