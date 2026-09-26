'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Send,
  AlertTriangle,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  RotateCcw,
  Building2,
  User,
  Package,
  Ruler,
  Settings,
  Trash2,
  Save,
  X,
} from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Diajukan:   { label: 'Diajukan',   color: 'text-amber-800',   bg: 'bg-amber-50',   icon: <Clock className="w-3.5 h-3.5 text-amber-600" /> },
  Disetujui:  { label: 'Disetujui',  color: 'text-blue-800',    bg: 'bg-blue-50',    icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> },
  Dikerjakan: { label: 'Dikerjakan', color: 'text-indigo-800',  bg: 'bg-indigo-50',  icon: <Wrench className="w-3.5 h-3.5 text-indigo-600" /> },
  Selesai:    { label: 'Selesai',    color: 'text-emerald-800', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
  Ditolak:    { label: 'Ditolak',    color: 'text-rose-800',    bg: 'bg-rose-50',    icon: <XCircle className="w-3.5 h-3.5 text-rose-600" /> },
};

const DAFTAR_SEKSI_REQUEST = [
  'TBR Produksi', 'MC/TB Produksi', 'PSR/AG Produksi', 'Mixing', 'Material', 
  'Engineering', 'Quality', 'PPC', 'Warehouse', 'Utility', 'Lainnya',
];

// ===================== Components =====================

function StatusBadgeRequest({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Diajukan;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      <span>{cfg.label}</span>
    </span>
  );
}

function UrgensiBadge({ urgensi }: { urgensi: string }) {
  const dotColor = urgensi === 'Critical' ? 'bg-red-600' : urgensi === 'Urgent' ? 'bg-amber-500' : 'bg-emerald-600';
  const textColor = urgensi === 'Critical' ? 'text-red-700 bg-red-50 border border-red-200/60' : urgensi === 'Urgent' ? 'text-amber-800 bg-amber-50 border border-amber-200/60' : 'text-slate-700 bg-slate-100 border border-slate-200/60';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{urgensi}</span>
    </span>
  );
}

// ===================== Main Page =====================

export default function RequestPage() {
  const { isAdmin } = useAuth();

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
      showFeedback('error', 'Data Belum Lengkap', 'Mohon lengkapi seksi, nama PIC, dan nama barang.');
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
        showFeedback('success', 'Pengajuan Terkirim', data.message);
        setShowForm(false);
        setFormData({
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
        void fetchRequests();
      } else {
        showFeedback('error', 'Gagal Mengirim', data.error);
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin update status
  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', id: selectedRequest.id, ...adminForm }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Status Diperbarui', data.message);
        setSelectedRequest(null);
        void fetchRequests();
      } else {
        showFeedback('error', 'Gagal Memperbarui', data.error);
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // Admin delete
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
        showFeedback('success', 'Request Dihapus', data.message);
        setRequestToDelete(null);
        void fetchRequests();
      } else {
        showFeedback('error', 'Gagal Menghapus', data.error);
      }
    } catch {
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // Filter logic
  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.nomorRequest.toLowerCase().includes(q) ||
        r.seksiPemohon.toLowerCase().includes(q) ||
        r.picPemohon.toLowerCase().includes(q) ||
        r.namaBarang.toLowerCase().includes(q)
      );
    });
  }, [requests, filterStatus, search]);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          {isAdmin && (
            <div className="flex items-center gap-2 mb-2 text-xs">
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900">
                Dashboard Request Seksi
              </span>
            </div>
          )}
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <span>Follow-Up Request Antar Seksi</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 max-w-2xl">
            Sistem pengajuan pembuatan atau modifikasi barang ke bengkel produksi & special project
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Tutup Formulir' : 'Ajukan Request'}</span>
          </button>
          <button
            type="button"
            onClick={() => fetchRequests()}
            disabled={loading}
            className="h-8 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* Form Pengajuan Request */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            <span>Form Pengajuan Pembuatan / Modifikasi Barang</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Seksi Pemohon *</label>
              <select
                value={formData.seksiPemohon}
                onChange={e => setFormData(p => ({ ...p, seksiPemohon: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none cursor-pointer"
                required
              >
                <option value="">— Pilih Seksi —</option>
                {DAFTAR_SEKSI_REQUEST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama PIC Pemohon *</label>
              <input
                type="text"
                value={formData.picPemohon}
                onChange={e => setFormData(p => ({ ...p, picPemohon: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                placeholder="Nama lengkap PIC"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">No. Telp / Ext</label>
              <input
                type="text"
                value={formData.kontakPemohon}
                onChange={e => setFormData(p => ({ ...p, kontakPemohon: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                placeholder="Opsional"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Barang / Jig / Troli *</label>
              <input
                type="text"
                value={formData.namaBarang}
                onChange={e => setFormData(p => ({ ...p, namaBarang: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                placeholder="Nama barang yang diminta"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Jumlah & Satuan *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={formData.jumlah}
                  onChange={e => setFormData(p => ({ ...p, jumlah: parseInt(e.target.value) || 1 }))}
                  className="w-24 h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900 tabular-nums"
                  required
                />
                <input
                  type="text"
                  value={formData.satuan}
                  onChange={e => setFormData(p => ({ ...p, satuan: e.target.value }))}
                  className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                  placeholder="pcs / unit"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tingkat Urgensi</label>
              <select
                value={formData.urgensi}
                onChange={e => setFormData(p => ({ ...p, urgensi: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none cursor-pointer"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical (Line Stop)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Spesifikasi / Dimensi / Gambar Acuan</label>
            <textarea
              value={formData.spesifikasi}
              onChange={e => setFormData(p => ({ ...p, spesifikasi: e.target.value }))}
              rows={2}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none text-slate-900"
              placeholder="Jelaskan ukuran (P x L x T), material (besi pipa/plat/hollow), atau fungsi khusus"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Mengirim...' : 'Kirim Request'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['all', 'Diajukan', 'Disetujui', 'Dikerjakan', 'Selesai', 'Ditolak'] as RequestStatus[]).map(st => {
              const isActive = filterStatus === st;
              const count = st === 'all' ? requests.length : requests.filter(r => r.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <span>{st === 'all' ? 'Semua' : st}</span>
                  <span className={`text-[11px] tabular-nums ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nomor, barang, atau seksi..."
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {loading && !requests.length ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center p-6 space-y-2">
              <ClipboardList className="w-8 h-8 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-800">
                {requests.length === 0 ? 'Belum Ada Pengajuan Request' : 'Tidak Ada Request yang Cocok'}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {requests.length === 0
                  ? 'Seksi pabrik belum mengajukan kebutuhan fabrikasi, modifikasi, atau pengadaan barang baru.'
                  : 'Tidak ditemukan request yang cocok dengan filter status atau kata kunci pencarian Anda.'}
              </p>
              {requests.length > 0 ? (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setFilterStatus('all'); }}
                  className="mt-2 h-7 px-3 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-2 h-8 px-3.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Pengajuan Pertama</span>
                </button>
              )}
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="p-4 space-y-2.5 bg-white hover:bg-slate-50/60 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-medium text-slate-900 text-xs tabular-nums">{r.nomorRequest}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5 tabular-nums">• {formatDate(r.waktuDibuat)}</span>
                  </div>
                  <StatusBadgeRequest status={r.status} />
                </div>
                <div className="text-sm font-semibold text-slate-900">{r.namaBarang}</div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.seksiPemohon}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.picPemohon}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span className="tabular-nums">{r.jumlah} {r.satuan}</span>
                  </span>
                  <UrgensiBadge urgensi={r.urgensi} />
                </div>
                {r.spesifikasi && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-medium mr-1">Spesifikasi:</span>
                    <span>{r.spesifikasi}</span>
                  </div>
                )}
                {r.catatanAdmin && (
                  <div className="text-xs text-indigo-800 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                    <span className="font-medium mr-1">Catatan Admin:</span>
                    <span>{r.catatanAdmin}</span>
                  </div>
                )}
                {r.alasanTolak && (
                  <div className="text-xs text-rose-800 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                    <span className="font-medium mr-1">Alasan Tolak:</span>
                    <span>{r.alasanTolak}</span>
                  </div>
                )}
                {(r.picBengkel || r.estimasi) && (
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    {r.picBengkel && <span>PIC: <strong className="text-slate-700 font-medium">{r.picBengkel}</strong></span>}
                    {r.estimasi && <span>Estimasi: <strong className="text-slate-700 font-medium">{r.estimasi}</strong></span>}
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setSelectedRequest(r); setAdminForm({ status: r.status, alasanTolak: r.alasanTolak || '', picBengkel: r.picBengkel || '', estimasi: r.estimasi || '', catatanAdmin: r.catatanAdmin || '' }); }}
                      className="flex-1 h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Kelola</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestToDelete(r)}
                      className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
              <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/80 select-none">
                <th scope="col" className="p-3.5">No. Request</th>
                <th scope="col" className="p-3.5">Tanggal</th>
                <th scope="col" className="p-3.5">Seksi</th>
                <th scope="col" className="p-3.5">PIC</th>
                <th scope="col" className="p-3.5">Nama Barang</th>
                <th scope="col" className="p-3.5">Qty</th>
                <th scope="col" className="p-3.5">Urgensi</th>
                <th scope="col" className="p-3.5">Status</th>
                <th scope="col" className="p-3.5">PIC Bengkel</th>
                {isAdmin && <th scope="col" className="p-3.5 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !requests.length ? (
                <tr><td colSpan={10} className="p-8 text-center text-slate-400 font-medium">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="p-12 text-center">
                    <ClipboardList className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-slate-800 font-semibold text-sm mb-1">
                      {requests.length === 0 ? 'Belum Ada Pengajuan Request' : 'Tidak Ada Request yang Cocok'}
                    </div>
                    <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
                      {requests.length === 0
                        ? 'Seksi pabrik belum mengajukan kebutuhan fabrikasi, modifikasi, atau pengadaan barang baru.'
                        : 'Tidak ditemukan request yang cocok dengan kata kunci atau filter status terpilih.'}
                    </p>
                    {requests.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => { setSearch(''); setFilterStatus('all'); }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filter</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-xs rounded-lg transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Pengajuan Pertama</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-medium text-slate-800 tabular-nums">{r.nomorRequest}</td>
                    <td className="p-3.5 text-slate-500 tabular-nums">{formatDate(r.waktuDibuat)}</td>
                    <td className="p-3.5 font-medium text-slate-800">{r.seksiPemohon}</td>
                    <td className="p-3.5 text-slate-600">{r.picPemohon}</td>
                    <td className="p-3.5 font-semibold text-slate-900 max-w-[200px] truncate" title={r.namaBarang}>{r.namaBarang}</td>
                    <td className="p-3.5 text-slate-700 tabular-nums">{r.jumlah} {r.satuan}</td>
                    <td className="p-3.5"><UrgensiBadge urgensi={r.urgensi} /></td>
                    <td className="p-3.5"><StatusBadgeRequest status={r.status} /></td>
                    <td className="p-3.5 text-slate-600">{r.picBengkel || '-'}</td>
                    {isAdmin && (
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setSelectedRequest(r); setAdminForm({ status: r.status, alasanTolak: r.alasanTolak || '', picBengkel: r.picBengkel || '', estimasi: r.estimasi || '', catatanAdmin: r.catatanAdmin || '' }); }}
                            className="h-7 w-7 bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-200 transition cursor-pointer flex items-center justify-center shadow-2xs"
                            title="Kelola"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRequestToDelete(r)}
                            className="h-7 w-7 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 transition cursor-pointer flex items-center justify-center"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span>Kelola Request: {selectedRequest.nomorRequest}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedRequest.namaBarang} — {selectedRequest.seksiPemohon}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={adminForm.status}
                  onChange={e => setAdminForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none cursor-pointer"
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Alasan Penolakan</label>
                  <textarea
                    value={adminForm.alasanTolak}
                    onChange={e => setAdminForm(p => ({ ...p, alasanTolak: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none text-slate-900"
                    rows={2}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">PIC Bengkel / Teknisi</label>
                <input
                  type="text"
                  value={adminForm.picBengkel}
                  onChange={e => setAdminForm(p => ({ ...p, picBengkel: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                  placeholder="Nama teknisi yang mengerjakan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Estimasi Selesai</label>
                <input
                  type="text"
                  value={adminForm.estimasi}
                  onChange={e => setAdminForm(p => ({ ...p, estimasi: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                  placeholder="Misal: 3 hari kerja"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Catatan Admin</label>
                <textarea
                  value={adminForm.catatanAdmin}
                  onChange={e => setAdminForm(p => ({ ...p, catatanAdmin: e.target.value }))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none text-slate-900"
                  rows={2}
                  placeholder="Catatan internal bengkel"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2 justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!requestToDelete}
        title="Hapus Pengajuan Request"
        message={`Apakah Anda yakin ingin menghapus request "${requestToDelete?.nomorRequest}" (${requestToDelete?.namaBarang}) dari pemohon ${requestToDelete?.picPemohon} - Seksi ${requestToDelete?.seksiPemohon}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pengajuan"
        cancelText="Batal"
        isDestructive={true}
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
