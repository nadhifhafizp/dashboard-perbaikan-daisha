/**
 * lib/maintenanceWorkdays.ts
 * 
 * Modul kalkulasi hari kerja (Working Days) untuk Modul Maintenance Daisha.
 * Sesuai PRD Section 4.2:
 * Target Harian = (Total Keseluruhan Daisha yang Belum Maintenance) / (Sisa Hari Kerja dalam Setahun)
 * 
 * Hari Kerja:
 * - Mengecualikan Sabtu (hari ke-6) dan Minggu (hari ke-0).
 * - Mengecualikan hari libur nasional Indonesia.
 */

// Daftar libur nasional Indonesia (format YYYY-MM-DD)
// Bisa disesuaikan per tahun atau dinamis
export const INDONESIAN_HOLIDAYS: Record<string, string> = {
  // 2026 Holidays
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': 'Isra Miraj Nabi Muhammad SAW',
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-20': 'Hari Suci Nyepi',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 H (Hari 1)',
  '2026-03-22': 'Hari Raya Idul Fitri 1447 H (Hari 2)',
  '2026-03-23': 'Cuti Bersama Idul Fitri',
  '2026-03-24': 'Cuti Bersama Idul Fitri',
  '2026-04-03': 'Wafat Isa Al Masih',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Isa Al Masih',
  '2026-05-27': 'Hari Raya Idul Adha 1447 H',
  '2026-05-31': 'Hari Raya Waisak',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan RI Ke-81',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',
};

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Cek apakah tanggal tertentu adalah hari libur (Sabtu, Minggu, atau Hari Libur Nasional)
 */
export function isWeekendOrHoliday(date: Date, includeHolidays = true): boolean {
  const day = date.getDay();
  // 0 = Minggu, 6 = Sabtu
  if (day === 0 || day === 6) return true;

  if (includeHolidays) {
    const key = formatDateKey(date);
    if (INDONESIAN_HOLIDAYS[key]) return true;
  }

  return false;
}

/**
 * Menghitung sisa hari kerja dari tanggal referensi hingga akhir tahun (31 Desember)
 * 
 * @param fromDate Tanggal awal perhitungan (default: hari ini)
 * @param includeHolidays Apakah memperhitungkan libur nasional
 * @returns Sisa hari kerja (minimal 1 agar tidak terjadi pembagian dengan nol)
 */
export function calculateRemainingWorkDaysInYear(
  fromDate: Date = new Date(),
  includeHolidays = true
): { remainingWorkDays: number; totalWorkDaysInYear: number; year: number; holidayCount: number } {
  const year = fromDate.getFullYear();
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
  
  // Normalisasi waktu start ke awal hari
  const current = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  let remainingWorkDays = 0;
  let holidayCount = 0;

  // Hitung sisa hari kerja dari hari ini ke 31 Desember
  const loopDate = new Date(current);
  while (loopDate <= endOfYear) {
    const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;
    const isHoliday = includeHolidays && Boolean(INDONESIAN_HOLIDAYS[formatDateKey(loopDate)]);
    
    if (isHoliday && !isWeekend) {
      holidayCount++;
    }

    if (!isWeekend && !isHoliday) {
      remainingWorkDays++;
    }

    loopDate.setDate(loopDate.getDate() + 1);
  }

  // Hitung total hari kerja dalam setahun penuh
  let totalWorkDaysInYear = 0;
  const yearStart = new Date(year, 0, 1);
  const loopFullYear = new Date(yearStart);
  while (loopFullYear <= endOfYear) {
    const isWeekend = loopFullYear.getDay() === 0 || loopFullYear.getDay() === 6;
    const isHoliday = includeHolidays && Boolean(INDONESIAN_HOLIDAYS[formatDateKey(loopFullYear)]);
    if (!isWeekend && !isHoliday) {
      totalWorkDaysInYear++;
    }
    loopFullYear.setDate(loopFullYear.getDate() + 1);
  }

  return {
    remainingWorkDays: Math.max(1, remainingWorkDays),
    totalWorkDaysInYear: Math.max(1, totalWorkDaysInYear),
    year,
    holidayCount,
  };
}

/**
 * Menghitung target harian berdasarkan PRD:
 * Target Harian = (Total Keseluruhan Daisha yang Belum Maintenance) / (Sisa Hari Kerja dalam Setahun)
 */
export function calculateDailyTarget(
  totalUnmaintained: number,
  remainingWorkDays: number
): number {
  if (totalUnmaintained <= 0) return 0;
  if (remainingWorkDays <= 0) return totalUnmaintained;
  return Math.ceil(totalUnmaintained / remainingWorkDays);
}
