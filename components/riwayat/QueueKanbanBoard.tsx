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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* ================= KOLOM 1: MENUNGGU ANTREAN ================= */}
      <div className="bg-slate-50/80 rounded-2xl border border-amber-200/80 p-4 space-y-4 shadow-xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shadow-2xs border border-amber-200">
              ⏳
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Menunggu Antrean</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Unit mengantre untuk diperbaiki</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs">
            {waitingTickets.length} Unit
          </span>
        </div>

        {/* List Kartu */}
        <div className="space-y-3 min-h-[220px]">
          {waitingTickets.length === 0 ? (
            <div className="bg-white/70 rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-lg">
                🎉
              </div>
              <p className="text-xs font-extrabold text-slate-700">Tidak Ada Antrean</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Semua unit sudah ditangani bengkel</p>
            </div>
          ) : (
            waitingTickets.map((ticket, index) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);
              const parsed = parseTicketDamageDetail(ticket.detail);
              const queueNumber = index + 1;
              const isTopPriority = queueNumber === 1;

              return (
                <div
                  key={ticket.idTiketAsli}
                  className={`bg-white rounded-xl p-4 border transition hover:shadow-md space-y-3 cursor-pointer ${
                    isTopPriority
                      ? 'border-amber-400 ring-2 ring-amber-200/60 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris Atas: Nomor Antrean & Info Unit */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-black rounded-md ${
                          isTopPriority
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        Antrean #{queueNumber}
                      </span>
                      <span className="px-2.5 py-0.5 bg-red-700 text-white font-mono font-black text-xs rounded-md shadow-2xs">
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
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Nama Daisha */}
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-snug">
                      {ticket.namaDaisha || 'Daisha Standar'}
                    </h3>
                  </div>

                  {/* Kerusakan Ringkas */}
                  <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-xs space-y-1">
                    <p className="text-[11px] font-bold text-amber-900 line-clamp-2">
                      <span className="font-black text-amber-700">Kerusakan:</span> {ticket.jenisKerusakan || 'Kerusakan Umum'}
                    </p>
                    {parsed.items.length > 0 && (
                      <p className="text-[10px] text-amber-800/80 truncate">
                        {parsed.items.map((it) => it.gejala).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Baris Bawah: Pelapor, Waktu Tunggu, & Aksi Cepat */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ticket.pelapor || 'Operator'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-amber-700 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatElapsedTime(ticket.tglMasuk)}</span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(ticket);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rincian</span>
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 transition flex items-center gap-1"
                      >
                        <span>Kerjakan di Bengkel</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
      <div className="bg-slate-50/80 rounded-2xl border border-blue-200/80 p-4 space-y-4 shadow-xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-2xs border border-blue-200 relative">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full" />
              ⚙️
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Sedang Diperbaiki</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Dalam proses penanganan mekanik</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-2xs">
            {inProgressTickets.length} Unit
          </span>
        </div>

        {/* List Kartu */}
        <div className="space-y-3 min-h-[220px]">
          {inProgressTickets.length === 0 ? (
            <div className="bg-white/70 rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-lg">
                💤
              </div>
              <p className="text-xs font-extrabold text-slate-700">Tidak Ada Pengerjaan Aktif</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mekanik belum menandai unit yang sedang diproses</p>
            </div>
          ) : (
            inProgressTickets.map((ticket) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);
              const parsed = parseTicketDamageDetail(ticket.detail);

              return (
                <div
                  key={ticket.idTiketAsli}
                  className="bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-md transition space-y-3 cursor-pointer shadow-xs"
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris Atas */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-red-700 text-white font-mono font-black text-xs rounded-md shadow-2xs">
                        {ticket.noDaisha}
                      </span>
                      {sizeInfo && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                        >
                          {sizeInfo.label}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md border border-blue-200 animate-pulse">
                        Sedang Dikerjakan
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Nama Daisha */}
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-snug">
                      {ticket.namaDaisha || 'Daisha Standar'}
                    </h3>
                  </div>

                  {/* Kerusakan */}
                  <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-xs space-y-1">
                    <p className="text-[11px] font-bold text-blue-900 line-clamp-2">
                      <span className="font-black text-blue-700">Tindakan:</span> {ticket.jenisKerusakan || 'Perbaikan Mekanikal'}
                    </p>
                    {parsed.items.length > 0 && (
                      <p className="text-[10px] text-blue-800/80 truncate">
                        {parsed.items.map((it) => `${it.gejala} (${it.tindakan})`).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Waktu Mulai & Pelapor */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ticket.pelapor || 'Operator'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-blue-700 shrink-0">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Masuk: {formatElapsedTime(ticket.tglMasuk)}</span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(ticket);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rincian</span>
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 transition flex items-center gap-1"
                      >
                        <span>Selesaikan di Bengkel</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
      <div className="bg-slate-50/80 rounded-2xl border border-emerald-200/80 p-4 space-y-4 shadow-xs">
        {/* Header Kolom */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-2xs border border-emerald-200">
              
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Siap Diambil</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Perbaikan selesai, dapat diambil seksi</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-2xs">
            {doneTickets.length} Unit
          </span>
        </div>

        {/* List Kartu */}
        <div className="space-y-3 min-h-[220px]">
          {doneTickets.length === 0 ? (
            <div className="bg-white/70 rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-lg">
                📦
              </div>
              <p className="text-xs font-extrabold text-slate-700">Belum Ada Unit Selesai</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Unit yang telah selesai diperbaiki akan muncul di sini</p>
            </div>
          ) : (
            doneTickets.slice(0, 15).map((ticket) => {
              const sizeInfo = detectDaishaSize(ticket.noDaisha);

              return (
                <div
                  key={ticket.idTiketAsli}
                  className="bg-white rounded-xl p-4 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition space-y-3 cursor-pointer shadow-xs"
                  onClick={() => onViewDetail(ticket)}
                >
                  {/* Baris Atas */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-red-700 text-white font-mono font-black text-xs rounded-md shadow-2xs">
                        {ticket.noDaisha}
                      </span>
                      {sizeInfo && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                        >
                          {sizeInfo.label}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Siap Ambil</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {ticket.seksi}
                    </span>
                  </div>

                  {/* Nama Daisha */}
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-snug">
                      {ticket.namaDaisha || 'Daisha Standar'}
                    </h3>
                  </div>

                  {/* Catatan Selesai */}
                  <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-xs space-y-1">
                    <p className="text-[11px] text-emerald-900 font-medium">
                      <span className="font-black text-emerald-700">Catatan Bengkel:</span>{' '}
                      {ticket.reason && ticket.reason !== '-' ? ticket.reason : 'Perbaikan telah selesai sesuai standar.'}
                    </p>
                  </div>

                  {/* Waktu Selesai & Pelapor */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ticket.pelapor || 'Operator'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{ticket.tglKeluar || 'Selesai'}</span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(ticket);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rincian</span>
                    </button>

                    {onPrintTag && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrintTag(ticket);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Tag</span>
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
