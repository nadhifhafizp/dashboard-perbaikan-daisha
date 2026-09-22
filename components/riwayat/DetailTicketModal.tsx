'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  X,
  Layers,
  RefreshCw,
  Wrench,
  FileText,
  Search,
  MapPin,
  User,
  Clock,
  MessageSquare,
  Tag,
  Edit3,
} from 'lucide-react';
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

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden transform transition-all animate-scale-up flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0" aria-hidden="true">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="detail-dialog-title" className="text-sm font-semibold text-slate-900 leading-tight">
                  Detail Tiket Perbaikan
                </h3>
                <StatusBadge status={ticket.status} size="sm" />
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                ID: {ticket.idTiketAsli || ticket.noTiket || '-'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Tutup modal detail tiket"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Informasi Lengkap untuk Cross-Check */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Box 1: Identitas Unit Daisha */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-medium">Nomor Fisik Unit:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-sm text-red-700 bg-red-100/80 px-2.5 py-0.5 rounded border border-red-200">
                  {ticket.noDaisha}
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

            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-medium">Tipe / Jenis Daisha:</span>
              <span className="font-semibold text-slate-800">{ticket.namaDaisha}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Seksi Asal Unit:</span>
              <span className="font-semibold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                {ticket.seksi}
              </span>
            </div>
          </div>

          {/* Box 2: Rincian Kerusakan - Dikelompokkan Berdasarkan Jenis Tindakan */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
            {/* Tag Komponen yang Terkena */}
            <div>
              <span className="text-slate-500 font-medium block mb-1.5">
                Kategori / Komponen Kerusakan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {komponenList.length > 0 ? (
                  komponenList.map((k) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 bg-white font-medium text-slate-800 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{k}</span>
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 bg-white font-medium text-slate-500 rounded-lg border border-slate-200">
                    Komponen Umum
                  </span>
                )}
              </div>
            </div>

            {/* Rekap Jumlah Tindakan & Total Pcs */}
            {parsed.items.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200/70">
                <span className="text-xs font-semibold text-slate-500">Rangkuman Tindakan:</span>
                {parsed.gantiItems.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-medium text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-blue-600" />
                    <span>{parsed.totalQtyGanti} pcs Perlu Ganti Baru ({parsed.gantiItems.length} titik)</span>
                  </span>
                )}
                {parsed.repairItems.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium text-xs flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-amber-600" />
                    <span>{parsed.totalQtyRepair} pcs Perlu Repair ({parsed.repairItems.length} titik)</span>
                  </span>
                )}
              </div>
            )}

            {/* GRUP 1: PERLU GANTI BARU */}
            {parsed.gantiItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    Perlu Ganti Baru ({parsed.totalQtyGanti} pcs / {parsed.gantiItems.length} Titik)
                  </span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Suku Cadang Pengganti
                  </span>
                </div>

                <div className="space-y-1.5">
                  {parsed.gantiItems.map((item, idx) => (
                    <div
                      key={`ganti-${idx}`}
                      className="p-2.5 bg-white rounded-lg border border-blue-200/80 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                          {item.komponen && item.komponen !== 'Umum' && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.komponen}
                            </span>
                          )}
                          <span className="text-xs font-medium text-slate-900">
                            {item.gejala}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-medium tabular-nums">
                          {item.qty} pcs
                        </span>
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-medium flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Ganti Baru</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GRUP 2: PERLU REPAIR / SERVIS */}
            {parsed.repairItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    Perlu Repair / Servis ({parsed.totalQtyRepair} pcs / {parsed.repairItems.length} Titik)
                  </span>
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    Pengerjaan Teknisi
                  </span>
                </div>

                <div className="space-y-1.5">
                  {parsed.repairItems.map((item, idx) => (
                    <div
                      key={`repair-${idx}`}
                      className="p-2.5 bg-white rounded-lg border border-amber-200/80 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-amber-50 text-amber-800 font-semibold text-xs flex items-center justify-center shrink-0 border border-amber-200/60">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                          {item.komponen && item.komponen !== 'Umum' && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.komponen}
                            </span>
                          )}
                          <span className="text-xs font-medium text-slate-900">
                            {item.gejala}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-medium tabular-nums">
                          {item.qty} pcs
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-xs font-medium flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          <span>Repair</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GRUP 3: ITEM LAINNYA */}
            {parsed.otherItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Keluhan Lainnya ({parsed.otherItems.length})
                </span>
                <div className="space-y-1.5">
                  {parsed.otherItems.map((item, idx) => (
                    <div
                      key={`other-${idx}`}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs text-slate-800 font-medium"
                    >
                      {item.gejala}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JIKA TIDAK ADA DATA SAMA SEKALI */}
            {parsed.items.length === 0 && (
              parsed.isWaitingDiagnosis ? (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2.5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-amber-900 flex items-center gap-1.5 text-xs">
                      <Search className="w-4 h-4 text-amber-700" />
                      <span>Menunggu Diagnosa Bengkel</span>
                    </span>
                    {onEdit && isOpenStatus && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEdit(ticket);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Input Diagnosa Sekarang</span>
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 font-normal leading-relaxed">
                    Unit didaftarkan langsung ke bengkel dari lini produksi. Teknisi bengkel perlu menginspeksi kondisi fisik Daisha dan menentukan komponen yang perlu diperbaiki atau diganti.
                  </p>
                  {parsed.catatan && (
                    <div className="p-2.5 bg-white rounded-lg border border-amber-300/80 text-xs font-medium text-amber-900 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>Catatan Gejala / Indikasi Awal: {parsed.catatan}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-400 italic text-center">
                  Tidak ada rincian keluhan spesifik dari pelapor.
                </div>
              )
            )}

            {/* Catatan Tambahan Lokasi / Keterangan Posisi */}
            {!parsed.isWaitingDiagnosis && parsed.catatan && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-amber-900">
                    Catatan Tambahan Lokasi / Posisi:
                  </span>
                  <span className="font-normal text-slate-800">{parsed.catatan}</span>
                </div>
              </div>
            )}
          </div>

          {/* Box 3: Riwayat Waktu, Pelapor & Catatan Servis */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-medium">Nama Teknisi / Pelapor:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                {ticket.pelapor}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-medium">Waktu Masuk / Lapor:</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {ticket.tglMasuk}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
              <span className="text-slate-500 font-medium">Waktu Selesai Servis:</span>
              <span className="font-medium text-slate-700 tabular-nums">
                {ticket.tglKeluar && ticket.tglKeluar !== '-' ? ticket.tglKeluar : 'Belum Selesai'}
              </span>
            </div>

            {ticket.reason && (
              <div className="pt-1">
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5 mb-1 text-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Catatan Tindakan Teknisi Workshop:
                </span>
                <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200 font-normal leading-relaxed">
                  {ticket.reason}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="order-3 sm:order-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition cursor-pointer text-center"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => setIsPrintTagOpen(true)}
            className="order-2 sm:order-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Cetak Tag Fisik</span>
          </button>

          {isOpenStatus && onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(ticket);
              }}
              className="order-1 sm:order-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
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
