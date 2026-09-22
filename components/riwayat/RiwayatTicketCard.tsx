'use client';

import React from 'react';
import { Ticket } from '@/types/ticket';
import StatusBadge from '@/components/common/StatusBadge';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';
import {
  Wrench,
  Search,
  RotateCw,
  MessageSquare,
  Clock,
  User,
  Tag,
  Pencil,
  Trash2,
} from 'lucide-react';

interface RiwayatTicketCardProps {
  ticket: Ticket;
  onViewDetail: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
  onCancel?: (ticket: Ticket) => void;
  onPrintTag?: (ticket: Ticket) => void;
}

function RiwayatTicketCardComponent({
  ticket,
  onViewDetail,
  onEdit,
  onCancel,
  onPrintTag,
}: RiwayatTicketCardProps) {
  const isOpen = ticket.status === 'Open';

  // Parse detail gejala menjadi objek terstruktur dan terkelompok
  const parsed = parseTicketDamageDetail(ticket.detail);
  const sizeInfo = detectDaishaSize(ticket.noDaisha);

  const isNeedsDiagnosis =
    parsed.isWaitingDiagnosis ||
    ticket.jenisKerusakan?.toLowerCase().includes('diagnosa') ||
    ticket.detail?.toLowerCase().includes('pemeriksaan bengkel') ||
    ticket.detail?.toLowerCase().includes('belum diidentifikasi');

  const komponenList =
    ticket.jenisKerusakan && ticket.jenisKerusakan !== '-'
      ? ticket.jenisKerusakan.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition space-y-2.5">
      {/* Baris 1: No Unit + Tipe Daisha + Seksi + Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="px-2.5 py-0.5 bg-red-600 text-white font-mono font-semibold text-xs sm:text-sm rounded shadow-2xs shrink-0">
            {ticket.noDaisha}
          </span>
          {sizeInfo && (
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor} shrink-0`}
            >
              {sizeInfo.label}
            </span>
          )}
          <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
            {ticket.namaDaisha}
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs text-slate-600 font-medium px-2 py-0.5 bg-slate-100 rounded shrink-0 border border-slate-200/60">
            Seksi: {ticket.seksi}
          </span>
        </div>

        <StatusBadge status={ticket.status} />
      </div>

      {/* Baris 2: Kerusakan Visual Dikelompokkan (Ganti vs Repair) */}
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-2">
        {/* Komponen Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            Kerusakan:
          </span>
          {isNeedsDiagnosis ? (
            <span className="px-2 py-0.5 rounded font-medium text-xs text-amber-900 bg-amber-100 border border-amber-300 flex items-center gap-1">
              <Search className="w-3 h-3" />
              <span>Menunggu Diagnosa Bengkel</span>
            </span>
          ) : komponenList.length > 0 ? (
            komponenList.map((k) => (
              <span
                key={k}
                className="px-2 py-0.5 rounded font-medium text-xs text-slate-800 bg-white border border-slate-200 shadow-2xs"
              >
                {k}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 rounded font-medium text-xs text-slate-500 bg-white border border-slate-200">
              Kerusakan Umum
            </span>
          )}
        </div>

        {/* Grup Tindakan: Ganti Baru vs Repair */}
        {parsed.items.length > 0 ? (
          <div className="space-y-1.5 pt-0.5">
            {/* 1. Kelompok Ganti Baru */}
            {parsed.gantiItems.length > 0 && (
              <div className="flex items-start gap-2 bg-blue-50/80 p-2 rounded-lg border border-blue-200/80">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-medium text-xs shrink-0 flex items-center gap-1 shadow-2xs tabular-nums">
                  <RotateCw className="w-3 h-3" />
                  <span>Ganti ({parsed.totalQtyGanti} pcs)</span>
                </span>
                <div className="min-w-0 text-xs text-slate-800 leading-relaxed">
                  {parsed.gantiItems.map((item, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="text-slate-300 mx-1.5">•</span>}
                      {item.komponen && item.komponen !== 'Umum' && (
                        <span className="font-medium text-slate-700 bg-blue-100/70 px-1 py-0.2 rounded mr-1">
                          {item.komponen}
                        </span>
                      )}
                      <span className="font-medium text-slate-900">{item.gejala}</span>
                      {item.qty > 1 && (
                        <span className="ml-1 text-xs font-medium text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded tabular-nums">
                          {item.qty} pcs
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Kelompok Repair / Servis */}
            {parsed.repairItems.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-50/80 p-2 rounded-lg border border-amber-200/80">
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-medium text-xs shrink-0 flex items-center gap-1 shadow-2xs tabular-nums">
                  <Wrench className="w-3 h-3" />
                  <span>Repair ({parsed.totalQtyRepair} pcs)</span>
                </span>
                <div className="min-w-0 text-xs text-slate-800 leading-relaxed">
                  {parsed.repairItems.map((item, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="text-slate-300 mx-1.5">•</span>}
                      {item.komponen && item.komponen !== 'Umum' && (
                        <span className="font-medium text-slate-700 bg-amber-100/70 px-1 py-0.2 rounded mr-1">
                          {item.komponen}
                        </span>
                      )}
                      <span className="font-medium text-slate-900">{item.gejala}</span>
                      {item.qty > 1 && (
                        <span className="ml-1 text-xs font-medium text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded tabular-nums">
                          {item.qty} pcs
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Kelompok Lainnya */}
            {parsed.otherItems.length > 0 && (
              <div className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-500">Keluhan: </span>
                {parsed.otherItems.map((i) => i.gejala).join(', ')}
              </div>
            )}
          </div>
        ) : isNeedsDiagnosis ? (
          <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg space-y-1 text-xs">
            <p className="font-semibold text-amber-950 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Unit Belum Diinspeksi Spesifik</span>
            </p>
            <p className="text-slate-600 text-xs font-normal">
              {parsed.catatan
                ? `Catatan Gejala dari Operator: "${parsed.catatan}"`
                : 'Unit didaftarkan langsung ke bengkel. Detail kerusakan akan diinput setelah pemeriksaan fisik.'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Belum ada rincian titik kerusakan spesifik.
          </p>
        )}

        {ticket.reason && (
          <div className="pt-1 text-xs text-emerald-800 font-medium flex items-start gap-1">
            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-px" />
            <span>Catatan Teknisi: {ticket.reason}</span>
          </div>
        )}
      </div>

      {/* Baris 3: Footer Info & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs">
        <div className="text-slate-400 font-normal truncate flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="tabular-nums">{ticket.tglMasuk}</span>
          <span className="mx-1">•</span>
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{ticket.pelapor}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onPrintTag && (
            <button
              type="button"
              onClick={() => onPrintTag(ticket)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Cetak Tag Fisik Daisha untuk digantungkan di unit"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Cetak Tag</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewDetail(ticket)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Detail</span>
          </button>

          {isOpen && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(ticket)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1 ${
                isNeedsDiagnosis
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {isNeedsDiagnosis ? (
                <Wrench className="w-3.5 h-3.5" />
              ) : (
                <Pencil className="w-3.5 h-3.5" />
              )}
              <span>{isNeedsDiagnosis ? 'Diagnosa' : 'Edit'}</span>
            </button>
          )}

          {isOpen && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(ticket)}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(RiwayatTicketCardComponent);
