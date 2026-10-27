'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Check,
  Plus,
  ChevronDown,
  ChevronRight,
  Wrench,
  Package,
  Layers,
  X,
} from 'lucide-react';
import { useDaishaCatalog } from '@/hooks/useDaishaCatalog';

export interface DamageItemState {
  komponen: string;
  gejala: string;
  tindakan: 'Repair' | 'Ganti';
  qty: number;
}

interface DamageCrosscheckSectionProps {
  namaDaisha: string;
  items: DamageItemState[];
  onToggleItem: (komponen: string, gejala: string, tindakan: 'Repair' | 'Ganti') => void;
  onAddCustomItem: (komponen: string, gejala: string, tindakan: 'Repair' | 'Ganti', qty: number) => void;
}

export default function DamageCrosscheckSection({
  namaDaisha,
  items,
  onToggleItem,
  onAddCustomItem,
}: DamageCrosscheckSectionProps) {
  const { catalog, loading } = useDaishaCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customKomponen, setCustomKomponen] = useState('');
  const [customGejala, setCustomGejala] = useState('');
  const [customTindakan, setCustomTindakan] = useState<'Repair' | 'Ganti'>('Ganti');
  const [customQty, setCustomQty] = useState(1);

  // Ambil jenis kerusakan Daisha dari katalog (case-insensitive fallback)
  const catalogEntry = useMemo(() => {
    if (!namaDaisha) return null;
    if (catalog[namaDaisha]) return catalog[namaDaisha];
    const match = Object.entries(catalog).find(
      ([key]) => key.trim().toLowerCase() === namaDaisha.trim().toLowerCase()
    );
    return match ? match[1] : null;
  }, [catalog, namaDaisha]);

  const jenisKerusakan = useMemo(() => {
    return catalogEntry?.jenisKerusakan || {};
  }, [catalogEntry]);

  // Set komponen & gejala yang sudah tercatat di tiket
  const activeKeysMap = useMemo(() => {
    const map = new Map<string, DamageItemState>();
    items.forEach((it) => {
      const k = `${it.komponen.trim().toLowerCase()}:::${it.gejala.trim().toLowerCase()}`;
      map.set(k, it);
    });
    return map;
  }, [items]);

  // Filter komponen & gejala sesuai kata kunci pencarian
  const filteredKomponenList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result: Array<{
      komponen: string;
      symptoms: string[];
      selectedCount: number;
    }> = [];

    Object.entries(jenisKerusakan).forEach(([compName, symptoms]) => {
      const matchComp = !q || compName.toLowerCase().includes(q);
      const filteredSymptoms = symptoms.filter((sym) => {
        if (!q) return true;
        return matchComp || sym.toLowerCase().includes(q);
      });

      if (filteredSymptoms.length > 0) {
        const selectedCount = symptoms.filter((sym) => {
          const k = `${compName.trim().toLowerCase()}:::${sym.trim().toLowerCase()}`;
          return activeKeysMap.has(k);
        }).length;

        result.push({
          komponen: compName,
          symptoms: filteredSymptoms,
          selectedCount,
        });
      }
    });

    return result;
  }, [jenisKerusakan, searchQuery, activeKeysMap]);

  const toggleComponentAccordion = (comp: string) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [comp]: prev[comp] === undefined ? false : !prev[comp],
    }));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKomponen.trim()) return;
    onAddCustomItem(
      customKomponen.trim(),
      customGejala.trim() || customKomponen.trim(),
      customTindakan,
      Math.max(1, customQty)
    );
    setCustomKomponen('');
    setCustomGejala('');
    setCustomTindakan('Ganti');
    setCustomQty(1);
    setShowCustomInput(false);
  };

  const totalCatalogSymptoms = useMemo(() => {
    return Object.values(jenisKerusakan).reduce((acc, list) => acc + list.length, 0);
  }, [jenisKerusakan]);

  const totalSelectedCatalogSymptoms = useMemo(() => {
    let count = 0;
    Object.entries(jenisKerusakan).forEach(([comp, syms]) => {
      syms.forEach((sym) => {
        const k = `${comp.trim().toLowerCase()}:::${sym.trim().toLowerCase()}`;
        if (activeKeysMap.has(k)) count++;
      });
    });
    return count;
  }, [jenisKerusakan, activeKeysMap]);

  return (
    <div className="border border-slate-200/90 rounded-xl bg-slate-50/60 overflow-hidden">
      {/* Header Crosscheck */}
      <div className="p-3 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <span>Crosscheck Kerusakan Daisha ({namaDaisha})</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {totalSelectedCatalogSymptoms} / {totalCatalogSymptoms} Part Terpilih
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Periksa kondisi fisik unit di bengkel. Klik item untuk menambah / membatalkan tindakan.
            </p>
          </div>
        </div>

        {/* Tombol Input Part Custom */}
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-xs font-medium text-slate-600 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 hover:border-red-300 bg-white transition cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>{showCustomInput ? 'Tutup Input Manual' : 'Input Part di Luar Katalog'}</span>
        </button>
      </div>

      {/* Form Input Manual / Custom Part jika tidak ada di katalog */}
      {showCustomInput && (
        <div className="p-3 bg-amber-50/70 border-b border-amber-200/80 space-y-2">
          <div className="font-semibold text-amber-900 text-xs flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-700" />
            <span>Tambah Part / Kerusakan Custom (Di Luar Master Katalog):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nama Komponen (contoh: Plat Pengunci, Baut As, Tiang)"
              value={customKomponen}
              onChange={(e) => setCustomKomponen(e.target.value)}
              className="h-9 px-3 bg-white border border-amber-300 rounded-lg text-xs outline-none focus:border-amber-600 text-slate-900"
            />
            <input
              type="text"
              placeholder="Gejala / Kerusakan (contoh: Patah, Bengkok, Miring)"
              value={customGejala}
              onChange={(e) => setCustomGejala(e.target.value)}
              className="h-9 px-3 bg-white border border-amber-300 rounded-lg text-xs outline-none focus:border-amber-600 text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-xs">Tindakan:</span>
              <button
                type="button"
                onClick={() => setCustomTindakan('Ganti')}
                className={`h-7 px-2.5 rounded-md text-xs font-semibold cursor-pointer ${
                  customTindakan === 'Ganti' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Ganti Baru
              </button>
              <button
                type="button"
                onClick={() => setCustomTindakan('Repair')}
                className={`h-7 px-2.5 rounded-md text-xs font-semibold cursor-pointer ${
                  customTindakan === 'Repair' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Repair
              </button>
              <div className="flex items-center border border-slate-300 rounded-md bg-white ml-2">
                <span className="px-2 text-xs text-slate-500">Qty:</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={customQty}
                  onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 h-7 text-xs text-center border-l border-slate-200 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customKomponen.trim()}
              className="h-8 px-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-md text-xs font-medium transition cursor-pointer"
            >
              Tambahkan ke Tiket
            </button>
          </div>
        </div>
      )}

      {/* Filter / Search Input */}
      <div className="p-2.5 bg-slate-100/70 border-b border-slate-200/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari part atau gejala kerusakan unit ini (contoh: bearing, roller, roda, frame)..."
            className="w-full h-8 pl-8 pr-7 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Daftar Komponen & Gejala */}
      <div className="p-3 max-h-64 overflow-y-auto space-y-2.5">
        {loading ? (
          <div className="text-center py-4 text-xs text-slate-500">
            Memuat daftar katalog kerusakan...
          </div>
        ) : filteredKomponenList.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            {searchQuery
              ? `Tidak ada part yang cocok dengan pencarian "${searchQuery}".`
              : `Belum ada master kerusakan terdaftar untuk Daisha "${namaDaisha}".`}
          </div>
        ) : (
          filteredKomponenList.map((item) => {
            const isAutoExpanded = Boolean(searchQuery.trim());
            const isExpanded =
              isAutoExpanded ||
              (expandedComponents[item.komponen] !== undefined
                ? expandedComponents[item.komponen]
                : true); // Default: terbuka agar teknisi langsung melihat gejala

            return (
              <div
                key={item.komponen}
                className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                {/* Header Komponen */}
                <button
                  type="button"
                  onClick={() => toggleComponentAccordion(item.komponen)}
                  className="w-full px-3 py-2 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <span className="font-bold text-xs text-slate-800 truncate">
                      {item.komponen}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({item.symptoms.length} gejala)
                    </span>
                  </div>

                  {item.selectedCount > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{item.selectedCount} aktif</span>
                    </span>
                  )}
                </button>

                {/* List Gejala */}
                {isExpanded && (
                  <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white">
                    {item.symptoms.map((symptom) => {
                      const itemKey = `${item.komponen.trim().toLowerCase()}:::${symptom.trim().toLowerCase()}`;
                      const activeItem = activeKeysMap.get(itemKey);
                      const isSelected = Boolean(activeItem);

                      return (
                        <div
                          key={symptom}
                          className={`p-2 rounded-lg border transition flex items-start justify-between gap-2 ${
                            isSelected
                              ? activeItem?.tindakan === 'Ganti'
                                ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                                : 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onToggleItem(
                                    item.komponen,
                                    symptom,
                                    activeItem?.tindakan || 'Repair'
                                  )
                                }
                                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition cursor-pointer ${
                                  isSelected
                                    ? activeItem?.tindakan === 'Ganti'
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-amber-500 border-amber-500 text-white'
                                    : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                                title={isSelected ? 'Hapus dari daftar tiket' : 'Tambahkan ke daftar tiket'}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-3" />}
                              </button>
                              <span
                                onClick={() =>
                                  onToggleItem(
                                    item.komponen,
                                    symptom,
                                    activeItem?.tindakan || 'Repair'
                                  )
                                }
                                className={`text-xs leading-snug cursor-pointer select-none ${
                                  isSelected
                                    ? 'font-semibold text-slate-900'
                                    : 'text-slate-700'
                                }`}
                              >
                                {symptom}
                              </span>
                            </div>
                          </div>

                          {/* Action Selector: Toggle Repair vs Ganti */}
                          <div className="shrink-0 flex items-center gap-1">
                            {isSelected ? (
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    activeItem?.tindakan === 'Ganti'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-amber-500 text-white'
                                  }`}
                                >
                                  {activeItem?.tindakan === 'Ganti' ? 'Ganti' : 'Repair'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onToggleItem(
                                      item.komponen,
                                      symptom,
                                      activeItem?.tindakan === 'Ganti' ? 'Repair' : 'Ganti'
                                    )
                                  }
                                  className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer px-1"
                                  title="Ganti mode tindakan"
                                >
                                  Ubah
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onToggleItem(item.komponen, symptom, 'Repair')}
                                  className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 transition cursor-pointer"
                                  title="Tambah sebagai Repair"
                                >
                                  + Repair
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onToggleItem(item.komponen, symptom, 'Ganti')}
                                  className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition cursor-pointer"
                                  title="Tambah sebagai Ganti Baru"
                                >
                                  + Ganti
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
