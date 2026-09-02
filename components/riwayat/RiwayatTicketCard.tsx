'use client';

import React from 'react';
import { Ticket } from '@/types/ticket';
import StatusBadge from '@/components/common/StatusBadge';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';

interface RiwayatTicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onCancel: (ticket: Ticket) => void;
  onViewDetail: (ticket: Ticket) => void;
  onPrintTag?: (ticket: Ticket) => void;
}

export default function RiwayatTicketCard({
  ticket,
  onEdit,
  onCancel,
  onViewDetail,
  onPrintTag,
}: RiwayatTicketCardProps) {
  const isOpen = ticket.status === 'Open';

  // Parse detail gejala menjadi objek terstruktur dan terkelompok
  const parsed = parseTicketDamageDetail(ticket.detail);
  const sizeInfo = detectDaishaSize(ticket.noDaisha);

  const komponenList =
    ticket.jenisKerusakan && ticket.jenisKerusakan !== '-'
      ? ticket.jenisKerusakan.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition space-y-2.5">
      {/* Baris 1: No Unit + Tipe Daisha + Seksi + Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="px-2.5 py-0.5 bg-red-600 text-white font-mono font-black text-xs sm:text-sm rounded-lg shadow-2xs shrink-0">
            {ticket.noDaisha}
          </span>
          {sizeInfo && (
            <span
              className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor} shrink-0`}
            >
              {sizeInfo.label}
            </span>
          )}
          <span className="text-xs sm:text-sm font-black text-slate-800 truncate">
            {ticket.namaDaisha}
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-600 font-bold px-2 py-0.5 bg-slate-100 rounded-md shrink-0 border border-slate-200/60">
            Seksi: {ticket.seksi}
          </span>
        </div>

        <StatusBadge status={ticket.status} />
      </div>

      {/* Baris 2: Kerusakan Visual Dikelompokkan (Ganti vs Repair) */}
      <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
        {/* Komponen Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            🔧 Kerusakan:
          </span>
          {komponenList.length > 0 ? (
            komponenList.map((k) => (
              <span
                key={k}
                className="px-2 py-0.5 rounded-md font-extrabold text-[11px] text-slate-800 bg-white border border-slate-200 shadow-2xs"
              >
                {k}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 rounded-md font-bold text-[11px] text-slate-500 bg-white border border-slate-200">
              Kerusakan Umum
            </span>
          )}
        </div>

        {/* Grup Tindakan: Ganti Baru vs Repair */}
        {parsed.items.length > 0 ? (
          <div className="space-y-1.5 pt-0.5">
            {/* 1. Kelompok Ganti Baru */}
            {parsed.gantiItems.length > 0 && (
              <div className="flex items-start gap-2 bg-blue-50/80 p-2 rounded-xl border border-blue-200/80">
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-[10px] shrink-0 flex items-center gap-1 shadow-2xs">
                  <span>🔄</span>
                  <span>Ganti ({parsed.totalQtyGanti} pcs)</span>
                </span>
                <div className="min-w-0 text-[11px] text-slate-800 leading-relaxed">
                  {parsed.gantiItems.map((item, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="text-slate-300 mx-1.5">•</span>}
                      {item.komponen && item.komponen !== 'Umum' && (
                        <span className="font-extrabold text-slate-700">[{item.komponen}]</span>
                      )}{' '}
                      <span className="font-semibold text-slate-900">{item.gejala}</span>
                      {item.qty > 1 && (
                        <span className="ml-1 text-[10px] font-black text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
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
              <div className="flex items-start gap-2 bg-amber-50/80 p-2 rounded-xl border border-amber-200/80">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[10px] shrink-0 flex items-center gap-1 shadow-2xs">
                  <span>🔨</span>
                  <span>Repair ({parsed.totalQtyRepair} pcs)</span>
                </span>
                <div className="min-w-0 text-[11px] text-slate-800 leading-relaxed">
                  {parsed.repairItems.map((item, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="text-slate-300 mx-1.5">•</span>}
                      {item.komponen && item.komponen !== 'Umum' && (
                        <span className="font-extrabold text-slate-700">[{item.komponen}]</span>
                      )}{' '}
                      <span className="font-semibold text-slate-900">{item.gejala}</span>
                      {item.qty > 1 && (
                        <span className="ml-1 text-[10px] font-black text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                          {item.qty} pcs
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Kelompok Lainnya (jika teks bebas) */}
            {parsed.otherItems.length > 0 && (
              <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500">Keluhan: </span>
                {parsed.otherItems.map((i) => i.gejala).join(', ')}
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Belum ada rincian titik kerusakan spesifik.
          </p>
        )}

        {/* Catatan Tindakan Workshop (jika ada) */}
        {ticket.reason && (
          <div className="pt-1 text-[11px] text-emerald-800 font-medium flex items-start gap-1">
            <span>💬</span>
            <span>Catatan Teknisi: {ticket.reason}</span>
          </div>
        )}
      </div>

      {/* Baris 3: Footer Info & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-[11px]">
        <div className="text-slate-400 font-medium truncate">
          <span>🕒 {ticket.tglMasuk}</span>
          <span className="mx-1.5">•</span>
          <span>👤 {ticket.pelapor}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tombol Cetak Tag Fisik Daisha Langsung */}
          {onPrintTag && (
            <button
              type="button"
              onClick={() => onPrintTag(ticket)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Cetak Tag Fisik Daisha untuk digantungkan di unit"
            >
              <span>🏷️</span>
              <span>Cetak Tag</span>
            </button>
          )}

          {/* Tombol Lihat Detail untuk Cross-Check */}
          <button
            type="button"
            onClick={() => onViewDetail(ticket)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <span>🔍</span>
            <span>Detail</span>
          </button>

          {isOpen ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(ticket)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onCancel(ticket)}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <span>🗑️</span>
                <span>Batal</span>
              </button>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 font-semibold italic">
              Tiket Diproses Bengkel
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
