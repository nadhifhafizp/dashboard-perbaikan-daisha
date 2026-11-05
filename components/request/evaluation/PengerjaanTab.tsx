import React from 'react';
import {
  Hammer,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { EvaluationFormData } from './types';
import PendingConfirmationModal from './PendingConfirmationModal';

interface PengerjaanTabProps {
  formData: EvaluationFormData;
  loading: boolean;
  isApprovedBySpecialProject?: boolean;
  isPendingMaterial: boolean;
  showPendingDialog: boolean;
  alasanPendingInput: string;
  approvalToken?: string;
  setFormData: React.Dispatch<React.SetStateAction<EvaluationFormData>>;
  setShowPendingDialog: (val: boolean) => void;
  setAlasanPendingInput: (val: string) => void;
  onAssignAtasanSpecialProject: () => void;
  onResumeProgress: () => void;
  onSetPendingMaterial: () => void;
  onOperatorSelesai: () => void;
}

export default function PengerjaanTab({
  formData,
  loading,
  isApprovedBySpecialProject = false,
  isPendingMaterial,
  showPendingDialog,
  alasanPendingInput,
  approvalToken,
  setFormData,
  setShowPendingDialog,
  setAlasanPendingInput,
  onAssignAtasanSpecialProject,
  onResumeProgress,
  onSetPendingMaterial,
  onOperatorSelesai,
}: PengerjaanTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status Alur Pengerjaan */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Hammer className="w-4 h-4 text-red-600" />
            <span>Status & Pelaksanaan Pekerjaan Fisik</span>
          </span>
          <span className="text-xs text-slate-500">
            Otomatis masuk pengerjaan saat Atasan Special Project approve
          </span>
        </div>

        {/* 1. Kondisi jika belum disetujui Special Project */}
        {!isApprovedBySpecialProject && (
          <div className="p-3.5 rounded-lg bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>Menunggu Tanda Tangan & Assign Atasan Special Project (8210 / 820)</span>
              </p>
              <p className="text-xs text-purple-800 mt-0.5">
                Pekerjaan fisik belum boleh dimulai atau diselesaikan. Begitu disetujui, request akan <strong>otomatis langsung berstatus &quot;Dikerjakan&quot;</strong> dan nomor surat resmi akan terbit.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {approvalToken && (
                <a
                  href={`/request/approval?token=${approvalToken}&role=special_project`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 px-3.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Lembar Approval (Tanda Tangan)</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* 2. Kondisi jika sedang Pending Material */}
        {isPendingMaterial && (
          <div className="p-3.5 rounded-lg bg-amber-50 border-2 border-amber-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
              <PauseCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pengerjaan Ditunda: Menunggu Sparepart / Material</span>
            </div>
            <p className="text-xs text-amber-800">
              Alasan Pending: <strong>{formData.alasanPending || 'Menunggu sparepart/material tambahan'}</strong>
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onResumeProgress}
                disabled={loading}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Lanjut Pengerjaan</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Teknisi & Tombol Pending */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              PIC Bengkel / Teknisi Pelaksana
            </label>
            <input
              type="text"
              placeholder="Nama teknisi bengkel yang mengerjakan"
              value={formData.picBengkel}
              onChange={(e) => setFormData((p) => ({ ...p, picBengkel: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Status Kontrol di Tengah Jalan
            </label>
            {!isPendingMaterial ? (
              <button
                type="button"
                onClick={() => setShowPendingDialog(true)}
                className="w-full h-10 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Tunda Pengerjaan</span>
              </button>
            ) : (
              <span className="text-xs text-amber-700 font-semibold block pt-1.5">
                Sedang dalam status Pending Material
              </span>
            )}
          </div>
        </div>

        {/* Tombol Pekerjaan Fisik Selesai */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onOperatorSelesai}
            disabled={loading || !isApprovedBySpecialProject}
            className={`h-10 px-4 font-bold text-xs rounded-lg transition flex items-center gap-1.5 ${
              !isApprovedBySpecialProject
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
            } disabled:opacity-50`}
            title={
              !isApprovedBySpecialProject
                ? 'Terkunci: Pekerjaan belum dapat diselesaikan karena belum disetujui Atasan Special Project'
                : undefined
            }
          >
            {!isApprovedBySpecialProject ? (
              <Lock className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Pekerjaan Selesai</span>
          </button>
        </div>
      </div>

      {/* Dialog Input Alasan Pending Material */}
      <PendingConfirmationModal
        show={showPendingDialog}
        alasan={alasanPendingInput}
        loading={loading}
        onChangeAlasan={setAlasanPendingInput}
        onCancel={() => setShowPendingDialog(false)}
        onConfirm={onSetPendingMaterial}
      />
    </div>
  );
}
