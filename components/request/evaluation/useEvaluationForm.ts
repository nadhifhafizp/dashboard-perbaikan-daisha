import { useState, useEffect } from 'react';
import { SectionRequestFull } from '../BridgestoneRequestPrintModal';
import { TabKey, EvaluationFormData } from './types';

const initialFormData: EvaluationFormData = {
  status: 'Diajukan',
  flowStep: 'STEP_4_EVALUASI_WORKSHOP',
  nomorSurat: '',
  alasanTolak: '',
  alasanPending: '',
  picBengkel: '',
  estimasi: '',
  catatanAdmin: '',
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
};

export function useEvaluationForm(
  requestData: SectionRequestFull | null,
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void
) {
  const [activeTab, setActiveTab] = useState<TabKey>('evaluasi');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<EvaluationFormData>(initialFormData);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [alasanPendingInput, setAlasanPendingInput] = useState('');
  const [notifSuccessData, setNotifSuccessData] = useState<{
    message: string;
    emailData?: { toEmail?: string; subject: string; bodyText: string; mailtoUrl: string };
  } | null>(null);

  // Helper verifikasi kelayakan approval Atasan Special Project secara komprehensif
  const checkIsSProjectApproved = (
    req: SectionRequestFull | null,
    fData?: EvaluationFormData
  ) => {
    if (!req) return false;
    if (req.statusApprovalAtasanSpecialProject === 'APPROVED') return true;
    if (req.ttdAtasanSpecialProject && req.ttdAtasanSpecialProject !== 'NONE' && req.ttdAtasanSpecialProject !== 'DITOLAK') return true;
    if (fData) {
      if (['Dikerjakan', 'Pending: Material Habis', 'Pekerjaan Fisik Selesai', 'Selesai'].includes(fData.status)) return true;
      if (['STEP_6_DALAM_PENGERJAAN', 'STEP_7_PEKERJAAN_SELESAI', 'STEP_8_SELESAI'].includes(fData.flowStep)) return true;
    }
    if (['Dikerjakan', 'Pending: Material Habis', 'Pekerjaan Fisik Selesai', 'Selesai'].includes(req.status || '')) return true;
    if (['STEP_6_DALAM_PENGERJAAN', 'STEP_7_PEKERJAAN_SELESAI', 'STEP_8_SELESAI'].includes(req.flowStep || '')) return true;
    return false;
  };

  const [prevRequest, setPrevRequest] = useState<SectionRequestFull | null>(null);
  const [wasOpen, setWasOpen] = useState(false);

  // Inisialisasi data form saat modal dibuka atau request berganti
  if (isOpen && (!wasOpen || requestData?.id !== prevRequest?.id)) {
    setWasOpen(true);
    setPrevRequest(requestData);
    if (requestData) {
      setFormData({
        status: requestData.status || 'Diajukan',
        flowStep: requestData.flowStep || 'STEP_4_EVALUASI_WORKSHOP',
        nomorSurat: requestData.nomorSurat || '',
        alasanTolak: '',
        alasanPending: requestData.alasanPending || '',
        picBengkel: requestData.foreman || '',
        estimasi: requestData.waktuEstimate || '',
        catatanAdmin: requestData.catatan || '',
        waktuEstimate: requestData.waktuEstimate || '',
        waktuActual: requestData.waktuActual || '',
        orangJamEstimate: requestData.orangJamEstimate || '',
        orangJamActual: requestData.orangJamActual || '',
        kebutuhanSparepart: '',
        kebutuhanMaterial: '',
        biayaEstimate: requestData.biayaEstimate || '',
        biayaActual: requestData.biayaActual || '',
        tglPelaksanaanEstimate: requestData.tglPelaksanaanEstimate || '',
        tglPelaksanaanActual: requestData.tglPelaksanaanActual || '',
        komentarEstimate: requestData.komentarEstimate || '',
        komentarActual: requestData.komentarActual || '',
        keputusan: requestData.keputusan || 'GO',
        keputusan8210:
          requestData.keputusan8210?.startsWith('Manager Special') || requestData.keputusan8210 === '8210'
            ? ''
            : requestData.keputusan8210 || '',
        keputusan820:
          requestData.keputusan820?.startsWith('Dept Head') || requestData.keputusan820 === '820'
            ? ''
            : requestData.keputusan820 || '',
        hasilCheck: requestData.hasilCheck || '',
        hasilCheckPemohon: requestData.hasilCheckPemohon || '',
        schedulePlanning: requestData.schedulePlanning || '',
        scheduleActual: requestData.scheduleActual || '',
      });
      setErrorMsg('');
      setNotifSuccessData(null);
      setShowPendingDialog(false);

      const isSProjectApproved = checkIsSProjectApproved(requestData);
      if (!isSProjectApproved) {
        setActiveTab('evaluasi');
      } else if (requestData.status?.includes('Material Habis') || requestData.status === 'Dikerjakan') {
        setActiveTab('pengerjaan');
      } else if (requestData.status === 'Pekerjaan Fisik Selesai' || requestData.status === 'Selesai') {
        setActiveTab('penyelesaian');
      } else {
        setActiveTab('evaluasi');
      }
    }
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const handleUnauthorized = () => {
    setErrorMsg('Sesi login telah kedaluwarsa atau Anda belum login. Mengarahkan ke halaman login...');
    setTimeout(() => {
      window.location.assign('/login?from=/request');
    }, 1500);
  };

  const handleSaveAction = async (customAction?: string, customUpdates?: Record<string, unknown>) => {
    if (!requestData) return;
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
        } else if (customUpdates?.assignAtasanSpecialProject) {
          setNotifSuccessData({
            message: `Permohonan ${requestData.nomorRequest} berhasil di-ACC & di-assign oleh Atasan Special Project! Status kini "Dikerjakan" (Tahap 6).`,
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

  const handleDecisionLanjut = () => {
    void handleSaveAction('EVALUASI_WORKSHOP', {
      keputusan: 'GO',
      status: 'Pending: Menunggu Assign S.Project',
      flowStep: 'STEP_5_MENUNGGU_ATASAN_SPROJECT',
    });
  };

  const handleAssignAtasanSpecialProject = (
    sp8210?: string,
    sp820?: string,
    catatan?: string
  ) => {
    const k8210 = sp8210 || formData.keputusan8210 || '';
    const k820 = sp820 || formData.keputusan820 || '';
    const cat = catatan !== undefined ? catatan : formData.catatanAdmin;
    void handleSaveAction('ASSIGN_ATASAN_SPROJECT', {
      assignAtasanSpecialProject: true,
      keputusan: 'GO',
      keputusan8210: k8210,
      keputusan820: k820,
      catatanAdmin: cat,
      status: 'Dikerjakan',
      flowStep: 'STEP_6_DALAM_PENGERJAAN',
      ttdAtasanSpecialProject: 'VERIFIED_DIGITAL',
    });
    // Langsung buka tab pengerjaan untuk kenyamanan workshop
    setActiveTab('pengerjaan');
  };

  const handleSetPendingMaterial = async () => {
    if (!requestData) return;
    const isApproved = checkIsSProjectApproved(requestData, formData);
    if (!isApproved) {
      setErrorMsg('Pengerjaan belum aktif karena belum disetujui / di-assign oleh Atasan Special Project.');
      return;
    }
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

  const handleResumeProgress = async () => {
    if (!requestData) return;
    const isApproved = checkIsSProjectApproved(requestData, formData);
    if (!isApproved) {
      setErrorMsg('Pengerjaan belum aktif karena belum disetujui / di-assign oleh Atasan Special Project.');
      return;
    }
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

  const handleOperatorSelesai = () => {
    const isApproved = checkIsSProjectApproved(requestData, formData);
    if (!isApproved) {
      setErrorMsg('Pekerjaan belum dapat diselesaikan karena permohonan ini belum disetujui / di-assign oleh Atasan Special Project.');
      return;
    }
    void handleSaveAction('EVALUASI_WORKSHOP', {
      status: 'Pekerjaan Fisik Selesai',
      flowStep: 'STEP_7_PEKERJAAN_SELESAI',
    });
    setActiveTab('penyelesaian');
  };

  const handleFinalFinish = () => {
    const isApproved = checkIsSProjectApproved(requestData, formData);
    if (!isApproved) {
      setErrorMsg('Request belum dapat diselesaikan karena permohonan ini belum disetujui / di-assign oleh Atasan Special Project.');
      return;
    }
    void handleSaveAction('FINISH_REQUEST', {
      status: 'Selesai',
      flowStep: 'STEP_8_SELESAI',
      hasilCheck: formData.hasilCheck,
      hasilCheckPemohon: formData.hasilCheckPemohon,
      waktuActual: formData.waktuActual,
      orangJamActual: formData.orangJamActual,
      biayaActual: formData.biayaActual,
      scheduleActual: formData.scheduleActual,
    });
  };

  return {
    activeTab,
    setActiveTab,
    isApprovedBySpecialProject: checkIsSProjectApproved(requestData, formData),
    loading,
    errorMsg,
    setErrorMsg,
    formData,
    setFormData,
    showPendingDialog,
    setShowPendingDialog,
    alasanPendingInput,
    setAlasanPendingInput,
    notifSuccessData,
    setNotifSuccessData,
    handleSaveAction,
    handleDecisionTolak,
    handleDecisionLanjut,
    handleAssignAtasanSpecialProject,
    handleSetPendingMaterial,
    handleResumeProgress,
    handleOperatorSelesai,
    handleFinalFinish,
    handleUnauthorized,
  };
}
