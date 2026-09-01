import { Ticket, RawTicketData, TicketStatus } from '@/types/ticket';
import { formatDateTime } from './date';

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
    const found = Object.keys(obj).find((k) => k.toLowerCase().replace(/[\s_]/g, "") === cleanKey);
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

// Parser terpusat yang memetakan raw Excel/SharePoint JSON ke model domain Ticket
export function processRawTicketData(hasilData: RawTicketData[]): Ticket[] {
  if (!Array.isArray(hasilData)) return [];

  return hasilData
    .map((item, index) => {
      const idTiket = getValue(item, ["idTiket", "ID Tiket", "ticketId"]);
      const extractedNoDaisha = getValue(item, ["noDaisha", "No Daisha", "nomorDaisha", "noUnit"]) || "-";
      const extractedNamaDaisha = getValue(item, ["namaDaisha", "Nama Daisha", "daisha"]) || "-";

      const rawStatus = getValue(item, ["status", "Status"]);
      let cleanStatus = normalizeStatus(rawStatus);
      let reason = getValue(item, ["catatan", "Catatan Teknisi", "CatatanTeknisi", "keterangan"]) || "";
      let tglKeluar = formatDateTime(getValue(item, ["waktuKeluar", "Waktu Keluar", "tanggalKeluar"]));

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
        jenisKerusakan: getValue(item, ["kategori", "Kategori", "jenisKerusakan", "Kerusakan"]) || "-",
        detail: getValue(item, ["detail", "Detail", "gejala", "Gejala", "rincian"]) || "-",
        pelapor: getValue(item, ["namaPelapor", "Nama Pelapor", "pelapor", "Nama"]) || "-",
        seksi: getValue(item, ["seksi", "Seksi", "departemen"]) || "-",
        status: cleanStatus,
        tglMasuk: formatDateTime(getValue(item, ["waktuMasuk", "Waktu Masuk", "tanggalMasuk"])),
        tglKeluar,
        reason,
      };
    })
    .filter(
      (item) =>
        item.namaDaisha !== "-" &&
        item.namaDaisha !== "" &&
        item.namaDaisha.toLowerCase() !== "nama daisha"
    );
}
