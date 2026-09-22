'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Package,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Search,
  Trash2,
  ArrowLeft,
  RefreshCw,
  ClipboardList,
  MapPin,
  Save,
  CheckCircle2,
  X,
} from 'lucide-react';

// ===================== Types =====================

interface SparepartLog {
  id: number;
  namaKomponen: string;
  tipe: string;
  qty: number;
  referensi?: string;
  keterangan?: string;
  tanggal: string;
}

interface Sparepart {
  namaKomponen: string;
  kategori: string;
  stokGudang: number;
  satuan: string;
  minStok: number;
  lokasi?: string;
  logs?: SparepartLog[];
}

const KATEGORI_OPTIONS = ['Umum', 'Daisha', 'Fabrikasi', 'Elektrik', 'Safety'];

// ===================== Main Page =====================

export default function SparepartsPage() {
  const { isAdmin } = useAuth();

  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Sparepart | null>(null);
  const [partToDelete, setPartToDelete] = useState<Sparepart | null>(null);
  const [logs, setLogs] = useState<SparepartLog[]>([]);

  // Form: tambah baru
  const [addForm, setAddForm] = useState({ namaKomponen: '', kategori: 'Umum', stokGudang: 0, satuan: 'pcs', minStok: 0, lokasi: '' });
  // Form: restock / pemakaian
  const [mutasiForm, setMutasiForm] = useState({ qty: 0, referensi: '', keterangan: '' });
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: FeedbackType; title: string; message: string }>({
    isOpen: false, type: 'success', title: '', message: '',
  });
  const showFeedback = (type: FeedbackType, title: string, message: string) => setFeedback({ isOpen: true, type, title, message });

  // Fetch
  const fetchSpareparts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/spareparts?logs=true');
      const data = await res.json();
      if (data.success) setSpareparts(data.spareparts);
    } catch (err) {
      console.error('Fetch spareparts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchSpareparts(); }, [fetchSpareparts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        else if (showRestockModal) setShowRestockModal(false);
        else if (showUseModal) setShowUseModal(false);
        else if (showLogModal) setShowLogModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showRestockModal, showUseModal, showLogModal]);

  // Guard: only admin
  if (!isAdmin) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h2 className="text-sm font-semibold text-slate-800">Akses Dibatasi</h2>
        <p className="text-xs text-slate-500 mt-1">Halaman ini hanya bisa diakses oleh akun Administrator Workshop.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Portal</span>
        </Link>
      </div>
    );
  }

  // Add sparepart
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.namaKomponen || !addForm.satuan) {
      showFeedback('error', 'Data Belum Lengkap', 'Nama komponen dan satuan wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/spareparts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', ...addForm }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Berhasil', data.message);
        setShowAddModal(false);
        setAddForm({ namaKomponen: '', kategori: 'Umum', stokGudang: 0, satuan: 'pcs', minStok: 0, lokasi: '' });
        void fetchSpareparts();
      } else {
        showFeedback('error', 'Gagal', data.error);
      }
    } catch { showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.'); }
    finally { setSubmitting(false); }
  };

  // Restock
  const handleRestock = async () => {
    if (!selectedPart || mutasiForm.qty <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/spareparts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTOCK', namaKomponen: selectedPart.namaKomponen, ...mutasiForm }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Restock Berhasil', data.message);
        setShowRestockModal(false);
        setMutasiForm({ qty: 0, referensi: '', keterangan: '' });
        void fetchSpareparts();
      } else { showFeedback('error', 'Gagal', data.error); }
    } catch { showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.'); }
    finally { setSubmitting(false); }
  };

  // Use (pengeluaran)
  const handleUse = async () => {
    if (!selectedPart || mutasiForm.qty <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/spareparts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'USE', namaKomponen: selectedPart.namaKomponen, ...mutasiForm }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Pengeluaran Berhasil', data.message);
        setShowUseModal(false);
        setMutasiForm({ qty: 0, referensi: '', keterangan: '' });
        void fetchSpareparts();
      } else { showFeedback('error', 'Gagal', data.error); }
    } catch { showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.'); }
    finally { setSubmitting(false); }
  };

  // Delete
  const confirmDelete = async () => {
    if (!partToDelete) return;
    try {
      const res = await fetch('/api/spareparts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', namaKomponen: partToDelete.namaKomponen }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Dihapus', data.message);
        setPartToDelete(null);
        void fetchSpareparts();
      } else { showFeedback('error', 'Gagal', data.error); }
    } catch { showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.'); }
  };

  // View logs
  const viewLogs = (part: Sparepart) => {
    setSelectedPart(part);
    setLogs(part.logs || []);
    setShowLogModal(true);
  };

  // Filtered
  const filtered = spareparts.filter(s => {
    if (filterKategori !== 'all' && s.kategori !== filterKategori) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.namaKomponen.toLowerCase().includes(q) || s.kategori.toLowerCase().includes(q) || (s.lokasi || '').toLowerCase().includes(q);
  });

  const lowStockCount = spareparts.filter(s => s.minStok > 0 && s.stokGudang <= s.minStok).length;

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          {isAdmin && (
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal Utama</span>
              </Link>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs font-medium text-slate-700">
                Monitoring Sparepart
              </span>
            </div>
          )}
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-5 h-5 text-slate-700" />
            <span>Manajemen Spareparts & Material</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-2xl">
            Inventaris stok bengkel — terhubung ke perbaikan Daisha dan request antar seksi
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Item</span>
          </button>
          <button
            type="button"
            onClick={() => fetchSpareparts()}
            disabled={loading}
            className="flex-1 sm:flex-none h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 shadow-2xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Item</span>
            <Package className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{spareparts.length}</div>
        </div>
        <div className={`p-3.5 rounded-xl border shadow-2xs ${lowStockCount > 0 ? 'bg-amber-50/40 border-amber-200/80' : 'bg-white border-slate-200/80'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${lowStockCount > 0 ? 'text-amber-800' : 'text-slate-500'}`}>Stok Menipis</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold tabular-nums ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{lowStockCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kategori</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{new Set(spareparts.map(s => s.kategori)).size}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Stok</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{spareparts.reduce((a, s) => a + s.stokGudang, 0)}</div>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari komponen..."
                className="h-8 pl-8 pr-3 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none w-full sm:w-56 text-slate-800 shadow-2xs transition"
              />
            </div>
            <select
              value={filterKategori}
              onChange={e => setFilterKategori(e.target.value)}
              className="h-8 px-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Kategori</option>
              {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <span className="text-xs text-slate-500 font-normal tabular-nums">{filtered.length} dari {spareparts.length} item</span>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {loading && !spareparts.length ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center p-6 space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-800">
                {search || filterKategori !== 'all'
                  ? 'Tidak ada sparepart yang sesuai dengan filter'
                  : 'Belum ada data master sparepart'}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {search || filterKategori !== 'all'
                  ? 'Coba periksa kata kunci pencarian atau ubah kategori terpilih.'
                  : 'Tambahkan item sparepart baru untuk mulai mengelola stok material bengkel.'}
              </p>
              {search || filterKategori !== 'all' ? (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setFilterKategori('all'); }}
                  className="mt-2 h-8 px-3 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition cursor-pointer"
                >
                  Reset Filter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 h-8 px-3.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition cursor-pointer inline-flex items-center gap-1.5 mx-auto shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sparepart Baru</span>
                </button>
              )}
            </div>
          ) : (
            filtered.map(s => {
              const isLow = s.minStok > 0 && s.stokGudang <= s.minStok;
              return (
                <div key={s.namaKomponen} className={`p-4 space-y-2.5 transition ${isLow ? 'bg-amber-50/20' : 'bg-white hover:bg-slate-50/60'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{s.namaKomponen}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="text-slate-600 font-medium">{s.kategori}</span>
                        {s.lokasi && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{s.lokasi}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold tabular-nums ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>{s.stokGudang}</div>
                      <div className="text-xs text-slate-500">{s.satuan}</div>
                    </div>
                  </div>
                  {isLow && (
                    <div className="text-xs font-medium text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Stok di bawah minimum ({s.minStok})</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowRestockModal(true); }}
                      aria-label={`Restock ${s.namaKomponen}`}
                      className="flex-1 h-8 px-2 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Restock</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowUseModal(true); }}
                      aria-label={`Catat pemakaian ${s.namaKomponen}`}
                      className="flex-1 h-8 px-2 bg-white hover:bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5" />
                      <span>Pakai</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => viewLogs(s)}
                      aria-label={`Riwayat mutasi ${s.namaKomponen}`}
                      className="h-8 w-8 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-center shadow-2xs"
                      title="Riwayat Mutasi"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartToDelete(s)}
                      aria-label={`Hapus ${s.namaKomponen}`}
                      className="h-8 w-8 bg-white hover:bg-rose-50 text-rose-600 text-xs font-medium rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-center shadow-2xs"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/80 select-none">
                <th scope="col" className="p-3">Nama Komponen</th>
                <th scope="col" className="p-3">Kategori</th>
                <th scope="col" className="p-3 text-center">Stok</th>
                <th scope="col" className="p-3">Satuan</th>
                <th scope="col" className="p-3 text-center">Min. Stok</th>
                <th scope="col" className="p-3">Lokasi</th>
                <th scope="col" className="p-3 text-center">Status</th>
                <th scope="col" className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !spareparts.length ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400 font-medium">Memuat data sparepart...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">
                      {search || filterKategori !== 'all'
                        ? 'Tidak ada sparepart yang cocok dengan kriteria filter'
                        : 'Belum ada data master sparepart terdaftar'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {search || filterKategori !== 'all'
                        ? 'Coba ganti kata kunci atau reset filter kategori untuk melihat semua item.'
                        : 'Tambahkan item sparepart baru untuk mulai mengelola stok material bengkel.'}
                    </p>
                    {search || filterKategori !== 'all' ? (
                      <button
                        type="button"
                        onClick={() => { setSearch(''); setFilterKategori('all'); }}
                        className="mt-3 h-8 px-3 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="mt-3 h-8 px-3.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Sparepart Baru</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map(s => {
                  const isLow = s.minStok > 0 && s.stokGudang <= s.minStok;
                  return (
                    <tr key={s.namaKomponen} className={`hover:bg-slate-50/70 transition ${isLow ? 'bg-amber-50/15' : ''}`}>
                      <td className="p-3 font-medium text-slate-900">{s.namaKomponen}</td>
                      <td className="p-3 text-slate-600">{s.kategori}</td>
                      <td className={`p-3 text-center font-bold text-sm tabular-nums ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>{s.stokGudang}</td>
                      <td className="p-3 text-slate-600">{s.satuan}</td>
                      <td className="p-3 text-center text-slate-500 tabular-nums">{s.minStok}</td>
                      <td className="p-3 text-slate-500">
                        {s.lokasi ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{s.lokasi}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md text-[11px] font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Min</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[11px] font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aman</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowRestockModal(true); }}
                            className="h-7 px-2.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:border-emerald-200 rounded-md border border-slate-200 shadow-2xs transition cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium"
                            title="Restock"
                            aria-label={`Restock ${s.namaKomponen}`}
                          >
                            <ArrowDownToLine className="w-3 h-3" />
                            <span>Restock</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowUseModal(true); }}
                            className="h-7 px-2.5 bg-white hover:bg-amber-50 text-amber-700 hover:border-amber-200 rounded-md border border-slate-200 shadow-2xs transition cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium"
                            title="Pemakaian"
                            aria-label={`Catat pemakaian ${s.namaKomponen}`}
                          >
                            <ArrowUpFromLine className="w-3 h-3" />
                            <span>Pakai</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => viewLogs(s)}
                            className="h-7 w-7 bg-white hover:bg-slate-50 text-slate-600 rounded-md border border-slate-200 shadow-2xs transition cursor-pointer flex items-center justify-center"
                            title="Riwayat Mutasi"
                            aria-label={`Riwayat mutasi ${s.namaKomponen}`}
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartToDelete(s)}
                            className="h-7 w-7 bg-white hover:bg-rose-50 text-rose-600 hover:border-rose-200 rounded-md border border-slate-200 shadow-2xs transition cursor-pointer flex items-center justify-center"
                            title="Hapus"
                            aria-label={`Hapus ${s.namaKomponen}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Item */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-sparepart-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 id="add-sparepart-title" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-600" />
                <span>Tambah Sparepart Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div>
                <label htmlFor="add-nama-komponen" className="block text-xs font-medium text-slate-700 mb-1">Nama Komponen *</label>
                <input id="add-nama-komponen" type="text" value={addForm.namaKomponen} onChange={e => setAddForm(p => ({ ...p, namaKomponen: e.target.value }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-slate-800" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-kategori" className="block text-xs font-medium text-slate-700 mb-1">Kategori</label>
                  <select id="add-kategori" value={addForm.kategori} onChange={e => setAddForm(p => ({ ...p, kategori: e.target.value }))} className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer">
                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="add-satuan" className="block text-xs font-medium text-slate-700 mb-1">Satuan *</label>
                  <input id="add-satuan" type="text" value={addForm.satuan} onChange={e => setAddForm(p => ({ ...p, satuan: e.target.value }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-slate-800" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-stok-awal" className="block text-xs font-medium text-slate-700 mb-1">Stok Awal</label>
                  <input id="add-stok-awal" type="number" min={0} value={addForm.stokGudang} onChange={e => setAddForm(p => ({ ...p, stokGudang: parseInt(e.target.value) || 0 }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-slate-800 tabular-nums" />
                </div>
                <div>
                  <label htmlFor="add-min-stok" className="block text-xs font-medium text-slate-700 mb-1">Min. Stok (Alert)</label>
                  <input id="add-min-stok" type="number" min={0} value={addForm.minStok} onChange={e => setAddForm(p => ({ ...p, minStok: parseInt(e.target.value) || 0 }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-slate-800 tabular-nums" />
                </div>
              </div>
              <div>
                <label htmlFor="add-lokasi" className="block text-xs font-medium text-slate-700 mb-1">Lokasi Gudang / Rak</label>
                <input id="add-lokasi" type="text" value={addForm.lokasi} onChange={e => setAddForm(p => ({ ...p, lokasi: e.target.value }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-slate-800" placeholder="Opsional (misal: Rak B-02)" />
              </div>
            </div>
            <div className="p-3.5 sm:p-4 border-t border-slate-100 flex gap-2 justify-end bg-slate-50/50">
              <button type="button" onClick={() => setShowAddModal(false)} className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs">Batal</button>
              <button type="submit" disabled={submitting} className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs">
                <Save className="w-3.5 h-3.5" />
                <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Restock */}
      {showRestockModal && selectedPart && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restock-sparepart-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 id="restock-sparepart-title" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                  <span>Restock: {selectedPart.namaKomponen}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Stok saat ini: <strong className="text-slate-800">{selectedPart.stokGudang} {selectedPart.satuan}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div>
                <label htmlFor="restock-qty" className="block text-xs font-medium text-slate-700 mb-1">Jumlah Masuk *</label>
                <input id="restock-qty" type="number" min={1} value={mutasiForm.qty} onChange={e => setMutasiForm(p => ({ ...p, qty: parseInt(e.target.value) || 0 }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-slate-800 tabular-nums" />
              </div>
              <div>
                <label htmlFor="restock-keterangan" className="block text-xs font-medium text-slate-700 mb-1">Keterangan</label>
                <input id="restock-keterangan" type="text" value={mutasiForm.keterangan} onChange={e => setMutasiForm(p => ({ ...p, keterangan: e.target.value }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-slate-800" placeholder="Misal: Penerimaan PO #123" />
              </div>
            </div>
            <div className="p-3.5 sm:p-4 border-t border-slate-100 flex gap-2 justify-end bg-slate-50/50">
              <button type="button" onClick={() => setShowRestockModal(false)} className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs">Batal</button>
              <button type="button" onClick={handleRestock} disabled={submitting || mutasiForm.qty <= 0} className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs">
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>{submitting ? 'Memproses...' : `Tambah ${mutasiForm.qty} ${selectedPart.satuan}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pemakaian */}
      {showUseModal && selectedPart && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="use-sparepart-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 id="use-sparepart-title" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ArrowUpFromLine className="w-4 h-4 text-amber-600" />
                  <span>Pengeluaran: {selectedPart.namaKomponen}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Stok saat ini: <strong className="text-slate-800">{selectedPart.stokGudang} {selectedPart.satuan}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setShowUseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div>
                <label htmlFor="use-qty" className="block text-xs font-medium text-slate-700 mb-1">Jumlah Keluar *</label>
                <input id="use-qty" type="number" min={1} max={selectedPart.stokGudang} value={mutasiForm.qty} onChange={e => setMutasiForm(p => ({ ...p, qty: parseInt(e.target.value) || 0 }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-amber-600 focus:border-amber-600 outline-none text-slate-800 tabular-nums" />
              </div>
              <div>
                <label htmlFor="use-referensi" className="block text-xs font-medium text-slate-700 mb-1">Referensi (No. Tiket / Request)</label>
                <input id="use-referensi" type="text" value={mutasiForm.referensi} onChange={e => setMutasiForm(p => ({ ...p, referensi: e.target.value }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-amber-600 focus:border-amber-600 outline-none text-slate-800" placeholder="Misal: TKT-20260101-001" />
              </div>
              <div>
                <label htmlFor="use-keterangan" className="block text-xs font-medium text-slate-700 mb-1">Keterangan</label>
                <input id="use-keterangan" type="text" value={mutasiForm.keterangan} onChange={e => setMutasiForm(p => ({ ...p, keterangan: e.target.value }))} className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-amber-600 focus:border-amber-600 outline-none text-slate-800" placeholder="Keterangan perbaikan unit" />
              </div>
            </div>
            <div className="p-3.5 sm:p-4 border-t border-slate-100 flex gap-2 justify-end bg-slate-50/50">
              <button type="button" onClick={() => setShowUseModal(false)} className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs">Batal</button>
              <button type="button" onClick={handleUse} disabled={submitting || mutasiForm.qty <= 0 || mutasiForm.qty > selectedPart.stokGudang} className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs">
                <ArrowUpFromLine className="w-3.5 h-3.5" />
                <span>{submitting ? 'Memproses...' : `Keluarkan ${mutasiForm.qty} ${selectedPart.satuan}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Mutasi */}
      {showLogModal && selectedPart && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-sparepart-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 id="log-sparepart-title" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-600" />
                <span>Riwayat Mutasi: {selectedPart.namaKomponen}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-normal text-xs">
                  <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  Belum ada catatan mutasi. Riwayat transaksi masuk (restock) dan keluar (pemakaian tiket) akan otomatis tercatat di sini.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map(l => (
                    <div key={l.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold inline-flex items-center gap-1 ${l.tipe === 'IN' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {l.tipe === 'IN' ? <ArrowDownToLine className="w-3.5 h-3.5" /> : <ArrowUpFromLine className="w-3.5 h-3.5" />}
                          <span>{l.tipe === 'IN' ? 'Masuk' : 'Keluar'} +{l.qty}</span>
                        </span>
                        <span className="text-xs text-slate-500 tabular-nums">{formatDate(l.tanggal)}</span>
                      </div>
                      {l.referensi && <div className="text-xs text-slate-600 mt-1">Ref: {l.referensi}</div>}
                      {l.keterangan && <div className="text-xs text-slate-500 mt-0.5">{l.keterangan}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3.5 sm:p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button type="button" onClick={() => setShowLogModal(false)} className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!partToDelete}
        title="Hapus Master Sparepart"
        message={`Apakah Anda yakin ingin menghapus sparepart "${partToDelete?.namaKomponen}" (Kategori: ${partToDelete?.kategori})? Seluruh riwayat mutasi stok terkait juga akan dihapus permanen.`}
        confirmText="Hapus Sparepart"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setPartToDelete(null)}
      />

      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
