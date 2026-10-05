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
} from 'lucide-react';
import { GridDaishaUnit } from './VerticalGridMapping';

interface UnitDetailModalProps {
  unit: GridDaishaUnit | null;
  currentYear: number;
  onClose: () => void;
  onOpenMaintenanceModal: (unit: GridDaishaUnit) => void;
}

export default function UnitDetailModal({
  unit,
  currentYear,
  onClose,
  onOpenMaintenanceModal,
}: UnitDetailModalProps) {
  if (!unit) return null;

  const isDone = unit.is_maintained;
  const formattedLastDate = unit.last_maintenance_date
    ? new Date(unit.last_maintenance_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Belum pernah dicatat';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-5 py-4 text-white flex items-center justify-between ${
          isDone ? 'bg-emerald-700' : 'bg-rose-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-mono font-black text-sm">
              {unit.serial_number || unit.nomor_daisha}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black tracking-tight">
                  {unit.nomor_daisha}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                  {unit.ukuran !== 'NONE' ? unit.ukuran : 'Nagara'}
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                {unit.jenis === 'VERTICAL' ? 'Daisha Vertical' : 'Daisha Nagara Filter'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
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
              <p className="text-[11px] opacity-80">
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

            {unit.days_since_last !== null && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Durasi Sejak Pengerjaan:
                </span>
                <span className="font-mono font-bold text-slate-700">
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
              className="flex-1 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMaintenanceModal(unit);
              }}
              className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ Catat Pengerjaan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
