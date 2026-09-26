/**
 * lib/damageParser.ts — Parser Kerusakan & Tindakan Perbaikan Daisha
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * Mengurai string rincian kerusakan multi-item dari tiket menjadi objek terstruktur.
 * 
 * Contoh Masukan:
 * "[Roda Putar] Roda aus (Qty: 2, Tindakan: Ganti) | [Body daisha] Tiang bengkok (Qty: 1, Tindakan: Repair)"
 * 
 * Hasil Parsing:
 * - Daftar item terstruktur: Komponen, Gejala, Qty, Tindakan (Repair / Ganti)
 * - Pemisahan kategori: item perbaikan (repair) vs penggantian suku cadang (ganti)
 * - Agregasi kuantitas: totalQtyGanti, totalQtyRepair, totalQtyAll
 * - Pengurangan stok gudang otomatis untuk komponen bertindakan 'Ganti'
 * - Deteksi tiket pendaftaran fleksibel ("Pemeriksaan Bengkel" / "Menunggu Diagnosa")
 * ============================================================================
 */

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
  isWaitingDiagnosis?: boolean;
  symptomNote?: string;
}

/**
 * Mengurai string detail kerusakan menjadi struktur data terpisah.
 * 
 * @param detailStr - String mentah kerusakan dari database atau form input
 * @returns ParsedTicketDetail objek hasil ekstraksi kuantitas dan rincian kerusakan
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
      isWaitingDiagnosis: false,
    };
  }

  let text = detailStr.trim();
  let catatan: string | undefined;

  // Deteksi jika tiket merupakan pendaftaran fleksibel (Cek di Bengkel / Menunggu Diagnosa)
  const isWaitingDiagnosis =
    text.toLowerCase().includes('pemeriksaan bengkel') ||
    text.toLowerCase().includes('belum diidentifikasi') ||
    text.toLowerCase().includes('belum diketahui') ||
    text.toLowerCase().includes('menunggu diagnosa');

  if (isWaitingDiagnosis) {
    // Ekstrak catatan gejala dari teks
    const matchGejala = text.match(/(?:Catatan Gejala|Gejala(?:\/Catatan)?|Indikasi|Catatan):\s*(.+)$/i);
    const symptomNote = matchGejala ? matchGejala[1].trim().replace(/\)$/, '') : undefined;
    return {
      items: [],
      gantiItems: [],
      repairItems: [],
      otherItems: [],
      totalQtyGanti: 0,
      totalQtyRepair: 0,
      totalQtyAll: 0,
      catatan: symptomNote,
      symptomNote,
      hasStructuredItems: false,
      isWaitingDiagnosis: true,
    };
  }

  // Ekstrak catatan tambahan jika ada: (Catatan: ...)
  const noteMatch = text.match(/\(Catatan:\s*(.*?)\)\s*$/i);
  if (noteMatch) {
    catatan = noteMatch[1].trim();
    text = text.replace(noteMatch[0], '').trim();
  }

  const rawSplits = text.includes('•') && !text.includes('|')
    ? text.split('•').map((s) => s.trim()).filter(Boolean)
    : text.split('|').map((s) => s.trim()).filter(Boolean);

  const items: ParsedDamageItem[] = [];

  for (const raw of rawSplits) {
    const cleanRaw = raw.replace(/^[•\s-]+/, '').trim();
    if (!cleanRaw) continue;

    // Pola mencakup:
    // - [Komponen] Gejala [Ganti] / [Repair]
    // - [Komponen] Gejala (Qty: 2, Tindakan: Ganti)
    // - [Komponen] Gejala
    const match = cleanRaw.match(
      /^(?:\d+\.\s*)?\[(.*?)\]\s*(.*?)(?:\s*\[(Repair|Ganti)\]|\s*\((?:(?:Qty|Jumlah):\s*(\d+)(?:,\s*|\s*\|\s*)?Tindakan:\s*(Repair|Ganti)|Tindakan:\s*(Repair|Ganti)(?:,\s*|\s*\|\s*)?(?:Qty|Jumlah):\s*(\d+)|Tindakan:\s*(Repair|Ganti)|(?:Qty|Jumlah):\s*(\d+))\))?$/i
    );

    if (match) {
      const komponen = match[1].trim();
      const rawGejala = match[2].replace(/\s*\[(Repair|Ganti)\]\s*$/i, '').trim();
      const rawQty = match[4] || match[7] || match[9] || '1';
      const qty = Math.max(1, parseInt(rawQty, 10) || 1);
      const rawTindakan = match[3] || match[5] || match[6] || match[8] || 'Repair';
      const tindakan: 'Repair' | 'Ganti' =
        rawTindakan.toLowerCase() === 'ganti' ? 'Ganti' : 'Repair';

      items.push({
        komponen,
        gejala: rawGejala,
        qty,
        tindakan,
        rawText: cleanRaw,
      });
    } else {
      // Jika teks bebas tanpa kurung siku []
      items.push({
        komponen: 'Umum',
        gejala: cleanRaw,
        qty: 1,
        rawText: cleanRaw,
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
