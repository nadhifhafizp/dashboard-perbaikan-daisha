'use client';

import React, { useState, useMemo } from 'react';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useDaishaCatalog, DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Globe,
  Cog,
  Building2,
  Flame,
  Scissors,
  Factory,
  Film,
  Boxes,
} from 'lucide-react';


export function getSeksiIcon(seksi: string): string {
  const lower = seksi.toLowerCase();
  if (lower.includes('all') || lower.includes('semua')) return '🌐';
  if (lower.includes('banbury') || lower.includes('bunbury')) return '🌋';
  if (lower.includes('bead')) return '⚙️';
  if (lower.includes('building')) return '🏗️';
  if (lower.includes('cutt') || lower.includes('cal')) return '✂️';
  if (lower.includes('extrud')) return '🏭';
  if (lower.includes('polyfilm') || lower.includes('film')) return '📜';
  if (lower.includes('curing')) return '♨️';
  if (lower.includes('qc') || lower.includes('inspect')) return '🔍';
  return '🏢';
}

export const SEKSI_THEMES: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    emoji: string;
    border: string;
    bg: string;
    hoverBg: string;
    textTitle: string;
    textNumber: string;
    textSubtitle: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  all: {
    icon: Boxes,
    emoji: '📋',
    border: 'border-slate-200/90',
    bg: 'bg-white',
    hoverBg: 'hover:bg-slate-50/80',
    textTitle: 'text-slate-500',
    textNumber: 'text-slate-900',
    textSubtitle: 'text-slate-500',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  'all seksi': {
    icon: Globe,
    emoji: '🌐',
    border: 'border-indigo-200/80',
    bg: 'bg-indigo-50/20',
    hoverBg: 'hover:bg-indigo-50/40',
    textTitle: 'text-indigo-700',
    textNumber: 'text-indigo-600',
    textSubtitle: 'text-indigo-600/80',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
  },
  bead: {
    icon: Cog,
    emoji: '⚙️',
    border: 'border-amber-200/80',
    bg: 'bg-amber-50/20',
    hoverBg: 'hover:bg-amber-50/40',
    textTitle: 'text-amber-700',
    textNumber: 'text-amber-600',
    textSubtitle: 'text-amber-600/80',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
  building: {
    icon: Building2,
    emoji: '🏗️',
    border: 'border-blue-200/80',
    bg: 'bg-blue-50/20',
    hoverBg: 'hover:bg-blue-50/40',
    textTitle: 'text-blue-700',
    textNumber: 'text-blue-600',
    textSubtitle: 'text-blue-600/80',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
  },
  bunbury: {
    icon: Flame,
    emoji: '🌋',
    border: 'border-rose-200/80',
    bg: 'bg-rose-50/20',
    hoverBg: 'hover:bg-rose-50/40',
    textTitle: 'text-rose-700',
    textNumber: 'text-rose-600',
    textSubtitle: 'text-rose-600/80',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
  },
  banbury: {
    icon: Flame,
    emoji: '🌋',
    border: 'border-rose-200/80',
    bg: 'bg-rose-50/20',
    hoverBg: 'hover:bg-rose-50/40',
    textTitle: 'text-rose-700',
    textNumber: 'text-rose-600',
    textSubtitle: 'text-rose-600/80',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
  },
  'cutt/cal': {
    icon: Scissors,
    emoji: '✂️',
    border: 'border-emerald-200/80',
    bg: 'bg-emerald-50/20',
    hoverBg: 'hover:bg-emerald-50/40',
    textTitle: 'text-emerald-700',
    textNumber: 'text-emerald-600',
    textSubtitle: 'text-emerald-600/80',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  extruding: {
    icon: Factory,
    emoji: '🏭',
    border: 'border-purple-200/80',
    bg: 'bg-purple-50/20',
    hoverBg: 'hover:bg-purple-50/40',
    textTitle: 'text-purple-700',
    textNumber: 'text-purple-600',
    textSubtitle: 'text-purple-600/80',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
  },
  polyfilm: {
    icon: Film,
    emoji: '📜',
    border: 'border-cyan-200/80',
    bg: 'bg-cyan-50/20',
    hoverBg: 'hover:bg-cyan-50/40',
    textTitle: 'text-cyan-700',
    textNumber: 'text-cyan-600',
    textSubtitle: 'text-cyan-600/80',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-700',
  },
};

export function getSeksiTheme(seksi: string) {
  const key = seksi.toLowerCase().trim();
  if (SEKSI_THEMES[key]) return SEKSI_THEMES[key];
  for (const [k, val] of Object.entries(SEKSI_THEMES)) {
    if (key.includes(k)) return val;
  }
  return {
    icon: Layers,
    emoji: '🏢',
    border: 'border-slate-200/90',
    bg: 'bg-slate-50/20',
    hoverBg: 'hover:bg-slate-100/50',
    textTitle: 'text-slate-500',
    textNumber: 'text-slate-900',
    textSubtitle: 'text-slate-500',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  };
}

export default function CatalogManager() {
  const { tree, seksiList, loading, refreshCatalog } = useDaishaCatalog();

  const [search, setSearch] = useState('');
  const [selectedSeksi, setSelectedSeksi] = useState('all');

  // Expanded Daisha Accordions
  const [expandedDaishaIds, setExpandedDaishaIds] = useState<number[]>([]);

  // Collapsed Seksi Cards
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
  const [addSymptomTarget, setAddSymptomTarget] = useState<{ componentId: number; componentName: string; daishaName: string } | null>(null);

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

      // Cek apakah nama daisha, komponen, atau gejala cocok dengan query
      const matchDaisha = d.name.toLowerCase().includes(q) || d.seksi.toLowerCase().includes(q);
      const matchComponent = d.components.some((c) =>
        c.name.toLowerCase().includes(q) ||
        c.symptoms.some((s) => s.description.toLowerCase().includes(q))
      );
      return matchDaisha || matchComponent;
    });
  }, [tree, selectedSeksi, search]);

  // Kelompokkan data per Seksi menjadi struktur Card
  const groupedBySeksi = useMemo(() => {
    const groups: Record<string, DaishaTreeItem[]> = {};

    filteredTree.forEach((daisha) => {
      const s = daisha.seksi || 'All seksi';
      if (!groups[s]) {
        groups[s] = [];
      }
      groups[s].push(daisha);
    });

    // Urutan Seksi: 'All seksi' pertama jika ada, selebihnya urut abjad
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

  // Hitung jumlah total Daisha per Seksi di seluruh database
  const seksiCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tree.forEach((d) => {
      const s = d.seksi || 'All seksi';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [tree]);

  // Daftar unik Seksi untuk Quick Filter
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

  // 1. Tambah Daisha Baru
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

  // 2. Tambah Komponen Baru
  const handleAddComponentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addComponentTarget || !newComponentName.trim()) return;

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_COMPONENT',
          daishaTypeId: addComponentTarget.id,
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

  // 3. Tambah Gejala Baru
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

  // 4. Edit Item
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.name.trim()) return;

    try {
      let action = 'EDIT_DAISHA';
      let payload: Record<string, unknown> = { id: editItem.id };

      if (editItem.type === 'daisha') {
        action = 'EDIT_DAISHA';
        payload = { ...payload, name: editItem.name, seksi: editItem.seksi };
      } else if (editItem.type === 'component') {
        action = 'EDIT_COMPONENT';
        payload = { ...payload, name: editItem.name };
      } else if (editItem.type === 'symptom') {
        action = 'EDIT_SYMPTOM';
        payload = { ...payload, description: editItem.name };
      }

      const res = await fetch('/api/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Berhasil Diperbarui', data.message);
        setEditItem(null);
        await refreshCatalog();
      } else {
        showFeedback('error', 'Gagal Memperbarui', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // 5. Delete Item
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    try {
      const res = await fetch(`/api/catalog?type=${deleteItem.type}&id=${deleteItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Berhasil Dihapus', data.message);
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
    <div className="space-y-6">
      {/* Header Katalog Auto-Pilot */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-600" />
            <span>Katalog Daisha & Kerusakan (Auto-Pilot)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tambah jenis Daisha baru, komponen, serta detail kerusakan langsung dari sini. Form input teknisi akan otomatis sinkron tanpa perlu coding ulang.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddDaishaModalOpen(true)}
          className="gap-2 shadow-xs w-full sm:w-auto shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jenis Daisha Baru</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari jenis Daisha, komponen, atau gejala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Seksi:</span>
          <select
            value={selectedSeksi}
            onChange={(e) => setSelectedSeksi(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-800 cursor-pointer"
          >
            <option value="all">Semua Seksi ({tree.length} Daisha)</option>
            {uniqueSeksiList
              .filter((s) => s.toLowerCase() !== 'all seksi')
              .map((s) => (
                <option key={s} value={s}>
                  {s} ({seksiCounts[s] || 0} Daisha)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Kotak-Kotak Kartu Seksi (Persis Desain KPI Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <span>🏷️</span> Pilih Seksi Plant Daisha
          </span>
          {groupedBySeksi.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={expandAllSeksi}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-bold transition cursor-pointer shadow-2xs text-[11px]"
              >
                Perluas Semua
              </button>
              <button
                type="button"
                onClick={collapseAllSeksi}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-bold transition cursor-pointer shadow-2xs text-[11px]"
              >
                Ciutkan Semua
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {/* Card 'Semua Seksi' */}
          {(() => {
            const isSelected = selectedSeksi === 'all';
            const theme = getSeksiTheme('all');
            const IconComp = theme.icon;

            return (
              <Card
                key="all"
                onClick={() => setSelectedSeksi('all')}
                className={`p-3.5 cursor-pointer transition-all flex flex-col justify-between group ${theme.border} ${theme.bg} ${theme.hoverBg} ${
                  isSelected
                    ? 'ring-2 ring-red-600 shadow-md scale-[1.02] !bg-white border-red-500'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-red-700' : theme.textTitle}`}>
                    SEMUA SEKSI
                  </span>
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-red-100 text-red-700' : `${theme.iconBg} ${theme.iconColor}`} transition`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className={`text-2xl font-black ${isSelected ? 'text-red-700' : theme.textNumber} transition`}>
                  {tree.length}
                </div>
                <div className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-red-600 font-bold' : theme.textSubtitle}`}>
                  Semua Daisha
                </div>
              </Card>
            );
          })()}

          {/* Card Setiap Seksi */}
          {uniqueSeksiList.map((s) => {
            const count = seksiCounts[s] || 0;
            const isSelected = selectedSeksi.toLowerCase() === s.toLowerCase();
            const theme = getSeksiTheme(s);
            const IconComp = theme.icon;

            return (
              <Card
                key={s}
                onClick={() => setSelectedSeksi(s)}
                className={`p-3.5 cursor-pointer transition-all flex flex-col justify-between group ${theme.border} ${theme.bg} ${theme.hoverBg} ${
                  isSelected
                    ? 'ring-2 ring-red-600 shadow-md scale-[1.02] !bg-white border-red-500'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate mr-1 ${isSelected ? 'text-red-700' : theme.textTitle}`} title={s}>
                    {s}
                  </span>
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-red-100 text-red-700' : `${theme.iconBg} ${theme.iconColor}`} transition shrink-0`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className={`text-2xl font-black ${isSelected ? 'text-red-700' : theme.textNumber} transition`}>
                  {count}
                </div>
                <div className={`text-[10px] font-medium mt-1 truncate ${isSelected ? 'text-red-600 font-bold' : theme.textSubtitle}`}>
                  {count} Jenis Daisha
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Daftar Jenis Daisha Dikelompokkan per Seksi Menjadi Card */}
      <div className="space-y-6">
        {loading && tree.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <span className="inline-block animate-spin mr-2">🔄</span> Memuat katalog master Daisha dari database...
          </div>
        ) : groupedBySeksi.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada jenis Daisha yang sesuai dengan filter atau pencarian Anda.
          </div>
        ) : (
          groupedBySeksi.map((group) => {
            const isSeksiCollapsed = !search.trim() && collapsedSeksi.includes(group.seksi);
            const seksiTheme = getSeksiTheme(group.seksi);
            const SeksiIcon = seksiTheme.icon;

            return (
              <div
                key={group.seksi}
                className={`bg-white rounded-2xl sm:rounded-3xl border ${seksiTheme.border} shadow-sm overflow-hidden transition`}
              >
                {/* Header Card Seksi */}
                <div
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none cursor-pointer transition border-b ${
                    isSeksiCollapsed
                      ? 'bg-slate-50/70 border-transparent hover:bg-slate-100/60'
                      : 'bg-gradient-to-r from-slate-50 via-slate-50/50 to-white border-slate-200/80'
                  }`}
                  onClick={() => toggleCollapseSeksi(group.seksi)}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl ${seksiTheme.iconBg} ${seksiTheme.iconColor} border ${seksiTheme.border} flex items-center justify-center font-black text-xl shrink-0 shadow-2xs`}>
                      <SeksiIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-slate-900 tracking-tight">
                          Seksi {group.seksi}
                        </h3>
                        <Badge variant="outline" className={`text-[11px] font-black ${seksiTheme.iconColor} ${seksiTheme.iconBg} ${seksiTheme.border} px-2.5 py-0.5`}>
                          {group.daishas.length} Jenis Daisha
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {group.totalKomponen} Komponen Kerusakan &middot; {group.totalGejala} Detail Gejala Masalah
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 self-stretch sm:self-center justify-end flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewDaishaForm({ name: '', seksi: group.seksi });
                        setIsAddDaishaModalOpen(true);
                      }}
                      className="gap-1.5 text-red-700 border-red-200 bg-red-50/80 hover:bg-red-100 text-xs font-bold rounded-xl shadow-2xs"
                      title={`Tambah Daisha baru khusus untuk Seksi ${group.seksi}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Daisha {group.seksi}</span>
                    </Button>

                    <button
                      type="button"
                      onClick={() => toggleCollapseSeksi(group.seksi)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      {isSeksiCollapsed ? (
                        <>
                          <span>Buka ({group.daishas.length})</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Tutup</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Body Card Seksi: Daftar Daisha dalam Seksi Ini (Grid 2 Kolom) */}
                {!isSeksiCollapsed && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-3.5 bg-slate-50/40">
                    {group.daishas.map((daisha) => {
                      const isExpanded = expandedDaishaIds.includes(daisha.id) || search.trim().length > 0;
                      const totalKomponen = daisha.components.length;
                      const totalGejala = daisha.components.reduce((acc, c) => acc + c.symptoms.length, 0);

                      return (
                        <div
                          key={daisha.id}
                          className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition hover:border-slate-300 ${
                            isExpanded ? 'lg:col-span-2 shadow-sm border-slate-300 ring-1 ring-slate-200' : ''
                          }`}
                        >
                          {/* Header Daisha Card */}
                          <div
                            className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none cursor-pointer transition ${
                              isExpanded ? 'bg-slate-50/80 border-b border-slate-200' : 'hover:bg-slate-50/50'
                            }`}
                            onClick={() => toggleAccordion(daisha.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
                                <FolderPlus className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-900">{daisha.name}</h4>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {totalKomponen} Komponen Kerusakan &middot; {totalGejala} Detail Gejala
                                </p>
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-1.5 self-stretch sm:self-center justify-end flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAddComponentTarget(daisha)}
                                className="gap-1 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                title="Tambah komponen baru untuk Daisha ini"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Komponen</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditItem({
                                    type: 'daisha',
                                    id: daisha.id,
                                    name: daisha.name,
                                    seksi: daisha.seksi,
                                  })
                                }
                                className="gap-1 text-slate-700 hover:bg-slate-100"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setDeleteItem({
                                    type: 'daisha',
                                    id: daisha.id,
                                    title: `Hapus Jenis Daisha: ${daisha.name}`,
                                    description: `Apakah Anda yakin ingin menghapus "${daisha.name}"? Semua ${totalKomponen} komponen dan ${totalGejala} gejala di dalamnya akan ikut terhapus secara permanen.`,
                                  })
                                }
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 p-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                              <div className="text-slate-400 p-1">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Body: Daftar Komponen & Gejala */}
                          {isExpanded && (
                            <div className="p-4 bg-gray-50/50 space-y-4">
                              {daisha.components.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-xs">
                                  Belum ada komponen kerusakan yang ditambahkan pada unit ini.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {daisha.components.map((comp) => (
                                    <div
                                      key={comp.id}
                                      className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5"
                                    >
                                      {/* Header Komponen */}
                                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                                          <span>🔧</span> {comp.name}
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
                                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 px-1.5 py-0.5 bg-emerald-50 rounded cursor-pointer"
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
                                            className="text-[10px] text-gray-500 hover:text-gray-800 px-1 cursor-pointer"
                                            title="Edit nama komponen"
                                          >
                                            ✏️
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
                                            className="text-[10px] text-red-500 hover:text-red-800 px-1 cursor-pointer"
                                            title="Hapus komponen ini"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>

                                      {/* Daftar Gejala Kerusakan */}
                                      <div className="space-y-1.5">
                                        {comp.symptoms.length === 0 ? (
                                          <div className="text-[11px] text-gray-400 italic">
                                            Belum ada detail gejala kerusakan.
                                          </div>
                                        ) : (
                                          comp.symptoms.map((sym) => (
                                            <div
                                              key={sym.id}
                                              className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80 hover:bg-gray-100/80 transition text-xs group"
                                            >
                                              <span className="text-gray-700 font-medium">{sym.description}</span>
                                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setEditItem({
                                                      type: 'symptom',
                                                      id: sym.id,
                                                      name: sym.description,
                                                    })
                                                  }
                                                  className="text-[10px] text-gray-400 hover:text-gray-700 px-1 cursor-pointer"
                                                  title="Edit deskripsi gejala"
                                                >
                                                  ✏️
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setDeleteItem({
                                                      type: 'symptom',
                                                      id: sym.id,
                                                      title: `Hapus Gejala Kerusakan`,
                                                      description: `Apakah Anda yakin ingin menghapus gejala "${sym.description}"?`,
                                                    })
                                                  }
                                                  className="text-[10px] text-red-400 hover:text-red-700 px-1 cursor-pointer"
                                                  title="Hapus gejala ini"
                                                >
                                                  🗑️
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

      {/* MODAL: Tambah Jenis Daisha Baru */}
      {isAddDaishaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>🛞</span> Tambah Jenis Daisha Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDaishaModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDaishaSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Jenis Daisha</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daisha AGV Otomatis"
                  value={newDaishaForm.name}
                  onChange={(e) => setNewDaishaForm({ ...newDaishaForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Seksi Plant Penempatan</label>
                <input
                  type="text"
                  required
                  list="seksi-options"
                  placeholder="Pilih atau ketik seksi baru..."
                  value={newDaishaForm.seksi}
                  onChange={(e) => setNewDaishaForm({ ...newDaishaForm, seksi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
                <datalist id="seksi-options">
                  {seksiList.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddDaishaModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Daisha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Komponen Baru */}
      {addComponentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>🔧</span> Tambah Komponen: {addComponentTarget.name}
              </h3>
              <button
                type="button"
                onClick={() => setAddComponentTarget(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddComponentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Komponen / Bagian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Roda Putar, Sensor, Hanger, Body frame..."
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddComponentTarget(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Komponen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Gejala Baru */}
      {addSymptomTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span>➕</span> Tambah Gejala Kerusakan
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {addSymptomTarget.daishaName} &middot; Komponen: <strong>{addSymptomTarget.componentName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddSymptomTarget(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSymptomSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Rincian / Gejala Kerusakan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Baut pengikat kendor/hilang, retak pada sambungan, roda macet..."
                  value={newSymptomText}
                  onChange={(e) => setNewSymptomText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddSymptomTarget(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Gejala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Item (Daisha / Komponen / Gejala) */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>✏️</span> Edit{' '}
                {editItem.type === 'daisha' ? 'Jenis Daisha' : editItem.type === 'component' ? 'Komponen' : 'Gejala'}
              </h3>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {editItem.type === 'symptom' ? 'Deskripsi Gejala' : 'Nama'}
                </label>
                <input
                  type="text"
                  required
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
                />
              </div>

              {editItem.type === 'daisha' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Seksi Penempatan</label>
                  <input
                    type="text"
                    required
                    list="seksi-options-edit"
                    value={editItem.seksi || ''}
                    onChange={(e) => setEditItem({ ...editItem, seksi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                  <datalist id="seksi-options-edit">
                    {seksiList.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        title={deleteItem?.title || 'Konfirmasi Hapus'}
        message={deleteItem?.description || 'Apakah Anda yakin ingin menghapus item ini?'}
        confirmText="Ya, Hapus Permanen"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteItem(null)}
      />

      {/* MODAL: Feedback Popup */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ ...feedback, isOpen: false })}
      />
    </div>
  );
}
