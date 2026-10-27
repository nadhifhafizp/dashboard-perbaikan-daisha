'use client';

import { useState, useMemo } from 'react';
import { useDaishaCatalog, DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { FeedbackType } from '@/components/FeedbackModal';
import { EditCatalogItemState } from '../CatalogModals';

export function useCatalogManager() {
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

  const toggleAccordion = (id: number) => {
    setExpandedDaishaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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

  const closeFeedback = () => setFeedback((p) => ({ ...p, isOpen: false }));

  // Group data per Seksi
  const groupedBySeksi = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = tree.filter((d) => {
      if (
        selectedSeksi !== 'all' &&
        d.seksi.toLowerCase() !== selectedSeksi.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;

      const matchDaisha =
        d.name.toLowerCase().includes(q) ||
        d.seksi.toLowerCase().includes(q) ||
        (d.codePrefix && d.codePrefix.toLowerCase().includes(q));
      const matchComponent = d.components.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symptoms.some((s) => s.description.toLowerCase().includes(q))
      );
      return matchDaisha || matchComponent;
    });

    const groups: Record<string, DaishaTreeItem[]> = {};

    filtered.forEach((daisha) => {
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
  }, [tree, selectedSeksi, search]);

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
        setNewDaishaForm({
          name: '',
          seksi: 'Building',
          codePrefix: '',
          totalUnits: 0,
        });
        await refreshCatalog();
      } else {
        showFeedback(
          'error',
          'Gagal Menambah Daisha',
          data.error || 'Terjadi kesalahan.'
        );
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
        showFeedback(
          'error',
          'Gagal Menambah Komponen',
          data.error || 'Terjadi kesalahan.'
        );
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
        showFeedback(
          'error',
          'Gagal Menambah Gejala',
          data.error || 'Terjadi kesalahan.'
        );
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
        showFeedback(
          'error',
          'Gagal Menambah Varian',
          data.error || 'Terjadi kesalahan.'
        );
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
        showFeedback(
          'error',
          'Gagal Mengubah Data',
          data.error || 'Terjadi kesalahan.'
        );
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
        showFeedback(
          'error',
          'Gagal Menghapus Data',
          data.error || 'Terjadi kesalahan.'
        );
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  return {
    tree,
    loading,
    refreshCatalog,
    search,
    setSearch,
    selectedSeksi,
    setSelectedSeksi,
    expandedDaishaIds,
    collapsedSeksi,
    toggleCollapseSeksi,
    collapseAllSeksi,
    expandAllSeksi,
    toggleAccordion,
    isAddDaishaModalOpen,
    setIsAddDaishaModalOpen,
    isAddVariantModalOpen,
    setIsAddVariantModalOpen,
    addVariantTarget,
    setAddVariantTarget,
    addComponentTarget,
    setAddComponentTarget,
    addSymptomTarget,
    setAddSymptomTarget,
    editItem,
    setEditItem,
    deleteItem,
    setDeleteItem,
    newDaishaForm,
    setNewDaishaForm,
    newVariantForm,
    setNewVariantForm,
    newComponentName,
    setNewComponentName,
    newSymptomText,
    setNewSymptomText,
    feedback,
    closeFeedback,
    groupedBySeksi,
    seksiCounts,
    totalAllUnits,
    uniqueSeksiList,
    handleAddDaishaSubmit,
    handleAddComponentSubmit,
    handleAddSymptomSubmit,
    handleAddVariantSubmit,
    handleEditSubmit,
    handleConfirmDelete,
  };
}
