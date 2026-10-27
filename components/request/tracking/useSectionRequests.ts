'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';
import { buildAtasanSeksiEmailContent } from '@/lib/emailTemplates';
import { FeedbackType } from '@/components/FeedbackModal';
import { FlowchartFilter, RequestFormData, SubmittedData } from './types';

const INITIAL_FORM_DATA: RequestFormData = {
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
};

export function useSectionRequests() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, currentUser, isLoading: authLoading } = useAuth();

  const [requests, setRequests] = useState<SectionRequestFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFlow, setFilterFlow] = useState<FlowchartFilter>(() => {
    const qStatus = searchParams?.get('status');
    if (
      qStatus &&
      [
        'all',
        'waiting_atasan',
        'workshop',
        'process',
        'pending_material',
        'completed',
        'rejected',
      ].includes(qStatus)
    ) {
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

  // Form state
  const [showForm, setShowForm] = useState(() => searchParams?.get('new') === 'true');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<RequestFormData>(INITIAL_FORM_DATA);

  // Inisialisasi otomatis seksi dan nama drafter dari akun login
  useEffect(() => {
    if (currentUser?.seksi) {
      setFormData((p) => ({
        ...p,
        seksiPemohon: p.seksiPemohon || currentUser.seksi || '',
        drafter: p.drafter || currentUser.name || currentUser.username || '',
        picPemohon: p.picPemohon || currentUser.name || currentUser.username || '',
      }));
    }
  }, [currentUser]);

  // Modals state
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);
  const [printModalRequest, setPrintModalRequest] = useState<SectionRequestFull | null>(null);
  const [evalModalRequest, setEvalModalRequest] = useState<SectionRequestFull | null>(null);
  const [shareApprovalRequest, setShareApprovalRequest] = useState<SectionRequestFull | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<SectionRequestFull | null>(null);

  // Feedback Modal
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
  const fetchRequests = useCallback(
    async (showLoading = false) => {
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
    },
    [router]
  );

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  // On-demand fetch foto hanya saat modal evaluasi atau cetak dibuka
  const openPrintModal = async (req: SectionRequestFull) => {
    setPrintModalRequest(req);
    if (!req.fotoSebelum && !req.fotoSesudah) {
      try {
        const res = await fetch(`/api/section-requests?id=${req.id}&includeImage=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.request) {
            setPrintModalRequest(data.request);
          }
        }
      } catch (err) {
        console.error('Error fetching detail images for print:', err);
      }
    }
  };

  const openEvalModal = async (req: SectionRequestFull) => {
    setEvalModalRequest(req);
    if (!req.fotoSebelum && !req.fotoSesudah) {
      try {
        const res = await fetch(`/api/section-requests?id=${req.id}&includeImage=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.request) {
            setEvalModalRequest(data.request);
          }
        }
      } catch (err) {
        console.error('Error fetching detail images for evaluation:', err);
      }
    }
  };

  // Submit new request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seksiPemohon || !formData.drafter || !formData.perihal) {
      showFeedback(
        'error',
        'Data Belum Lengkap',
        'Mohon lengkapi seksi pemohon, nama pemohon, dan perihal request.'
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
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
        showFeedback(
          'error',
          'Gagal Mengirim Request',
          data.error || 'Terjadi kesalahan saat menyimpan formulir.'
        );
        return;
      }

      showFeedback(
        'success',
        'Request Berhasil Dikirim',
        `Nomor Request: ${data.request?.nomorRequest || 'Tersimpan'}`
      );

      // Reset form
      setFormData(INITIAL_FORM_DATA);
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
      const res = await fetch(`/api/section-requests?id=${requestToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.status === 401) {
        router.replace('/login?from=/request/tracking');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        showFeedback('error', 'Gagal Menghapus', data.error || 'Terjadi kesalahan.');
        return;
      }
      showFeedback(
        'success',
        'Berhasil Dihapus',
        `Request ${requestToDelete.nomorRequest} berhasil dihapus.`
      );
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
        if (
          r.statusApprovalAtasanSeksi === 'APPROVED' ||
          r.statusApprovalAtasanSeksi === 'REJECTED'
        )
          return false;
      } else if (filterFlow === 'workshop') {
        if (
          r.flowStep !== 'STEP_3_EVALUASI_PIC_WORKSHOP' &&
          r.flowStep !== 'STEP_4_ASSIGN_SPECIAL_PROJECT'
        )
          return false;
      } else if (filterFlow === 'process') {
        if (
          r.flowStep !== 'STEP_5_PENGERJAAN' &&
          r.flowStep !== 'STEP_6_VERIFIKASI_SELESAI'
        )
          return false;
      } else if (filterFlow === 'pending_material') {
        if (!r.status?.toLowerCase().includes('material habis')) return false;
      } else if (filterFlow === 'completed') {
        if (r.flowStep !== 'STEP_8_SELESAI' && r.status !== 'Selesai') return false;
      } else if (filterFlow === 'rejected') {
        if (
          r.statusApprovalAtasanSeksi !== 'REJECTED' &&
          r.flowStep !== 'STEP_REJECTED'
        )
          return false;
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
        if (
          !matchNo &&
          !matchPerihal &&
          !matchBarang &&
          !matchMesin &&
          !matchSeksi &&
          !matchPIC
        )
          return false;
      }

      return true;
    });
  }, [requests, filterFlow, search]);

  return {
    isAdmin,
    currentUser,
    requests,
    filtered,
    loading,
    filterFlow,
    setFilterFlow,
    search,
    setSearch,
    showForm,
    setShowForm,
    submitting,
    formData,
    setFormData,
    submittedData,
    setSubmittedData,
    printModalRequest,
    setPrintModalRequest,
    openPrintModal,
    evalModalRequest,
    setEvalModalRequest,
    openEvalModal,
    shareApprovalRequest,
    setShareApprovalRequest,
    requestToDelete,
    setRequestToDelete,
    feedback,
    showFeedback,
    closeFeedback,
    handleSubmit,
    confirmDelete,
    fetchRequests,
  };
}
