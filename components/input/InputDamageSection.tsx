'use client';

import React from 'react';
import DamageCatalogSelector, { TindakanType } from '@/components/input/DamageCatalogSelector';
import { FormDataState } from './useInputKerusakan';

interface InputDamageSectionProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  isDiagnosaBengkel?: boolean;
  setIsDiagnosaBengkel?: (val: boolean) => void;
  catatanGejala?: string;
  setCatatanGejala?: (val: string) => void;
  katalogKerusakan: Record<string, string[]>;
  selectedKerusakan: string[];
  tindakanMap: Record<string, TindakanType>;
  qtyMap: Record<string, number>;
  customKerusakanList: string[];
  customTindakanMap: Record<string, TindakanType>;
  customQtyMap: Record<string, number>;
  toggleKerusakan: (komponen: string, detail: string) => void;
  setItemTindakan: (key: string, tindakan: TindakanType) => void;
  setItemQty: (key: string, qty: number) => void;
  handleAddCustom: (text: string) => void;
  handleRemoveCustom: (text: string) => void;
  setCustomTindakan: (text: string, tindakan: TindakanType) => void;
  setCustomItemQty: (text: string, qty: number) => void;
}

export default function InputDamageSection({
  formData,
  setFormData,
  katalogKerusakan,
  selectedKerusakan,
  tindakanMap,
  qtyMap,
  customKerusakanList,
  customTindakanMap,
  customQtyMap,
  toggleKerusakan,
  setItemTindakan,
  setItemQty,
  handleAddCustom,
  handleRemoveCustom,
  setCustomTindakan,
  setCustomItemQty,
}: InputDamageSectionProps) {
  return (
    <div className="space-y-4">
      {/* Katalog Titik Kerusakan Unit Daisha - Langsung Tampil Bersih & Fokus */}
      <DamageCatalogSelector
        jenisDaisha={formData.jenisDaisha}
        katalogKerusakan={katalogKerusakan}
        selectedKerusakan={selectedKerusakan}
        tindakanMap={tindakanMap}
        qtyMap={qtyMap}
        customKerusakanList={customKerusakanList}
        customTindakanMap={customTindakanMap}
        customQtyMap={customQtyMap}
        onToggleKerusakan={toggleKerusakan}
        onSetTindakan={setItemTindakan}
        onSetQty={setItemQty}
        onAddCustom={handleAddCustom}
        onRemoveCustom={handleRemoveCustom}
        onSetCustomTindakan={setCustomTindakan}
        onSetCustomQty={setCustomItemQty}
        catatanTambahan={formData.catatanTambahan}
        onCatatanChange={(val) => setFormData((prev) => ({ ...prev, catatanTambahan: val }))}
      />
    </div>
  );
}
