'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Package, Plus, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Search, Trash2, ArrowLeft } from 'lucide-react';

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

  // Guard: only admin
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-bold text-sm">⚠️ Halaman ini hanya bisa diakses oleh Admin.</p>
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
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          {isAdmin && (
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition border border-slate-200 hover:border-emerald-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal Utama</span>
              </Link>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                Monitoring Sparepart
              </span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            📦 Manajemen Spareparts & Material
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Inventaris stok bengkel — terhubung ke perbaikan Daisha & request antar seksi
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Item
          </button>
          <button
            onClick={() => fetchSpareparts()}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Item</span>
            <Package className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{spareparts.length}</div>
        </div>
        <div className={`p-4 rounded-2xl border shadow-xs ${lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${lowStockCount > 0 ? 'text-red-700' : 'text-gray-500'}`}>Stok Menipis</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </div>
          <div className={`text-2xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStockCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kategori</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{new Set(spareparts.map(s => s.kategori)).size}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Stok</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{spareparts.reduce((a, s) => a + s.stokGudang, 0)}</div>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari komponen..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-600 outline-none w-48"
              />
            </div>
            <select
              value={filterKategori}
              onChange={e => setFilterKategori(e.target.value)}
              className="p-2 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">{filtered.length} dari {spareparts.length} item</span>
        </div>

        {/* Mobile cards */}
        <div className="p-3 space-y-3 md:hidden">
          {loading && !spareparts.length ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold text-xs">Belum ada data sparepart.</div>
          ) : (
            filtered.map(s => {
              const isLow = s.minStok > 0 && s.stokGudang <= s.minStok;
              return (
                <div key={s.namaKomponen} className={`p-3.5 rounded-xl border shadow-2xs space-y-2 ${isLow ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-gray-900">{s.namaKomponen}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700">{s.kategori}</span>
                        {s.lokasi && <span className="text-[10px] text-gray-400">📍 {s.lokasi}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{s.stokGudang}</div>
                      <div className="text-[10px] text-gray-500 font-bold">{s.satuan}</div>
                    </div>
                  </div>
                  {isLow && <div className="text-[10px] font-bold text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Stok di bawah minimum ({s.minStok})</div>}
                  <div className="flex gap-1.5 pt-1">
                    <button onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowRestockModal(true); }} className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1"><ArrowDownToLine className="w-3 h-3" /> Restock</button>
                    <button onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowUseModal(true); }} className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1"><ArrowUpFromLine className="w-3 h-3" /> Pakai</button>
                    <button onClick={() => viewLogs(s)} className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-lg transition cursor-pointer">📋</button>
                    <button onClick={() => setPartToDelete(s)} className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-lg transition cursor-pointer"><Trash2 className="w-3 h-3" /></button>
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
              <tr className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3">Nama Komponen</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-center">Stok</th>
                <th className="p-3">Satuan</th>
                <th className="p-3 text-center">Min. Stok</th>
                <th className="p-3">Lokasi</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && !spareparts.length ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400 font-bold">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400 font-bold">Tidak ada data yang sesuai.</td></tr>
              ) : (
                filtered.map(s => {
                  const isLow = s.minStok > 0 && s.stokGudang <= s.minStok;
                  return (
                    <tr key={s.namaKomponen} className={`border-b border-gray-100 hover:bg-gray-50/60 transition ${isLow ? 'bg-red-50/30' : ''}`}>
                      <td className="p-3 font-bold text-gray-900">{s.namaKomponen}</td>
                      <td className="p-3"><span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700">{s.kategori}</span></td>
                      <td className={`p-3 text-center font-black text-lg ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{s.stokGudang}</td>
                      <td className="p-3 text-gray-600">{s.satuan}</td>
                      <td className="p-3 text-center text-gray-600">{s.minStok}</td>
                      <td className="p-3 text-gray-500">{s.lokasi || '-'}</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full text-[10px] font-black"><AlertTriangle className="w-3 h-3" /> LOW</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">OK</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowRestockModal(true); }} className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-lg transition cursor-pointer" title="Restock"><ArrowDownToLine className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setSelectedPart(s); setMutasiForm({ qty: 0, referensi: '', keterangan: '' }); setShowUseModal(true); }} className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-lg transition cursor-pointer" title="Pemakaian"><ArrowUpFromLine className="w-3.5 h-3.5" /></button>
                          <button onClick={() => viewLogs(s)} className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-lg transition cursor-pointer" title="Riwayat">📋</button>
                          <button onClick={() => setPartToDelete(s)} className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-lg transition cursor-pointer" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-sm font-black text-gray-900">➕ Tambah Sparepart Baru</h3>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Komponen *</label>
                <input type="text" value={addForm.namaKomponen} onChange={e => setAddForm(p => ({ ...p, namaKomponen: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Kategori</label>
                  <select value={addForm.kategori} onChange={e => setAddForm(p => ({ ...p, kategori: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer">
                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Satuan *</label>
                  <input type="text" value={addForm.satuan} onChange={e => setAddForm(p => ({ ...p, satuan: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stok Awal</label>
                  <input type="number" min={0} value={addForm.stokGudang} onChange={e => setAddForm(p => ({ ...p, stokGudang: parseInt(e.target.value) || 0 }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Min. Stok (Alert)</label>
                  <input type="number" min={0} value={addForm.minStok} onChange={e => setAddForm(p => ({ ...p, minStok: parseInt(e.target.value) || 0 }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Lokasi Gudang / Rak</label>
                <input type="text" value={addForm.lokasi} onChange={e => setAddForm(p => ({ ...p, lokasi: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none" placeholder="Opsional" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-2">
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50">
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan'}
              </button>
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Restock */}
      {showRestockModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><ArrowDownToLine className="w-4 h-4 text-emerald-600" /> Restock: {selectedPart.namaKomponen}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Stok saat ini: <b>{selectedPart.stokGudang} {selectedPart.satuan}</b></p>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Jumlah Masuk *</label>
                <input type="number" min={1} value={mutasiForm.qty} onChange={e => setMutasiForm(p => ({ ...p, qty: parseInt(e.target.value) || 0 }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Keterangan</label>
                <input type="text" value={mutasiForm.keterangan} onChange={e => setMutasiForm(p => ({ ...p, keterangan: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-600 outline-none" placeholder="Misal: PO #123" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-2">
              <button onClick={handleRestock} disabled={submitting || mutasiForm.qty <= 0} className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50">
                {submitting ? '⏳...' : `📥 Tambah ${mutasiForm.qty} ${selectedPart.satuan}`}
              </button>
              <button onClick={() => setShowRestockModal(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pemakaian */}
      {showUseModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><ArrowUpFromLine className="w-4 h-4 text-amber-600" /> Pengeluaran: {selectedPart.namaKomponen}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Stok saat ini: <b>{selectedPart.stokGudang} {selectedPart.satuan}</b></p>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Jumlah Keluar *</label>
                <input type="number" min={1} max={selectedPart.stokGudang} value={mutasiForm.qty} onChange={e => setMutasiForm(p => ({ ...p, qty: parseInt(e.target.value) || 0 }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-amber-600 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Referensi (No. Tiket / Request)</label>
                <input type="text" value={mutasiForm.referensi} onChange={e => setMutasiForm(p => ({ ...p, referensi: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-600 outline-none" placeholder="Misal: TKT-20260101-001" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Keterangan</label>
                <input type="text" value={mutasiForm.keterangan} onChange={e => setMutasiForm(p => ({ ...p, keterangan: e.target.value }))} className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-600 outline-none" placeholder="Keterangan pemakaian" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-2">
              <button onClick={handleUse} disabled={submitting || mutasiForm.qty <= 0 || mutasiForm.qty > selectedPart.stokGudang} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50">
                {submitting ? '⏳...' : `📤 Keluarkan ${mutasiForm.qty} ${selectedPart.satuan}`}
              </button>
              <button onClick={() => setShowUseModal(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Mutasi */}
      {showLogModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-sm font-black text-gray-900">📋 Riwayat Mutasi: {selectedPart.namaKomponen}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-bold text-xs">Belum ada riwayat mutasi.</div>
              ) : (
                <div className="space-y-2">
                  {logs.map(l => (
                    <div key={l.id} className={`p-3 rounded-xl border text-xs ${l.tipe === 'IN' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-black ${l.tipe === 'IN' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {l.tipe === 'IN' ? '📥 MASUK' : '📤 KELUAR'} +{l.qty}
                        </span>
                        <span className="text-[10px] text-gray-500">{formatDate(l.tanggal)}</span>
                      </div>
                      {l.referensi && <div className="text-[11px] text-gray-600 mt-0.5">Ref: {l.referensi}</div>}
                      {l.keterangan && <div className="text-[11px] text-gray-500 mt-0.5">{l.keterangan}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button onClick={() => setShowLogModal(false)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!partToDelete}
        title="Hapus Sparepart"
        message={`Yakin ingin menghapus "${partToDelete?.namaKomponen}" beserta seluruh riwayat mutasinya?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
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
