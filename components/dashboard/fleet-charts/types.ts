export interface CatalogItemData {
  id: number;
  name: string;
  seksi: string;
  codePrefix?: string | null;
  totalUnits: number;
  components?: Array<{
    id: number;
    name: string;
    symptoms?: Array<{ id: number; description: string }>;
  }>;
  variants?: Array<{
    id: number;
    name: string;
    ukuran?: string | null;
    codePrefix?: string | null;
    totalUnits: number;
    rangeFormat?: string | null;
    minNumber?: number | null;
    maxNumber?: number | null;
  }>;
}

export interface JenisHealthItem {
  id?: number;
  nama: string;
  seksi?: string;
  total: number;
  ready: number;
  broken: number;
  pctReady: number;
  pctBroken: number;
  seksiList: string[];
  codePrefix?: string | null;
  components?: Array<{
    id: number;
    name: string;
    symptoms?: Array<{ id: number; description: string }>;
  }>;
  variants?: Array<{
    id: number;
    name: string;
    ukuran?: string | null;
    codePrefix?: string | null;
    totalUnits: number;
    rangeFormat?: string | null;
    minNumber?: number | null;
    maxNumber?: number | null;
  }>;
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
