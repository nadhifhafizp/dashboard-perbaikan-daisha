/**
 * lib/ticketParser.ts — Normalisasi & Transformasi Data Tiket Perbaikan Daisha
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * 1. Mengubah status tiket heterogen menjadi enum baku ('Open', 'Progress', 'Done', 'Scrap').
 * 2. Ekstraksi field tangguh (tolerant extractor) yang mendukung berbagai variasi penamaan kolom.
 * 3. Sanitasi dan transformasi data mentah JSON dari backend/database menjadi array interface `Ticket`.
 * ============================================================================
 */
import { Ticket, RawTicketData, TicketStatus } from '@/types/ticket';
import { formatDisplayDate } from './date';

/**
 * Menormalkan status tiket dari berbagai format input menjadi status standar sistem.
 * 
 * @param val - Nilai status mentah (misal: "dalam proses", "complete", "afkir")
 * @returns TicketStatus standar ('Open' | 'Progress' | 'Done' | 'Scrap')
 */
export function normalizeStatus(val: unknown): TicketStatus {
  if (!val) return 'Open';
  const s = String(val).trim().toLowerCase();
  if (s === 'progress' || s === 'dalam proses' || s === 'sedang dikerjakan') return 'Progress';
  if (s === 'done' || s === 'selesai' || s === 'complete') return 'Done';
  if (s === 'scrap' || s === 'afkir' || s === 'rusak') return 'Scrap';
  return 'Open';
}

export function getValue(obj: RawTicketData, possibleKeys: string[]): string | null {
  if (!obj) return null;
  for (const key of possibleKeys) {
    if (obj[key] != null) return String(obj[key]);
  }
  const objKeys = Object.keys(obj);
  const normalizedMap = new Map(objKeys.map(k => [k.toLowerCase().replace(/[\s_]/g, ''), k]));
  for (const key of possibleKeys) {
    const target = key.toLowerCase().replace(/[\s_]/g, '');
    const matchedKey = normalizedMap.get(target);
    if (matchedKey && obj[matchedKey] != null) return String(obj[matchedKey]);
  }
  return null;
}

export function extractRawTicketArray(jsonResult: unknown): RawTicketData[] {
  if (Array.isArray(jsonResult)) return jsonResult as RawTicketData[];
  if (jsonResult && typeof jsonResult === 'object') {
    const record = jsonResult as Record<string, unknown>;
    for (const key of ['data', 'value', 'd', 'items', 'records', 'result']) {
      if (Array.isArray(record[key])) return record[key] as RawTicketData[];
    }
  }
  return [];
}

export function processRawTicketData(hasilData: RawTicketData[]): Ticket[] {
  if (!Array.isArray(hasilData)) return [];

  return hasilData
    .map((item, index) => {
      const idTiket = getValue(item, ["ID_Tiket", "ticketId"]);
      const extractedNoDaisha = getValue(item, ["No_Daisha", "nomorDaisha", "noUnit"]) || "-";
      const extractedNamaDaisha = getValue(item, ["Nama_Daisha", "daisha"]) || "-";

      const rawStatus = getValue(item, ["Status"]);
      const cleanStatus = normalizeStatus(rawStatus);
      const reason = getValue(item, ["Catatan", "keterangan"]) || "";
      const tglKeluar = formatDisplayDate(getValue(item, ["Waktu_Keluar", "tanggalKeluar"]));

      return {
        id: idTiket || `temp-${index}`,
        idTiketAsli: idTiket || "-",
        noDaisha: extractedNoDaisha,
        namaDaisha: extractedNamaDaisha,
        jenisKerusakan: getValue(item, ["Kategori_Kerusakan", "jenisKerusakan", "Kerusakan"]) || "-",
        detail: getValue(item, ["Detail_Kerusakan", "gejala", "rincian"]) || "-",
        pelapor: getValue(item, ["Nama_Pelapor", "pelapor", "Nama"]) || "-",
        seksi: getValue(item, ["Seksi", "departemen"]) || "-",
        status: cleanStatus,
        tglMasuk: formatDisplayDate(getValue(item, ["Waktu_Masuk", "tanggalMasuk"])),
        tglKeluar,
        reason,
      };
    })
    .filter(
      (item) =>
        item.namaDaisha !== "-" &&
        item.noDaisha !== "-" &&
        item.idTiketAsli !== "-"
    );
}
