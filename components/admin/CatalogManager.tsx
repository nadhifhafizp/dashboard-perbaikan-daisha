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
  Sparkles,
} from 'lucide-react';
import {
  AddDaishaModal,
  AddVariantModal,
  AddComponentModal,
  AddSymptomModal,
  EditCatalogItemModal,
  EditCatalogItemState,
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
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [addVariantTarget, setAddVariantTarget] = useState<DaishaTreeItem | null>(null);
  const [addComponentTarget, setAddComponentTarget] = useState<DaishaTreeItem | null>(null);
  const [addSymptomTarget, setAddSymptomTarget] = useState<{
    componentId: number;
    componentName: string;
    daishaName: string;
  } | null>(null);

  // Edit states
  const [editItem, setEditItem] = useState<EditCatalogItemState | null>(null);

  // Delete state
  const [deleteItem, setDeleteItem] = useState<{
    type: 'daisha' | 'component' | 'symptom' | 'variant';
    id: number;
    title: string;
    description: string;
  } | null>(null);

  // Form inputs
  const [newDaishaForm, setNewDaishaForm] = useState({
    name: '',
    seksi: 'Building',
    codePrefix: '',
    totalUnits: 0,
  });
  const [newVariantForm, setNewVariantForm] = useState({
    name: '',
    ukuran: '',
    susunan: '',
    tipe: '',
    codePrefix: '',
    minNumber: 1,
    maxNumber: 1,
    totalUnits: 1,
    rangeFormat: '',
  });
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

      const matchDaisha = d.name.toLowerCase().includes(q) || d.seksi.toLowerCase().includes(q) || (d.codePrefix && d.codePrefix.toLowerCase().includes(q));
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
      const daishas = groups[seksiName] || [];
      const totalKomponen = daishas.reduce(
        (acc, curr) => acc + curr.components.length,
        0
      );
      const totalGejala = daishas.reduce(
        (acc, curr) =>
          acc +
          curr.components.reduce((cAcc, c) => cAcc + c.symptoms.length, 0),
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

  // Total seluruh unit fisik troli armada
  const totalAllUnits = useMemo(() => {
    return tree.reduce((acc, curr) => acc + (curr.totalUnits || 0), 0);
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
          codePrefix: newDaishaForm.codePrefix.trim(),
          totalUnits: newDaishaForm.totalUnits,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Jenis Daisha Ditambahkan', data.message);
        setIsAddDaishaModalOpen(false);
        setNewDaishaForm({ name: '', seksi: 'Building', codePrefix: '', totalUnits: 0 });
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

  // 4. Submit Tambah Varian Baru
  const handleAddVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addVariantTarget || !newVariantForm.name.trim()) return;

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_VARIANT',
          daishaTypeId: addVariantTarget.id,
          name: newVariantForm.name.trim(),
          ukuran: newVariantForm.ukuran,
          susunan: newVariantForm.susunan,
          tipe: newVariantForm.tipe,
          codePrefix: newVariantForm.codePrefix.trim(),
          minNumber: newVariantForm.minNumber,
          maxNumber: newVariantForm.maxNumber,
          totalUnits: newVariantForm.totalUnits,
          rangeFormat: newVariantForm.rangeFormat.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Varian Ditambahkan', data.message);
        setIsAddVariantModalOpen(false);
        setAddVariantTarget(null);
        setNewVariantForm({
          name: '',
          ukuran: '',
          susunan: '',
          tipe: '',
          codePrefix: '',
          minNumber: 1,
          maxNumber: 1,
          totalUnits: 1,
          rangeFormat: '',
        });
        await refreshCatalog();
      } else {
        showFeedback('error', 'Gagal Menambah Varian', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // 5. Submit Edit
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
              : editItem.type === 'variant'
              ? 'UPDATE_VARIANT'
              : editItem.type === 'component'
              ? 'UPDATE_COMPONENT'
              : 'UPDATE_SYMPTOM',
          id: editItem.id,
          name: editItem.name.trim(),
          description: editItem.name.trim(),
          seksi: editItem.seksi,
          codePrefix: editItem.codePrefix?.trim(),
          totalUnits: editItem.totalUnits,
          ukuran: editItem.ukuran,
          susunan: editItem.susunan,
          tipe: editItem.tipe,
          minNumber: editItem.minNumber,
          maxNumber: editItem.maxNumber,
          rangeFormat: editItem.rangeFormat,
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

  // 6. Confirm Delete
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
              : deleteItem.type === 'variant'
              ? 'DELETE_VARIANT'
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
        showFeedback('error', 'Gagal Menghapus Data', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar & Quick Stats */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#E60012]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Katalog Master Unit & Kerusakan Daisha
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarki standarisasi: Seksi Asal → Unit Daisha (Kode Prefix & Populasi) → Komponen Kerusakan → Gejala.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => refreshCatalog()}
            className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded border border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Muat ulang data katalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setNewDaishaForm({ name: '', seksi: 'Building', codePrefix: '', totalUnits: 0 });
              setIsAddDaishaModalOpen(true);
            }}
            className="h-9 px-4 bg-[#E60012] hover:bg-[#CC0010] text-white font-bold text-xs rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Jenis Daisha</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Industrial KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Seksi Pabrik Terdaftar</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
              {uniqueSeksiList.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">Seksi</span>
            </p>
          </div>
          <Building2 className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Model & Varian Daisha</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
              {tree.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">Model</span>
            </p>
          </div>
          <Layers className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Populasi Armada Fisik</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
              {totalAllUnits.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">Unit Troli</span>
            </p>
          </div>
          <Boxes className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        {/* Seksi Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">
            Filter Seksi:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSeksi('all')}
            className={`h-7 px-2.5 rounded text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedSeksi === 'all'
                ? 'bg-[#E60012] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Semua Seksi</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${selectedSeksi === 'all' ? 'bg-[#B3000E] text-white' : 'bg-slate-200 text-slate-700'}`}>
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
                className={`h-7 px-2.5 rounded text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#E60012] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{s}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-[#B3000E] text-white' : 'bg-slate-200 text-slate-700'}`}>
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
              placeholder="Cari nama daisha, kode prefix, komponen, gejala..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded text-xs text-slate-900 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={expandAllSeksi}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition cursor-pointer"
            >
              Buka Semua
            </button>
            <button
              type="button"
              onClick={collapseAllSeksi}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition cursor-pointer"
            >
              Tutup Semua
            </button>
          </div>
        </div>
      </div>

      {/* 4. Structured Hierarchical List */}
      <div className="space-y-4">
        {loading && tree.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
            <span>Memuat katalog master Daisha dari database...</span>
          </div>
        ) : groupedBySeksi.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400 text-xs">
            Tidak ada jenis Daisha yang sesuai dengan filter atau pencarian Anda.
          </div>
        ) : (
          groupedBySeksi.map((group) => {
            const isSeksiCollapsed = !search.trim() && collapsedSeksi.includes(group.seksi);

            return (
              <div
                key={group.seksi}
                className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Header Seksi */}
                <div
                  className={`p-4 flex items-center justify-between gap-3 select-none cursor-pointer transition border-b ${
                    isSeksiCollapsed
                      ? 'bg-slate-50 border-transparent hover:bg-slate-100/80'
                      : 'bg-slate-100/70 border-slate-200'
                  }`}
                  onClick={() => toggleCollapseSeksi(group.seksi)}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">
                          Seksi {group.seksi}
                        </h3>
                        <span className="inline-flex items-center rounded px-2 py-0.2 text-xs font-semibold bg-slate-200 text-slate-800">
                          {group.daishas.length} Model Daisha
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        {group.totalKomponen} Komponen Kerusakan &bull; {group.totalGejala} Rincian Gejala
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewDaishaForm({ name: '', seksi: group.seksi, codePrefix: '', totalUnits: 0 });
                        setIsAddDaishaModalOpen(true);
                      }}
                      className="text-xs font-semibold text-[#E60012] hover:text-white hover:bg-[#E60012] px-2.5 py-1 rounded border border-red-300 transition cursor-pointer flex items-center gap-1"
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

                {/* List Unit Daisha di Seksi Ini */}
                {!isSeksiCollapsed && (
                  <div className="divide-y divide-slate-200">
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
                            className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 select-none cursor-pointer transition ${
                              isExpanded ? 'bg-slate-50 border-b border-slate-200' : 'hover:bg-slate-50/70'
                            }`}
                            onClick={() => toggleAccordion(daisha.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {daisha.codePrefix && (
                                    <span className="font-mono text-xs bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded border border-slate-300">
                                      {daisha.codePrefix}
                                    </span>
                                  )}
                                  <h4 className="font-bold text-sm text-slate-900">{daisha.name}</h4>
                                  {Boolean(daisha.totalUnits && daisha.totalUnits > 0) && (
                                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                      {daisha.totalUnits?.toLocaleString('id-ID')} Unit
                                    </span>
                                  )}
                                  <span className="text-xs text-slate-500 font-normal">
                                    &bull; {daisha.components.length} komponen &bull; {totalSymptoms} gejala
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setAddComponentTarget(daisha)}
                                className="h-7 px-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                                title="Tambah komponen kerusakan baru"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Komponen</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditItem({
                                    type: 'daisha',
                                    id: daisha.id,
                                    name: daisha.name,
                                    seksi: daisha.seksi,
                                    codePrefix: daisha.codePrefix || '',
                                    totalUnits: daisha.totalUnits || 0,
                                  })
                                }
                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer transition"
                                title="Edit nama, prefix, dan total unit Daisha"
                                aria-label="Edit unit Daisha"
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
                                className="w-7 h-7 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer transition"
                                title="Hapus unit Daisha"
                                aria-label="Hapus unit Daisha"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleAccordion(daisha.id)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                                aria-label="Buka/tutup detail"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Flat Komponen, Gejala & Varian List */}
                          {isExpanded && (
                            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4">
                              {/* Sub-seksi Varian & Rentang Seri Unit */}
                              <div className="bg-white rounded-lg border border-indigo-100 p-3.5 space-y-2.5 shadow-2xs">
                                <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    <span className="font-bold text-slate-900 text-xs">Varian & Rentang Seri Armada</span>
                                    <span className="text-slate-400 font-normal text-xs">
                                      ({(daisha.variants || []).length} varian terdaftar)
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddVariantTarget(daisha);
                                      setNewVariantForm({
                                        name: '',
                                        ukuran: '',
                                        susunan: '',
                                        tipe: '',
                                        codePrefix: daisha.codePrefix || '',
                                        minNumber: 1,
                                        maxNumber: 1,
                                        totalUnits: 1,
                                        rangeFormat: '',
                                      });
                                      setIsAddVariantModalOpen(true);
                                    }}
                                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer transition flex items-center gap-1"
                                    title="Tambah varian baru untuk jenis Daisha ini"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Varian Unit</span>
                                  </button>
                                </div>

                                {(daisha.variants || []).length === 0 ? (
                                  <div className="text-slate-400 text-xs italic py-1">
                                    Belum ada rincian varian terpisah. Unit ini menggunakan konfigurasi tunggal. Klik &quot;+ Varian Unit&quot; untuk memecah spesifikasi.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {(daisha.variants || []).map((v) => (
                                      <div
                                        key={v.id}
                                        className="p-2.5 rounded border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex items-start justify-between gap-2 text-xs"
                                      >
                                        <div className="space-y-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-slate-900 truncate">{v.name}</span>
                                            {v.ukuran && (
                                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                                                {v.ukuran}
                                              </span>
                                            )}
                                            {v.susunan && (
                                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                {v.susunan}
                                              </span>
                                            )}
                                            {v.tipe && (
                                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                                                {v.tipe}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                                            {v.codePrefix && (
                                              <span className="text-slate-700 font-semibold">{v.codePrefix}</span>
                                            )}
                                            <span>
                                              {v.rangeFormat || `No. ${v.minNumber} s/d ${v.maxNumber}`}
                                            </span>
                                            <span className="font-bold text-slate-800">
                                              ({v.totalUnits} unit)
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setEditItem({
                                                type: 'variant',
                                                id: v.id,
                                                name: v.name,
                                                ukuran: v.ukuran || '',
                                                susunan: v.susunan || '',
                                                tipe: v.tipe || '',
                                                codePrefix: v.codePrefix || '',
                                                minNumber: v.minNumber || 1,
                                                maxNumber: v.maxNumber || 1,
                                                totalUnits: v.totalUnits || 0,
                                                rangeFormat: v.rangeFormat || '',
                                              })
                                            }
                                            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                                            title="Edit varian"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDeleteItem({
                                                type: 'variant',
                                                id: v.id,
                                                title: `Hapus Varian: ${v.name}`,
                                                description: `Apakah Anda yakin ingin menghapus varian "${v.name}" (${v.totalUnits} unit) dari database?`,
                                              })
                                            }
                                            className="p-1 text-red-500 hover:text-red-700 rounded cursor-pointer"
                                            title="Hapus varian"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {daisha.components.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 text-xs">
                                  Belum ada komponen kerusakan pada jenis unit ini. Klik &quot;+ Komponen&quot; untuk menambahkan.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {daisha.components.map((comp) => (
                                    <div
                                      key={comp.id}
                                      className="bg-white rounded border border-slate-200 p-3 text-xs"
                                    >
                                      {/* Header Komponen */}
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                          <Wrench className="w-3.5 h-3.5 text-slate-600" />
                                          <span className="font-bold text-slate-900">{comp.name}</span>
                                          <span className="text-slate-400 font-normal">
                                            ({comp.symptoms.length} gejala)
                                          </span>
                                        </div>

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
                                            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer transition"
                                            title="Tambah gejala kerusakan pada komponen ini"
                                          >
                                            + Tambah Gejala
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
                                            <Pencil className="w-3.5 h-3.5" />
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
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Daftar Gejala */}
                                      <div className="pt-2">
                                        {comp.symptoms.length === 0 ? (
                                          <div className="text-xs text-slate-400 italic">
                                            Belum ada rincian gejala kerusakan.
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                            {comp.symptoms.map((sym) => (
                                              <div
                                                key={sym.id}
                                                className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 hover:bg-slate-100 transition"
                                              >
                                                <span className="truncate pr-2 font-medium">{sym.description}</span>
                                                <div className="flex items-center gap-1 shrink-0">
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
                                                    title="Edit gejala"
                                                    aria-label="Edit deskripsi gejala"
                                                  >
                                                    <Pencil className="w-3 h-3" />
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
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
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

      <AddVariantModal
        isOpen={isAddVariantModalOpen}
        onClose={() => setIsAddVariantModalOpen(false)}
        daishaTarget={addVariantTarget}
        form={newVariantForm}
        setForm={setNewVariantForm}
        onSubmit={handleAddVariantSubmit}
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
