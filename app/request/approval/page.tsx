'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  User,
  ArrowRight,
  AlertTriangle,
  Send,
  Printer,
  ChevronLeft,
  Mail,
  Wrench,
  Users,
  DollarSign,
  Package,
} from 'lucide-react';
import BridgestoneRequestPrintModal, { SectionRequestFull, FAKTOR_OPTIONS } from '@/components/request/BridgestoneRequestPrintModal';
import { getSeksiCode } from '@/lib/nomorSurat';
import SignaturePad from '@/components/request/SignaturePad';

function ApprovalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const roleParam = searchParams.get('role'); // 'spv_seksi' | 'manajer_seksi' | 'seksi' | 'special_project'

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [requestData, setRequestData] = useState<SectionRequestFull | null>(null);

  // Active Role State ('spv_seksi' vs 'manajer_seksi' vs 'special_project')
  const [activeRole, setActiveRole] = useState<'spv_seksi' | 'manajer_seksi' | 'special_project'>(
    roleParam === 'special_project'
      ? 'special_project'
      : roleParam === 'manajer_seksi'
      ? 'manajer_seksi'
      : 'spv_seksi'
  );

  // Form Approval Action
  const [namaAtasan, setNamaAtasan] = useState('');
  const [namaDeptHead, setNamaDeptHead] = useState('');
  const [catatan, setCatatan] = useState('');
  const [ttdAtasanSeksi, setTtdAtasanSeksi] = useState('');
  const [ttdAtasanSpecialProject, setTtdAtasanSpecialProject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminEmailData, setAdminEmailData] = useState<{
    toEmail?: string;
    subject: string;
    bodyText: string;
    mailtoUrl: string;
  } | null>(null);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');

  // Print Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch data
  useEffect(() => {
    if (!token) {
      setErrorMsg('Tautan persetujuan tidak memiliki token yang valid.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/section-requests/approval?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          const req: SectionRequestFull = data.request;
          setRequestData(req);

          // Determine initial role
          const isSPTarget =
            roleParam === 'special_project' ||
            ((req.statusApprovalAtasanSeksi === 'APPROVED' &&
              (req.statusApprovalManajerSeksi === 'APPROVED' || !req.namaManajerSeksi)) &&
              (req.flowStep === 'STEP_5_MENUNGGU_ATASAN_SPROJECT' ||
                req.status === 'Menunggu Assign S.Project' ||
                req.status === 'Pending: Menunggu Assign S.Project'));

          const isManajerTarget =
            roleParam === 'manajer_seksi' ||
            (req.statusApprovalAtasanSeksi === 'APPROVED' &&
              req.statusApprovalManajerSeksi !== 'APPROVED' &&
              Boolean(req.namaManajerSeksi) &&
              !isSPTarget);

          if (isSPTarget) {
            setActiveRole('special_project');
            setNamaAtasan(cleanPersonName(req.keputusan8210));
            setNamaDeptHead(cleanPersonName(req.keputusan820));
            if (
              req.flowStep === 'STEP_6_DALAM_PENGERJAAN' ||
              req.status === 'Dikerjakan' ||
              req.status === 'Selesai'
            ) {
              setActionDone('APPROVED');
            } else if (req.flowStep === 'STEP_5_DITOLAK') {
              setActionDone('REJECTED');
            }
          } else if (isManajerTarget) {
            setActiveRole('manajer_seksi');
            setNamaAtasan(req.namaManajerSeksi || '');
            if (req.statusApprovalManajerSeksi === 'APPROVED') {
              setActionDone('APPROVED');
            } else if (req.statusApprovalManajerSeksi === 'REJECTED') {
              setActionDone('REJECTED');
            }
          } else {
            setActiveRole('spv_seksi');
            setNamaAtasan(req.namaAtasanSeksi || req.foreman || '');
            if (req.statusApprovalAtasanSeksi === 'APPROVED') {
              setActionDone('APPROVED');
            } else if (req.statusApprovalAtasanSeksi === 'REJECTED') {
              setActionDone('REJECTED');
            }
          }
        } else {
          setErrorMsg(data.error || 'Gagal memuat formulir request.');
        }
      } catch {
        setErrorMsg('Gagal menghubungi server.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [token, roleParam]);

  // Switch role handler for simulation
  const handleSwitchRole = (newRole: 'spv_seksi' | 'manajer_seksi' | 'special_project') => {
    setActiveRole(newRole);
    if (!requestData) return;
    if (newRole === 'special_project') {
      setNamaAtasan(cleanPersonName(requestData.keputusan8210));
      setNamaDeptHead(cleanPersonName(requestData.keputusan820));
      if (
        requestData.flowStep === 'STEP_6_DALAM_PENGERJAAN' ||
        requestData.status === 'Dikerjakan' ||
        requestData.status === 'Selesai'
      ) {
        setActionDone('APPROVED');
      } else if (requestData.flowStep === 'STEP_5_DITOLAK') {
        setActionDone('REJECTED');
      } else {
        setActionDone(null);
      }
    } else if (newRole === 'manajer_seksi') {
      setNamaAtasan(requestData.namaManajerSeksi || '');
      if (requestData.statusApprovalManajerSeksi === 'APPROVED') {
        setActionDone('APPROVED');
      } else if (requestData.statusApprovalManajerSeksi === 'REJECTED') {
        setActionDone('REJECTED');
      } else {
        setActionDone(null);
      }
    } else {
      setNamaAtasan(requestData.namaAtasanSeksi || requestData.foreman || '');
      if (requestData.statusApprovalAtasanSeksi === 'APPROVED') {
        setActionDone('APPROVED');
      } else if (requestData.statusApprovalAtasanSeksi === 'REJECTED') {
        setActionDone('REJECTED');
      } else {
        setActionDone(null);
      }
    }
  };

  // Escape key listener untuk menutup modal penolakan
  useEffect(() => {
    if (!showRejectModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        setShowRejectModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRejectModal, submitting]);

  const handleApprove = async () => {
    if (!token) return;
    setSubmitting(true);
    setErrorMsg('');

    const isSpecialProject = activeRole === 'special_project';

    try {
      const payload = isSpecialProject
        ? {
            token,
            role: 'special_project',
            action: 'APPROVE_SPROJECT',
            namaAtasan: namaAtasan || 'Manager Special Project (8236)',
            namaDeptHead: namaDeptHead || 'Dept Head Special Project (8236)',
            catatan,
            ttdAtasanSpecialProject: ttdAtasanSpecialProject || undefined,
          }
        : activeRole === 'manajer_seksi'
        ? {
            token,
            role: 'manajer_seksi',
            action: 'APPROVE',
            namaManajerSeksi: namaAtasan || requestData?.namaManajerSeksi || 'Manajer Seksi',
            catatan,
            ttdManajerSeksi: ttdAtasanSeksi || undefined,
          }
        : {
            token,
            role: 'spv_seksi',
            action: 'APPROVE',
            namaAtasan: namaAtasan || requestData?.namaAtasanSeksi || 'Spv Seksi',
            catatan,
            ttdAtasanSeksi: ttdAtasanSeksi || undefined,
          };

      const res = await fetch('/api/section-requests/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setActionDone('APPROVED');
        if (data.adminWorkshopEmail) {
          setAdminEmailData(data.adminWorkshopEmail);
        }
        if (requestData) {
          if (isSpecialProject) {
            setRequestData({
              ...requestData,
              keputusan8210: namaAtasan || 'Manager Special Project (8236)',
              keputusan820: namaDeptHead || 'Dept Head Special Project (8236)',
              ttdAtasanSpecialProject: ttdAtasanSpecialProject || requestData.ttdAtasanSpecialProject,
              nomorSurat: data.request?.nomorSurat || requestData.nomorSurat,
              status: 'Dikerjakan',
              flowStep: 'STEP_6_DALAM_PENGERJAAN',
            });
          } else if (activeRole === 'manajer_seksi') {
            setRequestData({
              ...requestData,
              statusApprovalManajerSeksi: 'APPROVED',
              namaManajerSeksi: namaAtasan || requestData.namaManajerSeksi,
              ttdManajerSeksi: ttdAtasanSeksi || requestData.ttdManajerSeksi,
              status: 'Pending: Menunggu Evaluasi Workshop',
              flowStep: 'STEP_3_DITERIMA_WORKSHOP',
            });
          } else {
            setRequestData({
              ...requestData,
              statusApprovalAtasanSeksi: 'APPROVED',
              foreman: namaAtasan || requestData.foreman,
              ttdAtasanSeksi: ttdAtasanSeksi || requestData.ttdAtasanSeksi,
              status: requestData.namaManajerSeksi ? 'Menunggu Assign Manajer Seksi' : 'Pending: Menunggu Evaluasi Workshop',
              flowStep: requestData.namaManajerSeksi ? 'STEP_2B_WAITING_MANAJER_SEKSI' : 'STEP_3_DITERIMA_WORKSHOP',
            });
          }
        }
      } else {
        setErrorMsg(data.error || 'Gagal menyetujui request.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi saat mengirim persetujuan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!token || !alasanTolak.trim()) {
      alert('Mohon isi alasan penolakan.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    const isSpecialProject = activeRole === 'special_project';

    try {
      const payload = isSpecialProject
        ? {
            token,
            role: 'special_project',
            action: 'REJECT_SPROJECT',
            namaAtasan: namaAtasan || 'Manager Special Project (8236)',
            alasanTolak,
          }
        : activeRole === 'manajer_seksi'
        ? {
            token,
            role: 'manajer_seksi',
            action: 'REJECT',
            namaManajerSeksi: namaAtasan || requestData?.namaManajerSeksi || 'Manajer Seksi',
            alasanTolak,
          }
        : {
            token,
            role: 'spv_seksi',
            action: 'REJECT',
            namaAtasan: namaAtasan || requestData?.namaAtasanSeksi || 'Spv Seksi',
            alasanTolak,
          };

      const res = await fetch('/api/section-requests/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setActionDone('REJECTED');
        setShowRejectModal(false);
        if (requestData) {
          if (isSpecialProject) {
            setRequestData({
              ...requestData,
              status: 'Ditolak',
              flowStep: 'STEP_5_DITOLAK',
              alasanTolak: alasanTolak,
              keputusan8210: 'DITOLAK',
            });
          } else {
            setRequestData({
              ...requestData,
              statusApprovalAtasanSeksi: 'REJECTED',
              status: 'Ditolak Atasan Seksi',
              alasanTolak: alasanTolak,
            });
          }
        }
      } else {
        setErrorMsg(data.error || 'Gagal menolak request.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi saat menolak request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-700">Memuat formulir permohonan resmi...</p>
      </div>
    );
  }

  if (errorMsg && !requestData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-rose-200 max-w-md w-full text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Tautan Tidak Valid</h2>
          <p className="text-xs text-slate-500">{errorMsg}</p>
          <div className="pt-2">
            <Link
              href="/request/tracking"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Request</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSpecialProject = activeRole === 'special_project';

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <Image src="/logo-bs.png" alt="BS" fill className="object-contain" priority />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                PT Bridgestone Tire Indonesia
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {isSpecialProject
                  ? 'Persetujuan & Assign Atasan Special Project (8236)'
                  : activeRole === 'manajer_seksi'
                  ? `Persetujuan Manajer Seksi (${requestData?.kodeSeksi || 'Pemohon'})`
                  : 'Persetujuan Supervisor (Spv) Seksi'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Simulasi Role Switcher (Dapat beralih kapan saja untuk keperluan simulasi & pengujian) */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => handleSwitchRole('spv_seksi')}
                className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeRole === 'spv_seksi'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Spv Seksi</span>
                {requestData?.statusApprovalAtasanSeksi === 'APPROVED' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sudah Disetujui Spv" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole('manajer_seksi')}
                className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeRole === 'manajer_seksi'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Manajer Seksi</span>
                {requestData?.statusApprovalManajerSeksi === 'APPROVED' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sudah Disetujui Manajer" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole('special_project')}
                className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  isSpecialProject
                    ? 'bg-purple-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3. Special Project</span>
                {requestData?.keputusan8210 && requestData?.keputusan8210 !== 'DITOLAK' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Sudah Di-assign S.Project" />
                )}
              </button>
            </div>

            {requestData && (
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer ml-1"
                title="Cetak Formulir Standar Ukuran A4"
              >
                <Printer className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Cetak A4</span>
              </button>
            )}

            <Link
              href="/request"
              className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 ml-2"
            >
              <span>Dashboard Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-5 space-y-5">
        {/* Status Notification Banner */}
        {actionDone === 'APPROVED' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-sm flex items-start gap-3.5 animate-scale-up">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                {isSpecialProject
                  ? 'Permohonan Telah Disetujui & Di-assign oleh Atasan Special Project!'
                  : 'Formulir Telah Berhasil Disetujui & Ditandatangani!'}
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                {isSpecialProject ? (
                  <>
                    Persetujuan Anda telah dicatat pada kotak <strong>Special Project (Spv / Manajer 8236)</strong>. Dokumen request{' '}
                    <strong className="font-mono">
                      {requestData?.nomorRequest?.startsWith('REQ-') && requestData?.nomorSurat
                        ? requestData.nomorSurat
                        : requestData?.nomorRequest}
                    </strong>{' '}
                    kini berstatus <strong>&quot;Dikerjakan&quot; (STEP 6)</strong> dan teknisi workshop siap memulai pengerjaan fisik.
                  </>
                ) : (
                  <>
                    Tanda tangan Anda telah dicantumkan pada kotak <strong>Spv</strong>. Dokumen request{' '}
                    <strong className="font-mono">
                      {requestData?.nomorRequest?.startsWith('REQ-') && requestData?.nomorSurat
                        ? requestData.nomorSurat
                        : requestData?.nomorRequest}
                    </strong>{' '}
                    otomatis diteruskan ke <strong>Admin & PIC Workshop Produksi</strong> untuk tahap Evaluasi Pekerjaan (Waktu, Men Power, Sparepart, Material).
                  </>
                )}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    {isSpecialProject
                      ? 'Notifikasi otomatis telah terkirim ke Workshop Bengkel & Seksi Pemohon'
                      : 'Notifikasi otomatis telah terkirim ke Admin Workshop (via Web Apps & Email)'}
                  </span>
                </span>
                {adminEmailData && (
                  <a
                    href={adminEmailData.mailtoUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Buka Email ke Admin Workshop</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActionDone(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <span>Ubah Data / Simulasi Ulang</span>
                </button>
              </div>
            </div>
          </div>
        ) : actionDone === 'REJECTED' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-950">
                {isSpecialProject
                  ? 'Permohonan Ditolak oleh Atasan Special Project'
                  : 'Permohonan Telah Ditolak oleh Atasan Seksi'}
              </h2>
              <p className="text-xs text-rose-800 mt-0.5">
                Alasan penolakan: <strong>{alasanTolak || requestData?.alasanTolak || '-'}</strong>. Status telah diperbarui dan Seksi Pemohon diinformasikan.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setActionDone(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <span>Batalkan / Coba Ulang Persetujuan</span>
                </button>
              </div>
            </div>
          </div>
        ) : isSpecialProject ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50 border-2 border-purple-300 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-purple-950">
                Permintaan Persetujuan & Penugasan (Assign) Atasan Special Project
              </h2>
              <p className="text-xs text-purple-900 mt-0.5 leading-relaxed">
                PIC Workshop telah menyelesaikan evaluasi teknis, estimasi waktu, kebutuhan men-power, biaya, dan kebutuhan material/sparepart.
                Silakan tinjau ringkasan evaluasi bengkel dan lembar formulir di bawah ini, kemudian klik tombol <strong>&quot;Setujui &amp; Assign Pengerjaan Workshop&quot;</strong>.
              </p>
            </div>
          </div>
        ) : activeRole === 'manajer_seksi' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                Persetujuan Tahap 2: Manajer Seksi ({requestData?.kodeSeksi || 'Pemohon'})
              </h2>
              <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                Supervisor Seksi (<strong className="text-slate-900">{requestData?.namaAtasanSeksi || requestData?.foreman}</strong>) telah menandatangani persetujuan awal.
                Silakan tinjau lembar formulir di bawah ini, kemudian cantumkan tanda tangan digital Anda sebagai <strong>Manajer Seksi</strong> untuk meneruskan formulir ke Workshop Produksi.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                Persetujuan Tahap 1: Supervisor (Spv) Seksi Pemohon
              </h2>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                PIC Seksi pemohon (<strong className="text-slate-900">{requestData?.picPemohon}</strong>) meminta persetujuan Anda sebagai <strong>Supervisor Seksi</strong>.
                Silakan tinjau lembar formulir di bawah ini, kemudian klik tombol <strong>&quot;Setujui &amp; Tanda Tangani (Assign)&quot;</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Info Banner Khusus Mode Simulasi Special Project */}
        {isSpecialProject && !actionDone && (
          <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl text-purple-950 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Simulasi Approval &amp; Assign Atasan Special Project (8236):</span>
              <p className="mt-0.5 text-purple-900 leading-relaxed">
                Anda sedang mensimulasikan peran <strong>Manager Special Project (8236)</strong>.
                Ketika tombol persetujuan diklik, keputusan, nama reviewer, dan instruksi pengerjaan akan disimpan secara nyata ke database PostgreSQL,
                dan status request otomatis berlanjut ke <strong>&quot;Dikerjakan&quot; (STEP 6)</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Ringkasan Hasil Evaluasi Workshop (Ditampilkan khusus untuk Atasan Special Project) */}
        {isSpecialProject && requestData && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900">
                  Hasil Evaluasi Teknis & Estimasi PIC Special Project
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                PIC Bengkel: {requestData.picBengkel || 'Workshop Team'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Estimasi Waktu</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-900">
                  {requestData.waktuEstimate || '-'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. Men Power</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-900">
                  {requestData.orangJamEstimate || '-'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Estimasi Biaya</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-900">
                  {requestData.biayaEstimate || '-'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Kebutuhan Suku Cadang (Sparepart):
                </span>
                <span className="text-xs text-slate-800 font-medium">
                  {requestData.kebutuhanSparepart || '-'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Kebutuhan Bahan Fabrikasi / Material:
                </span>
                <span className="text-xs text-slate-800 font-medium">
                  {requestData.kebutuhanMaterial || '-'}
                </span>
              </div>
            </div>

            {requestData.materials && requestData.materials.length > 0 && (
              <div className="pt-1">
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  Daftar Suku Cadang & Material Terdaftar ({requestData.materials.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {requestData.materials.map((m, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-300 text-xs font-medium text-slate-800"
                    >
                      <Package className="w-3 h-3 text-slate-500" />
                      <span>{m.namaKomponen}</span>
                      <strong className="text-purple-700 font-bold ml-1">
                        ({m.qty} {m.satuan || 'Pcs'})
                      </strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Card For Atasan (Only if still pending) */}
        {!actionDone && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-300 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`w-5 h-5 ${
                  isSpecialProject
                    ? 'text-purple-600'
                    : activeRole === 'manajer_seksi'
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              />
              <h3 className="text-sm font-bold text-slate-900">
                {isSpecialProject
                  ? 'Tindakan Atasan Special Project (8236)'
                  : activeRole === 'manajer_seksi'
                  ? `Tindakan Persetujuan Manajer Seksi (${requestData?.kodeSeksi || 'Pemohon'})`
                  : 'Tindakan Persetujuan Supervisor (Spv) Seksi'}
              </h3>
            </div>

            {isSpecialProject ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Spv Special Project (Ketik Manual) *
                    </label>
                    <input
                      type="text"
                      value={namaAtasan}
                      onChange={(e) => setNamaAtasan(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-purple-600 outline-none font-medium"
                      placeholder="Ketik manual nama Spv (misal: Bpk. Haryono)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Manajer Special Project 8236 (Ketik Manual) *
                    </label>
                    <input
                      type="text"
                      value={namaDeptHead}
                      onChange={(e) => setNamaDeptHead(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-purple-600 outline-none font-medium"
                      placeholder="Ketik manual nama Manajer (misal: Bpk. Bambang)"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Instruksi Khusus / Catatan Pengerjaan Bengkel (Opsional)
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-purple-600 outline-none"
                    placeholder="Misal: Prioritas pengerjaan shift 1, perhatikan presisi bubut roda..."
                  />
                </div>

                {/* Signature Pad Atasan Special Project */}
                <div className="pt-2 border-t border-purple-100">
                  <SignaturePad
                    value={ttdAtasanSpecialProject}
                    onChange={setTtdAtasanSpecialProject}
                    signerName={namaAtasan || 'Spv Special Project'}
                    roleLabel="Tanda Tangan / Paraf Atasan Special Project"
                  />
                </div>
              </div>
            ) : activeRole === 'manajer_seksi' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Manajer Seksi ({requestData?.kodeSeksi || 'Pemohon'}) *
                    </label>
                    <input
                      type="text"
                      value={namaAtasan}
                      onChange={(e) => setNamaAtasan(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none font-medium"
                      placeholder="Nama Manajer Seksi Pemohon"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Catatan Manajer Seksi (Opsional)
                    </label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                      placeholder="Catatan persetujuan manajer untuk bengkel"
                    />
                  </div>
                </div>

                {/* Signature Pad Manajer Seksi */}
                <div className="pt-2 border-t border-slate-100">
                  <SignaturePad
                    value={ttdAtasanSeksi}
                    onChange={setTtdAtasanSeksi}
                    signerName={namaAtasan || 'Manajer Seksi'}
                    roleLabel={`Tanda Tangan / Paraf Manajer Seksi (${requestData?.kodeSeksi || 'Pemohon'})`}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Spv Seksi (Supervisor) *
                    </label>
                    <input
                      type="text"
                      value={namaAtasan}
                      onChange={(e) => setNamaAtasan(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-amber-600 outline-none font-medium"
                      placeholder="Nama Spv seksi (akan dicantumkan di kotak Spv)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-amber-600 outline-none"
                      placeholder="Catatan persetujuan untuk PIC Workshop"
                    />
                  </div>
                </div>

                {/* Signature Pad Atasan Seksi */}
                <div className="pt-2 border-t border-slate-100">
                  <SignaturePad
                    value={ttdAtasanSeksi}
                    onChange={setTtdAtasanSeksi}
                    signerName={namaAtasan || 'Spv Seksi'}
                    roleLabel="Tanda Tangan / Paraf Spv Seksi (Supervisor)"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={submitting}
                className="w-full sm:w-auto h-10 px-4 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-lg border border-rose-300 transition cursor-pointer"
              >
                Tolak Permohonan
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className={`w-full sm:w-auto h-10 px-5 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-sm ${
                  isSpecialProject
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {submitting
                    ? 'Memproses Persetujuan...'
                    : isSpecialProject
                    ? 'Setujui & Assign Pengerjaan Workshop (8236)'
                    : 'Setujui & Tanda Tangani (Assign Form)'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Paper Document Preview */}
        {requestData && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-slate-900 p-4 sm:p-6 text-slate-900 text-xs font-sans space-y-3">
            {/* Top Registration & Logo */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span className="font-mono text-[10.5px] text-slate-500 font-normal">
                ID: {requestData.nomorRequest}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5">
                  <Image src="/logo-bs.png" alt="BS" fill className="object-contain" />
                </div>
                <span className="font-black tracking-wider text-sm text-slate-900">BRIDGESTONE</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-1">
              <h1 className="text-lg sm:text-xl font-black tracking-widest uppercase">R E Q U E S T</h1>
            </div>

            {/* Routing & Seksi Box */}
            <div className="grid grid-cols-12 border border-slate-900 text-xs">
              {/* Tanggal & No Req */}
              <div className="col-span-12 sm:col-span-4 p-2.5 border-b sm:border-b-0 sm:border-r border-slate-900 space-y-1">
                <div>
                  <span className="font-bold">TANGGAL : </span>
                  <span>
                    {requestData.waktuDibuat
                      ? new Date(requestData.waktuDibuat).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="font-bold">REQ. NO. : </span>
                  {requestData.nomorSurat && !requestData.nomorSurat.startsWith('REQ-') ? (
                    <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                      {requestData.nomorSurat}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">
                      (Belum Terbit)
                    </span>
                  )}
                </div>
              </div>

              {/* Seksi Pemohon & Special Project Approval Box */}
              <div className="col-span-12 sm:col-span-8 p-0 flex flex-col justify-between">
                {/* Header Grup Seksi */}
                <div className="grid grid-cols-2 text-center text-xs font-bold divide-x divide-slate-900 bg-slate-100 border-b border-slate-900">
                  <div className="py-1">Seksi Pemohon</div>
                  <div className="py-1">Special Project</div>
                </div>

                {/* Baris 1: Jabatan */}
                <div className="grid grid-cols-6 text-center text-[10px] sm:text-[10.5px] font-bold divide-x divide-slate-900 bg-slate-50 border-b border-slate-900">
                  <div className="py-1 px-0.5 truncate">Staff</div>
                  <div className="py-1 px-0.5 truncate">Spv</div>
                  <div className="py-1 px-0.5 truncate leading-tight">
                    Manajer ({requestData.kodeSeksi || getSeksiCode(requestData.seksiPemohon)})
                  </div>
                  <div className="py-1 px-0.5 truncate">Staff</div>
                  <div className="py-1 px-0.5 truncate">Spv</div>
                  <div className="py-1 px-0.5 truncate leading-tight">Manajer (8236)</div>
                </div>

                {/* Baris 2: Tanda Tangan */}
                <div className="grid grid-cols-6 text-center divide-x divide-slate-900 h-14 bg-white">
                  <div className="h-full flex items-center justify-center p-1">
                    {/* Staff Seksi Pemohon */}
                    {requestData.picPemohon || requestData.drafter ? (
                      <span className="text-[10px] text-slate-400 font-mono italic">Paraf Staff</span>
                    ) : null}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {/* Spv Seksi Pemohon */}
                    {activeRole === 'spv_seksi' && ttdAtasanSeksi ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ttdAtasanSeksi}
                        alt="TTD Spv"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : requestData.ttdAtasanSeksi ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={requestData.ttdAtasanSeksi}
                        alt="TTD Spv"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {/* Manajer Pemohon */}
                    {activeRole === 'manajer_seksi' && ttdAtasanSeksi ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ttdAtasanSeksi}
                        alt="TTD Manajer Seksi"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : requestData.ttdManajerSeksi ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={requestData.ttdManajerSeksi}
                        alt="TTD Manajer Seksi"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : requestData.kodeSeksi ? (
                      <span className="text-[10px] text-slate-400 font-mono italic">ACC {requestData.kodeSeksi}</span>
                    ) : null}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {/* Staff Special Project */}
                    {requestData.ttdAdminWorkshop ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={requestData.ttdAdminWorkshop}
                        alt="TTD Staff Workshop"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {/* Spv Special Project */}
                    {requestData.keputusan8210 && requestData.keputusan8210 !== 'DITOLAK' ? (
                      <span className="text-[10px] text-purple-500 font-mono italic">Verified</span>
                    ) : null}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {/* Manajer Special Project (8236) */}
                    {(ttdAtasanSpecialProject || requestData.ttdAtasanSpecialProject) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ttdAtasanSpecialProject || requestData.ttdAtasanSpecialProject}
                        alt="TTD Manajer 8236"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : null}
                  </div>
                </div>

                {/* Baris 3: Nama Orangnya */}
                <div className="grid grid-cols-6 text-center text-[9.5px] sm:text-[10px] font-semibold divide-x divide-slate-900 bg-slate-50 border-t border-slate-900">
                  <div className="py-1 px-1 truncate" title={requestData.drafter || requestData.picPemohon}>
                    {requestData.drafter || requestData.picPemohon || '-'}
                  </div>
                  <div className="py-1 px-1 truncate font-bold text-emerald-800" title={requestData.foreman || requestData.namaAtasanSeksi}>
                    {activeRole === 'spv_seksi' && actionDone === 'APPROVED'
                      ? namaAtasan || requestData.foreman || 'Approved'
                      : requestData.foreman || requestData.namaAtasanSeksi || (requestData.statusApprovalAtasanSeksi === 'APPROVED' ? 'Approved' : '-')}
                  </div>
                  <div className="py-1 px-1 truncate font-bold text-emerald-800" title={requestData.namaManajerSeksi || requestData.seksiPemohon}>
                    {activeRole === 'manajer_seksi' && actionDone === 'APPROVED'
                      ? namaAtasan || requestData.namaManajerSeksi || 'Approved'
                      : requestData.namaManajerSeksi || (requestData.statusApprovalManajerSeksi === 'APPROVED' ? 'Approved' : (requestData.seksiPemohon || '-'))}
                  </div>
                  <div className="py-1 px-1 truncate" title={requestData.picBengkel}>
                    {requestData.picBengkel || '-'}
                  </div>
                  <div className="py-1 px-1 truncate font-medium text-slate-800" title={cleanPersonName(requestData.keputusan8210)}>
                    {cleanPersonName(requestData.keputusan8210) || '-'}
                  </div>
                  <div className="py-1 px-1 truncate font-medium text-slate-800" title={cleanPersonName(requestData.keputusan820)}>
                    {isSpecialProject && actionDone === 'APPROVED'
                      ? namaDeptHead || cleanPersonName(requestData.keputusan820) || 'Approved'
                      : cleanPersonName(requestData.keputusan820) || (isSpecialProject ? '(Pending)' : '-')}
                  </div>
                </div>
              </div>
            </div>

            {/* Perihal & Mesin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 p-0 text-xs">
              <div className="p-2">
                <span className="font-bold">PERIHAL : </span>
                <span>{requestData.perihal || requestData.namaBarang}</span>
              </div>
              <div className="p-2">
                <span className="font-bold">NAMA MACHINE : </span>
                <span>{requestData.namaMachine || '-'}</span>
              </div>
            </div>

            {/* Tujuan & Faktor (SEQCD) - Kotak Terpisah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 p-0 text-xs">
              <div className="p-2 space-y-1">
                <span className="font-bold">TUJUAN : </span>
                <span className="text-slate-800">{requestData.tujuan || '-'}</span>
              </div>
              <div className="p-2 space-y-1">
                <span className="font-bold">FAKTOR : </span>
                <span className="text-slate-700">
                  {FAKTOR_OPTIONS.map((f, idx) => {
                    const activeFaktors = (requestData.faktor || requestData.tujuan || 'Safety')
                      .split(',')
                      .map((s) => s.trim().toLowerCase())
                      .filter(Boolean);
                    const sel = activeFaktors.some((af) => af === f.toLowerCase() || af.includes(f.toLowerCase()));
                    return (
                      <span key={f}>
                        {sel ? (
                          <strong className="underline underline-offset-2 font-bold text-slate-950 bg-slate-200 px-1 py-0.5 rounded border border-slate-400">
                            {f}
                          </strong>
                        ) : (
                          <span className="text-slate-600">{f}</span>
                        )}
                        {idx < FAKTOR_OPTIONS.length - 1 ? ' | ' : ''}
                      </span>
                    );
                  })}
                </span>
              </div>
            </div>

            {/* Seksi, PIC, Kontak & Kuantitas/Urgensi */}
            <div className="grid grid-cols-1 sm:grid-cols-12 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 p-0 text-xs">
              <div className="sm:col-span-4 p-2">
                <span className="font-bold">SEKSI : </span>
                <span>{requestData.seksiPemohon}</span>
              </div>
              <div className="sm:col-span-4 p-2 flex justify-between gap-1">
                <span><strong className="font-bold">NAMA : </strong>{requestData.picPemohon || requestData.drafter || '-'}</span>
                <span><strong className="font-bold">TELP. (Ext) : </strong>{requestData.kontakPemohon || '-'}</span>
              </div>
              <div className="sm:col-span-4 p-2 flex items-center justify-end gap-1.5 flex-wrap">
                <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs uppercase bg-slate-50">
                  {requestData.urgensi || 'NORMAL'}
                </span>
                <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs bg-slate-50">
                  QTY: {requestData.jumlah} {requestData.satuan}
                </span>
              </div>
            </div>

            {/* Visual Condition: Keadaan Sekarang vs Rencana Tindakan vs Target Hasil (3 Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-x border-b border-slate-900 divide-y md:divide-y-0 md:divide-x divide-slate-900 text-xs">
              <div className="p-2.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold">Keadaan Sekarang :</div>
                  <p className="text-slate-800 text-xs leading-relaxed min-h-[30px] mt-1">
                    {requestData.keadaanSekarang || requestData.catatan || '-'}
                  </p>
                </div>
                <div className="border border-slate-200 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSebelum ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={requestData.fotoSebelum}
                      alt="Keadaan Sekarang"
                      className="max-h-[180px] w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Tidak ada foto kondisi sekarang
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold">Rencana Tindakan :</div>
                  <p className="text-slate-800 text-xs leading-relaxed min-h-[30px] mt-1">
                    {requestData.rencanaTindakan || requestData.spesifikasi || '-'}
                  </p>
                </div>
                <div className="border border-slate-200 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSesudah ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={requestData.fotoSesudah}
                      alt="Rencana Tindakan"
                      className="max-h-[180px] w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Tidak ada foto rencana tindakan
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2.5 space-y-2 flex flex-col">
                <div className="font-bold">Target Hasil :</div>
                <span className="text-[10px] text-slate-500 block -mt-1">(Pcs/Day, Rp./Month, etc)</span>
                <p className="text-slate-800 text-xs leading-relaxed min-h-[140px] mt-1 whitespace-pre-wrap p-2 rounded bg-slate-50/50 border border-slate-200">
                  {requestData.targetHasil || '-'}
                </p>
              </div>
            </div>

            {/* Penjelasan Pelaksanaan */}
            <div className="border-x border-b border-slate-900 p-2 text-xs">
              <span className="font-bold">Penjelasan tentang pelaksanaan : </span>
              <span>{requestData.penjelasanPelaksanaan || '-'}</span>
            </div>

            {/* Footer ASBES */}
            <div className="text-center font-bold italic text-[9.5px] p-1.5 text-slate-700">
              Perhatian : Barang/Material yang dipergunakan di PT. Bridgestone Tire Indonesia tidak
              boleh mengandung ASBES
            </div>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-slate-900">
              {isSpecialProject
                ? 'Alasan Penolakan Permohonan (Atasan Special Project)'
                : 'Alasan Penolakan Permohonan (Atasan Seksi)'}
            </h3>
            <p className="text-xs text-slate-500">
              Mohon berikan alasan penolakan agar PIC Seksi pemohon atau tim workshop dapat memahami
              kendala yang ada.
            </p>
            <textarea
              value={alasanTolak}
              onChange={(e) => setAlasanTolak(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-rose-500 text-slate-900"
              placeholder="Misal: Prioritas anggaran dialihkan, beban mesin bengkel penuh, atau spesifikasi belum sesuai..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={submitting}
                className="min-h-[44px] sm:min-h-0 sm:h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={submitting}
                className="min-h-[44px] sm:min-h-0 sm:h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal Ukuran A4 */}
      {showPrintModal && requestData && (
        <BridgestoneRequestPrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          requestData={requestData}
        />
      )}
    </div>
  );
}

function cleanPersonName(val?: string | null): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    trimmed.startsWith('Manager Special') ||
    trimmed.startsWith('Dept Head Special') ||
    trimmed === '8210' ||
    trimmed === '820' ||
    trimmed === '8236'
  ) {
    return '';
  }
  return trimmed;
}

export default function RequestApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ApprovalContent />
    </Suspense>
  );
}
