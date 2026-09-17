export type RequestStatus = 'Diajukan' | 'Disetujui' | 'Dikerjakan' | 'Selesai' | 'Ditolak';

export type RequestUrgensi = 'Normal' | 'Urgent' | 'Critical';

export interface SectionRequestMaterial {
  id: number;
  requestId: number;
  sparepartId?: number | null;
  namaKomponen: string;
  qty: number;
  keterangan?: string | null;
}

export interface SectionRequest {
  id: number;
  nomorRequest: string;
  seksiPemohon: string;
  picPemohon: string;
  kontakPemohon?: string | null;
  namaBarang: string;
  spesifikasi?: string | null;
  jumlah: number;
  satuan: string;
  urgensi: RequestUrgensi | string;
  catatan?: string | null;
  fotoUrl?: string | null;
  status: RequestStatus | string;
  alasanTolak?: string | null;
  picBengkel?: string | null;
  estimasi?: string | null;
  catatanAdmin?: string | null;
  dibuatOleh: string;
  waktuDibuat: string | Date;
  waktuUpdate: string | Date;
  waktuSelesai?: string | Date | null;
  materials?: SectionRequestMaterial[];
}
