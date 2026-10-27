import { FleetUnit } from '../FleetExplorer';

export const formatUkuran = (ukuran?: string | null): string => {
  if (!ukuran) return 'Standar';
  const clean = ukuran.trim().toUpperCase();
  if (
    clean === 'NONE' ||
    clean === 'STD' ||
    clean === 'STANDARD' ||
    clean === 'STANDAR'
  ) {
    return 'Standar';
  }
  return ukuran.trim();
};

export interface PmStagingRecord {
  id: number;
  seksi: string;
  units: string[];
  lokasi: string;
  catatan: string | null;
  pelapor: string;
  status: 'WAITING_PICKUP' | 'PICKED_UP' | 'COMPLETED';
  createdAt: string;
  pickedUpAt: string | null;
  completedAt: string | null;
}

export interface ColorCodedVariantGroup {
  key: string;
  name: string;
  ukuran: string;
  prefix: string;
  totalUnits: number;
  dueUnits: FleetUnit[];
  stagedUnits: { unit: FleetUnit; lokasi: string }[];
  doneUnits: FleetUnit[];
  pctDone: number;
  pctStaged: number;
  pctDue: number;
  dailyTarget: number;
  stagedTodayCount: number;
  isTargetFulfilled: boolean;
  remainingTarget: number;
}

export interface StagedLocationGroup {
  lokasi: string;
  units: string[];
  records: PmStagingRecord[];
  status: 'WAITING_PICKUP' | 'PICKED_UP';
  waktuTerbaru: string;
  pelaporTerbaru: string;
  catatan?: string | null;
}
