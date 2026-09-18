'use client';

import React from 'react';
import { Ticket } from '@/types/ticket';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';
import { parseToTimestamp } from '@/lib/date';
import { Clock, Wrench, CheckCircle2, AlertCircle, ArrowRight, Printer, Eye, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface QueueKanbanBoardProps {
  tickets: Ticket[];
  onViewDetail: (ticket: Ticket) => void;
  onPrintTag?: (ticket: Ticket) => void;
  isAdmin?: boolean;
}

function formatElapsedTime(dateStr: string): string {
  const ts = parseToTimestamp(dateStr);
  if (!ts) return '-';
  const diffMs = Date.now() - ts;
  if (diffMs < 0) return 'Baru saja';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return `${hours}j ${remMins}m lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function QueueKanbanBoard({
  tickets,
  onViewDetail,
  onPrintTag,
  isAdmin = false,
}: QueueKanbanBoardProps) {
  // State untuk toggle batas tampilan unit selesai di kolom 3
  const [showAllDone, setShowAllDone] = React.useState(false);

  // 1. Kolom 1: Menunggu Antrean (Status 'Open') - Urutkan FIFO
  const waitingTickets = React.useMemo(() => {
    return tickets
      .filter((t) => t.status === 'Open')
      .sort((a, b) => parseToTimestamp(a.tglMasuk) - parseToTimestamp(b.tglMasuk));
  }, [tickets]);

  // 2. Kolom 2: Sedang Dikerjakan (Status 'Progress')
  const inProgressTickets = React.useMemo(() => {
    return tickets
      .filter((t) => t.status === 'Progress')
      .sort((a, b) => parseToTimestamp(a.tglMasuk) - parseToTimestamp(b.tglMasuk));
  }, [tickets]);

  // 3. Kolom 3: Siap Diambil / Selesai (Status 'Done')
  const doneTickets = React.useMemo(() => {
    return tickets
      .filter((t) => t.status === 'Done')
      .sort((a, b) => (parseToTimestamp(b.tglKeluar) || parseToTimestamp(b.tglMasuk)) - (parseToTimestamp(a.tglKeluar) || parseToTimestamp(a.tglMasuk)));
  }, [tickets]);

  const displayedDoneTickets = React.useMemo(() => {
    return showAllDone ? doneTickets : doneTickets.slice(0, 10);
  }, [doneTickets, showAllDone]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
      {/* ================= KOLOM 1: MENUNGGU ANTREAN ================= */}
      <div className="bg-slate-50/80 rounded-2xl border border-amber-200/70 p-3 flex flex-col h-[580px] shadow-2xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200">
              ⏳
            </span>
            <h2 className="text-xs font-black text-slate-800 tracking-tight">
              Menunggu
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
            {waitingTickets.length}
          </span>
        </div>

        {/* List Kartu - Scrollable Internally */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {waitingTickets.length === 0 ? (
            <div className="bg-white/60 rounded-xl border border-dashed border-slate-200 p-6 text-center mt-4">
              <p className="text-xs font-medium text-slate-400">Tidak ada antrean</p>
            </div>
          ) : (
            waitingTickets.map((ticket, index) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);
              const queueNumber = index + 1;
              const isTopPriority = queueNumber === 1;

              return (
                <div
                  key={ticket.idTiketAsli}
                  className={`bg-white rounded-xl p-2.5 border transition hover:shadow-xs space-y-1.5 cursor-pointer ${
                    isTopPriority
                      ? 'border-amber-400 ring-1.5 ring-amber-200/50 shadow-2xs'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris 1: Nomor Antrean & Unit */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          isTopPriority
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        #{queueNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-red-700 text-white font-mono font-bold text-xs rounded shadow-2xs">
                        {ticket.noDaisha}
                      </span>
                      {sizeInfo && (
                        <span
                          className={`px-1 py-0.5 text-[9px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                        >
                          {sizeInfo.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Baris 2: Nama Daisha & Kerusakan */}
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">{ticket.namaDaisha || 'Daisha'}</span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-amber-800 font-medium truncate">{ticket.jenisKerusakan || 'Umum'}</span>
                  </div>

                  {/* Baris 3: Pelapor, Waktu & Aksi */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <span className="truncate text-slate-600 font-medium">{ticket.pelapor || 'Operator'}</span>
                      <span>•</span>
                      <span className="text-amber-700 font-medium shrink-0">{formatElapsedTime(ticket.tglMasuk)}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(ticket);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Detail
                      </button>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-red-700 hover:bg-red-50 border border-red-200 transition flex items-center gap-0.5"
                        >
                          <span>Kerjakan</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= KOLOM 2: SEDANG DIPERBAIKI ================= */}
      <div className="bg-slate-50/80 rounded-2xl border border-blue-200/70 p-3 flex flex-col h-[580px] shadow-2xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
              ⚙️
            </span>
            <h2 className="text-xs font-black text-slate-800 tracking-tight">
              Dikerjakan
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
            {inProgressTickets.length}
          </span>
        </div>

        {/* List Kartu - Scrollable Internally */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {inProgressTickets.length === 0 ? (
            <div className="bg-white/60 rounded-xl border border-dashed border-slate-200 p-6 text-center mt-4">
              <p className="text-xs font-medium text-slate-400">Tidak ada unit dikerjakan</p>
            </div>
          ) : (
            inProgressTickets.map((ticket) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);

              return (
                <div
                  key={ticket.idTiketAsli}
                  className="bg-white rounded-xl p-2.5 border border-blue-200 hover:border-blue-400 hover:shadow-xs transition space-y-1.5 cursor-pointer shadow-2xs"
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris 1 */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-red-700 text-white font-mono font-bold text-xs rounded shadow-2xs">
                        {ticket.noDaisha}
                      </span>
                      {sizeInfo && (
                        <span
                          className={`px-1 py-0.5 text-[9px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                        >
                          {sizeInfo.label}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded border border-blue-200">
                        Diproses
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Baris 2 */}
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">{ticket.namaDaisha || 'Daisha'}</span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-blue-800 font-medium truncate">{ticket.jenisKerusakan || 'Servis'}</span>
                  </div>

                  {/* Baris 3 */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <span className="truncate text-slate-600 font-medium">{ticket.pelapor || 'Operator'}</span>
                      <span>•</span>
                      <span className="text-blue-700 font-medium shrink-0">{formatElapsedTime(ticket.tglMasuk)}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(ticket);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Detail
                      </button>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 transition flex items-center gap-0.5"
                        >
                          <span>Selesaikan</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= KOLOM 3: SIAP DIAMBIL / SELESAI ================= */}
      <div className="bg-slate-50/80 rounded-2xl border border-emerald-200/70 p-3 flex flex-col h-[580px] shadow-2xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
              
            </span>
            <h2 className="text-xs font-black text-slate-800 tracking-tight">
              Siap Ambil
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {doneTickets.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAllDone(!showAllDone)}
                className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                {showAllDone ? '10 Terbaru' : `Semua (${doneTickets.length})`}
              </button>
            )}
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
              {doneTickets.length}
            </span>
          </div>
        </div>

        {/* List Kartu - Scrollable Internally */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {displayedDoneTickets.length === 0 ? (
            <div className="bg-white/60 rounded-xl border border-dashed border-slate-200 p-6 text-center mt-4">
              <p className="text-xs font-medium text-slate-400">Belum ada unit selesai</p>
            </div>
          ) : (
            displayedDoneTickets.map((ticket) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);

              return (
                <div
                  key={ticket.idTiketAsli}
                  className="bg-white rounded-xl p-2.5 border border-emerald-200 hover:border-emerald-400 hover:shadow-xs transition space-y-1.5 cursor-pointer shadow-2xs"
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris 1 */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-red-700 text-white font-mono font-bold text-xs rounded shadow-2xs">
                        {ticket.noDaisha}
                      </span>
                      {sizeInfo && (
                        <span
                          className={`px-1 py-0.5 text-[9px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                        >
                          {sizeInfo.label}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Ready</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Baris 2 */}
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">{ticket.namaDaisha || 'Daisha'}</span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-emerald-800 font-medium truncate">
                      {ticket.reason && ticket.reason !== '-' ? ticket.reason : 'Perbaikan selesai'}
                    </span>
                  </div>

                  {/* Baris 3 */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <span className="truncate text-slate-600 font-medium">{ticket.pelapor || 'Operator'}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium shrink-0">{ticket.tglKeluar || 'Selesai'}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(ticket);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Detail
                      </button>

                      {onPrintTag && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPrintTag(ticket);
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition flex items-center gap-0.5 cursor-pointer"
                        >
                          <Printer className="w-2.5 h-2.5" />
                          <span>Tag</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
