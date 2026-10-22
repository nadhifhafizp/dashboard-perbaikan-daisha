'use client';

import React from 'react';
import {
  X,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Layers,
  Truck,
} from 'lucide-react';
import { FleetUnit } from './FleetExplorer';

interface UnitDetailModalProps {
  unit: FleetUnit | null;
  currentYear: number;
  isSeksiUser?: boolean;
  onClose: () => void;
  onOpenMaintenanceModal: (unit: FleetUnit) => void;
  onStageUnit?: (unit: FleetUnit) => void;
}

export default function UnitDetailModal({
  unit,
  currentYear,
  isSeksiUser = false,
  onClose,
  onOpenMaintenanceModal,
  onStageUnit,
}: UnitDetailModalProps) {
  // Escape key listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!unit) return null;

  const isDone = unit.is_maintained;
  const formattedLastDate = unit.last_maintenance_date
    ? new Date(unit.last_maintenance_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Belum pernah dicatat';

  const formattedWaktuMasuk = unit.last_waktu_masuk
    ? new Date(unit.last_waktu_masuk).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-5 py-4 text-white flex items-center justify-between ${
          isDone ? 'bg-emerald-700' : 'bg-rose-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm tabular-nums">
              {unit.serial_number || unit.nomor_daisha}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black tracking-tight">
                  <code className="font-mono">{unit.nomor_daisha.replace(/---+/g, '-').replace(/--+/g, '-')}</code>
                </h2>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                  {unit.ukuran && unit.ukuran !== 'NONE' ? unit.ukuran : unit.jenis}
                </span>
              </div>
              <p className="text-xs text-white/80">
                {unit.jenis} {unit.ukuran && unit.ukuran !== 'NONE' ? `(${unit.ukuran})` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-8 sm:h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Tutup modal detail unit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status Badge */}
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
            isDone
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDone ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {isDone ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold">
                {isDone
                  ? `Sudah Maintenance di Tahun ${currentYear}`
                  : `Belum Maintenance di Tahun ${currentYear}`}
              </div>
              <p className="text-xs opacity-80">
                {isDone
                  ? 'Unit siap beroperasi dengan standar keselamatan tahunan.'
                  : 'Target prioritas pengerjaan pemeliharaan bengkel.'}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Maintenance Terakhir:
              </span>
              <span className="font-semibold text-slate-800">{formattedLastDate}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Status Pemeliharaan {currentYear}:
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                isDone
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isDone ? 'Sudah PM' : 'Belum PM'}
              </span>
            </div>

            {formattedWaktuMasuk && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Jadwal Masuk Bengkel:
                </span>
                <span className="font-semibold text-slate-700">
                  {formattedWaktuMasuk}
                </span>
              </div>
            )}

            {unit.days_since_last !== null && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Durasi Sejak Pengerjaan:
                </span>
                <span className="font-bold text-slate-700 tabular-nums">
                  {unit.days_since_last} hari yang lalu
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Kategori Armada:
              </span>
              <span className="font-medium text-slate-800">
                {unit.jenis} ({unit.ukuran})
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] sm:min-h-0 sm:h-9 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Tutup
            </button>

            {!isSeksiUser && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMaintenanceModal(unit);
                }}
                className="flex-1 min-h-[44px] sm:min-h-0 sm:h-9 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Catat PM</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
