'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import { ClipboardList, Clock, CheckCircle2, XCircle, Wrench, Send, AlertTriangle, Filter, Plus, ArrowLeft } from 'lucide-react';

// ===================== Types =====================

interface SectionRequestMaterial {
  id: number;
  namaKomponen: string;
  qty: number;
  keterangan?: string;
}

interface SectionRequest {
  id: number;
  nomorRequest: string;
  seksiPemohon: string;
  picPemohon: string;
  kontakPemohon?: string;
  namaBarang: string;
  spesifikasi?: string;
  jumlah: number;
  satuan: string;
  urgensi: string;
  catatan?: string;
  status: string;
  alasanTolak?: string;
  picBengkel?: string;
  estimasi?: string;
  catatanAdmin?: string;
  dibuatOleh: string;
  waktuDibuat: string;
  waktuUpdate: string;
  waktuSelesai?: string;
  materials: SectionRequestMaterial[];
}

type RequestStatus = 'all' | 'Diajukan' | 'Disetujui' | 'Dikerjakan' | 'Selesai' | 'Ditolak';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Diajukan:   { label: 'Diajukan',   color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
  Disetujui:  { label: 'Disetujui',  color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Dikerjakan: { label: 'Dikerjakan', color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200',icon: <Wrench className="w-3.5 h-3.5" /> },
  Selesai:    { label: 'Selesai',    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Ditolak:    { label: 'Ditolak',    color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',  icon: <XCircle className="w-3.5 h-3.5" /> },
};

const URGENSI_OPTIONS = ['Normal', 'Urgent', 'Critical'];

const DAFTAR_SEKSI_REQUEST = [
  'TBR Produksi', 'MC/TB Produksi', 'PSR/AG Produksi', 'Mixing', 'Material', 
  'Engineering', 'Quality', 'PPC', 'Warehouse', 'Utility', 'Lainnya',
];

// ===================== Components =====================

function StatusBadgeRequest({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Diajukan;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function UrgensiBadge({ urgensi }: { urgensi: string }) {
  const colorMap: Record<string, string> = {
    Normal: 'bg-slate-100 text-slate-700 border-slate-200',
    Urgent: 'bg-amber-100 text-amber-800 border-amber-300',
    Critical: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${colorMap[urgensi] || colorMap.Normal}`}>
      {urgensi === 'Critical' ? '🔴' : urgensi === 'Urgent' ? '🟡' : '🟢'} {urgensi}
    </span>
  );
}

// ===================== Main Page =====================

export default function RequestPage() {
  const { currentUser, isAdmin } = useAuth();

  const [requests, setRequests] = useState<SectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<RequestStatus>('all');
  const [search, setSearch] = useState('');

  // Form create state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    seksiPemohon: '',
    picPemohon: '',
    kontakPemohon: '',
    namaBarang: '',
    spesifikasi: '',
    jumlah: 1,
    satuan: 'pcs',
    urgensi: 'Normal',
    catatan: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Admin: update status modal
  const [selectedRequest, setSelectedRequest] = useState<SectionRequest | null>(null);
  const [adminForm, setAdminForm] = useState({
    status: '',
    alasanTolak: '',
    picBengkel: '',
    estimasi: '',
    catatanAdmin: '',
  });

  // Delete
  const [requestToDelete, setRequestToDelete] = useState<SectionRequest | null>(null);

  // Feedback
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: FeedbackType; title: string; message: string }>({
    isOpen: false, type: 'success', title: '', message: '',
  });

  const showFeedback = (type: FeedbackType, title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/section-requests');
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  // Submit new request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seksiPemohon || !formData.picPemohon || !formData.namaBarang) {
      showFeedback('error', 'Data Belum Lengkap', 'Seksi, PIC, dan Nama Barang wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Request Berhasil Diajukan', data.message);
        setShowForm(false);
        setFormData({ seksiPemohon: '', picPemohon: '', kontakPemohon: '', namaBarang: '', spesifikasi: '', jumlah: 1, satuan: 'pcs', urgensi: 'Normal', catatan: '' });
        void fetchRequests();
      } else {
        showFeedback('error', 'Gagal Mengajukan', data.error);
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin: update status
  const handleUpdateStatus = async () => {
    if (!selectedRequest || !adminForm.status) return;

    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          id: selectedRequest.id,
          ...adminForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Status Diperbarui', data.message);
        setSelectedRequest(null);
        void fetchRequests();
      } else {
        showFeedback('error', 'Gagal Update', data.error);
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // Delete request
  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id: requestToDelete.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Dihapus', data.message);
        setRequestToDelete(null);
        void fetchRequests();
      } else {
        showFeedback('error', 'Gagal Hapus', data.error);
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      all: requests.length,
      diajukan: requests.filter(r => r.status === 'Diajukan').length,
      proses: requests.filter(r => r.status === 'Disetujui' || r.status === 'Dikerjakan').length,
      selesai: requests.filter(r => r.status === 'Selesai').length,
      ditolak: requests.filter(r => r.status === 'Ditolak').length,
    };
  }, [requests]);

  // Filtered list
  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.nomorRequest.toLowerCase().includes(q) ||
        r.namaBarang.toLowerCase().includes(q) ||
        r.seksiPemohon.toLowerCase().includes(q) ||
        r.picPemohon.toLowerCase().includes(q)
      );
    });
  }, [requests, filterStatus, search]);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition border border-slate-200 hover:border-blue-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal Utama</span>
              </Link>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Dashboard Request Seksi
              </span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            📋 Follow-Up Request Antar Seksi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Sistem pengajuan pembuatan / modifikasi barang ke bengkel produksi & special project
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Request</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => fetchRequests()}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Form Pengajuan (USER_SEKSI only) */}
      {showForm && !isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-6 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" /> Form Pengajuan Pembuatan / Modifikasi Barang
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Seksi Pemohon *</label>
              <select
                value={formData.seksiPemohon}
                onChange={e => setFormData(p => ({ ...p, seksiPemohon: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
                required
              >
                <option value="">— Pilih Seksi —</option>
                {DAFTAR_SEKSI_REQUEST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nama PIC Pemohon *</label>
              <input
                type="text"
                value={formData.picPemohon}
                onChange={e => setFormData(p => ({ ...p, picPemohon: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="Nama lengkap PIC"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">No. Telp / Ext</label>
              <input
                type="text"
                value={formData.kontakPemohon}
                onChange={e => setFormData(p => ({ ...p, kontakPemohon: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="Opsional"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Barang / Jig / Troli *</label>
              <input
                type="text"
                value={formData.namaBarang}
                onChange={e => setFormData(p => ({ ...p, namaBarang: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="Nama barang yang diminta"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Spesifikasi / Ukuran</label>
              <input
                type="text"
                value={formData.spesifikasi}
                onChange={e => setFormData(p => ({ ...p, spesifikasi: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="Detail teknis opsional"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Jumlah</label>
                <input
                  type="number"
                  min={1}
                  value={formData.jumlah}
                  onChange={e => setFormData(p => ({ ...p, jumlah: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Satuan</label>
                <input
                  type="text"
                  value={formData.satuan}
                  onChange={e => setFormData(p => ({ ...p, satuan: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tingkat Urgensi</label>
              <select
                value={formData.urgensi}
                onChange={e => setFormData(p => ({ ...p, urgensi: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
              >
                {URGENSI_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Catatan Kebutuhan</label>
              <textarea
                value={formData.catatan}
                onChange={e => setFormData(p => ({ ...p, catatan: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                rows={2}
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? '⏳ Mengirim...' : '📨 Kirim Request'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => setFilterStatus('all')} className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${filterStatus === 'all' ? 'ring-2 ring-indigo-600 bg-white border-indigo-500 shadow-md' : 'bg-white border-gray-200 hover:shadow-md'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.all}</div>
        </button>
        <button onClick={() => setFilterStatus('Diajukan')} className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${filterStatus === 'Diajukan' ? 'ring-2 ring-amber-500 bg-white border-amber-500 shadow-md' : 'bg-amber-50/30 border-amber-200/80 hover:shadow-md'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Diajukan</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.diajukan}</div>
        </button>
        <button onClick={() => setFilterStatus('Dikerjakan')} className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${filterStatus === 'Dikerjakan' ? 'ring-2 ring-indigo-500 bg-white border-indigo-500 shadow-md' : 'bg-indigo-50/30 border-indigo-200/80 hover:shadow-md'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Proses</span>
            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats.proses}</div>
        </button>
        <button onClick={() => setFilterStatus('Selesai')} className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${filterStatus === 'Selesai' ? 'ring-2 ring-emerald-500 bg-white border-emerald-500 shadow-md' : 'bg-emerald-50/30 border-emerald-200/80 hover:shadow-md'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Selesai</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.selesai}</div>
        </button>
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" /> Daftar Request
            </h2>
            <span className="text-[11px] text-gray-500 font-medium">
              Menampilkan {filtered.length} dari {requests.length} request
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Cari nomor / barang / seksi..."
            className="w-full sm:w-64 p-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>

        {/* Mobile: Cards */}
        <div className="p-3 space-y-3 md:hidden">
          {loading && !requests.length ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold text-xs">Belum ada request.</div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-gray-900 text-xs">{r.nomorRequest}</span>
                    <span className="text-[10px] text-gray-400 ml-1.5">• {formatDate(r.waktuDibuat)}</span>
                  </div>
                  <StatusBadgeRequest status={r.status} />
                </div>
                <div className="text-sm font-black text-indigo-800">{r.namaBarang}</div>
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-600">
                  <span>🏢 {r.seksiPemohon}</span>
                  <span>👤 {r.picPemohon}</span>
                  <span>📦 {r.jumlah} {r.satuan}</span>
                  <UrgensiBadge urgensi={r.urgensi} />
                </div>
                {r.spesifikasi && <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg">📐 {r.spesifikasi}</div>}
                {r.catatanAdmin && <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">📝 Admin: {r.catatanAdmin}</div>}
                {r.alasanTolak && <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">❌ Ditolak: {r.alasanTolak}</div>}
                {r.picBengkel && <div className="text-[11px] text-gray-600">🔧 PIC Bengkel: <b>{r.picBengkel}</b></div>}
                {r.estimasi && <div className="text-[11px] text-gray-600">⏰ Estimasi: <b>{r.estimasi}</b></div>}

                {isAdmin && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setSelectedRequest(r); setAdminForm({ status: r.status, alasanTolak: r.alasanTolak || '', picBengkel: r.picBengkel || '', estimasi: r.estimasi || '', catatanAdmin: r.catatanAdmin || '' }); }}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      ⚙️ Kelola
                    </button>
                    <button
                      onClick={() => setRequestToDelete(r)}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3">No. Request</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Seksi</th>
                <th className="p-3">PIC</th>
                <th className="p-3">Nama Barang</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Urgensi</th>
                <th className="p-3">Status</th>
                <th className="p-3">PIC Bengkel</th>
                {isAdmin && <th className="p-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading && !requests.length ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-400 font-bold">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-400 font-bold">Tidak ada request yang sesuai filter.</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition">
                    <td className="p-3 font-mono font-bold text-gray-900">{r.nomorRequest}</td>
                    <td className="p-3 text-gray-600">{formatDate(r.waktuDibuat)}</td>
                    <td className="p-3 font-bold text-gray-800">{r.seksiPemohon}</td>
                    <td className="p-3 text-gray-700">{r.picPemohon}</td>
                    <td className="p-3 font-bold text-indigo-800 max-w-[200px] truncate" title={r.namaBarang}>{r.namaBarang}</td>
                    <td className="p-3 text-gray-700">{r.jumlah} {r.satuan}</td>
                    <td className="p-3"><UrgensiBadge urgensi={r.urgensi} /></td>
                    <td className="p-3"><StatusBadgeRequest status={r.status} /></td>
                    <td className="p-3 text-gray-600">{r.picBengkel || '-'}</td>
                    {isAdmin && (
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setSelectedRequest(r); setAdminForm({ status: r.status, alasanTolak: r.alasanTolak || '', picBengkel: r.picBengkel || '', estimasi: r.estimasi || '', catatanAdmin: r.catatanAdmin || '' }); }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                          >
                            ⚙️ Kelola
                          </button>
                          <button
                            onClick={() => setRequestToDelete(r)}
                            className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-lg transition cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin: Modal Update Status */}
      {selectedRequest && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-sm font-black text-gray-900">⚙️ Kelola Request: {selectedRequest.nomorRequest}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{selectedRequest.namaBarang} — {selectedRequest.seksiPemohon}</p>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={adminForm.status}
                  onChange={e => setAdminForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
                >
                  <option value="Diajukan">Diajukan</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Dikerjakan">Dikerjakan</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              {adminForm.status === 'Ditolak' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Alasan Penolakan</label>
                  <textarea
                    value={adminForm.alasanTolak}
                    onChange={e => setAdminForm(p => ({ ...p, alasanTolak: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                    rows={2}
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">PIC Bengkel / Teknisi</label>
                <input
                  type="text"
                  value={adminForm.picBengkel}
                  onChange={e => setAdminForm(p => ({ ...p, picBengkel: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Nama teknisi yang mengerjakan"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estimasi Selesai</label>
                <input
                  type="text"
                  value={adminForm.estimasi}
                  onChange={e => setAdminForm(p => ({ ...p, estimasi: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Misal: 3 hari kerja"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Catatan Admin</label>
                <textarea
                  value={adminForm.catatanAdmin}
                  onChange={e => setAdminForm(p => ({ ...p, catatanAdmin: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                  rows={2}
                  placeholder="Catatan internal bengkel"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                💾 Simpan Perubahan
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!requestToDelete}
        title="Hapus Request"
        message={`Yakin ingin menghapus request "${requestToDelete?.nomorRequest}" (${requestToDelete?.namaBarang})?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setRequestToDelete(null)}
      />

      {/* Feedback Modal */}
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
