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

  const [prevRequest, setPrevRequest] = useState(requestData);
  if (requestData !== prevRequest) {
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
        keputusan8210: requestData.keputusan8210 || '',
        keputusan820: requestData.keputusan820 || '',
        hasilCheck: requestData.hasilCheck || '',
        hasilCheckPemohon: requestData.hasilCheckPemohon || '',
        schedulePlanning: requestData.schedulePlanning || '',
        scheduleActual: requestData.scheduleActual || '',
      });
      setErrorMsg('');
      setNotifSuccessData(null);
      setShowPendingDialog(false);

      if (requestData.status?.includes('Material Habis') || requestData.status === 'Dikerjakan') {
        setActiveTab('pengerjaan');
      } else if (requestData.status === 'Pekerjaan Fisik Selesai' || requestData.status === 'Selesai') {
        setActiveTab('penyelesaian');
      } else {
        setActiveTab('evaluasi');
      }
    }
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

  const handleAssignAtasanSpecialProject = () => {
    void handleSaveAction('EVALUASI_WORKSHOP', {
      assignAtasanSpecialProject: true,
      keputusan8210: formData.keputusan8210 || 'Eng 8210',
      keputusan820: formData.keputusan820 || 'Mgr 820',
      status: 'Dikerjakan',
      flowStep: 'STEP_6_DALAM_PENGERJAAN',
    });
  };

  const handleSetPendingMaterial = async () => {
    if (!requestData) return;
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
    void handleSaveAction('EVALUASI_WORKSHOP', {
      status: 'Pekerjaan Fisik Selesai',
      flowStep: 'STEP_7_PEKERJAAN_SELESAI',
    });
    setActiveTab('penyelesaian');
  };

  const handleFinalFinish = () => {
    void handleSaveAction('FINISH_REQUEST', {
      status: 'Selesai',
      flowStep: 'STEP_8_SELESAI',
    });
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    errorMsg,
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
