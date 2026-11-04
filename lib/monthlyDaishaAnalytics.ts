import { Ticket } from '@/types/ticket';
import { parseToISODate, parseToTimestamp } from '@/lib/date';

export interface MonthlyDaishaItem {
  monthKey: string; // '2026-01'
  year: string; // '2026'
  monthIndex: number; // 1-12
  monthShort: string; // 'Jan'
  monthName: string; // 'Januari'
  monthLabel: string; // 'Jan 2026'
  totalMasuk: number;
  selesai: number;
  proses: number;
  scrap: number;
  completionRate: number; // 0-100%
  momDiff: number; // selisih vs bulan sebelumnya
  momGrowth: number | null; // % pertumbuhan vs bulan sebelumnya
  topSeksi: string;
  topSeksiCount: number;
  byJenisDaisha: Record<string, number>;
}

export interface MonthlyDaishaSummary {
  monthlyData: MonthlyDaishaItem[];
  availableYears: string[];
  totalMasuk: number;
  totalSelesai: number;
  totalProses: number;
  totalScrap: number;
  avgMonthly: number;
  peakMonth: { label: string; total: number } | null;
  lowestMonth: { label: string; total: number } | null;
  currentMonthTotal: number;
}

const MONTH_NAMES_ID: Record<string, { short: string; full: string }> = {
  '01': { short: 'Jan', full: 'Januari' },
  '02': { short: 'Feb', full: 'Februari' },
  '03': { short: 'Mar', full: 'Maret' },
  '04': { short: 'Apr', full: 'April' },
  '05': { short: 'Mei', full: 'Mei' },
  '06': { short: 'Jun', full: 'Juni' },
  '07': { short: 'Jul', full: 'Juli' },
  '08': { short: 'Agu', full: 'Agustus' },
  '09': { short: 'Sep', full: 'September' },
  '10': { short: 'Okt', full: 'Oktober' },
  '11': { short: 'Nov', full: 'November' },
  '12': { short: 'Des', full: 'Desember' },
};

/**
 * Ekstraksi tahun dan bulan dari string tanggal tiket secara aman
 */
export function extractYearMonth(tglMasuk: unknown): { year: string; month: string } | null {
  if (!tglMasuk) return null;

  const iso = parseToISODate(tglMasuk);
  if (iso && iso.length >= 7 && iso.includes('-')) {
    const parts = iso.split('-');
    if (parts[0] && parts[1]) {
      return { year: parts[0], month: parts[1].padStart(2, '0') };
    }
  }

  const ts = parseToTimestamp(tglMasuk);
  if (ts > 0) {
    const d = new Date(ts);
    return {
      year: String(d.getFullYear()),
      month: String(d.getMonth() + 1).padStart(2, '0'),
    };
  }

  return null;
}

/**
 * Mengolah daftar tiket perbaikan menjadi statistik bulanan lengkap untuk Diagram Batang Role Admin
 */
export function aggregateMonthlyDaisha(
  tickets: Ticket[],
  selectedYear: string = 'CURRENT_YEAR'
): MonthlyDaishaSummary {
  const currentYearStr = String(new Date().getFullYear());
  const currentMonthKey = `${currentYearStr}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // 1. Kumpulkan semua tahun unik dari data tiket
  const yearsSet = new Set<string>();
  const parsedTickets: Array<{
    ticket: Ticket;
    year: string;
    month: string;
    monthKey: string;
  }> = [];

  for (const t of tickets) {
    const ym = extractYearMonth(t.tglMasuk);
    if (ym && ym.year.length === 4) {
      yearsSet.add(ym.year);
      parsedTickets.push({
        ticket: t,
        year: ym.year,
        month: ym.month,
        monthKey: `${ym.year}-${ym.month}`,
      });
    }
  }

  yearsSet.add(currentYearStr);
  const availableYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));

  // Tentukan tahun aktif
  let activeYear = selectedYear;
  if (activeYear === 'CURRENT_YEAR') {
    activeYear = availableYears[0] || currentYearStr;
  }

  // 2. Tentukan daftar monthKey yang akan ditampilkan
  let targetMonthKeys: string[] = [];

  if (activeYear === 'LAST_12_MONTHS') {
    // 12 bulan bergeser (sliding window) hingga bulan berjalan
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yStr = String(d.getFullYear());
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      targetMonthKeys.push(`${yStr}-${mStr}`);
    }
  } else if (activeYear === 'ALL') {
    // Semua bulan yang memiliki data
    const allKeys = Array.from(new Set(parsedTickets.map((p) => p.monthKey))).sort();
    targetMonthKeys = allKeys.length > 0 ? allKeys : [`${currentYearStr}-01`];
  } else {
    // 12 bulan penuh dari tahun tertentu (01 s/d 12)
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, '0');
      targetMonthKeys.push(`${activeYear}-${mStr}`);
    }
  }

  // 3. Kelompokkan tiket per bulan
  const grouped: Record<
    string,
    {
      totalMasuk: number;
      selesai: number;
      proses: number;
      scrap: number;
      seksiMap: Record<string, number>;
      jenisMap: Record<string, number>;
    }
  > = {};

  for (const k of targetMonthKeys) {
    grouped[k] = {
      totalMasuk: 0,
      selesai: 0,
      proses: 0,
      scrap: 0,
      seksiMap: {},
      jenisMap: {},
    };
  }

  for (const { ticket, monthKey } of parsedTickets) {
    if (!grouped[monthKey]) {
      // Jika mode ALL atau di luar slot inisialisasi
      if (activeYear === 'ALL') {
        grouped[monthKey] = {
          totalMasuk: 0,
          selesai: 0,
          proses: 0,
          scrap: 0,
          seksiMap: {},
          jenisMap: {},
        };
      } else {
        continue;
      }
    }

    const g = grouped[monthKey];
    g.totalMasuk += 1;

    const st = (ticket.status || '').toLowerCase();
    if (st === 'done' || st === 'selesai') {
      g.selesai += 1;
    } else if (st === 'scrap') {
      g.scrap += 1;
    } else {
      g.proses += 1; // Open / Progress / Pending
    }

    // Seksi
    const seksi = ticket.seksi || 'Lainnya';
    g.seksiMap[seksi] = (g.seksiMap[seksi] || 0) + 1;

    // Jenis Daisha
    const jenis = ticket.namaDaisha || 'Standard';
    g.jenisMap[jenis] = (g.jenisMap[jenis] || 0) + 1;
  }

  // 4. Transform ke MonthlyDaishaItem berurutan
  const sortedKeys = targetMonthKeys.sort();
  const monthlyData: MonthlyDaishaItem[] = [];

  let prevTotal: number | null = null;
  let totalMasuk = 0;
  let totalSelesai = 0;
  let totalProses = 0;
  let totalScrap = 0;

  for (const mKey of sortedKeys) {
    const [y, m] = mKey.split('-');
    const monthMeta = MONTH_NAMES_ID[m] || { short: m, full: `Bulan ${m}` };
    const g = grouped[mKey] || {
      totalMasuk: 0,
      selesai: 0,
      proses: 0,
      scrap: 0,
      seksiMap: {},
      jenisMap: {},
    };

    totalMasuk += g.totalMasuk;
    totalSelesai += g.selesai;
    totalProses += g.proses;
    totalScrap += g.scrap;

    // Cari top seksi
    let topSeksi = '-';
    let topSeksiCount = 0;
    for (const [sName, sCount] of Object.entries(g.seksiMap)) {
      if (sCount > topSeksiCount) {
        topSeksiCount = sCount;
        topSeksi = sName;
      }
    }

    // MoM Growth
    let momDiff = 0;
    let momGrowth: number | null = null;
    if (prevTotal !== null) {
      momDiff = g.totalMasuk - prevTotal;
      if (prevTotal > 0) {
        momGrowth = Math.round((momDiff / prevTotal) * 100);
      } else if (g.totalMasuk > 0) {
        momGrowth = 100;
      } else {
        momGrowth = 0;
      }
    }
    prevTotal = g.totalMasuk;

    const completionRate =
      g.totalMasuk > 0 ? Math.round((g.selesai / g.totalMasuk) * 100) : 0;

    monthlyData.push({
      monthKey: mKey,
      year: y,
      monthIndex: parseInt(m, 10),
      monthShort: monthMeta.short,
      monthName: monthMeta.full,
      monthLabel: `${monthMeta.short} '${y.slice(2)}`,
      totalMasuk: g.totalMasuk,
      selesai: g.selesai,
      proses: g.proses,
      scrap: g.scrap,
      completionRate,
      momDiff,
      momGrowth,
      topSeksi,
      topSeksiCount,
      byJenisDaisha: g.jenisMap,
    });
  }

  // 5. Metrik Eksekutif
  const activeCount = monthlyData.filter((d) => d.totalMasuk > 0).length || 1;
  const avgMonthly = Math.round(totalMasuk / (monthlyData.length || 1));

  let peakMonth: { label: string; total: number } | null = null;
  let lowestMonth: { label: string; total: number } | null = null;

  for (const item of monthlyData) {
    if (!peakMonth || item.totalMasuk > peakMonth.total) {
      peakMonth = { label: `${item.monthName} ${item.year}`, total: item.totalMasuk };
    }
    // Cari terendah dari bulan yang sudah berjalan atau memiliki data
    if (item.totalMasuk > 0 && (!lowestMonth || item.totalMasuk < lowestMonth.total)) {
      lowestMonth = { label: `${item.monthName} ${item.year}`, total: item.totalMasuk };
    }
  }

  const currentMonthItem = monthlyData.find((d) => d.monthKey === currentMonthKey);
  const currentMonthTotal = currentMonthItem ? currentMonthItem.totalMasuk : 0;

  return {
    monthlyData,
    availableYears,
    totalMasuk,
    totalSelesai,
    totalProses,
    totalScrap,
    avgMonthly,
    peakMonth,
    lowestMonth,
    currentMonthTotal,
  };
}

