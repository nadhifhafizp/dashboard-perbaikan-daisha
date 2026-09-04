import { Ticket, RawTicketData, TicketStatus } from '@/types/ticket';
import { formatDisplayDate } from './date';

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
    if (obj[key] !== undefined && obj[key] !== null) return String(obj[key]);
    const cleanKey = key.toLowerCase().replace(/[\s_]/g, "");
    const found = Object.keys(obj).find((k) => {
      const cleanK = k.toLowerCase().replace(/[\s_]/g, "");
      return cleanK === cleanKey;
    });
    if (found && obj[found] !== undefined && obj[found] !== null) return String(obj[found]);
  }
  return null;
}

// Local cache override untuk mencegah visual rollback sesaat setelah Admin update status (akibat delay Power Automate sync)
export interface StatusOverrideEntry {
  status: TicketStatus;
  waktuKeluar: string;
  reason: string;
  timestamp: number;
}

export const localStatusOverrides = new Map<string, StatusOverrideEntry>();

export function setStatusOverride(idTiket: string, status: TicketStatus, waktuKeluar = '-', reason = '') {
  localStatusOverrides.set(idTiket, {
    status,
    waktuKeluar,
    reason,
    timestamp: Date.now()
  });
}

/**
 * Ekstraksi array mentah dari berbagai bentuk respons Power Automate / SharePoint API
 * (array langsung, atau objek dengan properti data, value, d, items, records, result)
 */
export function extractRawTicketArray(jsonResult: unknown): RawTicketData[] {
  if (Array.isArray(jsonResult)) {
    return jsonResult as RawTicketData[];
  }
  if (jsonResult && typeof jsonResult === 'object') {
    const record = jsonResult as Record<string, unknown>;
    const potentialKeys = ['data', 'value', 'd', 'items', 'records', 'result'];
    for (const key of potentialKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as RawTicketData[];
      }
    }
  }
  return [];
}

// Parser terpusat yang memetakan raw Excel/SharePoint JSON ke model domain Ticket
export function processRawTicketData(hasilData: RawTicketData[]): Ticket[] {
  if (!Array.isArray(hasilData)) return [];

  return hasilData
    .map((item, index) => {
      const idTiket = getValue(item, ["ID_Tiket", "idTiket", "ID Tiket", "ticketId", "id_tiket"]);
      const extractedNoDaisha = getValue(item, ["No_Daisha", "noDaisha", "No Daisha", "nomorDaisha", "noUnit", "no_daisha"]) || "-";
      const extractedNamaDaisha = getValue(item, ["Nama_Daisha", "namaDaisha", "Nama Daisha", "daisha", "nama_daisha"]) || "-";

      const rawStatus = getValue(item, ["Status", "status"]);
      let cleanStatus = normalizeStatus(rawStatus);
      let reason = getValue(item, ["Catatan", "catatan", "Catatan Teknisi", "CatatanTeknisi", "keterangan"]) || "";
      let tglKeluar = formatDisplayDate(getValue(item, ["Waktu_Keluar", "waktuKeluar", "Waktu Keluar", "tanggalKeluar"]));

      // Pertahankan status lokal jika baru saja diupdate dalam 60 detik terakhir
      const override = localStatusOverrides.get(idTiket || "");
      if (override && (Date.now() - override.timestamp < 60000)) {
        if (override.status !== 'Open' && cleanStatus === 'Open') {
          cleanStatus = override.status;
          if (override.waktuKeluar && override.waktuKeluar !== '-') tglKeluar = override.waktuKeluar;
          if (override.reason) reason = override.reason;
        }
      }

      return {
        id: idTiket || `temp-${index}`,
        idTiketAsli: idTiket || "-",
        noDaisha: extractedNoDaisha,
        namaDaisha: extractedNamaDaisha,
        jenisKerusakan: getValue(item, [
          "Kategori_Kerusakan",
          "KategoriKerusakan",
          "kategori_kerusakan",
          "kategori",
          "Kategori",
          "jenisKerusakan",
          "jenis_kerusakan",
          "Kerusakan"
        ]) || "-",
        detail: getValue(item, [
          "Detail_Kerusakan",
          "DetailKerusakan",
          "detail_kerusakan",
          "detail",
          "Detail",
          "gejala",
          "Gejala",
          "rincian",
          "rincian_kerusakan"
        ]) || "-",
        pelapor: getValue(item, [
          "Nama_Pelapor",
          "NamaPelapor",
          "nama_pelapor",
          "namaPelapor",
          "Nama Pelapor",
          "pelapor",
          "Nama"
        ]) || "-",
        seksi: getValue(item, ["Seksi", "seksi", "departemen"]) || "-",
        status: cleanStatus,
        tglMasuk: formatDisplayDate(getValue(item, ["Waktu_Masuk", "waktuMasuk", "Waktu Masuk", "tanggalMasuk"])),
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
