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
  // 1. Kolom 1: Menunggu Antrean (Status 'Open') - Urutkan FIFO (yang masuk duluan prioritas atas)
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

  // 3. Kolom 3: Siap Diambil / Selesai (Status 'Done') - Yang baru selesai di atas
  const doneTickets = React.useMemo(() => {
    return tickets
      .filter((t) => t.status === 'Done')
      .sort((a, b) => (parseToTimestamp(b.tglKeluar) || parseToTimestamp(b.tglMasuk)) - (parseToTimestamp(a.tglKeluar) || parseToTimestamp(a.tglMasuk)));
  }, [tickets]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      {/* ================= KOLOM 1: MENUNGGU ANTREAN ================= */}
      <div className="bg-slate-50/70 rounded-2xl border border-amber-200/70 p-3.5 space-y-3 shadow-xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/50">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200">
              ⏳
            </span>
            <h2 className="text-sm font-black text-slate-800 tracking-tight">
              Menunggu
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
            {waitingTickets.length}
          </span>
        </div>

        {/* List Kartu */}
        <div className="space-y-2.5 min-h-[180px]">
          {waitingTickets.length === 0 ? (
            <div className="bg-white/60 rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-xs font-bold text-slate-500">Tidak ada antrean</p>
            </div>
          ) : (
            waitingTickets.map((ticket, index) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);
              const queueNumber = index + 1;
              const isTopPriority = queueNumber === 1;

              return (
                <div
                  key={ticket.idTiketAsli}
                  className={`bg-white rounded-xl p-3 border transition hover:shadow-sm space-y-2.5 cursor-pointer ${
                    isTopPriority
                      ? 'border-amber-400 ring-2 ring-amber-200/50 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris Atas */}
                  <div className="flex items-center justify-between gap-1.5">
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
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                        >
                          {sizeInfo.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Nama Daisha */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug truncate">
                      {ticket.namaDaisha || 'Daisha'}
                    </h3>
                  </div>

                  {/* Kerusakan Ringkas */}
                  <div className="bg-amber-50/60 px-2.5 py-1.5 rounded-lg border border-amber-100 text-xs">
                    <p className="text-[11px] font-medium text-amber-900 truncate">
                      <span className="font-bold text-amber-800">Kerusakan:</span> {ticket.jenisKerusakan || 'Umum'}
                    </p>
                  </div>

                  {/* Baris Bawah: Pelapor & Waktu */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{ticket.pelapor || 'Operator'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-amber-700 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatElapsedTime(ticket.tglMasuk)}</span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(ticket);
                      }}
                      className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Detail
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 rounded-md text-[11px] font-bold text-red-700 hover:bg-red-50 border border-red-200 transition flex items-center gap-1"
                      >
                        <span>Kerjakan</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= KOLOM 2: SEDANG DIPERBAIKI ================= */}
      <div className="bg-slate-50/70 rounded-2xl border border-blue-200/70 p-3.5 space-y-3 shadow-xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/50">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
              ⚙️
            </span>
            <h2 className="text-sm font-black text-slate-800 tracking-tight">
              Dikerjakan
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
            {inProgressTickets.length}
          </span>
        </div>

        {/* List Kartu */}
        <div className="space-y-2.5 min-h-[180px]">
          {inProgressTickets.length === 0 ? (
            <div className="bg-white/60 rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-xs font-bold text-slate-500">Tidak ada pengerjaan aktif</p>
            </div>
          ) : (
            inProgressTickets.map((ticket) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);

              return (
                <div
                  key={ticket.idTiketAsli}
                  className="bg-white rounded-xl p-3 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition space-y-2.5 cursor-pointer shadow-xs"
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris Atas */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-red-700 text-white font-mono font-bold text-xs rounded shadow-2xs">
                        {ticket.noDaisha}
                      </span>
                      {sizeInfo && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
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

                  {/* Nama Daisha */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug truncate">
                      {ticket.namaDaisha || 'Daisha'}
                    </h3>
                  </div>

                  {/* Kerusakan */}
                  <div className="bg-blue-50/60 px-2.5 py-1.5 rounded-lg border border-blue-100 text-xs">
                    <p className="text-[11px] font-medium text-blue-900 truncate">
                      <span className="font-bold text-blue-800">Tindakan:</span> {ticket.jenisKerusakan || 'Servis'}
                    </p>
                  </div>

                  {/* Waktu & Pelapor */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{ticket.pelapor || 'Operator'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-blue-700 shrink-0">
                      <Wrench className="w-3 h-3" />
                      <span>{formatElapsedTime(ticket.tglMasuk)}</span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(ticket);
                      }}
                      className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Detail
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 rounded-md text-[11px] font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 transition flex items-center gap-1"
                      >
                        <span>Selesaikan</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= KOLOM 3: SIAP DIAMBIL / SELESAI ================= */}
      <div className="bg-slate-50/70 rounded-2xl border border-emerald-200/70 p-3.5 space-y-3 shadow-xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200/50">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
              
            </span>
            <h2 className="text-sm font-black text-slate-800 tracking-tight">
              Siap Ambil
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
            {doneTickets.length}
          </span>
        </div>

        {/* List Kartu */}
        <div className="space-y-2.5 min-h-[180px]">
          {doneTickets.length === 0 ? (
            <div className="bg-white/60 rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-xs font-bold text-slate-500">Belum ada unit selesai</p>
            </div>
          ) : (
            doneTickets.slice(0, 15).map((ticket) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);

              return (
                <div
                  key={ticket.idTiketAsli}
                  className="bg-white rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-sm transition space-y-2.5 cursor-pointer shadow-xs"
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris Atas */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-red-700 text-white font-mono font-bold text-xs rounded shadow-2xs">
                        {ticket.noDaisha}
                      </span>
                      {sizeInfo && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                        >
                          {sizeInfo.label}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Ready</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Nama Daisha */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug truncate">
                      {ticket.namaDaisha || 'Daisha'}
                    </h3>
                  </div>

                  {/* Catatan Selesai */}
                  <div className="bg-emerald-50/60 px-2.5 py-1.5 rounded-lg border border-emerald-100 text-xs">
                    <p className="text-[11px] text-emerald-900 font-medium truncate">
                      {ticket.reason && ticket.reason !== '-' ? ticket.reason : 'Perbaikan selesai'}
                    </p>
                  </div>

                  {/* Waktu Selesai & Pelapor */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{ticket.pelapor || 'Operator'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{ticket.tglKeluar || 'Selesai'}</span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(ticket);
                      }}
                      className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
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
                        className="px-2 py-1 rounded-md text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Tag</span>
                      </button>
                    )}
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
