/**
 * lib/workflowConstants.ts
 * Definisi alur flowchart Follow-up Request sesuai standar SOP Bridgestone
 */

export type FlowStepCode =
  | 'STEP_1_SUBMITTED'
  | 'STEP_2_WAITING_ATASAN_SEKSI'
  | 'STEP_3_DITERIMA_WORKSHOP'
  | 'STEP_4_EVALUASI_WORKSHOP'
  | 'STEP_5_MENUNGGU_ATASAN_SPROJECT'
  | 'STEP_5_DITOLAK'
  | 'STEP_6_DALAM_PENGERJAAN'
  | 'STEP_7_PEKERJAAN_SELESAI'
  | 'STEP_8_SELESAI';

export interface FlowStepInfo {
  code: FlowStepCode;
  order: number;
  label: string;
  actor: string;
  description: string;
  badgeBg: string;
  badgeColor: string;
}

export const WORKFLOW_STEPS: Record<FlowStepCode, FlowStepInfo> = {
  STEP_1_SUBMITTED: {
    code: 'STEP_1_SUBMITTED',
    order: 1,
    label: 'Pengajuan Form',
    actor: 'Seksi Terkait',
    description: 'Seksi pemohon telah mengisi formulir request perbaikan/modifikasi.',
    badgeBg: 'bg-slate-100',
    badgeColor: 'text-slate-800',
  },
  STEP_2_WAITING_ATASAN_SEKSI: {
    code: 'STEP_2_WAITING_ATASAN_SEKSI',
    order: 2,
    label: 'Menunggu Assign Atasan Seksi',
    actor: 'Atasan Seksi Pemohon',
    description: 'Link persetujuan telah dikirim ke Atasan Seksi untuk ditandatangani.',
    badgeBg: 'bg-amber-50 border border-amber-200',
    badgeColor: 'text-amber-800',
  },
  STEP_3_DITERIMA_WORKSHOP: {
    code: 'STEP_3_DITERIMA_WORKSHOP',
    order: 3,
    label: 'Diterima PIC Workshop',
    actor: 'PIC Workshop / Mentor',
    description: 'Form yang sudah di-assign telah diterima oleh PIC Workshop & Mentor.',
    badgeBg: 'bg-blue-50 border border-blue-200',
    badgeColor: 'text-blue-800',
  },
  STEP_4_EVALUASI_WORKSHOP: {
    code: 'STEP_4_EVALUASI_WORKSHOP',
    order: 4,
    label: 'Evaluasi Pekerjaan',
    actor: 'PIC Workshop Produksi',
    description: 'Evaluasi 4 aspek: 1. Waktu, 2. Men Power, 3. Sparepart, 4. Material.',
    badgeBg: 'bg-indigo-50 border border-indigo-200',
    badgeColor: 'text-indigo-800',
  },
  STEP_5_MENUNGGU_ATASAN_SPROJECT: {
    code: 'STEP_5_MENUNGGU_ATASAN_SPROJECT',
    order: 5,
    label: 'Assign Atasan Special Project',
    actor: 'Atasan S.Project (8210 / 820)',
    description: 'Keputusan Lanjut: Menunggu tanda tangan & keputusan GO dari Atasan Special Project.',
    badgeBg: 'bg-purple-50 border border-purple-200',
    badgeColor: 'text-purple-800',
  },
  STEP_5_DITOLAK: {
    code: 'STEP_5_DITOLAK',
    order: 5,
    label: 'Ditolak',
    actor: 'PIC Workshop / Atasan',
    description: 'Permohonan ditolak dan informasi telah dikirimkan ke seksi terkait.',
    badgeBg: 'bg-rose-50 border border-rose-200',
    badgeColor: 'text-rose-800',
  },
  STEP_6_DALAM_PENGERJAAN: {
    code: 'STEP_6_DALAM_PENGERJAAN',
    order: 6,
    label: 'Proses Pengerjaan',
    actor: 'Operator Workshop Produksi',
    description: 'Status proses ditetapkan. Teknisi/operator sedang mengerjakan di bengkel.',
    badgeBg: 'bg-cyan-50 border border-cyan-200',
    badgeColor: 'text-cyan-800',
  },
  STEP_7_PEKERJAAN_SELESAI: {
    code: 'STEP_7_PEKERJAAN_SELESAI',
    order: 7,
    label: 'Pekerjaan Fisik Selesai',
    actor: 'Operator Workshop Produksi',
    description: 'Pengerjaan fisik selesai oleh operator, menunggu verifikasi akhir PIC Workshop.',
    badgeBg: 'bg-teal-50 border border-teal-200',
    badgeColor: 'text-teal-800',
  },
  STEP_8_SELESAI: {
    code: 'STEP_8_SELESAI',
    order: 8,
    label: 'Selesai & Diinformasikan',
    actor: 'PIC Workshop Produksi',
    description: 'Status selesai ditetapkan, hasil check terisi, dan diinformasikan ke seksi terkait.',
    badgeBg: 'bg-emerald-50 border border-emerald-200',
    badgeColor: 'text-emerald-800',
  },
};

/**
 * Konfigurasi Email Default Terpusat
 */
export const DEFAULT_WORKSHOP_ADMIN_EMAIL = 'admin.workshop@bridgestone.co.id';
export const DEFAULT_ATASAN_SPROJECT_EMAIL = 'atasan.sproject@bridgestone.co.id';
