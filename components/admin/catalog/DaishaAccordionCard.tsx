'use client';

import React from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { EditCatalogItemState } from '../CatalogModals';
import DaishaVariantTable from './DaishaVariantTable';
import DaishaComponentTable from './DaishaComponentTable';

interface DaishaAccordionCardProps {
  daisha: DaishaTreeItem;
  isExpanded: boolean;
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

export default function DaishaAccordionCard({
  daisha,
  isExpanded,
  onToggleAccordion,
  onOpenAddComponent,
  onOpenAddVariant,
  onOpenAddSymptom,
  onEditItem,
  onDeleteItem,
}: DaishaAccordionCardProps) {
  const totalSymptoms = daisha.components.reduce(
    (acc, curr) => acc + curr.symptoms.length,
    0
  );

  return (
    <div>
      <div
        onClick={() => onToggleAccordion(daisha.id)}
        className="p-3.5 bg-white hover:bg-slate-50/80 transition flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {daisha.codePrefix && (
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded border border-slate-300 tabular-nums">
                  {daisha.codePrefix}
                </span>
              )}
              <h4 className="font-bold text-sm text-slate-900">{daisha.name}</h4>
              {Boolean(daisha.totalUnits && daisha.totalUnits > 0) && (
                <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                  {daisha.totalUnits?.toLocaleString('id-ID')} Unit
                </span>
              )}
              <span className="text-xs text-slate-500 font-normal">
                &bull; {daisha.components.length} komponen &bull; {totalSymptoms} gejala
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onOpenAddComponent(daisha)}
            className="h-8 sm:h-9 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
            title="Tambah komponen kerusakan baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Komponen</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onEditItem({
                type: 'daisha',
                id: daisha.id,
                name: daisha.name,
                seksi: daisha.seksi,
                codePrefix: daisha.codePrefix || '',
                totalUnits: daisha.totalUnits || 0,
              })
            }
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer transition"
            title="Edit nama, prefix, dan total unit Daisha"
            aria-label="Edit unit Daisha"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              onDeleteItem({
                type: 'daisha',
                id: daisha.id,
                title: `Hapus Jenis Daisha: ${daisha.name}`,
                description: `Apakah Anda yakin ingin menghapus "${daisha.name}"? Semua ${daisha.components.length} komponen dan ${totalSymptoms} gejala di dalamnya akan ikut terhapus.`,
              })
            }
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer transition"
            title="Hapus unit Daisha"
            aria-label="Hapus unit Daisha"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleAccordion(daisha.id)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            aria-label="Buka/tutup detail"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Flat Komponen, Gejala & Varian List */}
      {isExpanded && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4">
          <DaishaVariantTable
            daisha={daisha}
            onOpenAddVariant={onOpenAddVariant}
            onEditVariant={onEditItem}
            onDeleteVariant={onDeleteItem}
          />
          <DaishaComponentTable
            daisha={daisha}
            onOpenAddSymptom={onOpenAddSymptom}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        </div>
      )}
    </div>
  );
}
