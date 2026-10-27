export interface JenisHealthItem {
  nama: string;
  total: number;
  ready: number;
  broken: number;
  pctReady: number;
  pctBroken: number;
  seksiList: string[];
}

export interface BreakdownItem {
  label: string;
  seksi?: string;
  jenis?: string;
  total: number;
  oke: number;
  ng: number;
  pctOke: number;
  pctNg: number;
}

export interface RecurringUnitItem {
  noDaisha: string;
  namaDaisha: string;
  seksi: string;
  repairCount: number;
  activeInWorkshop: boolean;
}
