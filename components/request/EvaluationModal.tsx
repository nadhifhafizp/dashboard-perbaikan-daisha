'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Shield,
  Check,
  Ban,
  ArrowRight,
  Send,
  Boxes,
  Users,
  Timer,
  Hammer,
  Mail,
  Plus,
  Trash2,
  PauseCircle,
  PlayCircle,
  Package,
  Layers,
  FileText,
  DollarSign,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SectionRequestFull } from './BridgestoneRequestPrintModal';
import FlowchartTracker from './FlowchartTracker';
import { FlowStepCode } from '@/lib/workflowConstants';

interface SparepartOption {
  id?: number | string;
  namaKomponen: string;
  kategori: string;
  stokGudang: number;
  satuan: string;
  lokasi?: string;
}

function normalizeMaterialsClient(raw: unknown): Array<{
  id: number;
  namaKomponen: string;
  qty: number;
  keterangan?: string;
}> {
  if (!raw) return [];
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  const result: any[] = [];
  for (const item of parsed) {
    if (!item) continue;
    if (typeof item === 'string') {
      try {
        const inner = JSON.parse(item);
        if (Array.isArray(inner)) {
          result.push(...inner);
        } else if (inner && typeof inner === 'object') {
          result.push(inner);
        }
      } catch {
        // ignore
      }
    } else if (typeof item === 'object') {
      result.push(item);
    }
  }
  return result
    .filter((m) => m && (m.namaKomponen || m.id))
    .map((m) => ({
      id: Number(m.id) || Date.now(),
      namaKomponen: String(m.namaKomponen || ''),
      qty: Number(m.qty) || 1,
      keterangan: m.keterangan || undefined,
    }));
}

interface EvaluationModalProps {
  isOpen: boolean;
  requestData: SectionRequestFull | null;
  onClose: () => void;
  onSuccess: () => void;
}

type TabKey = 'evaluasi' | 'materials' | 'pengerjaan' | 'penyelesaian';

export default function EvaluationModal({
  isOpen,
  requestData,
  onClose,
  onSuccess,
}: EvaluationModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('evaluasi');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    status: 'Diajukan',
    flowStep: 'STEP_4_EVALUASI_WORKSHOP',
    alasanTolak: '',
    alasanPending: '',
    picBengkel: '',
    estimasi: '',
    catatanAdmin: '',
    // Evaluasi 4 Aspek Flowchart
    waktuEstimate: '',
    waktuActual: '',
    orangJamEstimate: '',
    orangJamActual: '',
    kebutuhanSparepart: '',
    kebutuhanMaterial: '',
    biayaEstimate: '',
    biayaActual: '',
    tglPelaksanaanEstimate: '',
    tglPelaksanaanActual: '',
    komentarEstimate: '',
    komentarActual: '',
    keputusan: 'GO',
    keputusan8210: '',
    keputusan820: '',
    hasilCheck: '',
    hasilCheckPemohon: '',
    schedulePlanning: '',
    scheduleActual: '',
  });

  // Material & Sparepart States (Stok Gudang Live)
  const [sparepartsCatalog, setSparepartsCatalog] = useState<SparepartOption[]>([]);
  const [selectedSparepart, setSelectedSparepart] = useState('');
  const [materialQty, setMaterialQty] = useState<number>(1);
  const [materialKeterangan, setMaterialKeterangan] = useState('');
  const [materialsList, setMaterialsList] = useState<Array<{ id: number; namaKomponen: string; qty: number; keterangan?: string }>>([]);
  const [materialLoading, setMaterialLoading] = useState(false);

  // Dialog Pending Material
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [alasanPendingInput, setAlasanPendingInput] = useState('');

  // Notification success banner
  const [notifSuccessData, setNotifSuccessData] = useState<{
    message: string;
    emailData?: { toEmail?: string; subject: string; bodyText: string; mailtoUrl: string };
  } | null>(null);

  // Fetch spareparts catalog when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCatalog = async () => {
        try {
          const res = await fetch('/api/spareparts');
          if (res.status === 401) {
            handleUnauthorized();
            return;
          }
          const data = await res.json();
          if (res.ok && data.success) {
            setSparepartsCatalog(data.spareparts || []);
          }
        } catch {
          // ignore
        }
      };
      void fetchCatalog();
    }
  }, [isOpen]);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading && !materialLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, materialLoading, onClose]);

  useEffect(() => {
    if (requestData) {
      setFormData({
        status: requestData.status || 'Diajukan',
        flowStep: requestData.flowStep || 'STEP_4_EVALUASI_WORKSHOP',
        alasanTolak: requestData.alasanTolak || '',
        alasanPending: requestData.alasanPending || '',
        picBengkel: requestData.picBengkel || '',
        estimasi: requestData.estimasi || '',
        catatanAdmin: requestData.catatanAdmin || '',
        waktuEstimate: requestData.waktuEstimate || '',
        waktuActual: requestData.waktuActual || '',
        orangJamEstimate: requestData.orangJamEstimate || '',
        orangJamActual: requestData.orangJamActual || '',
        kebutuhanSparepart: requestData.kebutuhanSparepart || '',
        kebutuhanMaterial: requestData.kebutuhanMaterial || '',
        biayaEstimate: requestData.biayaEstimate || '',
        biayaActual: requestData.biayaActual || '',
        tglPelaksanaanEstimate: requestData.tglPelaksanaanEstimate || '',
        tglPelaksanaanActual: requestData.tglPelaksanaanActual || '',
        komentarEstimate: requestData.komentarEstimate || '',
        komentarActual: requestData.komentarActual || '',
        keputusan: requestData.keputusan || 'GO',
        keputusan8210: requestData.keputusan8210 || '',
        keputusan820: requestData.keputusan820 || '',
        hasilCheck: requestData.hasilCheck || '',
        hasilCheckPemohon: requestData.hasilCheckPemohon || '',
        schedulePlanning: requestData.schedulePlanning || '',
        scheduleActual: requestData.scheduleActual || '',
      });

      setMaterialsList(normalizeMaterialsClient(requestData.materials));
      setErrorMsg('');
      setNotifSuccessData(null);
      setShowPendingDialog(false);

      // Auto-focus relevant tab based on status
      if (requestData.status?.includes('Material Habis') || requestData.status === 'Dikerjakan') {
        setActiveTab('pengerjaan');
      } else if (requestData.status === 'Pekerjaan Fisik Selesai' || requestData.status === 'Selesai') {
        setActiveTab('penyelesaian');
      } else {
        setActiveTab('evaluasi');
      }
    }
  }, [requestData]);

  if (!isOpen || !requestData) return null;

  const currentStep = (formData.flowStep || 'STEP_4_EVALUASI_WORKSHOP') as FlowStepCode;
  const isPendingMaterial = formData.status?.toLowerCase().includes('material habis');

  const handleUnauthorized = () => {
    setErrorMsg('Sesi login telah kedaluwarsa atau Anda belum login. Mengarahkan ke halaman login...');
    setTimeout(() => {
      window.location.href = '/login?from=/request';
    }, 1500);
  };

  // Generic Save Action
  const handleSaveAction = async (customAction?: string, customUpdates?: Record<string, any>) => {
    setLoading(true);
    setErrorMsg('');

    const payload = {
      action: customAction || 'EVALUASI_WORKSHOP',
      id: requestData.id,
      ...formData,
      ...(customUpdates || {}),
    };

    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        if (customUpdates) {
          setFormData((p) => ({ ...p, ...customUpdates }));
        }
        if (data.atasanSProjectEmail) {
          setNotifSuccessData({
            message: data.message,
            emailData: data.atasanSProjectEmail,
          });
          onSuccess();
        } else {
          onSuccess();
          if (customAction === 'FINISH_REQUEST') {
            onClose();
          }
        }
      } else {
        setErrorMsg(data.error || 'Gagal memperbarui data request.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Aksi Keputusan: Tolak
  const handleDecisionTolak = () => {
    if (!formData.alasanTolak.trim()) {
      alert('Mohon isi Alasan Penolakan sebelum menetapkan Tolak.');
      return;
    }
    void handleSaveAction('EVALUASI_WORKSHOP', {
      keputusan: 'REJECT',
      status: 'Ditolak',
      flowStep: 'STEP_5_DITOLAK',
    });
  };

  // 2. Aksi Keputusan: Lanjut (Kirim ke S.Project)
  const handleDecisionLanjut = () => {
    void handleSaveAction('EVALUASI_WORKSHOP', {
      keputusan: 'GO',
      status: 'Pending: Menunggu Assign S.Project',
      flowStep: 'STEP_5_MENUNGGU_ATASAN_SPROJECT',
    });
  };

  // 3. Persetujuan Atasan S.Project -> Otomatis status langsung 'Dikerjakan' (Dalam Pengerjaan)
  const handleAssignAtasanSpecialProject = () => {
    void handleSaveAction('EVALUASI_WORKSHOP', {
      assignAtasanSpecialProject: true,
      keputusan8210: formData.keputusan8210 || 'Eng 8210',
      keputusan820: formData.keputusan820 || 'Mgr 820',
      status: 'Dikerjakan', // OTOMATIS LANGSUNG MASUK PROSES PENGERJAAN
      flowStep: 'STEP_6_DALAM_PENGERJAAN',
    });
  };

  // 4. Update Status Pending Material (Tunda Pengerjaan)
  const handleSetPendingMaterial = async () => {
    if (!alasanPendingInput.trim()) {
      alert('Mohon tulis alasan material/sparepart yang habis.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_PENDING_MATERIAL',
          id: requestData.id,
          alasan: alasanPendingInput.trim(),
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setFormData((p) => ({
          ...p,
          status: 'Pending: Material Habis',
          alasanPending: alasanPendingInput.trim(),
        }));
        setShowPendingDialog(false);
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Gagal mengubah status pending.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Lanjutkan Pengerjaan (Material Tersedia)
  const handleResumeProgress = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESUME_PROGRESS',
          id: requestData.id,
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setFormData((p) => ({
          ...p,
          status: 'Dikerjakan',
          alasanPending: '',
        }));
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Gagal melanjutkan pengerjaan.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Operator Fisik Selesai
  const handleOperatorSelesai = () => {
    void handleSaveAction('EVALUASI_WORKSHOP', {
      status: 'Pekerjaan Fisik Selesai',
      flowStep: 'STEP_7_PEKERJAAN_SELESAI',
    });
    setActiveTab('penyelesaian');
  };

  // 7. Selesaikan & Informasikan ke Seksi
  const handleFinalFinish = () => {
    void handleSaveAction('FINISH_REQUEST', {
      status: 'Selesai',
      flowStep: 'STEP_8_SELESAI',
    });
  };

  // 8. Tambah Pemakaian Sparepart (Otomatis Potong Stok)
  const handleAddMaterial = async () => {
    if (!selectedSparepart || materialQty < 1) {
      alert('Pilih sparepart dan tentukan kuantitas.');
      return;
    }

    const itemGudang = sparepartsCatalog.find((s) => s.namaKomponen === selectedKomponen);
    if (itemGudang && itemGudang.stokGudang < materialQty) {
      alert(`Stok gudang tidak mencukupi! Sisa stok "${itemGudang.namaKomponen}" hanya ${itemGudang.stokGudang} ${itemGudang.satuan}.`);
      return;
    }

    setMaterialLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MATERIAL',
          sectionRequestId: requestData.id,
          namaKomponen: selectedSparepart,
          qty: materialQty,
          keterangan: materialKeterangan,
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMaterialsList(normalizeMaterialsClient(data.materials));
        setSelectedSparepart('');
        setMaterialQty(1);
        setMaterialKeterangan('');
        // Re-fetch catalog to refresh live stocks
        const catRes = await fetch('/api/spareparts');
        const catData = await catRes.json();
        if (catRes.ok && catData.success) {
          setSparepartsCatalog(catData.spareparts || []);
        }
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Gagal memotong stok material.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server saat menambah material.');
    } finally {
      setMaterialLoading(false);
    }
  };

  // 9. Batalkan Pemakaian Sparepart (Kembalikan Stok)
  const handleRemoveMaterial = async (matId?: number, namaKomponen?: string) => {
    if (!confirm('Yakin ingin membatalkan pemakaian komponen ini? Stok akan otomatis dikembalikan ke gudang.')) {
      return;
    }
    setMaterialLoading(true);
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_MATERIAL',
          sectionRequestId: requestData.id,
          materialId: matId,
          namaKomponen: namaKomponen,
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMaterialsList(normalizeMaterialsClient(data.materials));
        // Re-fetch catalog
        const catRes = await fetch('/api/spareparts');
        const catData = await catRes.json();
        if (catRes.ok && catData.success) {
          setSparepartsCatalog(catData.spareparts || []);
        }
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Gagal membatalkan material.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server saat membatalkan material.');
    } finally {
      setMaterialLoading(false);
    }
  };

  const selectedKomponen = selectedSparepart;
  const currentKomponenDetail = sparepartsCatalog.find((s) => s.namaKomponen === selectedKomponen);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-red-600" />
                <span>Panel Evaluasi & Workshop</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                {requestData.nomorRequest}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isPendingMaterial
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : formData.status === 'Dikerjakan'
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                    : formData.status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                Status: {formData.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
              <strong>{requestData.seksiPemohon}</strong> • {requestData.perihal || requestData.namaBarang} (Drafter: {requestData.picPemohon || '-'})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition flex items-center justify-center cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel tabs navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-5 overflow-x-auto shrink-0 divide-x divide-transparent">
          <button
            type="button"
            onClick={() => setActiveTab('evaluasi')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'evaluasi'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>1. Evaluasi & Keputusan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'materials'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>2. Sparepart & Material</span>
            {materialsList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center">
                {materialsList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pengerjaan')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'pengerjaan'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>3. Status Pengerjaan & Pending</span>
            {isPendingMaterial && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('penyelesaian')}
            className={`py-2.5 px-3.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'penyelesaian'
                ? 'border-red-600 text-red-700 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4. Hasil Check & Selesai</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alert Notifikasi Sukses ke S.Project */}
          {notifSuccessData && (
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 space-y-2 animate-scale-up">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{notifSuccessData.message}</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Notifikasi otomatis telah dikirimkan ke <strong>Atasan Special Project (8210 / 820)</strong> via sistem dan email default ({notifSuccessData.emailData?.toEmail}).
              </p>
              {notifSuccessData.emailData && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={notifSuccessData.emailData.mailtoUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Buka Email ke Atasan Special Project</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setNotifSuccessData(null)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    Tutup Pesan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tracker Alur Flowchart */}
          <FlowchartTracker currentStep={currentStep} />

          {/* Panel 1: Evaluasi & Keputusan Workshop */}
          {activeTab === 'evaluasi' && (
            <div className="space-y-4 animate-fade-in">
              {/* Ringkasan Permohonan Pemohon */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium block">Perihal / Mesin:</span>
                  <span className="font-semibold text-slate-800">{requestData.perihal || requestData.namaBarang} ({requestData.namaMachine || '-'})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Alasan Permohonan:</span>
                  <span className="text-slate-800">{requestData.alasan || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Tujuan & Qty:</span>
                  <span className="font-semibold text-slate-800">{requestData.tujuan || 'Safety'} • {requestData.jumlah || 1} {requestData.satuan || 'Set'}</span>
                </div>
              </div>

              {/* Form Input Evaluasi (Waktu, Man Power, Biaya) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>1. Estimasi Waktu</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Planning (Hari / Tanggal)</label>
                    <input
                      type="text"
                      placeholder="Mis: 3 Hari Kerja"
                      value={formData.waktuEstimate}
                      onChange={(e) => setFormData((p) => ({ ...p, waktuEstimate: e.target.value }))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Realisasi (Actual)</label>
                    <input
                      type="text"
                      placeholder="Mis: 2.5 Hari Kerja"
                      value={formData.waktuActual}
                      onChange={(e) => setFormData((p) => ({ ...p, waktuActual: e.target.value }))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>2. Men Power (Orang/Jam)</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Estimasi Man-hours</label>
                    <input
                      type="text"
                      placeholder="Mis: 2 Orang / 4 Jam"
                      value={formData.orangJamEstimate}
                      onChange={(e) => setFormData((p) => ({ ...p, orangJamEstimate: e.target.value }))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Realisasi Man-hours</label>
                    <input
                      type="text"
                      placeholder="Mis: 2 Orang / 3.5 Jam"
                      value={formData.orangJamActual}
                      onChange={(e) => setFormData((p) => ({ ...p, orangJamActual: e.target.value }))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Estimasi Biaya (Rp)</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Estimasi Biaya</label>
                    <input
                      type="text"
                      placeholder="Mis: Rp 250.000"
                      value={formData.biayaEstimate}
                      onChange={(e) => setFormData((p) => ({ ...p, biayaEstimate: e.target.value }))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Realisasi Biaya</label>
                    <input
                      type="text"
                      placeholder="Mis: Rp 210.000"
                      value={formData.biayaActual}
                      onChange={(e) => setFormData((p) => ({ ...p, biayaActual: e.target.value }))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Box: Keputusan Pekerjaan (Lanjut atau Tolak) */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-red-600" />
                    <span>Keputusan Evaluasi PIC Workshop</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Kirim notifikasi otomatis ke Atasan Special Project
                  </span>
                </div>

                {/* Input Alasan Tolak */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Alasan Penolakan (Hanya diisi jika menetapkan TOLAK):
                  </label>
                  <input
                    type="text"
                    value={formData.alasanTolak}
                    onChange={(e) => setFormData((p) => ({ ...p, alasanTolak: e.target.value }))}
                    placeholder="Contoh: Keterbatasan mesin bubut workshop / spesifikasi di luar wewenang bengkel"
                    className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDecisionLanjut}
                    disabled={loading}
                    className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Lanjut (Workshop Menyetujui & Kirim ke S.Project)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDecisionTolak}
                    disabled={loading}
                    className="h-9 px-4 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Tolak Permohonan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Panel 2: Penggunaan Sparepart & Material */}
          {activeTab === 'materials' && (
            <div className="space-y-4 animate-fade-in">
              {/* Form Input Sparepart & Potong Stok */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Ambil Sparepart & Material Gudang (Pengurangan Stok Otomatis)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Tersedia {sparepartsCatalog.length} jenis komponen di database
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Pilih Komponen Gudang *
                    </label>
                    <select
                      value={selectedSparepart}
                      onChange={(e) => setSelectedSparepart(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-red-600 font-medium cursor-pointer"
                    >
                      <option value="">Pilih Sparepart / Material...</option>
                      {sparepartsCatalog.map((s, idx) => (
                        <option key={s.namaKomponen ? `${s.namaKomponen}-${idx}` : `sparepart-${idx}`} value={s.namaKomponen}>
                          {s.namaKomponen} (Stok: {s.stokGudang} {s.satuan}) [{s.kategori}]
                        </option>
                      ))}
                    </select>
                    {currentKomponenDetail && (
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Lokasi: {currentKomponenDetail.lokasi || '-'} • Sisa Stok: <strong>{currentKomponenDetail.stokGudang} {currentKomponenDetail.satuan}</strong>
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Kuantitas (Qty) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={currentKomponenDetail ? currentKomponenDetail.stokGudang : 1000}
                      value={materialQty}
                      onChange={(e) => setMaterialQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Keterangan / Posisi Pasang
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Mis: Penggantian roda kanan"
                        value={materialKeterangan}
                        onChange={(e) => setMaterialKeterangan(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddMaterial}
                        disabled={materialLoading || !selectedSparepart}
                        className="h-8 px-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{materialLoading ? '...' : 'Gunakan'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabel Daftar Material Terpakai */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-slate-700" />
                    <span>Daftar Material Terpakai Pada Request Ini ({materialsList.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Otomatis tercatat di kartu log stok bengkel
                  </span>
                </div>

                {materialsList.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 font-medium text-xs">
                    Belum ada material/sparepart yang digunakan. Pilih sparepart di atas untuk memotong stok gudang.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                        <tr>
                          <th className="py-2 px-3">No</th>
                          <th className="py-2 px-3">Nama Komponen</th>
                          <th className="py-2 px-3">Qty</th>
                          <th className="py-2 px-3">Keterangan</th>
                          <th className="py-2 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materialsList.map((m, idx) => (
                          <tr key={m.id || idx} className="hover:bg-slate-50/60">
                            <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{m.namaKomponen}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{m.qty} unit</td>
                            <td className="py-2 px-3 text-slate-600">{m.keterangan || '-'}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterial(m.id, m.namaKomponen)}
                                disabled={materialLoading}
                                className="text-rose-600 hover:text-rose-800 font-medium text-[11px] p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                                title="Batalkan & kembalikan stok ke gudang"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                                <span>Batalkan</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel 3: Status Pengerjaan & Kontrol Pending */}
          {activeTab === 'pengerjaan' && (
            <div className="space-y-4 animate-fade-in">
              {/* Status Alur Pengerjaan */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Hammer className="w-4 h-4 text-red-600" />
                    <span>Status & Pelaksanaan Pekerjaan Fisik</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Otomatis masuk pengerjaan saat Atasan Special Project approve
                  </span>
                </div>

                {/* 1. Kondisi jika belum disetujui Special Project */}
                {formData.status === 'Pending: Menunggu Assign S.Project' && (
                  <div className="p-3.5 rounded-lg bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-xs text-purple-950">
                        Menunggu Tanda Tangan & Assign Atasan Special Project (8210 / 820)
                      </p>
                      <p className="text-[11px] text-purple-800 mt-0.5">
                        Begitu disetujui, request akan <strong>otomatis langsung berstatus "Dikerjakan"</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAssignAtasanSpecialProject}
                      disabled={loading}
                      className="h-8 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui Assign S.Project (Otomatis Dikerjakan)</span>
                    </button>
                  </div>
                )}

                {/* 2. Kondisi jika sedang Pending Material */}
                {isPendingMaterial && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border-2 border-amber-300 space-y-2">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                      <PauseCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Pengerjaan Ditunda: Menunggu Sparepart / Material</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Alasan Pending: <strong>{formData.alasanPending || 'Menunggu sparepart/material tambahan'}</strong>
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleResumeProgress}
                        disabled={loading}
                        className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Lanjutkan Pengerjaan (Material Sudah Tersedia)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Teknisi & Tombol Pending */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      PIC Bengkel / Teknisi Pelaksana
                    </label>
                    <input
                      type="text"
                      placeholder="Nama teknisi bengkel yang mengerjakan"
                      value={formData.picBengkel}
                      onChange={(e) => setFormData((p) => ({ ...p, picBengkel: e.target.value }))}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Status Kontrol di Tengah Jalan
                    </label>
                    {!isPendingMaterial ? (
                      <button
                        type="button"
                        onClick={() => setShowPendingDialog(true)}
                        className="w-full h-8 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Tunda (Pending: Material/Sparepart Habis)</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-semibold block pt-1.5">
                        Sedang dalam status Pending Material
                      </span>
                    )}
                  </div>
                </div>

                {/* Tombol Pekerjaan Fisik Selesai */}
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={handleOperatorSelesai}
                    disabled={loading}
                    className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pekerjaan Fisik Selesai (Lanjut ke Serah Terima)</span>
                  </button>
                </div>
              </div>

              {/* Dialog Input Alasan Pending Material */}
              {showPendingDialog && (
                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-3 animate-scale-up">
                  <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Set Status Pending: Kebutuhan Material / Sparepart Habis</span>
                  </span>
                  <div>
                    <label className="block text-[10px] text-amber-900 font-medium mb-1">
                      Tuliskan rincian sparepart/material yang habis atau kendala:
                    </label>
                    <input
                      type="text"
                      placeholder="Mis: Menunggu bearing 6204 dan plat strip tebal 3mm tiba dari supplier"
                      value={alasanPendingInput}
                      onChange={(e) => setAlasanPendingInput(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPendingDialog(false)}
                      className="h-7 px-3 bg-white text-slate-600 border border-slate-300 rounded-md text-xs font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSetPendingMaterial}
                      disabled={loading}
                      className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold cursor-pointer transition shadow-2xs"
                    >
                      Simpan Status Pending
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel 4: Hasil Check & Penyelesaian */}
          {activeTab === 'penyelesaian' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pengecekan Akhir (Target VS Actual) & Serah Terima ke Seksi</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Hasil Check Pemohon (Target VS Actual)
                    </label>
                    <textarea
                      value={formData.hasilCheck}
                      onChange={(e) => setFormData((p) => ({ ...p, hasilCheck: e.target.value }))}
                      rows={3}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-red-600 resize-none leading-relaxed"
                      placeholder="Komentar hasil pengecekan akhir oleh pemohon setelah barang selesai diperbaiki..."
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Nama Checker Pemohon (Serah Terima)
                      </label>
                      <input
                        type="text"
                        placeholder="Nama staf seksi yang mengecek barang"
                        value={formData.hasilCheckPemohon}
                        onChange={(e) => setFormData((p) => ({ ...p, hasilCheckPemohon: e.target.value }))}
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Schedule Planning & Actual
                      </label>
                      <input
                        type="text"
                        placeholder="Realisasi tanggal (mis: 02 Sep - 05 Sep 2026)"
                        value={formData.scheduleActual}
                        onChange={(e) => setFormData((p) => ({ ...p, scheduleActual: e.target.value }))}
                        className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={handleFinalFinish}
                    disabled={loading}
                    className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Selesaikan Request & Informasikan ke Seksi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Tab: <strong className="text-slate-800 capitalize">{activeTab}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => handleSaveAction()}
              disabled={loading}
              className="h-8 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
