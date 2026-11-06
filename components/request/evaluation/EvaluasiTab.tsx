import React from 'react';
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
} from 'lucide-react';
import { SectionRequestFull } from '../BridgestoneRequestPrintModal';
import { EvaluationFormData } from './types';
import { getSeksiCode } from '@/lib/nomorSurat';
import SignaturePad from '@/components/request/SignaturePad';
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
  React.useEffect(() => {
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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Ringkasan Permohonan Pemohon */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-500 font-medium block">Perihal / Mesin:</span>
          <span className="font-semibold text-slate-800">
            {requestData.perihal || requestData.namaBarang} ({requestData.namaMachine || '-'})
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Tujuan Pekerjaan:</span>
          <span className="text-slate-800">{requestData.tujuan || '-'}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Faktor (SEQCD) &amp; Qty:</span>
          <span className="font-semibold text-slate-800">
            {requestData.faktor || 'Safety'} • {requestData.jumlah || 1} {requestData.satuan || 'Set'}
          </span>
        </div>
      </div>

      {/* Pengaturan Nomor Request / Surat Resmi (Format: 001/Seksi/Romawi/Tahun) */}
      <div className="p-3.5 bg-white rounded-xl border border-red-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-900">
              Nomor Request Resmi (REQ. NO. : 001/Seksi/Romawi/Tahun)
            </span>
          </div>
          {formData.nomorSurat || (requestData.nomorRequest && !requestData.nomorRequest.startsWith('REQ-')) ? (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ REQ. NO. Aktif
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
              Otomatis terbit saat disetujui
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.nomorSurat || (requestData.nomorRequest && !requestData.nomorRequest.startsWith('REQ-') ? requestData.nomorRequest : '')}
            onChange={(e) => setFormData((p) => ({ ...p, nomorSurat: e.target.value }))}
            placeholder={`Contoh: 001/${getSeksiCode(requestData.seksiPemohon)}/XI/2026`}
            className="flex-1 h-10 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder:font-normal placeholder-slate-400 focus:bg-white focus:border-red-600 outline-none uppercase tracking-wide"
          />
        </div>
        <p className="text-xs text-slate-500">
          Penomoran REQ. NO. terpusat 1 urutan global dari Special Project / Workshop Bridgestone (Format: 001/Seksi/Romawi/Tahun).
        </p>
      </div>

      {/* Form Input Evaluasi Awal (Estimasi Waktu, Man Power, Biaya) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>1. Estimasi Waktu</span>
          </div>
          <div>
            <label className="text-xs text-slate-600 font-medium">Planning (Hari / Tanggal)</label>
            <input
              type="text"
              placeholder="Mis: 3 Hari Kerja / 10 Nov 2026"
              value={formData.waktuEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, waktuEstimate: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1 focus:border-red-600 outline-none"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
            <Users className="w-4 h-4 text-amber-600" />
            <span>2. Men Power (Orang/Jam)</span>
          </div>
          <div>
            <label className="text-xs text-slate-600 font-medium">Estimasi Man-hours</label>
            <input
              type="text"
              placeholder="Mis: 2 Orang / 4 Jam"
              value={formData.orangJamEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, orangJamEstimate: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1 focus:border-red-600 outline-none"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>3. Estimasi Biaya (Rp)</span>
          </div>
          <div>
            <label className="text-xs text-slate-600 font-medium">Estimasi Biaya Fabrikasi / Servis</label>
            <input
              type="text"
              placeholder="Mis: Rp 250.000"
              value={formData.biayaEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, biayaEstimate: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1 focus:border-red-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Penginputan Suku Cadang (Sparepart) & Material Fabrikasi Langsung di Panel Evaluasi */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Penggunaan Sparepart &amp; Material (Workshop)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Pilih suku cadang gudang (potong stok otomatis) atau input material/plat fabrikasi
          </span>
        </div>

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

      {/* 4.5. Personel Special Project (Ketik Manual Nama Staff, Spv, & Manajer 8236) */}
      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-100 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-700" />
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
              Penetapan Personel Special Project (Ketik Manual)
            </h4>
          </div>
          <span className="text-[11px] text-purple-800">
            Nama akan tercetak pada kolom Special Project (Staff, Spv, Manajer 8236)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              1. Staff (PIC Workshop)
            </label>
            <input
              type="text"
              value={formData.picBengkel || ''}
              onChange={(e) => setFormData((p) => ({ ...p, picBengkel: e.target.value }))}
              placeholder="Ketik nama Staff / PIC Bengkel"
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:border-purple-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              2. Spv Special Project
            </label>
            <input
              type="text"
              value={
                formData.keputusan8210?.startsWith('Manager Special') || formData.keputusan8210 === '8210'
                  ? ''
                  : formData.keputusan8210 || ''
              }
              onChange={(e) => setFormData((p) => ({ ...p, keputusan8210: e.target.value }))}
              placeholder="Ketik nama Spv Special Project"
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:border-purple-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              3. Manajer Special Project (8236)
            </label>
            <input
              type="text"
              value={
                formData.keputusan820?.startsWith('Dept Head') || formData.keputusan820 === '820'
                  ? ''
                  : formData.keputusan820 || ''
              }
              onChange={(e) => setFormData((p) => ({ ...p, keputusan820: e.target.value }))}
              placeholder="Ketik nama Manajer (8236)"
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:border-purple-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5. BOX UTAMA ACC & ASSIGN ATASAN SPECIAL PROJECT (8236) */}
      {isWaitingSpecialProject && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-purple-500 bg-purple-50/90 space-y-4 shadow-sm animate-scale-up">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-purple-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wide flex items-center gap-2">
                  <span>Persetujuan &amp; ACC Assign Atasan Special Project (8236)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-200 text-purple-900 border border-purple-300">
                    TAHAP 5 AKTIF
                  </span>
                </h4>
                <p className="text-xs text-purple-800 mt-0.5">
                  Klik tombol <strong>ACC / Setujui Assign</strong> di bawah ini agar permohonan langsung beralih ke <strong>&quot;Dikerjakan&quot; (Tahap 6)</strong> dan tersimpan ke database.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Nama Spv Special Project *
              </label>
              <input
                type="text"
                value={
                  formData.keputusan8210?.startsWith('Manager Special') || formData.keputusan8210 === '8210'
                    ? ''
                    : formData.keputusan8210 || ''
                }
                onChange={(e) => setFormData((p) => ({ ...p, keputusan8210: e.target.value }))}
                placeholder="Ketik manual nama Spv Special Project"
                className="w-full h-10 px-3 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Nama Manajer Special Project (8236) *
              </label>
              <input
                type="text"
                value={
                  formData.keputusan820?.startsWith('Dept Head') || formData.keputusan820 === '820'
                    ? ''
                    : formData.keputusan820 || ''
                }
                onChange={(e) => setFormData((p) => ({ ...p, keputusan820: e.target.value }))}
                placeholder="Ketik manual nama Manajer 8236"
                className="w-full h-10 px-3 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-950 mb-1">
              Catatan Instruksi Pengerjaan Bengkel (Opsional)
            </label>
            <input
              type="text"
              value={formData.catatanAdmin || ''}
              onChange={(e) => setFormData((p) => ({ ...p, catatanAdmin: e.target.value }))}
              placeholder="Contoh: Prioritas pengerjaan shift 1, pastikan finishing bubut sesuai toleransi..."
              className="w-full h-10 px-3 bg-white border border-purple-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-purple-200">
            <span className="text-xs text-purple-900">
              * Perubahan tersimpan secara nyata ke database PostgreSQL dan tercatat di lembar cetak formulir resmi.
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {requestData.approvalToken && (
                <a
                  href={`/request/approval?token=${encodeURIComponent(requestData.approvalToken)}&role=special_project`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 px-3.5 bg-white hover:bg-purple-100 text-purple-800 font-semibold text-xs rounded-lg border border-purple-300 transition inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>Lembar Approval Eksternal</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => onAssignSpecialProject?.(formData.keputusan8210, formData.keputusan820, formData.catatanAdmin)}
                disabled={loading}
                className="h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Menyimpan ke DB...' : 'ACC / Setujui Assign Special Project (8236)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi jika sudah di-ACC Special Project */}
      {isAlreadyAssigned && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs animate-scale-up">
          <div className="flex items-center gap-2 text-emerald-950 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Telah di-ACC oleh Atasan Special Project: <strong>{formData.keputusan8210 || '-'}</strong> (Spv) &amp; <strong>{formData.keputusan820 || '-'}</strong> (Manajer 8236) - (Status: Dikerjakan / Tahap 6).
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAssignSpecialProject?.(formData.keputusan8210, formData.keputusan820, formData.catatanAdmin)}
            disabled={loading}
            className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md text-xs font-semibold cursor-pointer"
          >
            Perbarui Data ACC S.Project
          </button>
        </div>
      )}

      {/* Action Box: Keputusan Pekerjaan (Lanjut atau Tolak) */}
      <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Keputusan Evaluasi PIC Workshop</span>
          </span>
          <span className="text-xs text-slate-500">
            {isWaitingSpecialProject
              ? 'Evaluasi workshop telah selesai disetujui (Menunggu ACC Special Project di atas)'
              : 'Kirim notifikasi otomatis ke Atasan Special Project'}
          </span>
        </div>

        {/* Input Alasan Tolak */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Alasan Penolakan (Hanya diisi jika menetapkan TOLAK):
          </label>
          <input
            type="text"
            value={formData.alasanTolak}
            onChange={(e) => setFormData((p) => ({ ...p, alasanTolak: e.target.value }))}
            placeholder="Contoh: Keterbatasan mesin bubut workshop / spesifikasi di luar wewenang bengkel"
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Tanda Tangan Digital Resmi PIC Workshop (Checklist Verified) */}
        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-start gap-3 p-3.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition">
            <input
              type="checkbox"
              checked={formData.ttdAdminWorkshop !== 'NONE'}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  ttdAdminWorkshop: e.target.checked ? 'VERIFIED_DIGITAL' : 'NONE',
                }))
              }
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-emerald-950 block">
                ✓ Tanda Tangan Digital PIC Workshop (Verified)
              </span>
              <span className="text-emerald-800 text-[11px] block mt-0.5 leading-relaxed">
                Evaluasi pekerjaan, estimasi biaya &amp; orang/jam disetujui secara digital oleh <strong>{formData.picBengkel || 'PIC Workshop'}</strong>.
              </span>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={onDecisionLanjut}
            disabled={loading}
            className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Setujui Evaluasi Workshop</span>
          </button>

          {!isWaitingSpecialProject && !isAlreadyAssigned && (
            <button
              type="button"
              onClick={() => onAssignSpecialProject?.(formData.keputusan8210, formData.keputusan820, formData.catatanAdmin)}
              disabled={loading}
              className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Setujui &amp; Langsung ACC S.Project (Fast Track)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDecisionTolak}
            disabled={loading}
            className="h-10 px-4 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-300 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            <span>Tolak Permohonan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
