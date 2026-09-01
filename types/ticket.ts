export type TicketStatus = 'Open' | 'Progress' | 'Done' | 'Scrap';

export interface RawTicketData {
  [key: string]: unknown;
}

export interface Ticket {
  id: number | string;
  idTiketAsli: string;
  noTiket?: string;
  pelapor: string;
  namaPelapor?: string;
  tglMasuk: string;
  tglKeluar: string;
  status: TicketStatus | string;
  namaDaisha: string;
  seksi: string;
  noDaisha: string;
  jenisKerusakan: string;
  kategori?: string;
  detail: string;
  reason?: string;
}

export interface CreateTicketPayload {
  action: 'CREATE';
  idTiket: string;
  waktuMasuk: string;
  waktuKeluar: string;
  status: TicketStatus;
  namaPelapor: string;
  seksi: string;
  namaDaisha: string;
  noDaisha: string;
  kategori: string;
  detail: string;
}

export interface UpdateTicketPayload {
  action: 'UPDATE';
  idTiket: string;
  status: TicketStatus | string;
  waktuKeluar: string;
  catatan?: string;
}

export interface DeleteTicketPayload {
  action: 'DELETE';
  idTiket: string;
}

export type TicketApiPayload = CreateTicketPayload | UpdateTicketPayload | DeleteTicketPayload;

export interface AggregateItem {
  name: string;
  value: number;
}
