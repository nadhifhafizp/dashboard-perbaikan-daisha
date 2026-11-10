'use client';

import React from 'react';
import { Building2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
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
  onOpenAddDaisha: (seksi: string) => void;
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
    daishaName?: string;
    componentName?: string;
    symptomDesc?: string;
    ukuran?: string;
  }) => void;
}

export default function SeksiGroupSection({
  group,
  isSeksiCollapsed,
  onToggleCollapseSeksi,
  expandedDaishaIds,
  onToggleAccordion,
  onOpenAddDaisha,
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
        className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-100/70 transition select-none"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Seksi {group.seksi}
          </h3>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold tabular-nums">
            {group.daishas.length} Model Daisha
          </span>
          <span className="text-xs text-slate-500 font-normal hidden md:inline">
            &bull; {group.totalKomponen} total komponen &bull; {group.totalGejala}{' '}
            gejala kerusakan
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Tombol Cepat: Tambah Daisha Baru ke Seksi Ini */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAddDaisha(group.seksi);
            }}
            className="h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title={`Registrasi Daisha Baru untuk Seksi ${group.seksi}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Daisha Baru ({group.seksi})</span>
          </button>

          <span className="text-xs text-slate-400 hidden lg:inline pl-1">
            {isSeksiCollapsed ? 'Buka' : 'Tutup'}
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
        <div>
          {group.daishas.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-white">
              <p className="text-xs text-slate-500">
                Belum ada model Daisha yang terdaftar di Seksi {group.seksi}.
              </p>
              <button
                type="button"
                onClick={() => onOpenAddDaisha(group.seksi)}
                className="h-8 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Registrasi Daisha Pertama di Seksi {group.seksi}</span>
              </button>
            </div>
          ) : (
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

              {/* Action Bar Footer Seksi */}
              <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  Ada pembuatan atau pengadaan model daisha baru di Seksi {group.seksi}?
                </span>
                <button
                  type="button"
                  onClick={() => onOpenAddDaisha(group.seksi)}
                  className="h-7.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 hover:text-red-600 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-red-600" />
                  <span>Tambah Jenis Daisha ke Seksi {group.seksi}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
