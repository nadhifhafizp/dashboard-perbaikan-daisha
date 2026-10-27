import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PendingConfirmationModalProps {
  show: boolean;
  alasan: string;
  loading: boolean;
  onChangeAlasan: (val: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function PendingConfirmationModal({
  show,
  alasan,
  loading,
  onChangeAlasan,
  onCancel,
  onConfirm,
}: PendingConfirmationModalProps) {
  if (!show) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-3 animate-scale-up">
      <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span>Set Status Pending: Kebutuhan Material / Sparepart Habis</span>
      </span>
      <div>
        <label className="block text-xs text-amber-900 font-medium mb-1">
          Tuliskan rincian sparepart/material yang habis atau kendala:
        </label>
        <input
          type="text"
          placeholder="Mis: Menunggu bearing 6204 dan plat strip tebal 3mm tiba dari supplier"
          value={alasan}
          onChange={(e) => onChangeAlasan(e.target.value)}
          className="w-full h-10 px-3 bg-white border border-amber-300 rounded-lg text-xs"
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 bg-white text-slate-600 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="h-10 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition disabled:opacity-50"
        >
          Simpan Status
        </button>
      </div>
    </div>
  );
}
