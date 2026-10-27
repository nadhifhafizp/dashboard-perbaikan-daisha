export type FlowchartFilter =
  | 'all'
  | 'waiting_atasan'
  | 'workshop'
  | 'process'
  | 'pending_material'
  | 'completed'
  | 'rejected';

export const DAFTAR_SEKSI_REQUEST = [
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

export const DAFTAR_TUJUAN = [
  'Safety',
  'Quality',
  'Peningkatan Produksi',
  'Cost Down',
  'Penambahan Produksi',
  'Lain-lain',
];

export interface RequestFormData {
  nomorRequest: string;
  seksiPemohon: string;
  kodeSeksi: string;
  drafter: string;
  foreman: string;
  namaAtasanSeksi: string;
  emailAtasanSeksi: string;
  emailMentorWorkshop: string;
  picPemohon: string;
  kontakPemohon: string;
  perihal: string;
  namaMachine: string;
  namaBarang: string;
  tujuan: string;
  alasan: string;
  urgensi: string;
  jumlah: number;
  satuan: string;
  keadaanSekarang: string;
  fotoSebelum: string;
  rencanaTindakan: string;
  fotoSesudah: string;
  targetHasil: string;
  penjelasanPelaksanaan: string;
}

export interface SubmittedData {
  nomorRequest: string;
  perihal: string;
  emailAtasan: string;
  namaAtasan: string;
  approvalLink: string;
  mailtoUrl: string;
}

export { UrgensiBadge } from './UrgensiBadge';
