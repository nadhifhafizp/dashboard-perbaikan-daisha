'use client';

import React, { useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Mail,
  Boxes,
  Timer,
  Hammer,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import FlowchartTracker from './FlowchartTracker';
import { FlowStepCode } from '@/lib/workflowConstants';
import { EvaluationModalProps } from './evaluation/types';
import { useEvaluationForm } from './evaluation/useEvaluationForm';
import { useMaterialsEditor } from './evaluation/useMaterialsEditor';
import EvaluasiTab from './evaluation/EvaluasiTab';
import PengerjaanTab from './evaluation/PengerjaanTab';
import PenyelesaianTab from './evaluation/PenyelesaianTab';

export type { SparepartOption } from './evaluation/types';
export type { ClientMaterialItem } from '@/lib/materialArea';
export { normalizeMaterialsClient } from '@/lib/materialArea';

export default function EvaluationModal({
  isOpen,
  requestData,
  onClose,
  onSuccess,
}: EvaluationModalProps) {
  const form = useEvaluationForm(requestData, isOpen, onClose, onSuccess);
  const materials = useMaterialsEditor(
    requestData,
    isOpen,
    onSuccess,
    form.handleUnauthorized,
    (msg) => form.handleSaveAction(undefined, undefined).catch(() => {})
  );

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !form.loading && !materials.materialLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, form.loading, materials.materialLoading, onClose]);

  if (!isOpen || !requestData) return null;

  const currentStep = (form.formData.flowStep || 'STEP_4_EVALUASI_WORKSHOP') as FlowStepCode;
  const isPendingMaterial = form.formData.status?.toLowerCase().includes('material habis');
  const isApprovedBySpecialProject = form.isApprovedBySpecialProject;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-red-600" />
                <span>Panel Evaluasi & Workshop</span>
              </span>
              <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                {requestData.nomorRequest}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isPendingMaterial
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : form.formData.status === 'Dikerjakan'
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                    : form.formData.status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                Status: {form.formData.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              <strong>{requestData.seksiPemohon}</strong> • {requestData.perihal || requestData.namaBarang} (Drafter: {requestData.picPemohon || '-'})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition flex items-center justify-center cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel tabs navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-5 overflow-x-auto shrink-0 divide-x divide-transparent">
          <button
            type="button"
            onClick={() => form.setActiveTab('evaluasi')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              form.activeTab === 'evaluasi' || form.activeTab === 'materials'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>1. Evaluasi &amp; Keputusan</span>
            {materials.materialsList.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {materials.materialsList.length} part
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isApprovedBySpecialProject) {
                form.setErrorMsg('Tahap pengerjaan fisik masih terkunci. Menunggu persetujuan & assign resmi dari Atasan Special Project (8236).');
                return;
              }
              form.setActiveTab('pengerjaan');
            }}
            disabled={!isApprovedBySpecialProject}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              !isApprovedBySpecialProject
                ? 'border-transparent text-slate-400 bg-slate-100/60 cursor-not-allowed opacity-70'
                : form.activeTab === 'pengerjaan'
                ? 'border-red-600 text-red-700 bg-red-50/40 cursor-pointer'
                : 'border-transparent text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
            title={!isApprovedBySpecialProject ? 'Terkunci: Menunggu persetujuan & assign dari Atasan Special Project (8236)' : undefined}
          >
            {!isApprovedBySpecialProject ? (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Hammer className="w-3.5 h-3.5" />
            )}
            <span>2. Status Pengerjaan {isApprovedBySpecialProject ? '' : '(Terkunci)'}</span>
            {isPendingMaterial && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isApprovedBySpecialProject) {
                form.setErrorMsg('Tahap penyelesaian permohonan terkunci. Menunggu persetujuan & assign resmi dari Atasan Special Project (8236).');
                return;
              }
              form.setActiveTab('penyelesaian');
            }}
            disabled={!isApprovedBySpecialProject}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              !isApprovedBySpecialProject
                ? 'border-transparent text-slate-400 bg-slate-100/60 cursor-not-allowed opacity-70'
                : form.activeTab === 'penyelesaian'
                ? 'border-red-600 text-red-700 bg-red-50/40 cursor-pointer'
                : 'border-transparent text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
            title={!isApprovedBySpecialProject ? 'Terkunci: Menunggu persetujuan & assign dari Atasan Special Project (8236)' : undefined}
          >
            {!isApprovedBySpecialProject ? (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>3. Hasil Check &amp; Selesai {isApprovedBySpecialProject ? '' : '(Terkunci)'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Error Message */}
          {form.errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{form.errorMsg}</span>
            </div>
          )}

          {/* Alert Notifikasi Sukses ke S.Project */}
          {form.notifSuccessData && (
            <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-300 space-y-2 animate-scale-up">
              <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{form.notifSuccessData.message}</span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed">
                Evaluasi workshop telah disimpan. Permohonan kini <strong>menunggu persetujuan dan tanda tangan resmi dari Atasan Special Project (8236)</strong>. Tahap pengerjaan fisik serta penyelesaian baru dapat dilakukan setelah Atasan Special Project memberikan persetujuan (Assign).
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {form.notifSuccessData.emailData && (
                  <a
                    href={form.notifSuccessData.emailData.mailtoUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg text-xs font-semibold transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Buka Email ke Atasan Special Project</span>
                  </a>
                )}
                {requestData.approvalToken && (
                  <a
                    href={`/request/approval?token=${encodeURIComponent(requestData.approvalToken)}&role=special_project`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Buka Lembar Approval (Tanda Tangan S.Project)</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => form.setNotifSuccessData(null)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Tutup Pesan
                </button>
              </div>
            </div>
          )}

          {/* Tracker Alur Flowchart */}
          <FlowchartTracker currentStep={currentStep} />

          {/* Tab 1: Evaluasi & Keputusan (Termasuk Penginputan Suku Cadang & Material Fabrikasi) */}
          {(form.activeTab === 'evaluasi' || form.activeTab === 'materials') && (
            <EvaluasiTab
              requestData={requestData}
              formData={form.formData}
              loading={form.loading}
              setFormData={form.setFormData}
              onDecisionLanjut={form.handleDecisionLanjut}
              onDecisionTolak={form.handleDecisionTolak}
              onAssignSpecialProject={form.handleAssignAtasanSpecialProject}
              materialsEditor={materials}
            />
          )}

          {/* Tab 3: Pengerjaan & Pending */}
          {form.activeTab === 'pengerjaan' && (
            <PengerjaanTab
              formData={form.formData}
              loading={form.loading}
              isApprovedBySpecialProject={isApprovedBySpecialProject}
              isPendingMaterial={Boolean(isPendingMaterial)}
              showPendingDialog={form.showPendingDialog}
              alasanPendingInput={form.alasanPendingInput}
              approvalToken={requestData.approvalToken}
              setFormData={form.setFormData}
              setShowPendingDialog={form.setShowPendingDialog}
              setAlasanPendingInput={form.setAlasanPendingInput}
              onAssignAtasanSpecialProject={form.handleAssignAtasanSpecialProject}
              onResumeProgress={form.handleResumeProgress}
              onSetPendingMaterial={form.handleSetPendingMaterial}
              onOperatorSelesai={form.handleOperatorSelesai}
            />
          )}

          {/* Tab 4: Hasil Check & Penyelesaian */}
          {form.activeTab === 'penyelesaian' && (
            <PenyelesaianTab
              formData={form.formData}
              loading={form.loading}
              isApprovedBySpecialProject={isApprovedBySpecialProject}
              setFormData={form.setFormData}
              onFinalFinish={form.handleFinalFinish}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Tab: <strong className="text-slate-800 capitalize">{form.activeTab}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => form.handleSaveAction()}
              disabled={form.loading}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{form.loading ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
