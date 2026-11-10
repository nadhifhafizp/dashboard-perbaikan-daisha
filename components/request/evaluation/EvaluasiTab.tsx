import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  DollarSign,
  Wrench,
  Package,
  Shield,
  ArrowRight,
  Ban,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { SectionRequestFull } from '../BridgestoneRequestPrintModal';
import { EvaluationFormData } from './types';
import { getSeksiCode } from '@/lib/nomorSurat';
import MaterialsTab from './MaterialsTab';
import { MaterialsEditorType } from './useMaterialsEditor';

interface EvaluasiTabProps {
  requestData: SectionRequestFull;
  formData: EvaluationFormData;
  loading: boolean;
  setFormData: React.Dispatch<React.SetStateAction<EvaluationFormData>>;
  onDecisionLanjut: () => void;
  onDecisionTolak: () => void;
  onAssignSpecialProject?: (sp8210?: string, sp820?: string, catatan?: string) => void;
  materialsEditor?: MaterialsEditorType;
}

export default function EvaluasiTab({
  requestData,
  formData,
  loading,
  setFormData,
  onDecisionLanjut,
  onDecisionTolak,
  onAssignSpecialProject,
  materialsEditor,
}: EvaluasiTabProps) {
  // Mode keputusan: 'APPROVE' (setujui/lanjut) vs 'REJECT' (tolak)
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT'>(
    formData.keputusan === 'REJECT' ? 'REJECT' : 'APPROVE'
  );

  // Toggle buka/tutup modul sparepart & material agar modal tidak terlalu panjang
  const [showMaterialsEditor, setShowMaterialsEditor] = useState<boolean>(
    !materialsEditor || materialsEditor.materialsList.length === 0
  );

  const isWaitingSpecialProject =
    formData.flowStep === 'STEP_5_MENUNGGU_ATASAN_SPROJECT' ||
    formData.status === 'Menunggu Assign S.Project' ||
    formData.status === 'Pending: Menunggu Assign S.Project' ||
    requestData.flowStep === 'STEP_5_MENUNGGU_ATASAN_SPROJECT' ||
    requestData.status === 'Menunggu Assign S.Project' ||
    requestData.status === 'Pending: Menunggu Assign S.Project';

  const isAlreadyAssigned =
    formData.flowStep === 'STEP_6_DALAM_PENGERJAAN' ||
    formData.status === 'Dikerjakan' ||
    formData.flowStep === 'STEP_7_PEKERJAAN_SELESAI' ||
    formData.status === 'Pekerjaan Fisik Selesai' ||
    formData.flowStep === 'STEP_8_SELESAI' ||
    formData.status === 'Selesai';

  // Otomatis sinkronkan ringkasan kebutuhan part & material saat admin menambahkan/menghapus item
  useEffect(() => {
    if (!materialsEditor) return;
    const spList = materialsEditor.materialsList
      .filter((m) => m.tipe === 'SPAREPART')
      .map((m) => `${m.namaKomponen} (${m.qty} ${m.satuan || 'Pcs'})`)
      .join(', ');
    const matList = materialsEditor.materialsList
      .filter((m) => m.tipe === 'MATERIAL')
      .map((m) => `${m.namaKomponen}${m.dimensi ? ` [${m.dimensi}]` : ''} (${m.qty} ${m.satuan || 'Unit'})`)
      .join(', ');

    if (spList && spList !== formData.kebutuhanSparepart) {
      setFormData((p) => ({ ...p, kebutuhanSparepart: spList }));
    }
    if (matList && matList !== formData.kebutuhanMaterial) {
      setFormData((p) => ({ ...p, kebutuhanMaterial: matList }));
    }
  }, [materialsEditor?.materialsList, formData.kebutuhanSparepart, formData.kebutuhanMaterial, setFormData]);

  const hasReqNoActive = Boolean(
    formData.nomorSurat ||
    (requestData.nomorRequest && !requestData.nomorRequest.startsWith('REQ-'))
  );

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* 1. Header Card: Ringkasan Pengajuan & Nomor Surat Resmi */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          {/* Sisi Kiri: Data Pemohon */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm">
                {requestData.perihal || requestData.namaBarang}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {requestData.seksiPemohon}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {requestData.faktor || 'Safety'} • {requestData.jumlah || 1} {requestData.satuan || 'Set'}
              </span>
            </div>

            <div className="text-slate-600 space-y-0.5">
              <p>
                <strong className="text-slate-700">Mesin / Line:</strong> {requestData.namaMachine || '-'}
              </p>
              <p className="line-clamp-2">
                <strong className="text-slate-700">Tujuan:</strong> {requestData.tujuan || '-'}
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Nomor Request Resmi */}
          <div className="p-3 bg-slate-50/90 rounded-lg border border-slate-200/90 space-y-1.5">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>Nomor Request Resmi (REQ. NO.)</span>
              </div>
              {hasReqNoActive ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ REQ. NO. Aktif
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
                  Otomatis terbit saat disetujui
                </span>
              )}
            </div>

            <input
              type="text"
              value={formData.nomorSurat || (requestData.nomorRequest && !requestData.nomorRequest.startsWith('REQ-') ? requestData.nomorRequest : '')}
              onChange={(e) => setFormData((p) => ({ ...p, nomorSurat: e.target.value }))}
              placeholder={`Contoh: 001/${getSeksiCode(requestData.seksiPemohon)}/XI/2026`}
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-900 placeholder:font-normal placeholder-slate-400 focus:border-red-600 outline-none uppercase tracking-wide"
            />
            <p className="text-[10px] text-slate-500">
              Format baku: 001/Seksi/Romawi/Tahun (Global Workshop Bridgestone).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Estimasi Pengerjaan Workshop (3 Aspek Utama) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Clock className="w-4 h-4 text-red-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            1. Estimasi Waktu, Tenaga Kerja &amp; Biaya
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Estimasi Waktu */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Estimasi Waktu Pengerjaan</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: 3 Hari Kerja / 10 Nov 2026"
              value={formData.waktuEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, waktuEstimate: e.target.value }))}
              className="w-full h-9 px-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg focus:bg-white focus:border-red-600 outline-none transition"
            />
          </div>

          {/* Men Power */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Men Power (Orang / Jam)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: 2 Orang / 4 Jam"
              value={formData.orangJamEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, orangJamEstimate: e.target.value }))}
              className="w-full h-9 px-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg focus:bg-white focus:border-red-600 outline-none transition"
            />
          </div>

          {/* Estimasi Biaya */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-semibold text-slate-700">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Estimasi Biaya (Rp)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Rp 250.000"
              value={formData.biayaEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, biayaEstimate: e.target.value }))}
              className="w-full h-9 px-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg focus:bg-white focus:border-red-600 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* 3. Penggunaan Sparepart & Material (Workshop) - Clean & Collapsible */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              2. Kebutuhan Sparepart &amp; Material Fabrikasi
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {materialsEditor && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {materialsEditor.countSparepart} Sparepart
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {materialsEditor.countMaterial} Material
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowMaterialsEditor((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition cursor-pointer"
            >
              <span>{showMaterialsEditor ? 'Tutup Form Part' : 'Kelola / Tambah Part'}</span>
              {showMaterialsEditor ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Ringkasan jika Form Ditutup tapi ada Item Terpasang */}
        {!showMaterialsEditor && materialsEditor && materialsEditor.materialsList.length > 0 && (
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700">Item Terpilih:</span>
            {materialsEditor.materialsList.map((m) => (
              <span
                key={m.id || m.namaKomponen}
                className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 text-[11px] font-medium shadow-2xs"
              >
                {m.tipe === 'SPAREPART' ? '🔧' : '📦'} {m.namaKomponen} ({m.qty} {m.satuan || 'Pcs'})
              </span>
            ))}
          </div>
        )}

        {/* Modul Editor jika dibuka */}
        {showMaterialsEditor && (
          <div className="pt-1">
            {materialsEditor ? (
              <MaterialsTab
                itemCategoryMode={materialsEditor.itemCategoryMode}
                setItemCategoryMode={materialsEditor.setItemCategoryMode}
                sparepartsCatalogList={materialsEditor.sparepartsCatalogList}
                materialsCatalogList={materialsEditor.materialsCatalogList}
                selectedSparepart={materialsEditor.selectedSparepart}
                setSelectedSparepart={materialsEditor.setSelectedSparepart}
                sparepartQty={materialsEditor.sparepartQty}
                setSparepartQty={materialsEditor.setSparepartQty}
                sparepartKeterangan={materialsEditor.sparepartKeterangan}
                setSparepartKeterangan={materialsEditor.setSparepartKeterangan}
                currentSparepartDetail={materialsEditor.currentSparepartDetail}
                currentMaterialDetail={materialsEditor.currentMaterialDetail}
                materialSourceMode={materialsEditor.materialSourceMode}
                setMaterialSourceMode={materialsEditor.setMaterialSourceMode}
                selectedMaterial={materialsEditor.selectedMaterial}
                setSelectedMaterial={materialsEditor.setSelectedMaterial}
                customMaterialName={materialsEditor.customMaterialName}
                setCustomMaterialName={materialsEditor.setCustomMaterialName}
                materialQty={materialsEditor.materialQty}
                setMaterialQty={materialsEditor.setMaterialQty}
                materialSatuan={materialsEditor.materialSatuan}
                setMaterialSatuan={materialsEditor.setMaterialSatuan}
                customSatuan={materialsEditor.customSatuan}
                setCustomSatuan={materialsEditor.setCustomSatuan}
                materialDimensi={materialsEditor.materialDimensi}
                setMaterialDimensi={materialsEditor.setMaterialDimensi}
                materialKeterangan={materialsEditor.materialKeterangan}
                setMaterialKeterangan={materialsEditor.setMaterialKeterangan}
                materialPotongStokGudang={materialsEditor.materialPotongStokGudang}
                setMaterialPotongStokGudang={materialsEditor.setMaterialPotongStokGudang}
                materialQtyPotongGudang={materialsEditor.materialQtyPotongGudang}
                setMaterialQtyPotongGudang={materialsEditor.setMaterialQtyPotongGudang}
                showPlateCalc={materialsEditor.showPlateCalc}
                setShowPlateCalc={materialsEditor.setShowPlateCalc}
                calcPanjang={materialsEditor.calcPanjang}
                setCalcPanjang={materialsEditor.setCalcPanjang}
                calcLebar={materialsEditor.calcLebar}
                setCalcLebar={materialsEditor.setCalcLebar}
                calcTebal={materialsEditor.calcTebal}
                setCalcTebal={materialsEditor.setCalcTebal}
                computedArea={materialsEditor.computedArea}
                applyPlateArea={materialsEditor.applyPlateArea}
                tableFilterType={materialsEditor.tableFilterType}
                setTableFilterType={materialsEditor.setTableFilterType}
                filteredMaterialsTable={materialsEditor.filteredMaterialsTable}
                materialsList={materialsEditor.materialsList}
                countSparepart={materialsEditor.countSparepart}
                countMaterial={materialsEditor.countMaterial}
                materialLoading={materialsEditor.materialLoading}
                onAddSparepart={materialsEditor.handleAddSparepart}
                onAddMaterial={materialsEditor.handleAddMaterial}
                onRemoveMaterial={materialsEditor.handleRemoveMaterial}
              />
            ) : (
              <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-xs italic">
                Memuat modul suku cadang &amp; material...
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Tim Penanggung Jawab (Special Project & Workshop) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              3. Personel Evaluator &amp; Approval
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Nama akan tercetak pada formulir fisik resmi Bridgestone
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staff (PIC Workshop)
            </label>
            <input
              type="text"
              value={formData.picBengkel || ''}
              onChange={(e) => setFormData((p) => ({ ...p, picBengkel: e.target.value }))}
              placeholder="Nama Staff / PIC Bengkel"
              className="w-full h-9 px-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-600 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spv Special Project
            </label>
            <input
              type="text"
              value={
                formData.keputusan8210?.startsWith('Manager Special') || formData.keputusan8210 === '8210'
                  ? ''
                  : formData.keputusan8210 || ''
              }
              onChange={(e) => setFormData((p) => ({ ...p, keputusan8210: e.target.value }))}
              placeholder="Nama Spv Special Project"
              className="w-full h-9 px-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-600 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manajer Special Project (8236)
            </label>
            <input
              type="text"
              value={
                formData.keputusan820?.startsWith('Dept Head') || formData.keputusan820 === '820'
                  ? ''
                  : formData.keputusan820 || ''
              }
              onChange={(e) => setFormData((p) => ({ ...p, keputusan820: e.target.value }))}
              placeholder="Nama Manajer (8236)"
              className="w-full h-9 px-3 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-600 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* 5. BOX NOTIFIKASI KHUSUS ACC ATASAN SPECIAL PROJECT */}
      {isWaitingSpecialProject && (
        <div className="p-4 rounded-xl border-2 border-purple-400 bg-purple-50/90 space-y-3 shadow-xs animate-scale-up">
          <div className="flex items-center gap-2 text-purple-950 font-bold">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>Menunggu Persetujuan / Assign Atasan Special Project (8236)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-200 text-purple-900 border border-purple-300">
              Tahap 5 Aktif
            </span>
          </div>
          <p className="text-purple-900 leading-relaxed text-xs">
            Evaluasi workshop telah selesai disetujui. Atasan Special Project dapat langsung meng-ACC permohonan ini di bawah atau melalui link approval email untuk mengaktifkan status <strong>&quot;Dikerjakan&quot; (Tahap 6)</strong>.
          </p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {requestData.approvalToken && (
              <a
                href={`/request/approval?token=${encodeURIComponent(requestData.approvalToken)}&role=special_project`}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-3 bg-white hover:bg-purple-100 text-purple-900 font-semibold text-xs rounded-lg border border-purple-300 transition inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Lembar Approval Eksternal</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => onAssignSpecialProject?.(formData.keputusan8210, formData.keputusan820, formData.catatanAdmin)}
              disabled={loading}
              className="h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'ACC / Setujui Assign S.Project Sekarang'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Konfirmasi jika sudah di-ACC Special Project */}
      {isAlreadyAssigned && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between flex-wrap gap-2 animate-scale-up">
          <div className="flex items-center gap-2 text-emerald-950 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Telah di-ACC oleh Atasan Special Project: <strong>{formData.keputusan8210 || '-'}</strong> (Spv) &amp; <strong>{formData.keputusan820 || '-'}</strong> (Manajer 8236) — Status: <strong>Dikerjakan</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAssignSpecialProject?.(formData.keputusan8210, formData.keputusan820, formData.catatanAdmin)}
            disabled={loading}
            className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md text-xs font-semibold cursor-pointer"
          >
            Perbarui Data ACC
          </button>
        </div>
      )}

      {/* 6. Keputusan Evaluasi PIC Workshop - Jelas, Bersih & Tidak Membingungkan */}
      <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/90 space-y-4">
        {/* Toggle Pilihan Keputusan: Setujui vs Tolak */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Shield className="w-4 h-4 text-red-600" />
            <span>4. Keputusan Evaluasi PIC Workshop</span>
          </div>

          <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5">
            <button
              type="button"
              onClick={() => setDecisionMode('APPROVE')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                decisionMode === 'APPROVE'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Setujui Permohonan</span>
            </button>
            <button
              type="button"
              onClick={() => setDecisionMode('REJECT')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                decisionMode === 'REJECT'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ban className="w-3.5 h-3.5 text-rose-600" />
              <span>Tolak Permohonan</span>
            </button>
          </div>
        </div>

        {/* JIKA MODE: SETUJUI PERMOHONAN */}
        {decisionMode === 'APPROVE' && (
          <div className="space-y-3 animate-fade-in">
            {/* Tanda Tangan Digital PIC Workshop */}
            <label className="flex items-start gap-3 p-3 bg-white border border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50/50 transition">
              <input
                type="checkbox"
                checked={formData.ttdAdminWorkshop !== 'NONE'}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    ttdAdminWorkshop: e.target.checked ? 'VERIFIED_DIGITAL' : 'NONE',
                  }))
                }
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-bold text-emerald-950 block">
                  ✓ Tanda Tangan Digital PIC Workshop (Terverifikasi)
                </span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  Estimasi waktu, orang/jam, dan kebutuhan part disahkan oleh <strong>{formData.picBengkel || 'PIC Workshop'}</strong>.
                </span>
              </div>
            </label>

            {/* Tombol Aksi Persetujuan */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={onDecisionLanjut}
                disabled={loading}
                className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Setujui & Kirim ke Atasan S.Project'}</span>
              </button>

              {!isWaitingSpecialProject && !isAlreadyAssigned && (
                <button
                  type="button"
                  onClick={() => onAssignSpecialProject?.(formData.keputusan8210, formData.keputusan820, formData.catatanAdmin)}
                  disabled={loading}
                  title="Gunakan ini jika Anda memiliki wewenang untuk langsung ACC tanpa alur tunggu Atasan."
                  className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Setujui &amp; Langsung Mulai (Fast Track)</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              * Tombol merah akan mengirim notifikasi ke Atasan Special Project (8236) untuk ACC. Tombol ungu (Fast Track) langsung mengaktifkan status pengerjaan bengkel.
            </p>
          </div>
        )}

        {/* JIKA MODE: TOLAK PERMOHONAN */}
        {decisionMode === 'REJECT' && (
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-rose-950 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Alasan Penolakan Permohonan (Wajib Diisi) *</span>
              </label>
              <input
                type="text"
                value={formData.alasanTolak}
                onChange={(e) => setFormData((p) => ({ ...p, alasanTolak: e.target.value }))}
                placeholder="Contoh: Beban workshop penuh / spesifikasi di luar wewenang bengkel / mesin fabrikasi tidak memadai"
                className="w-full h-10 px-3 bg-white border border-rose-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={onDecisionTolak}
                disabled={loading || !formData.alasanTolak.trim()}
                className="h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>{loading ? 'Memproses...' : 'Konfirmasi Tolak Permohonan'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDecisionMode('APPROVE')}
                className="h-10 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
