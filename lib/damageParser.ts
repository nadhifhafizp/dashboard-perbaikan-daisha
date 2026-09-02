export interface ParsedDamageItem {
  komponen: string;
  gejala: string;
  qty: number;
  tindakan?: 'Repair' | 'Ganti' | string;
  rawText: string;
}

export interface ParsedTicketDetail {
  items: ParsedDamageItem[];
  gantiItems: ParsedDamageItem[];
  repairItems: ParsedDamageItem[];
  otherItems: ParsedDamageItem[];
  totalQtyGanti: number;
  totalQtyRepair: number;
  totalQtyAll: number;
  catatan?: string;
  hasStructuredItems: boolean;
}

/**
 * Parser untuk mengubah string gabungan kerusakan:
 * Contoh: "1. [Roda Putar] Roda aus (Qty: 2, Tindakan: Ganti) | 2. [Body daisha] Tiang miring (Qty: 1, Tindakan: Repair) (Catatan: di line 3)"
 * Menjadi objek terstruktur lengkap dengan jumlah (Qty) dan tindakan (Repair vs Ganti).
 */
export function parseTicketDamageDetail(detailStr?: string | null): ParsedTicketDetail {
  if (!detailStr || detailStr.trim() === '' || detailStr.trim() === '-') {
    return {
      items: [],
      gantiItems: [],
      repairItems: [],
      otherItems: [],
      totalQtyGanti: 0,
      totalQtyRepair: 0,
      totalQtyAll: 0,
      hasStructuredItems: false,
    };
  }

  let text = detailStr.trim();
  let catatan: string | undefined;

  // Ekstrak catatan tambahan jika ada: (Catatan: ...)
  const noteMatch = text.match(/\(Catatan:\s*(.*?)\)\s*$/i);
  if (noteMatch) {
    catatan = noteMatch[1].trim();
    text = text.replace(noteMatch[0], '').trim();
  }

  const rawSplits = text.split('|').map((s) => s.trim()).filter(Boolean);
  const items: ParsedDamageItem[] = [];

  for (const raw of rawSplits) {
    // Pola mencakup:
    // - (Qty: 2, Tindakan: Ganti)
    // - (Tindakan: Ganti, Qty: 2)
    // - (Tindakan: Ganti)
    // - (Qty: 2)
    const match = raw.match(
      /^(?:\d+\.\s*)?\[(.*?)\]\s*(.*?)(?:\s*\((?:(?:Qty|Jumlah):\s*(\d+)(?:,\s*|\s*\|\s*)?Tindakan:\s*(Repair|Ganti)|Tindakan:\s*(Repair|Ganti)(?:,\s*|\s*\|\s*)?(?:Qty|Jumlah):\s*(\d+)|Tindakan:\s*(Repair|Ganti)|(?:Qty|Jumlah):\s*(\d+))\))?$/i
    );

    if (match) {
      const komponen = match[1].trim();
      const gejala = match[2].trim();
      const rawQty = match[3] || match[6] || match[8] || '1';
      const qty = Math.max(1, parseInt(rawQty, 10) || 1);
      const rawTindakan = match[4] || match[5] || match[7] || 'Repair';
      const tindakan: 'Repair' | 'Ganti' =
        rawTindakan.toLowerCase() === 'ganti' ? 'Ganti' : 'Repair';

      items.push({
        komponen,
        gejala,
        qty,
        tindakan,
        rawText: raw,
      });
    } else {
      // Jika teks bebas tanpa kurung siku []
      items.push({
        komponen: 'Umum',
        gejala: raw,
        qty: 1,
        rawText: raw,
      });
    }
  }

  const gantiItems = items.filter((i) => i.tindakan === 'Ganti');
  const repairItems = items.filter((i) => i.tindakan === 'Repair');
  const otherItems = items.filter((i) => !i.tindakan);

  const totalQtyGanti = gantiItems.reduce((acc, curr) => acc + (curr.qty || 1), 0);
  const totalQtyRepair = repairItems.reduce((acc, curr) => acc + (curr.qty || 1), 0);
  const totalQtyAll = items.reduce((acc, curr) => acc + (curr.qty || 1), 0);

  const hasStructuredItems = items.some((i) => i.komponen !== 'Umum' || Boolean(i.tindakan));

  return {
    items,
    gantiItems,
    repairItems,
    otherItems,
    totalQtyGanti,
    totalQtyRepair,
    totalQtyAll,
    catatan,
    hasStructuredItems,
  };
}
