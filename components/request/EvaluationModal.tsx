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
} from 'lucide-react';
import FlowchartTracker from './FlowchartTracker';
import { FlowStepCode } from '@/lib/workflowConstants';
import { EvaluationModalProps } from './evaluation/types';
import { useEvaluationForm } from './evaluation/useEvaluationForm';
import { useMaterialsEditor } from './evaluation/useMaterialsEditor';
import EvaluasiTab from './evaluation/EvaluasiTab';
import MaterialsTab from './evaluation/MaterialsTab';
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
              form.activeTab === 'evaluasi'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>1. Evaluasi & Keputusan</span>
          </button>

          <button
            type="button"
            onClick={() => form.setActiveTab('materials')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              form.activeTab === 'materials'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>2. Sparepart & Material</span>
            {materials.materialsList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                {materials.materialsList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => form.setActiveTab('pengerjaan')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              form.activeTab === 'pengerjaan'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>3. Status Pengerjaan & Pending</span>
            {isPendingMaterial && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => form.setActiveTab('penyelesaian')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              form.activeTab === 'penyelesaian'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4. Hasil Check & Selesai</span>
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
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 space-y-2 animate-scale-up">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{form.notifSuccessData.message}</span>
              </div>
              <p className="text-xs text-emerald-800">
                Notifikasi otomatis telah dikirimkan ke <strong>Atasan Special Project (8210 / 820)</strong> via sistem dan email default ({form.notifSuccessData.emailData?.toEmail}).
              </p>
              {form.notifSuccessData.emailData && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={form.notifSuccessData.emailData.mailtoUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Buka Email ke Atasan Special Project</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => form.setNotifSuccessData(null)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    Tutup Pesan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tracker Alur Flowchart */}
          <FlowchartTracker currentStep={currentStep} />

          {/* Tab 1: Evaluasi & Keputusan */}
          {form.activeTab === 'evaluasi' && (
            <EvaluasiTab
              requestData={requestData}
              formData={form.formData}
              loading={form.loading}
              setFormData={form.setFormData}
              onDecisionLanjut={form.handleDecisionLanjut}
              onDecisionTolak={form.handleDecisionTolak}
            />
          )}

          {/* Tab 2: Sparepart & Material */}
          {form.activeTab === 'materials' && (
            <MaterialsTab
              itemCategoryMode={materials.itemCategoryMode}
              setItemCategoryMode={materials.setItemCategoryMode}
              sparepartsCatalogList={materials.sparepartsCatalogList}
              materialsCatalogList={materials.materialsCatalogList}
              selectedSparepart={materials.selectedSparepart}
              setSelectedSparepart={materials.setSelectedSparepart}
              sparepartQty={materials.sparepartQty}
              setSparepartQty={materials.setSparepartQty}
              sparepartKeterangan={materials.sparepartKeterangan}
              setSparepartKeterangan={materials.setSparepartKeterangan}
              currentSparepartDetail={materials.currentSparepartDetail}
              currentMaterialDetail={materials.currentMaterialDetail}
              materialSourceMode={materials.materialSourceMode}
              setMaterialSourceMode={materials.setMaterialSourceMode}
              selectedMaterial={materials.selectedMaterial}
              setSelectedMaterial={materials.setSelectedMaterial}
              customMaterialName={materials.customMaterialName}
              setCustomMaterialName={materials.setCustomMaterialName}
              materialQty={materials.materialQty}
              setMaterialQty={materials.setMaterialQty}
              materialSatuan={materials.materialSatuan}
              setMaterialSatuan={materials.setMaterialSatuan}
              customSatuan={materials.customSatuan}
              setCustomSatuan={materials.setCustomSatuan}
              materialDimensi={materials.materialDimensi}
              setMaterialDimensi={materials.setMaterialDimensi}
              materialKeterangan={materials.materialKeterangan}
              setMaterialKeterangan={materials.setMaterialKeterangan}
              materialPotongStokGudang={materials.materialPotongStokGudang}
              setMaterialPotongStokGudang={materials.setMaterialPotongStokGudang}
              materialQtyPotongGudang={materials.materialQtyPotongGudang}
              setMaterialQtyPotongGudang={materials.setMaterialQtyPotongGudang}
              showPlateCalc={materials.showPlateCalc}
              setShowPlateCalc={materials.setShowPlateCalc}
              calcPanjang={materials.calcPanjang}
              setCalcPanjang={materials.setCalcPanjang}
              calcLebar={materials.calcLebar}
              setCalcLebar={materials.setCalcLebar}
              calcTebal={materials.calcTebal}
              setCalcTebal={materials.setCalcTebal}
              computedArea={materials.computedArea}
              applyPlateArea={materials.applyPlateArea}
              tableFilterType={materials.tableFilterType}
              setTableFilterType={materials.setTableFilterType}
              filteredMaterialsTable={materials.filteredMaterialsTable}
              materialsList={materials.materialsList}
              countSparepart={materials.countSparepart}
              countMaterial={materials.countMaterial}
              materialLoading={materials.materialLoading}
              onAddSparepart={materials.handleAddSparepart}
              onAddMaterial={materials.handleAddMaterial}
              onRemoveMaterial={materials.handleRemoveMaterial}
            />
          )}

          {/* Tab 3: Pengerjaan & Pending */}
          {form.activeTab === 'pengerjaan' && (
            <PengerjaanTab
              formData={form.formData}
              loading={form.loading}
              isPendingMaterial={Boolean(isPendingMaterial)}
              showPendingDialog={form.showPendingDialog}
              alasanPendingInput={form.alasanPendingInput}
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
