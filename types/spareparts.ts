export type SparepartKategori = 'Umum' | 'Daisha' | 'Fabrikasi' | 'Elektrik' | 'Safety';

export type LogMutasiTipe = 'MASUK' | 'KELUAR' | 'PENYESUAIAN';

export interface SparepartLog {
  id: number;
  sparepartId: number;
  namaKomponen: string;
  tipe: LogMutasiTipe | string;
  qty: number;
  stokSebelum: number;
  stokSesudah: number;
  referensi?: string | null;
  keterangan?: string | null;
  dibuatOleh: string;
  tanggal: string | Date;
}

export interface Sparepart {
  id: number;
  namaKomponen: string;
  kategori: SparepartKategori | string;
  stokGudang: number;
  satuan: string;
  minStok: number;
  lokasi?: string | null;
  keterangan?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  logs?: SparepartLog[];
}
