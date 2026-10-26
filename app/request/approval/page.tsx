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
} from 'lucide-react';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';

function ApprovalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [requestData, setRequestData] = useState<SectionRequestFull | null>(null);

  // Form Approval Action
  const [namaAtasan, setNamaAtasan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminEmailData, setAdminEmailData] = useState<{ toEmail?: string; subject: string; bodyText: string; mailtoUrl: string } | null>(null);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');

  // Fetch data
  useEffect(() => {
    if (!token) {
      setErrorMsg('Tautan persetujuan tidak memiliki token yang valid.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/section-requests/approval?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setRequestData(data.request);
          setNamaAtasan(data.request.namaAtasanSeksi || data.request.foreman || '');
          if (data.request.statusApprovalAtasanSeksi === 'APPROVED') {
            setActionDone('APPROVED');
          } else if (data.request.statusApprovalAtasanSeksi === 'REJECTED') {
            setActionDone('REJECTED');
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
  }, [token]);

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

    try {
      const res = await fetch('/api/section-requests/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'APPROVE',
          namaAtasan: namaAtasan || 'Atasan Seksi',
          catatan,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionDone('APPROVED');
        if (data.adminWorkshopEmail) {
          setAdminEmailData(data.adminWorkshopEmail);
        }
        if (requestData) {
          setRequestData({
            ...requestData,
            statusApprovalAtasanSeksi: 'APPROVED',
            foreman: namaAtasan || requestData.foreman || 'Atasan Seksi',
            status: 'Diterima Workshop',
          });
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

    try {
      const res = await fetch('/api/section-requests/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'REJECT',
          namaAtasan: namaAtasan || 'Atasan Seksi',
          alasanTolak,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionDone('REJECTED');
        setShowRejectModal(false);
        if (requestData) {
          setRequestData({
            ...requestData,
            statusApprovalAtasanSeksi: 'REJECTED',
            status: 'Ditolak Atasan Seksi',
          });
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

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <Image src="/logo-bs.png" alt="BS" fill className="object-contain" priority />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                PT Bridgestone Tire Indonesia
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Persetujuan Formulir Permohonan Seksi (ENG-KP-011)
              </span>
            </div>
          </div>
          <Link
            href="/request"
            className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1"
          >
            <span>Dashboard Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
                Formulir Telah Berhasil Disetujui & Ditandatangani!
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Tanda tangan Anda telah dicantumkan pada kotak <strong>FOREMAN</strong>. Dokumen request{' '}
                <strong className="font-mono">{requestData?.nomorRequest}</strong> otomatis diteruskan ke{' '}
                <strong>Admin & PIC Workshop Produksi</strong> untuk tahap Evaluasi Pekerjaan (Waktu, Men Power, Sparepart, Material).
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Notifikasi otomatis telah terkirim ke Admin Workshop (via Web Apps & Email)</span>
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
              </div>
            </div>
          </div>
        ) : actionDone === 'REJECTED' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-950">Permohonan Telah Ditolak</h2>
              <p className="text-xs text-rose-800 mt-0.5">
                Alasan penolakan telah tercatat dan diinformasikan ke Seksi Pemohon.
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
                Permintaan Persetujuan & Tanda Tangan (Assign) Formulir
              </h2>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                PIC Seksi pemohon (<strong className="text-slate-900">{requestData?.picPemohon}</strong>) meminta persetujuan Anda sebagai Atasan Seksi.
                Silakan tinjau lembar formulir di bawah ini, kemudian klik tombol <strong>"Setujui & Tanda Tangani (Assign)"</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Action Card For Atasan (Only if still pending) */}
        {!actionDone && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-300 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Tindakan Atasan Seksi Pemohon</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Lengkap / Paraf Atasan *
                </label>
                <input
                  type="text"
                  value={namaAtasan}
                  onChange={(e) => setNamaAtasan(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none font-medium"
                  placeholder="Nama atasan (akan dicantumkan di kotak Foreman)"
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
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                  placeholder="Catatan persetujuan untuk PIC Workshop"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={submitting}
                className="w-full sm:w-auto h-9 px-4 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-lg border border-rose-300 transition cursor-pointer"
              >
                Tolak Permohonan
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="w-full sm:w-auto h-9 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Memproses Persetujuan...' : 'Setujui & Tanda Tangani (Assign Form)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Paper Document Preview (ENG-KP-011) */}
        {requestData && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-slate-900 p-4 sm:p-6 text-slate-900 text-xs font-sans space-y-3">
            {/* Top Registration & Logo */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span className="text-xs text-slate-600 font-mono">
                Regist. No. : ENG-KP-011 (2), Issue Date : 25 April 2012
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
                  <span className="font-mono font-bold">{requestData.nomorRequest}</span>
                </div>
              </div>

              {/* Seksi Pemohon */}
              <div className="col-span-12 sm:col-span-4 p-0 border-b sm:border-b-0 sm:border-r border-slate-900">
                <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900 text-xs">
                  Seksi Pemohon
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 border-b border-slate-900 font-semibold bg-slate-50">
                  <div className="py-0.5">DRAFTER</div>
                  <div className="py-0.5">FOREMAN</div>
                  <div className="py-0.5">{requestData.kodeSeksi || '3122'}</div>
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 h-12 items-end pb-1">
                  <div className="truncate px-1 font-medium">{requestData.drafter || requestData.picPemohon || '-'}</div>
                  <div className="truncate px-1 font-bold text-emerald-800 bg-emerald-50/50 py-0.5">
                    {actionDone === 'APPROVED' ? (namaAtasan || requestData.foreman || 'Approved') : requestData.foreman || '(Pending)'}
                  </div>
                  <div className="truncate px-1 font-medium">{requestData.seksiPemohon}</div>
                </div>
              </div>

              {/* Bengkel Prod */}
              <div className="col-span-12 sm:col-span-4 p-0">
                <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900 text-xs">
                  Bengkel Prod.
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 border-b border-slate-900 font-semibold bg-slate-50">
                  <div className="py-0.5">PWS</div>
                  <div className="py-0.5">K.SIE</div>
                  <div className="py-0.5">8210</div>
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 h-12 items-end pb-1">
                  <div className="truncate px-1 font-medium">{requestData.picBengkel || '-'}</div>
                  <div className="truncate px-1 font-medium">{requestData.keputusan8210 || '-'}</div>
                  <div className="truncate px-1 font-medium">{requestData.keputusan820 || '-'}</div>
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

            {/* Tujuan & Alasan */}
            <div className="border-x border-b border-slate-900 p-2 text-xs space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold">TUJUAN : </span>
                  <span className="font-semibold underline">{requestData.tujuan || 'Safety'}</span>
                  <span className="ml-2 font-normal text-slate-700">({requestData.alasan || requestData.spesifikasi || '-'})</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs">
                    {requestData.urgensi || 'Normal'}
                  </span>
                  <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs">
                    QTY: {requestData.jumlah} {requestData.satuan}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Condition: Keadaan Sekarang vs Rencana Tindakan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 text-xs">
              <div className="p-2.5 space-y-2">
                <div className="font-bold">Keadaan Sekarang :</div>
                <p className="text-slate-800 text-xs leading-relaxed min-h-[30px]">
                  {requestData.keadaanSekarang || requestData.catatan || '-'}
                </p>
                <div className="border border-slate-200 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSebelum ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={requestData.fotoSebelum} alt="Keadaan Sekarang" className="max-h-[180px] w-full object-contain p-1" />
                  ) : (
                    <span className="text-xs text-slate-500 italic">Tidak ada foto kondisi sekarang</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 space-y-2">
                <div className="font-bold">Rencana Tindakan :</div>
                <p className="text-slate-800 text-xs leading-relaxed min-h-[30px]">
                  {requestData.rencanaTindakan || requestData.spesifikasi || '-'}
                </p>
                <div className="border border-slate-200 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSesudah ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={requestData.fotoSesudah} alt="Rencana Tindakan" className="max-h-[180px] w-full object-contain p-1" />
                  ) : (
                    <span className="text-xs text-slate-500 italic">Tidak ada foto rencana tindakan</span>
                  )}
                </div>
              </div>
            </div>

            {/* Target Hasil */}
            <div className="border-x border-b border-slate-900 p-2 text-xs">
              <span className="font-bold">Target Hasil : </span>
              <span>{requestData.targetHasil || '-'}</span>
            </div>

            {/* Penjelasan Pelaksanaan */}
            <div className="border-x border-b border-slate-900 p-2 text-xs">
              <span className="font-bold">Penjelasan tentang pelaksanaan : </span>
              <span>{requestData.penjelasanPelaksanaan || '-'}</span>
            </div>

            {/* Footer ASBES */}
            <div className="text-center font-bold italic text-[9.5px] p-1.5 text-slate-700">
              Perhatian : Barang/Material yang dipergunakan di PT. Bridgestone Tire Indonesia tidak boleh mengandung ASBES
            </div>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-slate-900">Alasan Penolakan Permohonan</h3>
            <p className="text-xs text-slate-500">
              Mohon berikan alasan penolakan agar PIC Seksi pemohon dapat merevisi atau memahami kendala yang ada.
            </p>
            <textarea
              value={alasanTolak}
              onChange={(e) => setAlasanTolak(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-rose-500 text-slate-900"
              placeholder="Misal: Prioritas anggaran dialihkan, atau desain belum sesuai standar teknis..."
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
    </div>
  );
}

export default function RequestApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ApprovalContent />
    </Suspense>
  );
}
