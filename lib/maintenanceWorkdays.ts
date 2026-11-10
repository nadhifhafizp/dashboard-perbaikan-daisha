/**
 * lib/maintenanceWorkdays.ts
 * 
 * Modul kalkulasi hari kerja (Working Days) untuk Modul Maintenance Daisha.
 * Sesuai PRD Section 4.2 & Arahan Siklus 1 Tahun PM Daisha (Oktober - Oktober):
 * Target Harian = (Total Keseluruhan Daisha yang Belum Maintenance) / (Sisa Hari Kerja dalam Siklus)
 * 
 * Hari Kerja:
 * - Mengecualikan Sabtu (hari ke-6) dan Minggu (hari ke-0).
 * - Mengecualikan Hari Libur Nasional & Cuti Bersama resmi Indonesia.
 */

// Daftar libur nasional & cuti bersama Indonesia (format YYYY-MM-DD)
export const INDONESIAN_HOLIDAYS: Record<string, string> = {
  // === 2026 Holidays & Cuti Bersama ===
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': 'Isra Miraj Nabi Muhammad SAW',
  '2026-02-16': 'Cuti Bersama Tahun Baru Imlek',
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-19': 'Cuti Bersama Hari Suci Nyepi',
  '2026-03-20': 'Hari Suci Nyepi',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 H (Hari 1)',
  '2026-03-22': 'Hari Raya Idul Fitri 1447 H (Hari 2)',
  '2026-03-23': 'Cuti Bersama Idul Fitri',
  '2026-03-24': 'Cuti Bersama Idul Fitri',
  '2026-04-03': 'Wafat Isa Al Masih (Jumat Agung)',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Isa Al Masih',
  '2026-05-15': 'Cuti Bersama Kenaikan Isa Al Masih',
  '2026-05-27': 'Hari Raya Idul Adha 1447 H',
  '2026-05-28': 'Cuti Bersama Idul Adha',
  '2026-05-31': 'Hari Raya Waisak 2570 BE',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan RI Ke-81',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-24': 'Cuti Bersama Hari Raya Natal',
  '2026-12-25': 'Hari Raya Natal',

  // === 2027 Holidays & Cuti Bersama (Sampai Siklus Oktober 2027) ===
  '2027-01-01': 'Tahun Baru 2027 Masehi',
  '2027-01-05': 'Isra Miraj Nabi Muhammad SAW',
  '2027-02-05': 'Cuti Bersama Tahun Baru Imlek',
  '2027-02-06': 'Tahun Baru Imlek 2578 Kongzili',
  '2027-03-09': 'Hari Suci Nyepi',
  '2027-03-10': 'Hari Raya Idul Fitri 1448 H (Hari 1)',
  '2027-03-11': 'Hari Raya Idul Fitri 1448 H (Hari 2)',
  '2027-03-12': 'Cuti Bersama Idul Fitri',
  '2027-03-15': 'Cuti Bersama Idul Fitri',
  '2027-03-26': 'Wafat Isa Al Masih (Jumat Agung)',
  '2027-05-01': 'Hari Buruh Internasional',
  '2027-05-06': 'Kenaikan Isa Al Masih',
  '2027-05-17': 'Hari Raya Idul Adha 1448 H',
  '2027-05-20': 'Hari Raya Waisak 2571 BE',
  '2027-06-01': 'Hari Lahir Pancasila',
  '2027-06-06': 'Tahun Baru Islam 1449 H',
  '2027-08-17': 'Hari Kemerdekaan RI Ke-82',
  '2027-08-25': 'Maulid Nabi Muhammad SAW',
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
 * Cek apakah tanggal tertentu adalah hari libur (Sabtu, Minggu, Hari Libur Nasional, atau Cuti Bersama)
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
 * Menghitung sisa hari kerja dalam Siklus 1 Tahun PM Daisha (Oktober s/d 31 Oktober tahun berikutnya).
 * Mengecualikan Sabtu, Minggu, Hari Libur Nasional, dan Cuti Bersama.
 */
export function calculateRemainingWorkDaysInPmCycle(
  fromDate: Date = new Date(),
  includeHolidays = true
): {
  remainingWorkDays: number;
  totalWorkDaysInCycle: number;
  cycleStart: Date;
  cycleEnd: Date;
  holidayCount: number;
} {
  const year = fromDate.getFullYear();
  const month = fromDate.getMonth(); // 0 = Jan, 9 = Okt

  // Siklus PM Daisha dimulai 1 Oktober
  let cycleStartYear = year;
  let cycleEndYear = year + 1;
  if (month < 9) {
    // Jika sebelum Oktober (misal Mei 2027), siklus dimulai Okt tahun sebelumnya (2026) dan berakhir Okt tahun berjalan (2027)
    cycleStartYear = year - 1;
    cycleEndYear = year;
  }

  const cycleStart = new Date(cycleStartYear, 9, 1, 0, 0, 0, 0); // 1 Oktober
  const cycleEnd = new Date(cycleEndYear, 9, 31, 23, 59, 59, 999); // 31 Oktober

  // Normalisasi waktu start ke awal hari
  const current = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  let remainingWorkDays = 0;
  let holidayCount = 0;

  const loopDate = new Date(current);
  while (loopDate <= cycleEnd) {
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

  // Hitung total hari kerja dalam 1 siklus penuh
  let totalWorkDaysInCycle = 0;
  const loopFullCycle = new Date(cycleStart);
  while (loopFullCycle <= cycleEnd) {
    const isWeekend = loopFullCycle.getDay() === 0 || loopFullCycle.getDay() === 6;
    const isHoliday = includeHolidays && Boolean(INDONESIAN_HOLIDAYS[formatDateKey(loopFullCycle)]);
    if (!isWeekend && !isHoliday) {
      totalWorkDaysInCycle++;
    }
    loopFullCycle.setDate(loopFullCycle.getDate() + 1);
  }

  return {
    remainingWorkDays: Math.max(1, remainingWorkDays),
    totalWorkDaysInCycle: Math.max(1, totalWorkDaysInCycle),
    cycleStart,
    cycleEnd,
    holidayCount,
  };
}

/**
 * Menghitung sisa hari kerja dari tanggal referensi hingga akhir tahun (31 Desember)
 * (Dipertahankan untuk kompatibilitas tahun kalender)
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
 * Target Harian = (Total Keseluruhan Daisha yang Belum Maintenance) / (Sisa Hari Kerja dalam Siklus)
 */
export function calculateDailyTarget(
  totalUnmaintained: number,
  remainingWorkDays: number
): number {
  if (totalUnmaintained <= 0) return 0;
  if (remainingWorkDays <= 0) return totalUnmaintained;
  return Math.ceil(totalUnmaintained / remainingWorkDays);
}
