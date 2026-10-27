import { SectionRequestFull } from '../BridgestoneRequestPrintModal';
import { ClientMaterialItem } from '@/lib/materialArea';

export type TabKey = 'evaluasi' | 'materials' | 'pengerjaan' | 'penyelesaian';

export interface SparepartOption {
  id?: number | string;
  namaKomponen: string;
  kategori: string;
  stokGudang: number;
  satuan: string;
  lokasi?: string;
}

export interface EvaluationFormData {
  status: string;
  flowStep: string;
  nomorSurat: string;
  alasanTolak: string;
  alasanPending: string;
  picBengkel: string;
  estimasi: string;
  catatanAdmin: string;
  waktuEstimate: string;
  waktuActual: string;
  orangJamEstimate: string;
  orangJamActual: string;
  kebutuhanSparepart: string;
  kebutuhanMaterial: string;
  biayaEstimate: string;
  biayaActual: string;
  tglPelaksanaanEstimate: string;
  tglPelaksanaanActual: string;
  komentarEstimate: string;
  komentarActual: string;
  keputusan: string;
  keputusan8210: string;
  keputusan820: string;
  hasilCheck: string;
  hasilCheckPemohon: string;
  schedulePlanning: string;
  scheduleActual: string;
}

export interface EvaluationModalProps {
  isOpen: boolean;
  requestData: SectionRequestFull | null;
  onClose: () => void;
  onSuccess: () => void;
}
