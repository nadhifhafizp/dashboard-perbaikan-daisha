/**
 * lib/ticketUtils.ts - Utilitas Terpusat Validasi & Perakitan Payload Tiket Daisha
 *
 * Menggabungkan seluruh logika validasi input, sanitasi nama pelapor,
 * dan perakitan string format kerusakan standar (Qty & Tindakan)
 * agar app/input/page.tsx, AdminTicketForm.tsx, dan EditTicketModal.tsx
 * selalu menghasilkan struktur data tiket yang 100% konsisten.
 */

export const INVALID_OPERATOR_NAMES = [
  'Staff Input / Teknisi Lapangan',
  'Admin Maintenance & Rekap',
  'staff input',
  'operator',
  'admin',
  'user',
  'test',
  'contoh',
  '-',
  'null',
  'undefined',
];

export function isInvalidOperatorName(name: string | null | undefined): boolean {
  if (!name) return true;
  const trimmed = name.trim().toLowerCase();
  return !trimmed || INVALID_OPERATOR_NAMES.some((inv) => inv.toLowerCase() === trimmed);
}

export interface TicketValidationInput {
  namaPelapor: string;
  seksi: string;
  noDaisha: string;
  jenisDaisha?: string;
  isDiagnosaBengkel?: boolean;
  totalDamageCount?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
}

export function validateTicketInput(data: TicketValidationInput): ValidationResult {
  if (!data.namaPelapor.trim() || isInvalidOperatorName(data.namaPelapor)) {
    return {
      valid: false,
      field: 'namaPelapor',
      error: 'Harap isi nama Anda sebagai teknisi / operator pelapor.',
    };
  }
  if (!data.seksi) {
    return {
      valid: false,
      field: 'seksi',
      error: 'Harap pilih seksi asal unit Daisha.',
    };
  }
  if (data.jenisDaisha !== undefined && !data.jenisDaisha) {
    return {
      valid: false,
      field: 'jenisDaisha',
      error: 'Harap pilih jenis atau tipe Daisha.',
    };
  }
  if (!data.noDaisha.trim()) {
    return {
      valid: false,
      field: 'noDaisha',
      error: 'Harap isi atau scan nomor fisik unit Daisha.',
    };
  }
  if (!data.isDiagnosaBengkel && (data.totalDamageCount ?? 0) === 0) {
    return {
      valid: false,
      field: 'kerusakan',
      error: 'Harap pilih minimal 1 kerusakan pada katalog atau pilih mode "Cek di Bengkel" jika kerusakan belum diketahui.',
    };
  }
  return { valid: true };
}

export interface DamageAssemblyInput {
  isDiagnosaBengkel: boolean;
  catatanGejala?: string;
  selectedKerusakan: string[]; // array key "komponen:::gejala"
  tindakanMap: Record<string, string>;
  qtyMap: Record<string, number>;
  customKerusakanList?: string[];
  customTindakanMap?: Record<string, string>;
  customQtyMap?: Record<string, number>;
  catatanTambahan?: string;
}

export interface AssembledDamagePayload {
  kategoriKerusakan: string;
  detail: string;
  items: Array<{
    idDetail: number;
    komponen: string;
    gejala: string;
    tindakan: string;
    qty: number;
  }>;
}

/**
 * Merakit katalog kerusakan dan catatan menjadi format standar 100% identik
 */
export function buildTicketDamagePayload(input: DamageAssemblyInput): AssembledDamagePayload {
  const {
    isDiagnosaBengkel,
    catatanGejala = '',
    selectedKerusakan,
    tindakanMap,
    qtyMap,
    customKerusakanList = [],
    customTindakanMap = {},
    customQtyMap = {},
    catatanTambahan = '',
  } = input;

  if (isDiagnosaBengkel) {
    const symptomText = catatanGejala.trim() ? ` Catatan Gejala: ${catatanGejala.trim()}` : '';
    const detail = `• [Pemeriksaan Bengkel] Kerusakan belum diidentifikasi di lapangan.${symptomText}`;
    return {
      kategoriKerusakan: 'Menunggu Diagnosa Bengkel',
      detail,
      items: [
        {
          idDetail: 1,
          komponen: 'Menunggu Diagnosa Bengkel',
          gejala: catatanGejala.trim() || 'Perlu diagnosa teknisi di bengkel',
          tindakan: 'Pemeriksaan',
          qty: 1,
        },
      ],
    };
  }

  const parsedItems = selectedKerusakan.map((key, idx) => {
    const [komponen, detail] = key.split(':::');
    const tindakan = tindakanMap[key] || 'Repair';
    const qty = qtyMap[key] || 1;
    return {
      idDetail: idx + 1,
      komponen: komponen || 'Umum',
      gejala: detail || key,
      tindakan,
      qty,
    };
  });

  const customItems = customKerusakanList.map((customText, idx) => {
    const tindakan = customTindakanMap[customText] || 'Repair';
    const qty = customQtyMap[customText] || 1;
    return {
      idDetail: parsedItems.length + idx + 1,
      komponen: 'Others',
      gejala: customText,
      tindakan,
      qty,
    };
  });

  const allItems = [...parsedItems, ...customItems];
  const listKomponenUnik = Array.from(new Set(allItems.map((p) => p.komponen)));
  const kategoriKerusakan = listKomponenUnik.join(', ') || 'Umum';

  const detailLines = allItems.map((item, idx) => {
    const numPrefix = allItems.length > 1 ? `${idx + 1}. ` : '';
    const qtyStr = `(Qty: ${item.qty}, Tindakan: ${item.tindakan})`;
    return `${numPrefix}[${item.komponen}] ${item.gejala} ${qtyStr}`;
  });

  let detail = detailLines.join(' | ');
  if (catatanTambahan.trim()) {
    detail = `${detail} (Catatan: ${catatanTambahan.trim()})`;
  }

  return {
    kategoriKerusakan,
    detail,
    items: allItems,
  };
}
