'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import BridgestoneRequestPrintModal, { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';
import EvaluationModal from '@/components/request/EvaluationModal';
import FlowchartTracker from '@/components/request/FlowchartTracker';
import { compressImageFile } from '@/lib/imageCompressor';
import { buildAtasanSeksiEmailContent } from '@/lib/emailTemplates';
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
  BarChart3,
  Search,
  RotateCcw,
  Building2,
  User,
  Package,
  Settings,
  Trash2,
  Save,
  X,
  Printer,
  FileText,
  Upload,
  Check,
  ChevronRight,
  ShieldCheck,
  Mail,
  Copy,
  ExternalLink,
  Share2,
  LayoutDashboard,
} from 'lucide-react';

type FlowchartFilter = 'all' | 'waiting_atasan' | 'workshop' | 'process' | 'pending_material' | 'completed' | 'rejected';

const DAFTAR_SEKSI_REQUEST = [
  'Final Inspection',
  'TBR Produksi',
  'MC/TB Produksi',
  'PSR/AG Produksi',
  'Mixing',
  'Material',
  'Engineering',
  'Quality',
  'PPC',
  'Warehouse',
  'Utility',
  'Lainnya',
];

const DAFTAR_TUJUAN = [
  'Safety',
  'Quality',
  'Peningkatan Produksi',
  'Cost Down',
  'Penambahan Produksi',
  'Lain-lain',
];

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

function RequestTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, currentUser, isLoading: authLoading } = useAuth();

  const [requests, setRequests] = useState<SectionRequestFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFlow, setFilterFlow] = useState<FlowchartFilter>(() => {
    const qStatus = searchParams?.get('status');
    if (qStatus && ['all', 'waiting_atasan', 'workshop', 'process', 'pending_material', 'completed', 'rejected'].includes(qStatus)) {
      return qStatus as FlowchartFilter;
    }
    return 'all';
  });
  const [search, setSearch] = useState('');

  // Sesi guard: jika belum login, arahkan ke login
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login?from=/request/tracking');
    }
  }, [authLoading, currentUser, router]);

  // Form create state
  const [showForm, setShowForm] = useState(() => searchParams?.get('new') === 'true');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nomorRequest: '',
    seksiPemohon: '',
    kodeSeksi: '',
    drafter: '',
    foreman: '',
    namaAtasanSeksi: '',
    emailAtasanSeksi: '',
    emailMentorWorkshop: 'mentor.workshop@bridgestone.com',
    picPemohon: '',
    kontakPemohon: '',
    perihal: '',
    namaMachine: '',
    namaBarang: '',
    tujuan: 'Safety',
    alasan: '',
    urgensi: 'Normal',
    jumlah: 1,
    satuan: 'set',
    keadaanSekarang: '',
    fotoSebelum: '',
    rencanaTindakan: '',
    fotoSesudah: '',
    targetHasil: '',
    penjelasanPelaksanaan: 'Evaluasi, Design, Pembelian Barang',
  });

  const fileInputSebelumRef = useRef<HTMLInputElement>(null);
  const fileInputSesudahRef = useRef<HTMLInputElement>(null);

  // Post Submission Modal (Approval Link Generator)
  const [submittedData, setSubmittedData] = useState<{
    nomorRequest: string;
    perihal: string;
    emailAtasan: string;
    namaAtasan: string;
    approvalLink: string;
    mailtoUrl: string;
  } | null>(null);

  // Print Modal
  const [printModalRequest, setPrintModalRequest] = useState<SectionRequestFull | null>(null);

  // Evaluation / Follow-up Modal (Admin / PIC Workshop)
  const [evalModalRequest, setEvalModalRequest] = useState<SectionRequestFull | null>(null);

  // Share Approval Link Modal
  const [shareApprovalRequest, setShareApprovalRequest] = useState<SectionRequestFull | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Delete Confirmation
  const [requestToDelete, setRequestToDelete] = useState<SectionRequestFull | null>(null);

  // Feedback Modal
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: FeedbackType; title: string; message: string }>({
    isOpen: false, type: 'success', title: '', message: '',
  });

  const showFeedback = (type: FeedbackType, title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  // Escape key listener untuk menutup modal feedback submit & share link
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (submittedData) setSubmittedData(null);
        else if (shareApprovalRequest) setShareApprovalRequest(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submittedData, shareApprovalRequest]);

  // Fetch all requests
  const fetchRequests = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch('/api/section-requests');
      if (res.status === 401) {
        router.replace('/login?from=/request/tracking');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  // Handle Photo Compression & Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'fotoSebelum' | 'fotoSesudah') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 900, 900, 0.75);
      setFormData((p) => ({ ...p, [field]: compressed }));
    } catch (err) {
      console.error('Error compressing image:', err);
      showFeedback('error', 'Gagal Memproses Foto', 'Terjadi kesalahan saat memproses gambar.');
    }
  };

  // Submit new request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seksiPemohon || !formData.drafter || !formData.perihal) {
      showFeedback('error', 'Data Belum Lengkap', 'Mohon lengkapi seksi pemohon, nama pemohon, dan perihal request.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          drafter: formData.drafter,
          foreman: formData.foreman || formData.namaAtasanSeksi,
          picPemohon: formData.drafter,
        }),
      });

      if (res.status === 401) {
        router.replace('/login?from=/request/tracking');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        showFeedback('error', 'Gagal Mengirim Request', data.error || 'Terjadi kesalahan saat menyimpan formulir.');
        return;
      }

      showFeedback('success', 'Request Berhasil Dikirim', `Nomor Request: ${data.request?.nomorRequest || 'Tersimpan'}`);

      // Reset form
      setFormData({
        nomorRequest: '',
        seksiPemohon: '',
        kodeSeksi: '',
        drafter: '',
        foreman: '',
        namaAtasanSeksi: '',
        emailAtasanSeksi: '',
        emailMentorWorkshop: 'mentor.workshop@bridgestone.com',
        picPemohon: '',
        kontakPemohon: '',
        perihal: '',
        namaMachine: '',
        namaBarang: '',
        tujuan: 'Safety',
        alasan: '',
        urgensi: 'Normal',
        jumlah: 1,
        satuan: 'set',
        keadaanSekarang: '',
        fotoSebelum: '',
        rencanaTindakan: '',
        fotoSesudah: '',
        targetHasil: '',
        penjelasanPelaksanaan: 'Evaluasi, Design, Pembelian Barang',
      });
      setShowForm(false);
      void fetchRequests();

      // Show post-submission modal with approval link
      if (data.approvalLink) {
        const mailto = buildAtasanSeksiEmailContent({
          nomorRequest: data.request?.nomorRequest || 'REQUEST-BARU',
          seksiPemohon: data.request?.seksiPemohon || '',
          perihal: data.request?.perihal || data.request?.namaBarang || '',
          picPemohon: data.request?.drafter || data.request?.picPemohon || '',
          namaAtasan: data.request?.namaAtasanSeksi || data.request?.foreman || 'Bapak/Ibu',
          approvalLink: data.approvalLink,
        });

        setSubmittedData({
          nomorRequest: data.request?.nomorRequest || '',
          perihal: data.request?.perihal || data.request?.namaBarang || '',
          emailAtasan: data.request?.emailAtasanSeksi || '',
          namaAtasan: data.request?.namaAtasanSeksi || data.request?.foreman || 'Atasan Seksi',
          approvalLink: data.approvalLink,
          mailtoUrl: mailto.mailtoUrl,
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      showFeedback('error', 'Kesalahan Jaringan', 'Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Request
  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      const res = await fetch(`/api/section-requests?id=${requestToDelete.id}`, { method: 'DELETE' });
      if (res.status === 401) {
        router.replace('/login?from=/request/tracking');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        showFeedback('error', 'Gagal Menghapus', data.error || 'Terjadi kesalahan.');
        return;
      }
      showFeedback('success', 'Berhasil Dihapus', `Request ${requestToDelete.nomorRequest} berhasil dihapus.`);
      setRequestToDelete(null);
      void fetchRequests();
    } catch {
      showFeedback('error', 'Kesalahan Jaringan', 'Gagal menghapus data request.');
    }
  };

  // Filter List Requests
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      // 1. Flowchart filter tab
      if (filterFlow === 'waiting_atasan') {
        if (r.statusApprovalAtasanSeksi === 'APPROVED' || r.statusApprovalAtasanSeksi === 'REJECTED') return false;
      } else if (filterFlow === 'workshop') {
        if (r.flowStep !== 'STEP_3_EVALUASI_PIC_WORKSHOP' && r.flowStep !== 'STEP_4_ASSIGN_SPECIAL_PROJECT') return false;
      } else if (filterFlow === 'process') {
        if (r.flowStep !== 'STEP_5_PENGERJAAN' && r.flowStep !== 'STEP_6_VERIFIKASI_SELESAI') return false;
      } else if (filterFlow === 'pending_material') {
        if (!r.status?.toLowerCase().includes('material habis')) return false;
      } else if (filterFlow === 'completed') {
        if (r.flowStep !== 'STEP_8_SELESAI' && r.status !== 'Selesai') return false;
      } else if (filterFlow === 'rejected') {
        if (r.statusApprovalAtasanSeksi !== 'REJECTED' && r.flowStep !== 'STEP_REJECTED') return false;
      }

      // 2. Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNo = r.nomorRequest?.toLowerCase().includes(q);
        const matchPerihal = r.perihal?.toLowerCase().includes(q);
        const matchBarang = r.namaBarang?.toLowerCase().includes(q);
        const matchMesin = r.namaMachine?.toLowerCase().includes(q);
        const matchSeksi = r.seksiPemohon?.toLowerCase().includes(q);
        const matchPIC = r.picPemohon?.toLowerCase().includes(q);
        if (!matchNo && !matchPerihal && !matchBarang && !matchMesin && !matchSeksi && !matchPIC) return false;
      }

      return true;
    });
  }, [requests, filterFlow, search]);

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-5">
      {/* 1. Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
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
                Alur Follow-Up Request Antar Seksi
              </span>
            </div>
          )}
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-600" />
            <span>Alur Pelacakan Request Antar Seksi (Form ENG-KP-011)</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 max-w-2xl">
            Alur pengajuan dan approval terpadu dari pengisian PIC Seksi, persetujuan atasan, evaluasi workshop, hingga monitoring pengerjaan unit selesai.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Tutup Formulir' : 'Input Form Request Baru'}</span>
          </button>
          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={loading}
            className="h-8 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs (Pills: Dashboard vs Tracking) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pt-1">
        <Link
          href="/request"
          className="pb-2.5 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 border-b-2 border-transparent"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard Analitik Request</span>
        </Link>
        <div className="pb-2.5 px-3 text-xs font-bold text-red-600 border-b-2 border-red-600 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Daftar Pelacakan & Antrean ({requests.length})</span>
        </div>
      </div>

      {/* 3. SOP Workflow Flowchart Overview Banner */}
      <FlowchartTracker />

      {/* 4. Formulir Input Request Baru (ENG-KP-011) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 sm:p-6 space-y-4 animate-scale-up">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                <span>Formulir Permohonan Pekerjaan Antar Seksi (ENG-KP-011)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Format resmi Special Project & Maintenance Bengkel PT Bridgestone Tire Indonesia
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-xs font-semibold text-slate-700">
                Langkah 1 Flowchart: Pengisian data permohonan oleh PIC Pemohon
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Seksi Pemohon *</label>
                <select
                  value={formData.seksiPemohon}
                  onChange={(e) => setFormData((p) => ({ ...p, seksiPemohon: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
                  required
                >
                  <option value="">Pilih Seksi...</option>
                  {DAFTAR_SEKSI_REQUEST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kode Seksi / Dept</label>
                <input
                  type="text"
                  value={formData.kodeSeksi}
                  onChange={(e) => setFormData((p) => ({ ...p, kodeSeksi: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  placeholder="Mis: 3122"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama PIC Pemohon (Drafter) *</label>
                <input
                  type="text"
                  value={formData.drafter}
                  onChange={(e) => setFormData((p) => ({ ...p, drafter: e.target.value, picPemohon: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  placeholder="Nama pembuat request (Osep M)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Telp. (Extension)</label>
                <input
                  type="text"
                  value={formData.kontakPemohon}
                  onChange={(e) => setFormData((p) => ({ ...p, kontakPemohon: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  placeholder="Mis: 178"
                />
              </div>
            </div>

            {/* Email Atasan Seksi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-red-600" />
                  <span>Nama Atasan Seksi (Foreman / K.Sie)</span>
                </label>
                <input
                  type="text"
                  value={formData.namaAtasanSeksi}
                  onChange={(e) => setFormData((p) => ({ ...p, namaAtasanSeksi: e.target.value, foreman: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  placeholder="Mis: Bpk. Budi Santoso"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  <span>Email Atasan Seksi (Untuk Kirim Tautan Persetujuan) *</span>
                </label>
                <input
                  type="email"
                  value={formData.emailAtasanSeksi}
                  onChange={(e) => setFormData((p) => ({ ...p, emailAtasanSeksi: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  placeholder="atasan.seksi@bridgestone.com"
                  required
                />
              </div>
            </div>

            {/* Detail Pekerjaan */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-200">
              <div className="sm:col-span-8">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Perihal Permohonan / Uraian Singkat *
                </label>
                <input
                  type="text"
                  value={formData.perihal}
                  onChange={(e) => setFormData((p) => ({ ...p, perihal: e.target.value, namaBarang: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none font-medium"
                  placeholder="Contoh: Pembuatan Stopper Material Calender"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Machine / No. Mesin
                </label>
                <input
                  type="text"
                  value={formData.namaMachine}
                  onChange={(e) => setFormData((p) => ({ ...p, namaMachine: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  placeholder="Mis: CALENDER-02 / B-01"
                />
              </div>
            </div>

            {/* Urgensi & Tujuan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tingkat Urgensi</label>
                <select
                  value={formData.urgensi}
                  onChange={(e) => setFormData((p) => ({ ...p, urgensi: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
                >
                  <option value="Normal">Normal (Reguler)</option>
                  <option value="Urgent">Urgent (Segera)</option>
                  <option value="Critical">Critical (Stop Produksi/Safety)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tujuan Pekerjaan</label>
                <select
                  value={formData.tujuan}
                  onChange={(e) => setFormData((p) => ({ ...p, tujuan: e.target.value }))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
                >
                  {DAFTAR_TUJUAN.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) => setFormData((p) => ({ ...p, jumlah: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.satuan}
                    onChange={(e) => setFormData((p) => ({ ...p, satuan: e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                    placeholder="pcs / unit / set"
                  />
                </div>
              </div>
            </div>

            {/* Foto Sebelum & Sesudah */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">Keadaan Sekarang (Problem / Kondisi Aktual)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Foto Before</span>
                </div>
                <textarea
                  value={formData.keadaanSekarang}
                  onChange={(e) => setFormData((p) => ({ ...p, keadaanSekarang: e.target.value, alasan: e.target.value }))}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none resize-none leading-relaxed"
                  placeholder="Jelaskan kendala posisi saat ini, potensi bahaya, atau bottleneck..."
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputSebelumRef}
                  onChange={(e) => handlePhotoUpload(e, 'fotoSebelum')}
                  className="hidden"
                />
                {formData.fotoSebelum ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.fotoSebelum} alt="Before" className="w-full h-40 object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, fotoSebelum: '' }))}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md text-xs hover:bg-rose-700 transition shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputSebelumRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-red-600 transition cursor-pointer bg-white"
                  >
                    <Upload className="w-4 h-4 mb-0.5 text-slate-400" />
                    <span className="text-xs font-medium">Upload Foto Keadaan Sekarang</span>
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">Rencana Tindakan (Yang Diminta)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Foto After / Plan</span>
                </div>
                <textarea
                  value={formData.rencanaTindakan}
                  onChange={(e) => setFormData((p) => ({ ...p, rencanaTindakan: e.target.value }))}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none resize-none leading-relaxed"
                  placeholder="Jelaskan rencana pemindahan posisi atau modifikasi..."
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputSesudahRef}
                  onChange={(e) => handlePhotoUpload(e, 'fotoSesudah')}
                  className="hidden"
                />
                {formData.fotoSesudah ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.fotoSesudah} alt="After" className="w-full h-40 object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, fotoSesudah: '' }))}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md text-xs hover:bg-rose-700 transition shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputSesudahRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-red-600 transition cursor-pointer bg-white"
                  >
                    <Upload className="w-4 h-4 mb-0.5 text-slate-400" />
                    <span className="text-xs font-medium">Upload Foto Rencana Tindakan</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Mengirim Formulir...' : 'Kirim Formulir ke Atasan Seksi'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. Modal Link Approval Setelah Submit */}
      {submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Formulir Request Berhasil Dikirim!</h3>
                <p className="text-xs text-slate-500">
                  No. Request: <strong className="font-mono text-slate-800">{submittedData.nomorRequest}</strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                Tautan persetujuan tanda tangan (assign) telah dibuat untuk Atasan Seksi ({submittedData.namaAtasan || submittedData.emailAtasan}):
              </p>
              <div className="p-2 bg-white rounded-lg border border-slate-300 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-700 truncate select-all">
                  {submittedData.approvalLink}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submittedData.approvalLink)}
                  className="shrink-0 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2 border-t border-slate-100">
              <a
                href={submittedData.mailtoUrl}
                className="w-full sm:w-auto h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Buka Email (mailto:)</span>
              </a>
              <a
                href={submittedData.approvalLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Link Approval</span>
              </a>
              <button
                type="button"
                onClick={() => setSubmittedData(null)}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0 h-9 sm:h-8 px-4 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-medium text-xs rounded-lg transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Filter Tabs & Search Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Semua Request' },
              { id: 'waiting_atasan', label: 'Menunggu Assign Atasan' },
              { id: 'workshop', label: 'Diterima Workshop' },
              { id: 'process', label: 'Dalam Pengerjaan' },
              { id: 'pending_material', label: 'Pending Material' },
              { id: 'completed', label: 'Selesai' },
              { id: 'rejected', label: 'Ditolak' },
            ].map((tab) => {
              const isActive = filterFlow === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterFlow(tab.id as FlowchartFilter)}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor, perihal, mesin, seksi..."
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Mobile View: Cards */}
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
              <p className="text-xs font-semibold text-slate-800">Tidak Ada Request yang Cocok</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Silakan ubah filter tab atau buat permohonan request baru.
              </p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/60 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">{r.nomorRequest}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5 tabular-nums">• {formatDate(r.waktuDibuat)}</span>
                  </div>
                  <FlowchartTracker currentStep={r.flowStep} isCompact />
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {r.perihal || r.namaBarang}
                  </div>
                  {r.namaMachine && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      Mesin: <span className="font-medium text-slate-700">{r.namaMachine}</span>
                    </div>
                  )}
                </div>

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
                  <UrgensiBadge urgensi={r.urgensi} />
                </div>

                {/* Status Approval Atasan Seksi */}
                <div className="pt-1">
                  {r.statusApprovalAtasanSeksi === 'APPROVED' ? (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Disetujui Foreman: <strong>{r.foreman || r.namaAtasanSeksi}</strong></span>
                    </div>
                  ) : r.statusApprovalAtasanSeksi === 'REJECTED' ? (
                    <div className="text-[11px] text-rose-800 bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1.5 font-medium">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Ditolak Atasan: <strong>{r.alasanTolak || '-'}</strong></span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Menunggu persetujuan atasan ({r.emailAtasanSeksi || 'Atasan Seksi'})</span>
                      </span>
                      {r.approvalToken && (
                        <button
                          type="button"
                          onClick={() => setShareApprovalRequest(r)}
                          className="text-[10px] text-red-600 underline font-bold cursor-pointer"
                        >
                          Link Assign
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPrintModalRequest(r)}
                    className="flex-1 h-8 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cetak Form (ENG-KP-011)</span>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setEvalModalRequest(r)}
                      className="h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Evaluasi</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/80 select-none">
                <th scope="col" className="p-3.5">No. Request</th>
                <th scope="col" className="p-3.5">Tanggal</th>
                <th scope="col" className="p-3.5">Seksi / PIC</th>
                <th scope="col" className="p-3.5">Perihal / Mesin</th>
                <th scope="col" className="p-3.5">Status Flowchart</th>
                <th scope="col" className="p-3.5">Assign Atasan Seksi</th>
                <th scope="col" className="p-3.5 text-center">Formulir Cetak</th>
                {isAdmin && <th scope="col" className="p-3.5 text-center">Kelola Alur</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !requests.length ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="p-8 text-center text-slate-500 font-medium">
                    Memuat data request seksi...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="p-12 text-center">
                    <ClipboardList className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <div className="text-slate-800 font-semibold text-sm mb-1">
                      Tidak Ada Request yang Cocok
                    </div>
                    <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
                      Tidak ditemukan permohonan request pada kriteria filter terpilih.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFilterFlow('all')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filter</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-800 tabular-nums">
                      {r.nomorRequest}
                    </td>
                    <td className="p-3.5 text-slate-500 tabular-nums">{formatDate(r.waktuDibuat)}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{r.seksiPemohon}</div>
                      <div className="text-[11px] text-slate-500">PIC: {r.drafter || r.picPemohon}</div>
                    </td>
                    <td className="p-3.5 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate" title={r.perihal || r.namaBarang}>
                        {r.perihal || r.namaBarang}
                      </div>
                      {r.namaMachine && (
                        <div className="text-[11px] text-slate-500 truncate" title={r.namaMachine}>
                          {r.namaMachine}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <FlowchartTracker currentStep={r.flowStep} isCompact />
                      {r.status?.toLowerCase().includes('material habis') && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>Pending Material</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      {r.statusApprovalAtasanSeksi === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Foreman: {r.foreman || r.namaAtasanSeksi}</span>
                        </span>
                      ) : r.statusApprovalAtasanSeksi === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Ditolak Atasan</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu Assign</span>
                          </span>
                          {r.approvalToken && (
                            <button
                              type="button"
                              onClick={() => setShareApprovalRequest(r)}
                              className="p-1 rounded hover:bg-slate-200 text-red-600 transition cursor-pointer"
                              title="Salin / Buka Link Approval Atasan"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setPrintModalRequest(r)}
                        className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md border border-slate-300 transition cursor-pointer shadow-2xs"
                        title="Pratinjau & Cetak Dokumen ENG-KP-011"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cetak Form</span>
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEvalModalRequest(r)}
                            className="h-7 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold shadow-2xs"
                            title="Evaluasi Pekerjaan & Follow-up Flowchart"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Evaluasi</span>
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

      {/* 7. Modal Share Approval Link */}
      {shareApprovalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-3.5 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-red-600" />
                <span>Link Persetujuan Atasan Seksi</span>
              </h3>
              <button
                type="button"
                onClick={() => setShareApprovalRequest(null)}
                className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-8 sm:h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                aria-label="Tutup modal share approval"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Kirimkan link ini ke atasan seksi (<strong>{shareApprovalRequest.emailAtasanSeksi || 'Atasan'}</strong>) agar dapat meninjau dan menandatangani formulir permohonan <strong>{shareApprovalRequest.nomorRequest}</strong>:
            </p>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-800 truncate select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/request/approval?token=${shareApprovalRequest.approvalToken}` : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/request/approval?token=${shareApprovalRequest.approvalToken}`;
                  copyToClipboard(url);
                }}
                className="shrink-0 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <a
                href={`/request/approval?token=${shareApprovalRequest.approvalToken}`}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Link Sekarang</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8. Print Modal */}
      <BridgestoneRequestPrintModal
        isOpen={!!printModalRequest}
        requestData={printModalRequest}
        onClose={() => setPrintModalRequest(null)}
      />

      {/* 9. Evaluation Modal */}
      <EvaluationModal
        isOpen={!!evalModalRequest}
        requestData={evalModalRequest}
        onClose={() => setEvalModalRequest(null)}
        onSuccess={() => {
          showFeedback('success', 'Alur Flowchart Diperbarui', 'Data evaluasi & status pengerjaan bengkel berhasil diperbarui.');
          void fetchRequests();
        }}
      />

      {/* 10. Delete Confirmation */}
      <ConfirmModal
        isOpen={!!requestToDelete}
        title="Hapus Pengajuan Request"
        message={`Apakah Anda yakin ingin menghapus request "${requestToDelete?.nomorRequest}" (${requestToDelete?.perihal || requestToDelete?.namaBarang})?`}
        confirmText="Hapus Pengajuan"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setRequestToDelete(null)}
      />

      {/* 11. Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}

export default function RequestTrackingPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
        <span>Memuat pelacakan request seksi...</span>
      </div>
    }>
      <RequestTrackingContent />
    </Suspense>
  );
}
