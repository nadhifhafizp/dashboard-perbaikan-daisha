import React from 'react';
import {
  Wrench,
  Package,
  Plus,
  Boxes,
  Trash2,
  Calculator,
  Ruler,
} from 'lucide-react';
import { SparepartOption } from './types';
import { ClientMaterialItem, PlateAreaResult } from '@/lib/materialArea';

interface MaterialsTabProps {
  itemCategoryMode: 'SPAREPART' | 'MATERIAL';
  setItemCategoryMode: (mode: 'SPAREPART' | 'MATERIAL') => void;
  sparepartsCatalogList: SparepartOption[];
  materialsCatalogList: SparepartOption[];
  selectedSparepart: string;
  setSelectedSparepart: (val: string) => void;
  sparepartQty: number;
  setSparepartQty: (val: number) => void;
  sparepartKeterangan: string;
  setSparepartKeterangan: (val: string) => void;
  currentSparepartDetail?: SparepartOption;
  currentMaterialDetail?: SparepartOption;
  materialSourceMode: 'CATALOG' | 'CUSTOM';
  setMaterialSourceMode: (mode: 'CATALOG' | 'CUSTOM') => void;
  selectedMaterial: string;
  setSelectedMaterial: (val: string) => void;
  customMaterialName: string;
  setCustomMaterialName: (val: string) => void;
  materialQty: string;
  setMaterialQty: (val: string) => void;
  materialSatuan: string;
  setMaterialSatuan: (val: string) => void;
  customSatuan: string;
  setCustomSatuan: (val: string) => void;
  materialDimensi: string;
  setMaterialDimensi: (val: string) => void;
  materialKeterangan: string;
  setMaterialKeterangan: (val: string) => void;
  materialPotongStokGudang: boolean;
  setMaterialPotongStokGudang: (val: boolean) => void;
  materialQtyPotongGudang: number;
  setMaterialQtyPotongGudang: (val: number) => void;
  showPlateCalc: boolean;
  setShowPlateCalc: (val: boolean) => void;
  calcPanjang: string;
  setCalcPanjang: (val: string) => void;
  calcLebar: string;
  setCalcLebar: (val: string) => void;
  calcTebal: string;
  setCalcTebal: (val: string) => void;
  computedArea: PlateAreaResult | null;
  applyPlateArea: () => void;
  tableFilterType: 'ALL' | 'SPAREPART' | 'MATERIAL';
  setTableFilterType: (val: 'ALL' | 'SPAREPART' | 'MATERIAL') => void;
  filteredMaterialsTable: ClientMaterialItem[];
  materialsList: ClientMaterialItem[];
  countSparepart: number;
  countMaterial: number;
  materialLoading: boolean;
  onAddSparepart: () => void;
  onAddMaterial: () => void;
  onRemoveMaterial: (id: number, namaKomponen: string) => void;
}

export default function MaterialsTab({
  itemCategoryMode,
  setItemCategoryMode,
  sparepartsCatalogList,
  materialsCatalogList,
  selectedSparepart,
  setSelectedSparepart,
  sparepartQty,
  setSparepartQty,
  sparepartKeterangan,
  setSparepartKeterangan,
  currentSparepartDetail,
  currentMaterialDetail,
  materialSourceMode,
  setMaterialSourceMode,
  selectedMaterial,
  setSelectedMaterial,
  customMaterialName,
  setCustomMaterialName,
  materialQty,
  setMaterialQty,
  materialSatuan,
  setMaterialSatuan,
  customSatuan,
  setCustomSatuan,
  materialDimensi,
  setMaterialDimensi,
  materialKeterangan,
  setMaterialKeterangan,
  materialPotongStokGudang,
  setMaterialPotongStokGudang,
  materialQtyPotongGudang,
  setMaterialQtyPotongGudang,
  showPlateCalc,
  setShowPlateCalc,
  calcPanjang,
  setCalcPanjang,
  calcLebar,
  setCalcLebar,
  calcTebal,
  setCalcTebal,
  computedArea,
  applyPlateArea,
  tableFilterType,
  setTableFilterType,
  filteredMaterialsTable,
  materialsList,
  countSparepart,
  countMaterial,
  materialLoading,
  onAddSparepart,
  onAddMaterial,
  onRemoveMaterial,
}: MaterialsTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Pemisah Mode: Sparepart vs Material Fabrikasi */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setItemCategoryMode('SPAREPART')}
          className={`h-10 px-4 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            itemCategoryMode === 'SPAREPART'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>1. Input Suku Cadang (Sparepart)</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-xs font-mono ${
              itemCategoryMode === 'SPAREPART' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {countSparepart}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setItemCategoryMode('MATERIAL')}
          className={`h-10 px-4 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
            itemCategoryMode === 'MATERIAL'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>2. Input Material & Plat (Fabrikasi)</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-xs font-mono ${
              itemCategoryMode === 'MATERIAL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {countMaterial}
          </span>
        </button>
      </div>

      {/* Form Input Sparepart */}
      {itemCategoryMode === 'SPAREPART' && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Ambil Suku Cadang Gudang (Potong Stok Otomatis)</span>
            </span>
            <span className="text-xs text-blue-700 font-medium">
              Tersedia {sparepartsCatalogList.length} jenis sparepart di gudang
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Pilih Suku Cadang (Sparepart) *
              </label>
              <select
                value={selectedSparepart}
                onChange={(e) => setSelectedSparepart(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-600 font-medium cursor-pointer"
              >
                <option value="">Pilih Sparepart...</option>
                {sparepartsCatalogList.map((s, idx) => (
                  <option key={s.namaKomponen ? `${s.namaKomponen}-${idx}` : `sparepart-${idx}`} value={s.namaKomponen}>
                    {s.namaKomponen} (Sisa: {s.stokGudang} {s.satuan}) [{s.kategori}]
                  </option>
                ))}
              </select>
              {currentSparepartDetail && (
                <span className="text-xs text-slate-500 mt-1 block">
                  Lokasi: <strong>{currentSparepartDetail.lokasi || '-'}</strong> • Sisa Stok: <strong>{currentSparepartDetail.stokGudang} {currentSparepartDetail.satuan}</strong>
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jumlah (Qty) *
              </label>
              <input
                type="number"
                min={1}
                max={currentSparepartDetail ? currentSparepartDetail.stokGudang : 1000}
                value={sparepartQty}
                onChange={(e) => setSparepartQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
              <span className="text-xs text-slate-400 mt-0.5 block">
                Satuan: {currentSparepartDetail?.satuan || 'Pcs'}
              </span>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Posisi Pasang / Keterangan
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mis: Penggantian roda kanan belakang"
                  value={sparepartKeterangan}
                  onChange={(e) => setSparepartKeterangan(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={onAddSparepart}
                  disabled={materialLoading || !selectedSparepart}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{materialLoading ? '...' : 'Gunakan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Input Material & Plat */}
      {itemCategoryMode === 'MATERIAL' && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Pemakaian Material & Plat (Satuan Fleksibel: Luas / Panjang / Berat)</span>
            </span>

            {/* Source Selector: Katalog vs Bebas */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setMaterialSourceMode('CATALOG')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  materialSourceMode === 'CATALOG'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Katalog Material
              </button>
              <button
                type="button"
                onClick={() => setMaterialSourceMode('CUSTOM')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  materialSourceMode === 'CUSTOM'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ketik Material Bebas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Material Picker / Input */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {materialSourceMode === 'CATALOG' ? 'Pilih Material Gudang *' : 'Nama Material Fabrikasi *'}
              </label>
              {materialSourceMode === 'CATALOG' ? (
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-600 font-medium cursor-pointer"
                >
                  <option value="">Pilih Material Fabrikasi...</option>
                  {materialsCatalogList.map((s, idx) => (
                    <option key={s.namaKomponen ? `${s.namaKomponen}-${idx}` : `material-${idx}`} value={s.namaKomponen}>
                      {s.namaKomponen} (Stok: {s.stokGudang} {s.satuan}) [{s.kategori}]
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Mis: Plat Besi SPHC 3.2mm / Besi Siku 40x40"
                  value={customMaterialName}
                  onChange={(e) => setCustomMaterialName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                />
              )}
              {currentMaterialDetail && materialSourceMode === 'CATALOG' && (
                <span className="text-xs text-slate-500 mt-1 block">
                  Lokasi: <strong>{currentMaterialDetail.lokasi || '-'}</strong> • Stok Fisik: <strong>{currentMaterialDetail.stokGudang} {currentMaterialDetail.satuan}</strong>
                </span>
              )}
            </div>

            {/* Qty & Flexible Unit */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kuantitas & Satuan Penggunaan *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Mis: 1500 / 0.5"
                  value={materialQty}
                  onChange={(e) => setMaterialQty(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
                <select
                  value={materialSatuan}
                  onChange={(e) => setMaterialSatuan(e.target.value)}
                  className="w-full h-10 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium cursor-pointer outline-none focus:ring-1 focus:ring-amber-600"
                >
                  <optgroup label="Luas (Plat & Lembaran)">
                    <option value="cm²">cm² (Sentimeter²)</option>
                    <option value="m²">m² (Meter²)</option>
                    <option value="mm²">mm² (Milimeter²)</option>
                    <option value="Lembar">Lembar</option>
                    <option value="Potong">Potong</option>
                  </optgroup>
                  <optgroup label="Panjang (Besi & Pipa)">
                    <option value="Meter">Meter</option>
                    <option value="cm">cm (Centimeter)</option>
                    <option value="mm">mm (Milimeter)</option>
                    <option value="Batang">Batang</option>
                  </optgroup>
                  <optgroup label="Berat & Volume (Las & Cat)">
                    <option value="Kg">Kg (Kilogram)</option>
                    <option value="Gram">Gram</option>
                    <option value="Liter">Liter</option>
                    <option value="Kaleng">Kaleng</option>
                  </optgroup>
                  <optgroup label="Standar">
                    <option value="Pcs">Pcs</option>
                    <option value="Unit">Unit</option>
                    <option value="custom">Ketik Bebas...</option>
                  </optgroup>
                </select>
              </div>
              {materialSatuan === 'custom' && (
                <input
                  type="text"
                  placeholder="Ketik nama satuan custom..."
                  value={customSatuan}
                  onChange={(e) => setCustomSatuan(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs mt-1.5"
                />
              )}
            </div>

            {/* Dimensi & Tombol Kalkulator */}
            <div className="sm:col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Dimensi / Ukuran
                </label>
                <button
                  type="button"
                  onClick={() => setShowPlateCalc(!showPlateCalc)}
                  className="text-amber-800 hover:text-amber-950 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3 h-3" />
                  <span>{showPlateCalc ? 'Tutup Hitung' : 'Hitung Luas'}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Mis: 50 cm x 30 cm, t: 3mm"
                value={materialDimensi}
                onChange={(e) => setMaterialDimensi(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Panel Bantuan: Kalkulator Luas Plat (P x L) */}
          {showPlateCalc && (
            <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-300 space-y-2 animate-scale-up">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kalkulator Luas Plat Fabrikasi</span>
                </span>
                <span className="text-xs text-amber-800">
                  Otomatis mengalikan Panjang × Lebar ke satuan cm²
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-amber-900 font-medium">Panjang (cm)</label>
                  <input
                    type="number"
                    placeholder="Mis: 50"
                    value={calcPanjang}
                    onChange={(e) => setCalcPanjang(e.target.value)}
                    className="w-full h-9 px-2.5 bg-white border border-amber-300 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-900 font-medium">Lebar (cm)</label>
                  <input
                    type="number"
                    placeholder="Mis: 30"
                    value={calcLebar}
                    onChange={(e) => setCalcLebar(e.target.value)}
                    className="w-full h-9 px-2.5 bg-white border border-amber-300 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-900 font-medium">Tebal (mm, opsional)</label>
                  <input
                    type="number"
                    placeholder="Mis: 3.2"
                    value={calcTebal}
                    onChange={(e) => setCalcTebal(e.target.value)}
                    className="w-full h-9 px-2.5 bg-white border border-amber-300 rounded text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={applyPlateArea}
                    disabled={!computedArea}
                    className="w-full h-9 px-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded transition cursor-pointer disabled:opacity-40"
                  >
                    Terapkan ({computedArea ? `${computedArea.cm2} cm²` : '0 cm²'})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Keterangan & Aksi */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-8">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Keterangan / Posisi Pengelasan & Pemasangan
              </label>
              <input
                type="text"
                placeholder="Mis: Tambal plat lantai Daisha kanan / bracket pengait"
                value={materialKeterangan}
                onChange={(e) => setMaterialKeterangan(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-4 flex items-end">
              <button
                type="button"
                onClick={onAddMaterial}
                disabled={materialLoading || (materialSourceMode === 'CATALOG' ? !selectedMaterial : !customMaterialName.trim())}
                className="w-full h-10 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{materialLoading ? 'Menyimpan...' : 'Gunakan Material'}</span>
              </button>
            </div>
          </div>

          {/* Checkbox Potong Stok Gudang (Jika menggunakan 1 lembar baru utuh) */}
          {materialSourceMode === 'CATALOG' && currentMaterialDetail && (
            <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-center justify-between gap-2 text-xs flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={materialPotongStokGudang}
                  onChange={(e) => setMaterialPotongStokGudang(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                />
                <span>
                  Ambil lembaran baru dari gudang (potong stok fisik: <strong>{currentMaterialDetail.namaKomponen}</strong>)
                </span>
              </label>
              {materialPotongStokGudang && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Jumlah potong:</span>
                  <input
                    type="number"
                    min={1}
                    max={currentMaterialDetail.stokGudang}
                    value={materialQtyPotongGudang}
                    onChange={(e) => setMaterialQtyPotongGudang(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-8 px-2 border border-slate-300 rounded text-xs font-bold text-center"
                  />
                  <span className="text-xs font-medium text-slate-600">{currentMaterialDetail.satuan}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabel Daftar Sparepart & Material Terpakai */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-xs text-slate-800">
              Rincian Barang Terpakai ({materialsList.length})
            </span>
          </div>

          {/* Filter Sub-tabel */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTableFilterType('ALL')}
              className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                tableFilterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({materialsList.length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilterType('SPAREPART')}
              className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                tableFilterType === 'SPAREPART' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sparepart ({countSparepart})
            </button>
            <button
              type="button"
              onClick={() => setTableFilterType('MATERIAL')}
              className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                tableFilterType === 'MATERIAL' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Material ({countMaterial})
            </button>
          </div>
        </div>

        {filteredMaterialsTable.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-medium text-xs">
            {materialsList.length === 0
              ? 'Belum ada suku cadang atau material yang digunakan. Pilih tab Sparepart atau Material di atas.'
              : `Tidak ada item dengan filter "${tableFilterType}".`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">Nama Komponen / Material</th>
                  <th className="py-2.5 px-3">Jumlah (Qty)</th>
                  <th className="py-2.5 px-3">Dimensi / Ukuran</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterialsTable.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          m.tipe === 'MATERIAL'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {m.tipe === 'MATERIAL' ? 'Material' : 'Sparepart'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.namaKomponen}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {m.qty} {m.satuan || 'Pcs'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-xs">
                      {m.dimensi || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{m.keterangan || '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveMaterial(m.id, m.namaKomponen)}
                        disabled={materialLoading}
                        className="text-rose-600 hover:text-rose-800 font-medium text-xs p-1 rounded hover:bg-rose-50 transition cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                        title="Batalkan pemakaian item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Batalkan</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
