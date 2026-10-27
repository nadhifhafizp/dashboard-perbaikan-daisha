'use client';

import React from 'react';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { EditCatalogItemState } from '../CatalogModals';
import DaishaAccordionCard from './DaishaAccordionCard';

interface SeksiGroupSectionProps {
  group: {
    seksi: string;
    daishas: DaishaTreeItem[];
    totalKomponen: number;
    totalGejala: number;
  };
  isSeksiCollapsed: boolean;
  onToggleCollapseSeksi: (seksi: string) => void;
  expandedDaishaIds: number[];
  onToggleAccordion: (id: number) => void;
  onOpenAddComponent: (daisha: DaishaTreeItem) => void;
  onOpenAddVariant: (daisha: DaishaTreeItem) => void;
  onOpenAddSymptom: (target: {
    componentId: number;
    componentName: string;
    daishaName: string;
  }) => void;
  onEditItem: (state: EditCatalogItemState) => void;
  onDeleteItem: (item: {
    type: 'daisha' | 'component' | 'symptom' | 'variant';
    id: number;
    title: string;
    description: string;
  }) => void;
}

export default function SeksiGroupSection({
  group,
  isSeksiCollapsed,
  onToggleCollapseSeksi,
  expandedDaishaIds,
  onToggleAccordion,
  onOpenAddComponent,
  onOpenAddVariant,
  onOpenAddSymptom,
  onEditItem,
  onDeleteItem,
}: SeksiGroupSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Header Seksi */}
      <div
        onClick={() => onToggleCollapseSeksi(group.seksi)}
        className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition select-none"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Seksi {group.seksi}
          </h3>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold tabular-nums">
            {group.daishas.length} Model Daisha
          </span>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">
            &bull; {group.totalKomponen} total komponen &bull; {group.totalGejala}{' '}
            gejala kerusakan
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            {isSeksiCollapsed ? 'Klik untuk membuka' : 'Klik untuk menutup'}
          </span>
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded"
            aria-label="Buka/tutup seksi"
          >
            {isSeksiCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Daftar Jenis Daisha di Seksi Ini */}
      {!isSeksiCollapsed && (
        <div className="divide-y divide-slate-100">
          {group.daishas.map((daisha) => (
            <DaishaAccordionCard
              key={daisha.id}
              daisha={daisha}
              isExpanded={expandedDaishaIds.includes(daisha.id)}
              onToggleAccordion={onToggleAccordion}
              onOpenAddComponent={onOpenAddComponent}
              onOpenAddVariant={onOpenAddVariant}
              onOpenAddSymptom={onOpenAddSymptom}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
