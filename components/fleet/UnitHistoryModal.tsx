'use client';

import React from 'react';
import { FleetUnitItem } from '@/hooks/useFleetAnalytics';
import {
  X,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface UnitHistoryModalProps {
  unit: FleetUnitItem | null;
  onClose: () => void;
}

export default function UnitHistoryModal({ unit, onClose }: UnitHistoryModalProps) {
  if (!unit) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = () => {
    switch (unit.status) {
      case 'IN_WORKSHOP':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            <span>Di Bengkel</span>
          </span>
        );
      case 'DUE_SOON':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Mendekati Servis</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Overdue</span>
          </span>
        );
      case 'DORMANT':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>Belum Servis</span>
          </span>
        );
      case 'HEALTHY':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Aman</span>
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-slate-900">{unit.noDaisha}</span>
              <span className="text-xs text-slate-500 font-medium">{unit.namaDaisha} · Seksi {unit.seksi}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Servis Terakhir</span>
              <span className="font-semibold text-slate-800 font-mono">
                {unit.lastRepairDate ? formatDate(unit.lastRepairDate) : '-'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Jadwal Berikutnya</span>
              <span className="font-semibold text-slate-800 font-mono">
                {unit.nextDueDate ? formatDate(unit.nextDueDate) : '-'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Total Servis</span>
              <span className="font-semibold text-slate-800 font-mono">
                {unit.totalRepairs}x Kunjungan
              </span>
            </div>
          </div>

          {/* Chronological Repair History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Riwayat Tiket ({unit.historyTickets.length})
              </span>

              <Link
                href={`/input?noDaisha=${encodeURIComponent(unit.noDaisha)}&seksi=${encodeURIComponent(
                  unit.seksi
                )}&namaDaisha=${encodeURIComponent(unit.namaDaisha)}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
              >
                <span>+ Lapor Servis Unit Ini</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {unit.historyTickets.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Belum ada riwayat perbaikan di sistem.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-2 font-semibold">Tanggal</th>
                        <th className="p-2 font-semibold">Status</th>
                        <th className="p-2 font-semibold">Kerusakan</th>
                        <th className="p-2 font-semibold">Tindakan</th>
                        <th className="p-2 font-semibold">Pelapor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unit.historyTickets.map((t) => {
                        return (
                          <tr key={String(t.id)} className="hover:bg-slate-50 transition">
                            <td className="p-2 font-mono text-slate-700 whitespace-nowrap">
                              {formatDate(t.tglMasuk)}
                            </td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {t.status}
                              </span>
                            </td>
                            <td className="p-2 text-slate-800">
                              {t.jenisKerusakan || t.detail || '-'}
                            </td>
                            <td className="p-2 text-slate-600">
                              {t.detail || t.kategori || '-'}
                            </td>
                            <td className="p-2 text-slate-500 whitespace-nowrap">
                              {t.namaPelapor || t.pelapor || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
