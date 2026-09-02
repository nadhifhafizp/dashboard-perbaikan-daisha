'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types/ticket';
import StatusBadge from '@/components/common/StatusBadge';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';
import { detectDaishaSize } from '@/lib/daishaSize';

interface DetailTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onEdit?: (ticket: Ticket) => void;
}

export default function DetailTicketModal({
  isOpen,
  ticket,
  onClose,
  onEdit,
}: DetailTicketModalProps) {
  const [isPrintTagOpen, setIsPrintTagOpen] = useState(false);

  if (!isOpen || !ticket) return null;

  const isOpenStatus = ticket.status === 'Open';

  // Parse string gabungan kerusakan menjadi array objek terstruktur dan dikelompokkan
  const parsed = parseTicketDamageDetail(ticket.detail);
  const sizeInfo = detectDaishaSize(ticket.noDaisha);

  // Komponen chips
  const komponenList =
    ticket.jenisKerusakan && ticket.jenisKerusakan !== '-'
      ? ticket.jenisKerusakan.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-lg shrink-0">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Detail Tiket Perbaikan
                </h3>
                <StatusBadge status={ticket.status} size="sm" />
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                ID: {ticket.idTiketAsli || ticket.noTiket || '-'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg font-bold cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Body Informasi Lengkap untuk Cross-Check */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Box 1: Identitas Unit Daisha */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-semibold">Nomor Fisik Unit:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-sm text-red-700 bg-red-100 px-2.5 py-0.5 rounded-lg border border-red-200">
                  {ticket.noDaisha}
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

            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-semibold">Tipe / Jenis Daisha:</span>
              <span className="font-bold text-slate-800">{ticket.namaDaisha}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Seksi Asal Unit:</span>
              <span className="font-extrabold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                {ticket.seksi}
              </span>
            </div>
          </div>

          {/* Box 2: Rincian Kerusakan - Dikelompokkan Berdasarkan Jenis Tindakan (Ganti vs Repair) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
            {/* Tag Komponen yang Terkena */}
            <div>
              <span className="text-slate-500 font-semibold block mb-1.5">
                Kategori / Komponen Kerusakan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {komponenList.length > 0 ? (
                  komponenList.map((k) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 bg-white font-extrabold text-slate-800 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1"
                    >
                      <span>⚙️</span>
                      <span>{k}</span>
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 bg-white font-bold text-slate-500 rounded-lg border border-slate-200">
                    Komponen Umum
                  </span>
                )}
              </div>
            </div>

            {/* Rekap Jumlah Tindakan & Total Pcs */}
            {parsed.items.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-500">Rangkuman Tindakan:</span>
                {parsed.gantiItems.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-md font-black text-[10px] flex items-center gap-1">
                    <span>🔄</span>
                    <span>{parsed.totalQtyGanti} pcs Perlu Ganti Baru ({parsed.gantiItems.length} titik)</span>
                  </span>
                )}
                {parsed.repairItems.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-black text-[10px] flex items-center gap-1">
                    <span>🔨</span>
                    <span>{parsed.totalQtyRepair} pcs Perlu Repair ({parsed.repairItems.length} titik)</span>
                  </span>
                )}
              </div>
            )}

            {/* GRUP 1: PERLU GANTI BARU (BLUE SECTION) */}
            {parsed.gantiItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    🔄 Perlu Ganti Baru ({parsed.totalQtyGanti} pcs / {parsed.gantiItems.length} Titik)
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Suku Cadang Pengganti
                  </span>
                </div>

                <div className="space-y-1.5">
                  {parsed.gantiItems.map((item, idx) => (
                    <div
                      key={`ganti-${idx}`}
                      className="p-2.5 bg-white rounded-xl border border-blue-200/80 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0 border border-blue-100">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                          {item.komponen && item.komponen !== 'Umum' && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              ⚙️ {item.komponen}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900">
                            {item.gejala}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-[10px] font-black">
                          {item.qty} pcs
                        </span>
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-black flex items-center gap-1">
                          <span>🔄</span>
                          <span>Ganti Baru</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GRUP 2: PERLU REPAIR / SERVIS (AMBER SECTION) */}
            {parsed.repairItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    🔨 Perlu Repair / Servis ({parsed.totalQtyRepair} pcs / {parsed.repairItems.length} Titik)
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    Pengerjaan Teknisi
                  </span>
                </div>

                <div className="space-y-1.5">
                  {parsed.repairItems.map((item, idx) => (
                    <div
                      key={`repair-${idx}`}
                      className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 font-black text-[10px] flex items-center justify-center shrink-0 border border-amber-200/60">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                          {item.komponen && item.komponen !== 'Umum' && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              ⚙️ {item.komponen}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900">
                            {item.gejala}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-black">
                          {item.qty} pcs
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[10px] font-black flex items-center gap-1">
                          <span>🔨</span>
                          <span>Repair</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GRUP 3: ITEM LAINNYA (JIKA ADA TEKS BEBAS) */}
            {parsed.otherItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  📝 Keluhan Lainnya ({parsed.otherItems.length})
                </span>
                <div className="space-y-1.5">
                  {parsed.otherItems.map((item, idx) => (
                    <div
                      key={`other-${idx}`}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-slate-800 font-medium"
                    >
                      {item.gejala}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JIKA TIDAK ADA DATA SAMA SEKALI */}
            {parsed.items.length === 0 && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-400 italic text-center">
                Tidak ada rincian keluhan spesifik dari pelapor.
              </div>
            )}

            {/* Catatan Tambahan Lokasi / Keterangan Posisi */}
            {parsed.catatan && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                <span className="text-sm shrink-0 mt-0.5">📌</span>
                <div>
                  <span className="font-extrabold block text-amber-900">
                    Catatan Tambahan Lokasi / Posisi:
                  </span>
                  <span className="font-medium text-slate-800">{parsed.catatan}</span>
                </div>
              </div>
            )}
          </div>

          {/* Box 3: Riwayat Waktu, Pelapor & Catatan Servis */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-semibold">Nama Teknisi / Pelapor:</span>
              <span className="font-bold text-slate-800">👤 {ticket.pelapor}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-semibold">Waktu Masuk / Lapor:</span>
              <span className="font-semibold text-slate-700">🕒 {ticket.tglMasuk}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-semibold">Waktu Selesai Servis:</span>
              <span className="font-semibold text-slate-700">
                {ticket.tglKeluar && ticket.tglKeluar !== '-' ? ticket.tglKeluar : 'Belum Selesai'}
              </span>
            </div>

            {ticket.reason && (
              <div className="pt-1">
                <span className="text-emerald-700 font-bold block mb-1">
                  💬 Catatan Tindakan Teknisi Workshop:
                </span>
                <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 font-medium leading-relaxed">
                  {ticket.reason}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => setIsPrintTagOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>🏷️</span>
            <span>Cetak Tag Fisik</span>
          </button>

          {isOpenStatus && onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(ticket);
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-amber-900/10 cursor-pointer flex items-center gap-1.5"
            >
              <span>✏️</span>
              <span>Koreksi / Edit Tiket</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Cetak Tag Fisik Daisha */}
      <PrintTicketTagModal
        isOpen={isPrintTagOpen}
        ticket={
          ticket
            ? {
                idTiket: String(ticket.idTiketAsli || ticket.noTiket || ticket.id),
                noDaisha: ticket.noDaisha,
                namaDaisha: ticket.namaDaisha,
                seksi: ticket.seksi,
                namaPelapor: ticket.pelapor,
                waktuMasuk: ticket.tglMasuk,
                status: ticket.status,
                detail: ticket.detail,
                catatanTeknisi: ticket.reason,
              }
            : null
        }
        onClose={() => setIsPrintTagOpen(false)}
      />
    </div>
  );
}
