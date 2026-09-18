'use client';

import React from 'react';
import { Ticket } from '@/types/ticket';
import { detectDaishaSize } from '@/lib/daishaSize';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { parseToTimestamp, formatDisplayDate } from '@/lib/date';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  ArrowRight, 
  Printer, 
  X, 
  History, 
  ShieldCheck, 
  Activity, 
  Building,
  User
} from 'lucide-react';
import Link from 'next/link';

interface DaishaTrackerCardProps {
  noDaisha: string;
  unitTickets: Ticket[];
  onClose: () => void;
  onViewDetail: (ticket: Ticket) => void;
  onPrintTag?: (ticket: Ticket) => void;
  isAdmin?: boolean;
}

export default function DaishaTrackerCard({
  noDaisha,
  unitTickets,
  onClose,
  onViewDetail,
  onPrintTag,
  isAdmin = false,
}: DaishaTrackerCardProps) {
  // Urutkan riwayat tiket dari yang terbaru ke terlama
  const sortedTickets = React.useMemo(() => {
    return [...unitTickets].sort((a, b) => {
      const tsA = parseToTimestamp(a.tglMasuk);
      const tsB = parseToTimestamp(b.tglMasuk);
      return tsB - tsA;
    });
  }, [unitTickets]);

  const latestTicket = sortedTickets[0];
  const activeTicket = sortedTickets.find((t) => t.status === 'Open' || t.status === 'Progress');

  const sizeInfo = detectDaishaSize(noDaisha);
  const daishaName = latestTicket?.namaDaisha || 'Daisha Standar';
  const seksiName = latestTicket?.seksi || '-';

  // Tentukan status kesehatan / kesiapan unit saat ini
  const isHealthy = !activeTicket;
  const isWaiting = activeTicket?.status === 'Open';
  const isInProgress = activeTicket?.status === 'Progress';

  // Analisis komponen yang paling sering rusak pada unit ini
  const damageFrequency = React.useMemo(() => {
    const map: Record<string, number> = {};
    unitTickets.forEach((t) => {
      const list = t.jenisKerusakan ? t.jenisKerusakan.split(',').map((k) => k.trim()).filter(Boolean) : [];
      list.forEach((comp) => {
        map[comp] = (map[comp] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [unitTickets]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">
      {/* 1. Header Pelacakan & Status Kesiapan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 bg-red-700 text-white font-mono font-black text-lg sm:text-xl rounded-xl tracking-wide shadow-2xs">
            {noDaisha}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {daishaName}
              </h2>
              {sizeInfo && (
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}>
                  {sizeInfo.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
              <span>Seksi: <strong className="text-slate-700">{seksiName}</strong></span>
              <span>•</span>
              <span>Total Servis: <strong className="text-red-700">{unitTickets.length}x</strong></span>
            </p>
          </div>
        </div>

        {/* Badge Status Kesiapan Unit & Tombol Close */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isHealthy ? (
            <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Siap Pakai</span>
            </div>
          ) : isInProgress ? (
            <div className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5 animate-pulse">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Sedang Diservis</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Dalam Antrean</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Visual Stepper Pelacakan Servis Terkini */}
      <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-600" />
            <span>Alur Perbaikan</span>
          </span>
          {activeTicket ? (
            <span className="font-mono text-slate-500">
              #{activeTicket.idTiketAsli}
            </span>
          ) : (
            <span className="text-emerald-700 font-medium">
              Selesai: {latestTicket?.tglKeluar || latestTicket?.tglMasuk || '-'}
            </span>
          )}
        </div>

        {/* 4 Tahapan Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {/* Step 1: Laporan Dibuat */}
          <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>1. Lapor Masuk</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              {latestTicket?.tglMasuk || '-'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {latestTicket?.pelapor || '-'}
            </p>
          </div>

          {/* Step 2: Diterima Bengkel */}
          <div className={`p-2.5 rounded-xl bg-white border shadow-2xs space-y-0.5 ${
            latestTicket ? 'border-emerald-200' : 'border-slate-200 opacity-60'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>2. Masuk Bengkel</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Terdaftar
            </p>
            <p className="text-[10px] text-slate-400">
              Area bengkel
            </p>
          </div>

          {/* Step 3: Proses Perbaikan */}
          <div className={`p-2.5 rounded-xl bg-white border shadow-2xs space-y-0.5 ${
            isInProgress
              ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/30'
              : isHealthy
              ? 'border-emerald-200'
              : 'border-slate-200 opacity-60'
          }`}>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${
              isInProgress ? 'text-blue-700' : isHealthy ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {isInProgress ? <Wrench className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              <span>3. Perbaikan</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              {isInProgress ? 'Sedang ditangani' : isHealthy ? 'Selesai' : 'Antre'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {activeTicket?.jenisKerusakan || latestTicket?.jenisKerusakan || 'Umum'}
            </p>
          </div>

          {/* Step 4: Selesai / Siap Ambil */}
          <div className={`p-2.5 rounded-xl bg-white border shadow-2xs space-y-0.5 ${
            isHealthy
              ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/30'
              : 'border-slate-200 opacity-60'
          }`}>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${
              isHealthy ? 'text-emerald-700' : 'text-slate-400'
            }`}>
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isHealthy ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>4. Siap Pakai</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium truncate">
              {isHealthy ? latestTicket?.tglKeluar || 'Siap Ambil' : '-'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {latestTicket?.reason || 'Kondisi baik'}
            </p>
          </div>
        </div>

        {/* Action Button Khusus Admin Jika Unit Sedang Rusak */}
        {activeTicket && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200 mt-2">
            <p className="text-xs text-slate-600 truncate max-w-md">
              <span className="font-bold text-slate-800">Keluhan:</span> {activeTicket.detail}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onViewDetail(activeTicket)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Detail
              </button>

              {onPrintTag && (
                <button
                  type="button"
                  onClick={() => onPrintTag(activeTicket)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tag</span>
                </button>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-2xs"
                >
                  <span>Buka di Bengkel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Riwayat Rekam Medis (Medical Record) Unit Daisha Ini */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-red-600" />
            <span>Riwayat Servis ({unitTickets.length})</span>
          </h3>

          {damageFrequency.length > 0 && (
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Sering Rusak: <span className="text-red-700 font-bold">{damageFrequency[0][0]} ({damageFrequency[0][1]}x)</span>
            </span>
          )}
        </div>

        {/* Tabel Mini Rekam Medis */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
              <tr>
                <th className="p-2.5">Masuk</th>
                <th className="p-2.5">Selesai</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Kerusakan</th>
                <th className="p-2.5">Catatan Bengkel</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedTickets.map((t, idx) => (
                <tr key={t.idTiketAsli || idx} className="hover:bg-slate-50 transition">
                  <td className="p-2.5 font-semibold text-slate-700 whitespace-nowrap">
                    {t.tglMasuk || '-'}
                  </td>
                  <td className="p-2.5 font-semibold text-slate-700 whitespace-nowrap">
                    {t.tglKeluar || '-'}
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      t.status === 'Done'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : t.status === 'Open'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-slate-800">
                    {t.jenisKerusakan || 'Umum'}
                  </td>
                  <td className="p-2.5 text-slate-600 max-w-xs truncate">
                    {t.reason || t.detail || '-'}
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetail(t)}
                      className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
