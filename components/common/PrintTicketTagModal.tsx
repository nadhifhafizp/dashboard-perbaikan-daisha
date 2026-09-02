'use client';

import React from 'react';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';

export interface PrintableTicketData {
  idTiket: string;
  noDaisha: string;
  namaDaisha: string;
  seksi: string;
  namaPelapor: string;
  waktuMasuk: string;
  status?: string;
  detail: string;
  catatanTeknisi?: string;
}

interface PrintTicketTagModalProps {
  isOpen: boolean;
  ticket: PrintableTicketData | null;
  onClose: () => void;
}

export default function PrintTicketTagModal({
  isOpen,
  ticket,
  onClose,
}: PrintTicketTagModalProps) {
  if (!isOpen || !ticket) return null;

  const parsed = parseTicketDamageDetail(ticket.detail);
  const sizeInfo = detectDaishaSize(ticket.noDaisha);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷️</span>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Pratinjau Tag Fisik Unit Daisha
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Siap cetak untuk digantungkan pada fisik unit Daisha di bengkel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-black text-sm cursor-pointer shadow-2xs"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Scrollable Preview of the Tag */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {/* THE PRINTABLE TAG CARD (Targeted by @media print via .printable-tag-area) */}
          <div className="printable-tag-area w-full max-w-md bg-white border-2 border-dashed border-slate-400 p-5 rounded-2xl shadow-md text-slate-900 font-sans print:border-solid print:border-black print:rounded-none print:shadow-none print:p-4 print:max-w-none">
            {/* Tag Header */}
            <div className="border-b-2 border-black pb-3 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-black text-xs print:bg-black">
                    B
                  </div>
                  <div>
                    <h1 className="text-xs font-black tracking-wider uppercase">
                      PT BRIDGESTONE INDONESIA
                    </h1>
                    <p className="text-[10px] font-bold text-slate-600 print:text-black">
                      DAISHA REPAIR & MAINTENANCE TAG
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold block bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 print:border-black">
                    {ticket.idTiket}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold block mt-0.5 print:text-black">
                    {ticket.waktuMasuk}
                  </span>
                </div>
              </div>
            </div>

            {/* Nomor Unit & Seksi (Identitas Fisik Utama) */}
            <div className="bg-slate-50 border-2 border-black p-3 rounded-xl mb-3 print:bg-transparent">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
                    NOMOR UNIT DAISHA
                  </span>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-mono font-black text-2xl tracking-tight text-red-700 block print:text-black">
                      {ticket.noDaisha}
                    </span>
                    {sizeInfo && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded border border-black bg-white uppercase print:border-black">
                        {sizeInfo.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right border-l-2 border-black/20 pl-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-black">
                    SEKSI ASAL (KEMBALIKAN KE)
                  </span>
                  <span className="font-black text-lg text-slate-900 uppercase block leading-tight">
                    {ticket.seksi}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 print:border-black flex justify-between text-[11px] font-semibold">
                <span>Model: <strong>{ticket.namaDaisha}</strong></span>
                <span>Pelapor: <strong>{ticket.namaPelapor}</strong></span>
              </div>
            </div>

            {/* Checklist Kerusakan & Tindakan Mekanik */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wide">
                  RINCIAN KERUSAKAN & TINDAKAN BENGKEL:
                </span>
                <span className="text-[10px] font-bold bg-slate-200 px-1.5 py-0.2 rounded print:border print:border-black">
                  Total: {parsed.totalQtyAll} pcs
                </span>
              </div>

              <div className="border border-black rounded-lg divide-y divide-black/40 overflow-hidden text-xs">
                {parsed.items.length > 0 ? (
                  parsed.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 flex items-center justify-between gap-2 bg-white"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="inline-block w-4 h-4 border border-black rounded-xs shrink-0 mt-0.5 print:border-2" />
                        <div className="min-w-0">
                          <span className="font-extrabold block leading-tight text-slate-900">
                            {item.komponen && item.komponen !== 'Umum' ? `[${item.komponen}] ` : ''}
                            {item.gejala}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-right">
                        <span className="font-black text-[11px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 print:border-black">
                          {item.qty} pcs
                        </span>
                        <span
                          className={`font-black text-[10px] px-1.5 py-0.5 rounded border ${
                            item.tindakan === 'Ganti'
                              ? 'bg-blue-100 text-blue-900 border-blue-300 print:border-black print:bg-white'
                              : 'bg-amber-100 text-amber-900 border-amber-300 print:border-black print:bg-white'
                          }`}
                        >
                          {item.tindakan === 'Ganti' ? '🔄 GANTI' : '🔨 REPAIR'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 font-medium">{ticket.detail}</div>
                )}
              </div>

              {parsed.catatan && (
                <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900 font-semibold print:bg-transparent print:border-black">
                  📌 Catatan Posisi: {parsed.catatan}
                </div>
              )}
            </div>

            {/* Tanda Tangan & Serah Terima Unit */}
            <div className="border-t-2 border-black pt-2.5 mt-3">
              <span className="text-[10px] font-black uppercase block mb-1">
                VERIFIKASI SERAH TERIMA UNIT:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="border border-black p-1.5 rounded flex flex-col justify-between h-18">
                  <span className="font-bold text-slate-600 print:text-black">1. Pelapor</span>
                  <div className="border-b border-dotted border-black mx-2" />
                  <span className="font-bold truncate">{ticket.namaPelapor}</span>
                </div>
                <div className="border border-black p-1.5 rounded flex flex-col justify-between h-18">
                  <span className="font-bold text-slate-600 print:text-black">2. Mekanik</span>
                  <div className="border-b border-dotted border-black mx-2" />
                  <span className="text-slate-400 print:text-black">Paraf & Tgl</span>
                </div>
                <div className="border border-black p-1.5 rounded flex flex-col justify-between h-18">
                  <span className="font-bold text-slate-600 print:text-black">3. QC / Final</span>
                  <div className="border-b border-dotted border-black mx-2" />
                  <span className="text-slate-400 print:text-black">Status OK</span>
                </div>
              </div>
            </div>

            {/* Lubang Gantungan (Hole Punch Indicator) */}
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 print:border-black flex items-center justify-between text-[9px] text-slate-400 print:text-black">
              <span>⚪ Lubang Gantungan Kawat / Cable Ties</span>
              <span className="font-mono font-bold">Bridgestone Plant Maintenance</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex justify-between items-center gap-3">
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Tips: Gunakan kertas A5/A6 atau printer thermal label.
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-900/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>Cetak Tag Fisik (Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
