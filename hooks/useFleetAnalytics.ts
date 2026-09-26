import { useMemo } from 'react';
import { Ticket } from '@/types/ticket';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { DaishaVariantInfo } from '@/lib/daishaVariants';

export type MaintenanceHealthStatus =
  | 'HEALTHY' // Terawat rutin (jatuh tempo > 7 hari)
  | 'DUE_SOON' // Mendekati jatuh tempo (sisa <= 7 hari)
  | 'OVERDUE' // Lewat tanggal jatuh tempo (> 30 hari sejak servis terakhir)
  | 'DORMANT' // Mengendap / Tidak pernah masuk > 60 hari
  | 'IN_WORKSHOP'; // Saat ini sedang di bengkel (Open / Progress)

export interface FleetUnitItem {
  noDaisha: string;
  namaDaisha: string;
  seksi: string;
  codePrefix: string;
  totalRepairs: number;
  lastRepairDate: string | null;
  lastRepairTicketId: string | null;
  lastRepairProblem: string | null;
  lastRepairAction: string | null;
  daysSinceLastService: number | null;
  nextDueDate: string | null;
  daysUntilDue: number | null;
  status: MaintenanceHealthStatus;
  statusLabel: string;
  isVirtualRegistered?: boolean;
  historyTickets: Ticket[];
}

export interface DaishaTypeFleetSummary {
  id: number | string;
  name: string;
  seksi: string;
  codePrefix: string;
  rangeLabel: string; // Misal: S30 (35 unit), S40 (670 unit)... atau BAN-A-0001 s/d BAN-A-0430
  hasVariants?: boolean;
  variants?: DaishaVariantInfo[];
  registeredUnits: number;
  trackedUnits: number;
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  dormantCount: number;
  inWorkshopCount: number;
}

export interface SectionFleetSummary {
  seksi: string;
  totalUnits: number;
  typeCount: number;
  types: string[];
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  dormantCount: number;
  inWorkshopCount: number;
}

/**
 * Format penomoran unit resmi armada Daisha
 */
export function formatDaishaUnitNumber(prefix: string, index: number): string {
  if (prefix === 'S30') return `S30${String(index).padStart(3, '0')}`;
  if (prefix === 'S40') return `S40${String(index).padStart(3, '0')}`;
  if (prefix === 'M30') return `M30${String(index).padStart(3, '0')}`;
  if (prefix === 'L30') return `L30${String(index).padStart(3, '0')}`;
  if (prefix === 'S00') return `S${String(index).padStart(5, '0')}`; // S00001 to S00500
  if (prefix === 'M00') return `M${String(index).padStart(5, '0')}`; // M00001 to M01040
  if (prefix === 'L00') return `L${String(index).padStart(5, '0')}`; // L00001 to L00220
  if (prefix === 'OHA-CH-' || prefix === 'OHA-LY-') return `${prefix}${String(index).padStart(3, '0')}`;
  // Default 4 digit angka (B/P---0001, BAN-A-0001, PLY---0001, BELT--0001, dll)
  return `${prefix}${String(index).padStart(4, '0')}`;
}

/**
 * Menemukan kunci unit resmi dalam unitMap berdasarkan input nomor Daisha tiket
 * Menangani variasi penulisan seperti "S4 214" -> "S40214", "M 287" -> "M00287", "FIL-A 001" -> "FIL-A-0001", dll.
 */
export function resolveCanonicalUnitKey(
  rawNo: string,
  unitMap: Map<string, FleetUnitItem>
): string | null {
  if (!rawNo) return null;
  const upper = rawNo.trim().toUpperCase();
  if (unitMap.has(upper)) return upper;

  const clean = upper.replace(/[\s\-_]/g, '');
  if (unitMap.has(clean)) return clean;

  // 1. GT Ring pattern: S4 214 -> S40214, S3 024 -> S30024, M3 060 -> M30060, L3 024 -> L30024
  const gtMatch = clean.match(/^([SML])([34])0*(\d{1,4})$/);
  if (gtMatch) {
    const candidate = `${gtMatch[1]}${gtMatch[2]}0${gtMatch[3].padStart(3, '0')}`;
    if (unitMap.has(candidate)) return candidate;
  }

  // 2. Vertical pattern: M 287 -> M00287, S 064 -> S00064, L 010 -> L00010
  const vertMatch = clean.match(/^([SML])0*(\d{1,5})$/);
  if (vertMatch) {
    const candidate = `${vertMatch[1]}${vertMatch[2].padStart(5, '0')}`;
    if (unitMap.has(candidate)) return candidate;
  }

  // 3. Fallback pembersihan separator umum
  for (const key of unitMap.keys()) {
    const keyClean = key.replace(/[\s\-_]/g, '');
    if (keyClean === clean) return key;
  }

  return null;
}

export function useFleetAnalytics(tickets: Ticket[], daishaCatalog: DaishaTreeItem[]) {
  return useMemo(() => {
    const now = new Date();
    const PERIODIC_CYCLE_DAYS = 30; // Siklus maintenance berkala 1 bulan 1x
    const DORMANT_THRESHOLD_DAYS = 60; // Ambang batas unit mengendap

    // 1. Map seluruh tiket berdasarkan noDaisha
    const ticketsByUnit = new Map<string, Ticket[]>();

    tickets.forEach((ticket) => {
      const rawNo = (ticket.noDaisha || '').trim().toUpperCase();
      if (!rawNo || rawNo === '-' || rawNo === 'UNDEFINED') return;

      if (!ticketsByUnit.has(rawNo)) {
        ticketsByUnit.set(rawNo, []);
      }
      ticketsByUnit.get(rawNo)!.push(ticket);
    });

    // 2. Buat map seluruh unit fisik armada
    const unitMap = new Map<string, FleetUnitItem>();

    // A. Generate seluruh unit dari master katalog dinamis PostgreSQL (dengan fallback CANONICAL_DAISHA_CATALOG)
    if (daishaCatalog && daishaCatalog.length > 0) {
      daishaCatalog.forEach((d) => {
        if (d.variants && d.variants.length > 0) {
          d.variants.forEach((v) => {
            const prefix = v.codePrefix || d.codePrefix || '';
            const min = v.minNumber ?? 1;
            const max = v.maxNumber ?? (v.totalUnits || 1);
            for (let i = min; i <= max; i++) {
              const generatedNo = formatDaishaUnitNumber(prefix, i);
              unitMap.set(generatedNo.toUpperCase(), {
                noDaisha: generatedNo,
                namaDaisha: d.name,
                seksi: d.seksi,
                codePrefix: prefix,
                totalRepairs: 0,
                lastRepairDate: null,
                lastRepairTicketId: null,
                lastRepairProblem: null,
                lastRepairAction: null,
                daysSinceLastService: null,
                nextDueDate: null,
                daysUntilDue: null,
                status: 'DORMANT',
                statusLabel: 'Belum Pernah Masuk Bengkel',
                isVirtualRegistered: true,
                historyTickets: [],
              });
            }
          });
        } else if (d.codePrefix && (d.totalUnits || 0) > 0) {
          const prefix = d.codePrefix.trim();
          for (let i = 1; i <= d.totalUnits!; i++) {
            const generatedNo = formatDaishaUnitNumber(prefix, i);
            unitMap.set(generatedNo.toUpperCase(), {
              noDaisha: generatedNo,
              namaDaisha: d.name,
              seksi: d.seksi,
              codePrefix: prefix,
              totalRepairs: 0,
              lastRepairDate: null,
              lastRepairTicketId: null,
              lastRepairProblem: null,
              lastRepairAction: null,
              daysSinceLastService: null,
              nextDueDate: null,
              daysUntilDue: null,
              status: 'DORMANT',
              statusLabel: 'Belum Pernah Masuk Bengkel',
              isVirtualRegistered: true,
              historyTickets: [],
            });
          }
        }
      });
    }

    // B. Perkaya dengan tiket riil aktual dari workshop
    ticketsByUnit.forEach((unitTickets, noDaisha) => {
      unitTickets.sort((a, b) => {
        const timeA = new Date(a.tglMasuk || 0).getTime();
        const timeB = new Date(b.tglMasuk || 0).getTime();
        return timeB - timeA;
      });

      const latestTicket = unitTickets[0];
      const activeTicket = unitTickets.find((t) => {
        const s = (t.status || '').toUpperCase();
        return s === 'OPEN' || s === 'PROGRESS' || s === 'ANTRE' || s === 'DIKERJAKAN';
      });

      const lastRepairDate = latestTicket.tglMasuk || null;
      let daysSince: number | null = null;
      let nextDueDateStr: string | null = null;
      let daysUntilDue: number | null = null;

      if (lastRepairDate) {
        const lastDateObj = new Date(lastRepairDate);
        if (!isNaN(lastDateObj.getTime())) {
          const diffMs = now.getTime() - lastDateObj.getTime();
          daysSince = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

          const nextDueObj = new Date(lastDateObj);
          nextDueObj.setDate(nextDueObj.getDate() + PERIODIC_CYCLE_DAYS);
          nextDueDateStr = nextDueObj.toISOString();

          const diffDueMs = nextDueObj.getTime() - now.getTime();
          daysUntilDue = Math.ceil(diffDueMs / (1000 * 60 * 60 * 24));
        }
      }

      let status: MaintenanceHealthStatus = 'HEALTHY';
      let statusLabel = 'Terawat Rutin';

      if (activeTicket) {
        const s = (activeTicket.status || '').toUpperCase();
        status = 'IN_WORKSHOP';
        statusLabel = s === 'PROGRESS' || s === 'DIKERJAKAN' ? 'Sedang Dikerjakan' : 'Dalam Antrean Bengkel';
      } else if (daysSince === null || daysSince >= DORMANT_THRESHOLD_DAYS) {
        status = 'DORMANT';
        statusLabel = daysSince === null ? 'Belum Pernah Masuk Bengkel' : `Anomali: Tidak Masuk > ${DORMANT_THRESHOLD_DAYS} Hari`;
      } else if (daysSince > PERIODIC_CYCLE_DAYS) {
        status = 'OVERDUE';
        statusLabel = `Overdue Maintenance (+${daysSince - PERIODIC_CYCLE_DAYS} hari)`;
      } else if (daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0) {
        status = 'DUE_SOON';
        statusLabel = daysUntilDue === 0 ? 'Jatuh Tempo Hari Ini' : `Mendekati Waktu (${daysUntilDue} hari lagi)`;
      } else {
        status = 'HEALTHY';
        statusLabel = 'Terawat Rutin';
      }

      const parsedLatest = parseTicketDamageDetail(latestTicket.detail);
      const firstDamageItem = parsedLatest.items[0];

      // Cari apakah nomor unit cocok dengan unit registri master yang sudah digenerate
      const canonicalKey = resolveCanonicalUnitKey(noDaisha, unitMap);

      if (canonicalKey && unitMap.has(canonicalKey)) {
        const existing = unitMap.get(canonicalKey)!;
        unitMap.set(canonicalKey, {
          ...existing,
          totalRepairs: (existing.totalRepairs || 0) + unitTickets.length,
          lastRepairDate,
          lastRepairTicketId: String(latestTicket.idTiketAsli || latestTicket.noTiket || latestTicket.id),
          lastRepairProblem: latestTicket.jenisKerusakan || firstDamageItem?.gejala || latestTicket.detail || null,
          lastRepairAction: firstDamageItem?.tindakan || null,
          daysSinceLastService: daysSince,
          nextDueDate: nextDueDateStr,
          daysUntilDue,
          status,
          statusLabel,
          historyTickets: [...(existing.historyTickets || []), ...unitTickets],
        });
      } else {
        // Cek apakah tiket ini milik jenis Daisha non-prefix (nomor seri fisik fleksibel)
        // (Contoh: Can Auto Pigmen, Battery car, Transfer box roll, dll.)
        // Cek apakah tiket ini cocok dengan Daisha di database
        const catalogDef = (daishaCatalog || []).find(
          (c) => c.name.toLowerCase() === (latestTicket.namaDaisha || '').trim().toLowerCase()
        );

        if (catalogDef && (catalogDef.totalUnits === 0 || !catalogDef.codePrefix)) {
          unitMap.set(noDaisha.toUpperCase(), {
            noDaisha,
            namaDaisha: catalogDef.name,
            seksi: catalogDef.seksi,
            codePrefix: '',
            totalRepairs: unitTickets.length,
            lastRepairDate,
            lastRepairTicketId: String(latestTicket.idTiketAsli || latestTicket.noTiket || latestTicket.id),
            lastRepairProblem: latestTicket.jenisKerusakan || firstDamageItem?.gejala || latestTicket.detail || null,
            lastRepairAction: firstDamageItem?.tindakan || null,
            daysSinceLastService: daysSince,
            nextDueDate: nextDueDateStr,
            daysUntilDue,
            status,
            statusLabel,
            isVirtualRegistered: false,
            historyTickets: unitTickets,
          });
        }
      }
    });

    const allUnits = Array.from(unitMap.values());

    // 3. Hitung Agregat KPI Armada Pabrik
    const totalFleetUnits = allUnits.length;
    const inWorkshopUnits = allUnits.filter((u) => u.status === 'IN_WORKSHOP').length;
    const overdueUnits = allUnits.filter((u) => u.status === 'OVERDUE').length;
    const dueSoonUnits = allUnits.filter((u) => u.status === 'DUE_SOON').length;
    const dormantUnits = allUnits.filter((u) => u.status === 'DORMANT').length;
    const healthyUnits = allUnits.filter((u) => u.status === 'HEALTHY').length;

    // 4. Breakdown per 7 Seksi Resmi Pabrik
    const OFFICIAL_SECTIONS: string[] = ['Bead', 'Banbury', 'Cutt/Cal', 'Extruding', 'Building', 'Poly Film', 'All seksi'];

    const sectionSummaries: SectionFleetSummary[] = OFFICIAL_SECTIONS.map((seksiName) => {
      // Ambil unit yang cocok dengan seksi ini
      const uList = allUnits.filter(
        (u) => (u.seksi || '').trim().toLowerCase() === seksiName.trim().toLowerCase()
      );

      // Ambil seluruh jenis Daisha yang terdaftar di seksi ini dari database katalog
      const typesForSection = (daishaCatalog || [])
        .filter((def) => (def.seksi || '').toLowerCase() === seksiName.toLowerCase())
        .map((def) => def.name);

      return {
        seksi: seksiName,
        totalUnits: uList.length,
        typeCount: typesForSection.length,
        types: typesForSection,
        healthyCount: uList.filter((u) => u.status === 'HEALTHY').length,
        dueSoonCount: uList.filter((u) => u.status === 'DUE_SOON').length,
        overdueCount: uList.filter((u) => u.status === 'OVERDUE').length,
        dormantCount: uList.filter((u) => u.status === 'DORMANT').length,
        inWorkshopCount: uList.filter((u) => u.status === 'IN_WORKSHOP').length,
      };
    });

    // 5. Breakdown per Jenis/Tipe Daisha Kanonikal (didukung rincian varian S/M/L)
    const typeSummaries: DaishaTypeFleetSummary[] = (daishaCatalog || []).map((catalogItem) => {
      const matchingUnits = allUnits.filter(
        (u) => u.namaDaisha.trim().toLowerCase() === catalogItem.name.trim().toLowerCase()
      );

      const regCount = Number(catalogItem.totalUnits) || matchingUnits.length;
      const prefix = catalogItem.codePrefix || '-';
      
      let rangeLabel = '-';
      if (catalogItem.variants && catalogItem.variants.length > 0) {
        rangeLabel = catalogItem.variants
          .map((v) => v.rangeFormat || (v.codePrefix ? `${v.codePrefix}${v.minNumber ?? 1}-${v.maxNumber ?? 1}` : ''))
          .filter(Boolean)
          .join(', ');
      } else if (regCount > 0 && prefix !== '-') {
        rangeLabel = `${formatDaishaUnitNumber(prefix, 1)} s/d ${formatDaishaUnitNumber(prefix, regCount)}`;
      } else if (regCount === 0) {
        rangeLabel = 'Belum ada nomor barcode';
      }

      return {
        id: catalogItem.id,
        name: catalogItem.name,
        seksi: catalogItem.seksi,
        codePrefix: prefix,
        rangeLabel,
        hasVariants: Boolean(catalogItem.variants && catalogItem.variants.length > 0),
        variants: (catalogItem.variants || []).map((v) => ({
          id: String(v.id),
          name: v.name,
          ukuran: (v.ukuran as 'Small' | 'Medium' | 'Large') || undefined,
          susunan: (v.susunan as 'Susun 3' | 'Susun 4') || undefined,
          tipe: v.tipe,
          codePrefix: v.codePrefix || '',
          padLength: v.padLength,
          minNumber: v.minNumber ?? 1,
          maxNumber: v.maxNumber ?? 1,
          totalUnits: v.totalUnits ?? 0,
          rangeFormat: v.rangeFormat || '',
          badgeColor: v.badgeColor,
        })),
        registeredUnits: regCount,
        trackedUnits: matchingUnits.length,
        healthyCount: matchingUnits.filter((u) => u.status === 'HEALTHY').length,
        dueSoonCount: matchingUnits.filter((u) => u.status === 'DUE_SOON').length,
        overdueCount: matchingUnits.filter((u) => u.status === 'OVERDUE').length,
        dormantCount: matchingUnits.filter((u) => u.status === 'DORMANT').length,
        inWorkshopCount: matchingUnits.filter((u) => u.status === 'IN_WORKSHOP').length,
      };
    });

    typeSummaries.sort((a, b) => b.registeredUnits - a.registeredUnits);

    // 6. Unit Mendesak & Unit Dormant
    const urgentReminderUnits = allUnits
      .filter((u) => u.status === 'OVERDUE' || u.status === 'DUE_SOON')
      .sort((a, b) => (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999));

    const dormantAlertUnits = allUnits
      .filter((u) => u.status === 'DORMANT')
      .sort((a, b) => (b.daysSinceLastService ?? 999) - (a.daysSinceLastService ?? 999));

    return {
      allUnits,
      totalFleetUnits,
      healthyUnits,
      dueSoonUnits,
      overdueUnits,
      dormantUnits,
      inWorkshopUnits,
      sectionSummaries,
      typeSummaries,
      urgentReminderUnits,
      dormantAlertUnits,
    };
  }, [tickets, daishaCatalog]);
}
