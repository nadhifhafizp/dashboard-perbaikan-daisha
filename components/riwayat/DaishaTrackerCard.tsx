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
    <div className="bg-white rounded-3xl border-2 border-red-500/80 shadow-xl p-5 sm:p-7 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
      {/* 1. Header Pelacakan & Status Kesiapan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-start sm:items-center gap-3.5 flex-wrap">
          <div className="px-4 py-2 bg-red-700 text-white font-mono font-black text-xl sm:text-2xl rounded-2xl shadow-sm tracking-wide">
            {noDaisha}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {daishaName}
              </h2>
              {sizeInfo && (
                <span className={`px-2 py-0.5 text-xs font-black rounded-md border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}>
                  {sizeInfo.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Seksi Pemilik: <span className="text-slate-700 font-black">{seksiName}</span></span>
              <span>•</span>
              <span>Total Riwayat Servis: <span className="text-red-700 font-black">{unitTickets.length} kali</span></span>
            </p>
          </div>
        </div>

        {/* Badge Status Kesiapan Unit & Tombol Close */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isHealthy ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>🟢 Siap Operasional (Normal)</span>
            </div>
          ) : isInProgress ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs animate-pulse">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>⚙️ Sedang Diperbaiki di Bengkel</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>⏳ Menunggu Antrean Bengkel</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            title="Tutup Hasil Pelacakan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Visual Stepper Pelacakan Servis Terkini (Tracking Stepper) */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-red-600" />
            <span>Alur Status Penanganan Terkini</span>
          </span>
          {activeTicket ? (
            <span className="text-xs font-mono font-bold text-slate-500">
              ID Tiket: {activeTicket.idTiketAsli}
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
              Tiket Terakhir Selesai: {latestTicket?.tglKeluar || latestTicket?.tglMasuk || '-'}
            </span>
          )}
        </div>

        {/* 4 Tahapan Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Step 1: Laporan Dibuat */}
          <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Laporan Masuk</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {latestTicket?.tglMasuk || 'Tercatat'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold truncate">
              Oleh: {latestTicket?.pelapor || '-'}
            </p>
          </div>

          {/* Step 2: Diterima Bengkel */}
          <div className={`p-3 rounded-xl bg-white border shadow-2xs space-y-1 ${
            latestTicket ? 'border-emerald-200' : 'border-slate-200 opacity-60'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. Masuk Bengkel</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Unit tiba di area bengkel
            </p>
            <p className="text-[10px] text-slate-400 font-bold">
              Status: Terdaftar
            </p>
          </div>

          {/* Step 3: Proses Perbaikan */}
          <div className={`p-3 rounded-xl bg-white border shadow-2xs space-y-1 ${
            isInProgress
              ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/30'
              : isHealthy
              ? 'border-emerald-200'
              : 'border-slate-200 opacity-60'
          }`}>
            <div className={`flex items-center gap-1.5 text-xs font-black ${
              isInProgress ? 'text-blue-700' : isHealthy ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {isInProgress ? <Wrench className="w-4 h-4 text-blue-600 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              <span>3. Perbaikan Bengkel</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isInProgress ? 'Sedang ditangani mekanik' : isHealthy ? 'Perbaikan selesai' : 'Menunggu giliran'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold truncate">
              {activeTicket?.jenisKerusakan || latestTicket?.jenisKerusakan || 'Umum'}
            </p>
          </div>

          {/* Step 4: Selesai / Siap Ambil */}
          <div className={`p-3 rounded-xl bg-white border shadow-2xs space-y-1 ${
            isHealthy
              ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/30'
              : 'border-slate-200 opacity-60'
          }`}>
            <div className={`flex items-center gap-1.5 text-xs font-black ${
              isHealthy ? 'text-emerald-700' : 'text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${isHealthy ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>4. Siap Operasional</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isHealthy ? latestTicket?.tglKeluar || 'Selesai & Siap Ambil' : 'Belum selesai'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold truncate">
              {latestTicket?.reason || 'Kondisi siap pakai'}
            </p>
          </div>
        </div>

        {/* Action Button Khusus Admin Jika Unit Sedang Rusak */}
        {activeTicket && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 mt-2">
            <p className="text-xs font-medium text-slate-600">
              <span className="font-bold text-slate-800">Gejala Dilaporkan:</span> {activeTicket.detail}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewDetail(activeTicket)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Lihat Detail Lengkap
              </button>

              {onPrintTag && (
                <button
                  type="button"
                  onClick={() => onPrintTag(activeTicket)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Tag</span>
                </button>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Eksekusi di Panel Bengkel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Riwayat Rekam Medis (Medical Record) Unit Daisha Ini */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-red-600" />
            <span>Rekam Medis Perbaikan Masa Lalu ({unitTickets.length} Laporan)</span>
          </h3>

          {damageFrequency.length > 0 && (
            <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
              Komponen Paling Sering Diperbaiki: <span className="text-red-700 font-black">{damageFrequency[0][0]} ({damageFrequency[0][1]}x)</span>
            </span>
          )}
        </div>

        {/* Tabel Mini Rekam Medis */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
              <tr>
                <th className="p-3">Waktu Masuk</th>
                <th className="p-3">Waktu Selesai</th>
                <th className="p-3">Status</th>
                <th className="p-3">Komponen Kerusakan</th>
                <th className="p-3">Tindakan & Catatan Bengkel</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedTickets.map((t, idx) => (
                <tr key={t.idTiketAsli || idx} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                    {t.tglMasuk || '-'}
                  </td>
                  <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                    {t.tglKeluar || '-'}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
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
                  <td className="p-3 font-bold text-slate-800">
                    {t.jenisKerusakan || 'Umum'}
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">
                    {t.reason || t.detail || '-'}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetail(t)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    >
                      Rincian
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
