'use client';

import React, { useState, useMemo } from 'react';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useDaishaCatalog, DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import {
  FolderPlus,
  Plus,
  Search,
  Wrench,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Building2,
  Boxes,
  Tag,
  RefreshCw,
} from 'lucide-react';
import {
  AddDaishaModal,
  AddComponentModal,
  AddSymptomModal,
  EditCatalogItemModal,
} from './CatalogModals';

export default function CatalogManager() {
  const { tree, seksiList, loading, refreshCatalog } = useDaishaCatalog();

  const [search, setSearch] = useState('');
  const [selectedSeksi, setSelectedSeksi] = useState('all');

  // Expanded Daisha rows
  const [expandedDaishaIds, setExpandedDaishaIds] = useState<number[]>([]);

  // Collapsed Seksi sections
  const [collapsedSeksi, setCollapsedSeksi] = useState<string[]>([]);

  const toggleCollapseSeksi = (seksi: string) => {
    setCollapsedSeksi((prev) =>
      prev.includes(seksi) ? prev.filter((s) => s !== seksi) : [...prev, seksi]
    );
  };

  const collapseAllSeksi = () => {
    setCollapsedSeksi(groupedBySeksi.map((g) => g.seksi));
  };

  const expandAllSeksi = () => {
    setCollapsedSeksi([]);
  };

  // Modals state
  const [isAddDaishaModalOpen, setIsAddDaishaModalOpen] = useState(false);
  const [addComponentTarget, setAddComponentTarget] = useState<DaishaTreeItem | null>(null);
  const [addSymptomTarget, setAddSymptomTarget] = useState<{
    componentId: number;
    componentName: string;
    daishaName: string;
  } | null>(null);

  // Edit states
  const [editItem, setEditItem] = useState<{
    type: 'daisha' | 'component' | 'symptom';
    id: number;
    name: string;
    seksi?: string;
  } | null>(null);

  // Delete state
  const [deleteItem, setDeleteItem] = useState<{
    type: 'daisha' | 'component' | 'symptom';
    id: number;
    title: string;
    description: string;
  } | null>(null);

  // Form inputs
  const [newDaishaForm, setNewDaishaForm] = useState({ name: '', seksi: 'Building' });
  const [newComponentName, setNewComponentName] = useState('');
  const [newSymptomText, setNewSymptomText] = useState('');

  // Feedback popup
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showFeedback = (type: FeedbackType, title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  const toggleAccordion = (id: number) => {
    setExpandedDaishaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filtered tree
  const filteredTree = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tree.filter((d) => {
      if (selectedSeksi !== 'all' && d.seksi.toLowerCase() !== selectedSeksi.toLowerCase()) {
        return false;
      }
      if (!q) return true;

      const matchDaisha = d.name.toLowerCase().includes(q) || d.seksi.toLowerCase().includes(q);
      const matchComponent = d.components.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symptoms.some((s) => s.description.toLowerCase().includes(q))
      );
      return matchDaisha || matchComponent;
    });
  }, [tree, selectedSeksi, search]);

  // Group data per Seksi
  const groupedBySeksi = useMemo(() => {
    const groups: Record<string, DaishaTreeItem[]> = {};

    filteredTree.forEach((daisha) => {
      const s = daisha.seksi || 'All seksi';
      if (!groups[s]) {
        groups[s] = [];
      }
      groups[s].push(daisha);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a.toLowerCase() === 'all seksi') return -1;
      if (b.toLowerCase() === 'all seksi') return 1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((seksiName) => {
      const daishas = groups[seksiName];
      const totalKomponen = daishas.reduce((acc, d) => acc + d.components.length, 0);
      const totalGejala = daishas.reduce(
        (acc, d) => acc + d.components.reduce((cAcc, c) => cAcc + c.symptoms.length, 0),
        0
      );
      return {
        seksi: seksiName,
        daishas,
        totalKomponen,
        totalGejala,
      };
    });
  }, [filteredTree]);

  // Total daisha per Seksi
  const seksiCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tree.forEach((d) => {
      const s = d.seksi || 'All seksi';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [tree]);

  // Unique Seksi list
  const uniqueSeksiList = useMemo(() => {
    const set = new Set<string>();
    seksiList.forEach((s) => {
      if (s.toLowerCase() !== 'all seksi') set.add(s);
    });
    tree.forEach((d) => {
      if (d.seksi && d.seksi.toLowerCase() !== 'all seksi') set.add(d.seksi);
    });
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ['All seksi', ...sorted];
  }, [seksiList, tree]);

  // 1. Submit Tambah Daisha Baru
  const handleAddDaishaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDaishaForm.name.trim()) return;

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_DAISHA',
          name: newDaishaForm.name.trim(),
          seksi: newDaishaForm.seksi,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Jenis Daisha Ditambahkan', data.message);
        setIsAddDaishaModalOpen(false);
        setNewDaishaForm({ name: '', seksi: 'Building' });
        await refreshCatalog();
      } else {
        showFeedback('error', 'Gagal Menambah Daisha', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // 2. Submit Tambah Komponen Baru
  const handleAddComponentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addComponentTarget || !newComponentName.trim()) return;

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_COMPONENT',
          daishaId: addComponentTarget.id,
          name: newComponentName.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Komponen Ditambahkan', data.message);
        setAddComponentTarget(null);
        setNewComponentName('');
        await refreshCatalog();
      } else {
        showFeedback('error', 'Gagal Menambah Komponen', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // 3. Submit Tambah Gejala Baru
  const handleAddSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSymptomTarget || !newSymptomText.trim()) return;

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_SYMPTOM',
          componentId: addSymptomTarget.componentId,
          description: newSymptomText.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Gejala Ditambahkan', data.message);
        setAddSymptomTarget(null);
        setNewSymptomText('');
        await refreshCatalog();
      } else {
        showFeedback('error', 'Gagal Menambah Gejala', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // 4. Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.name.trim()) return;

    try {
      const res = await fetch('/api/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:
            editItem.type === 'daisha'
              ? 'UPDATE_DAISHA'
              : editItem.type === 'component'
              ? 'UPDATE_COMPONENT'
              : 'UPDATE_SYMPTOM',
          id: editItem.id,
          name: editItem.name.trim(),
          description: editItem.name.trim(),
          seksi: editItem.seksi,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Perubahan Disimpan', data.message);
        setEditItem(null);
        await refreshCatalog();
      } else {
        showFeedback('error', 'Gagal Mengubah Data', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // 5. Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch('/api/catalog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:
            deleteItem.type === 'daisha'
              ? 'DELETE_DAISHA'
              : deleteItem.type === 'component'
              ? 'DELETE_COMPONENT'
              : 'DELETE_SYMPTOM',
          id: deleteItem.id,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Data Dihapus', data.message);
        setDeleteItem(null);
        await refreshCatalog();
      } else {
        showFeedback('error', 'Gagal Menghapus', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar & Quick Stats */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-600" />
            <span>Katalog Master Unit & Kerusakan Daisha</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem pohon relasi unit Daisha, komponen sparepart, dan rincian gejala kerusakan untuk formulir input operasional.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refreshCatalog()}
            className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Muat ulang data katalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddDaishaModalOpen(true)}
            className="h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jenis Daisha</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar & Quick Stats Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        {/* Quick Seksi Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-medium text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> Seksi:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSeksi('all')}
            className={`h-7 px-2.5 rounded-md text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedSeksi === 'all'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Semua Seksi</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${selectedSeksi === 'all' ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tree.length}
            </span>
          </button>

          {uniqueSeksiList.map((s) => {
            const count = seksiCounts[s] || 0;
            const isSelected = selectedSeksi.toLowerCase() === s.toLowerCase();
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSeksi(s)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${isSelected ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input & Collapse controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari jenis Daisha, komponen, atau rincian gejala..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={expandAllSeksi}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
            >
              Buka Semua Seksi
            </button>
            <button
              type="button"
              onClick={collapseAllSeksi}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
            >
              Tutup Semua Seksi
            </button>
          </div>
        </div>
      </div>

      {/* 3. Daftar Katalog: Flat Hierarchical List (Bebas Nested Cards) */}
      <div className="space-y-4">
        {loading && tree.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200/80 text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
            <span>Memuat katalog master Daisha dari database...</span>
          </div>
        ) : groupedBySeksi.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200/80 text-slate-400 text-xs">
            Tidak ada jenis Daisha yang sesuai dengan filter atau pencarian Anda.
          </div>
        ) : (
          groupedBySeksi.map((group) => {
            const isSeksiCollapsed = !search.trim() && collapsedSeksi.includes(group.seksi);

            return (
              <div
                key={group.seksi}
                className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden"
              >
                {/* Header Seksi */}
                <div
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 select-none cursor-pointer transition border-b ${
                    isSeksiCollapsed
                      ? 'bg-slate-50/70 border-transparent hover:bg-slate-100/60'
                      : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                  onClick={() => toggleCollapseSeksi(group.seksi)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-slate-900">
                          Seksi {group.seksi}
                        </h3>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {group.daishas.length} Jenis Unit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {group.totalKomponen} Komponen Kerusakan &bull; {group.totalGejala} Rincian Gejala
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewDaishaForm({ name: '', seksi: group.seksi });
                        setIsAddDaishaModalOpen(true);
                      }}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md border border-red-200/60 transition cursor-pointer flex items-center gap-1"
                      title={`Tambah Jenis Daisha pada Seksi ${group.seksi}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tambah Unit</span>
                    </button>
                    <span className="text-slate-400 p-1">
                      {isSeksiCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Flat List Unit Daisha di Seksi Ini */}
                {!isSeksiCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {group.daishas.map((daisha) => {
                      const isExpanded = expandedDaishaIds.includes(daisha.id);
                      const totalSymptoms = daisha.components.reduce(
                        (acc, c) => acc + c.symptoms.length,
                        0
                      );

                      return (
                        <div key={daisha.id} className="transition">
                          {/* Daisha List Row */}
                          <div
                            className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 select-none cursor-pointer transition ${
                              isExpanded ? 'bg-slate-50/80 border-b border-slate-200/70' : 'hover:bg-slate-50/60'
                            }`}
                            onClick={() => toggleAccordion(daisha.id)}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                                <FolderPlus className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-xs text-slate-900">{daisha.name}</h4>
                                  <span className="text-[11px] text-slate-500 font-normal">
                                    ({daisha.components.length} komponen, {totalSymptoms} gejala)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setAddComponentTarget(daisha)}
                                className="h-7 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 rounded-md font-medium text-[11px] transition flex items-center gap-1 cursor-pointer"
                                title="Tambah komponen kerusakan baru"
                              >
                                <Plus className="w-3 h-3" />
                                <span className="hidden sm:inline">Komponen</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditItem({
                                    type: 'daisha',
                                    id: daisha.id,
                                    name: daisha.name,
                                    seksi: daisha.seksi,
                                  })
                                }
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition"
                                title="Edit nama unit Daisha"
                                aria-label="Edit nama unit Daisha"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteItem({
                                    type: 'daisha',
                                    id: daisha.id,
                                    title: `Hapus Jenis Daisha: ${daisha.name}`,
                                    description: `Apakah Anda yakin ingin menghapus "${daisha.name}"? Semua ${daisha.components.length} komponen dan ${totalSymptoms} gejala di dalamnya akan ikut terhapus.`,
                                  })
                                }
                                className="w-7 h-7 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer transition"
                                title="Hapus unit Daisha"
                                aria-label="Hapus unit Daisha"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleAccordion(daisha.id)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                                aria-label="Buka/tutup detail"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Detail Komponen & Gejala: Inset Panel Tanpa Nested Card Berat */}
                          {isExpanded && (
                            <div className="p-3.5 sm:p-4 bg-slate-50/50 border-b border-slate-200/60 space-y-3">
                              {daisha.components.length === 0 ? (
                                <div className="text-center py-5 text-slate-400 text-xs">
                                  Belum ada komponen kerusakan pada jenis unit ini. Klik &quot;+ Komponen&quot; untuk menambahkan.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {daisha.components.map((comp) => (
                                    <div
                                      key={comp.id}
                                      className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs space-y-2"
                                    >
                                      {/* Header Komponen */}
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                                          <Wrench className="w-3.5 h-3.5 text-slate-500" />
                                          <span>{comp.name}</span>
                                        </span>

                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setAddSymptomTarget({
                                                componentId: comp.id,
                                                componentName: comp.name,
                                                daishaName: daisha.name,
                                              })
                                            }
                                            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 px-1.5 py-0.5 bg-emerald-50 rounded cursor-pointer transition"
                                            title="Tambah gejala kerusakan pada komponen ini"
                                          >
                                            + Gejala
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setEditItem({
                                                type: 'component',
                                                id: comp.id,
                                                name: comp.name,
                                              })
                                            }
                                            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                                            title="Edit nama komponen"
                                            aria-label="Edit nama komponen"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDeleteItem({
                                                type: 'component',
                                                id: comp.id,
                                                title: `Hapus Komponen: ${comp.name}`,
                                                description: `Apakah Anda yakin ingin menghapus komponen "${comp.name}" dari unit ${daisha.name}? Semua ${comp.symptoms.length} gejala di dalamnya akan ikut terhapus.`,
                                              })
                                            }
                                            className="p-1 text-red-500 hover:text-red-700 rounded cursor-pointer"
                                            title="Hapus komponen ini"
                                            aria-label="Hapus komponen ini"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Daftar Gejala */}
                                      <div className="space-y-1">
                                        {comp.symptoms.length === 0 ? (
                                          <div className="text-[11px] text-slate-400 italic py-1">
                                            Belum ada rincian gejala kerusakan.
                                          </div>
                                        ) : (
                                          comp.symptoms.map((sym) => (
                                            <div
                                              key={sym.id}
                                              className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100 text-xs text-slate-700 group hover:bg-slate-100/70 transition"
                                            >
                                              <span className="text-[11px] leading-tight">{sym.description}</span>
                                              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 shrink-0 ml-2">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setEditItem({
                                                      type: 'symptom',
                                                      id: sym.id,
                                                      name: sym.description,
                                                    })
                                                  }
                                                  className="p-0.5 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                                                  title="Edit deskripsi gejala"
                                                  aria-label="Edit deskripsi gejala"
                                                >
                                                  <Pencil className="w-2.5 h-2.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setDeleteItem({
                                                      type: 'symptom',
                                                      id: sym.id,
                                                      title: `Hapus Gejala Kerusakan`,
                                                      description: `Hapus gejala "${sym.description}" dari komponen ${comp.name}?`,
                                                    })
                                                  }
                                                  className="p-0.5 text-red-400 hover:text-red-700 rounded cursor-pointer"
                                                  title="Hapus gejala"
                                                  aria-label="Hapus gejala"
                                                >
                                                  <Trash2 className="w-2.5 h-2.5" />
                                                </button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
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

      {/* 4. Modals (Terisolasi di CatalogModals.tsx) */}
      <AddDaishaModal
        isOpen={isAddDaishaModalOpen}
        onClose={() => setIsAddDaishaModalOpen(false)}
        form={newDaishaForm}
        setForm={setNewDaishaForm}
        onSubmit={handleAddDaishaSubmit}
        seksiList={uniqueSeksiList}
      />

      <AddComponentModal
        target={addComponentTarget}
        onClose={() => setAddComponentTarget(null)}
        componentName={newComponentName}
        setComponentName={setNewComponentName}
        onSubmit={handleAddComponentSubmit}
      />

      <AddSymptomModal
        target={addSymptomTarget}
        onClose={() => setAddSymptomTarget(null)}
        symptomText={newSymptomText}
        setSymptomText={setNewSymptomText}
        onSubmit={handleAddSymptomSubmit}
      />

      <EditCatalogItemModal
        item={editItem}
        onClose={() => setEditItem(null)}
        setItem={setEditItem}
        onSubmit={handleEditSubmit}
        seksiList={uniqueSeksiList}
      />

      {/* 5. Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={!!deleteItem}
        title={deleteItem?.title || ''}
        message={deleteItem?.description || ''}
        confirmText="Hapus Permanen"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteItem(null)}
      />

      {/* 6. Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
