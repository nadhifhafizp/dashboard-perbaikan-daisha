import { describe, it, expect } from 'vitest';
import {
  isWeekendOrHoliday,
  formatDateKey,
  calculateRemainingWorkDaysInYear,
  calculateDailyTarget,
} from './maintenanceWorkdays';

describe('lib/maintenanceWorkdays - Maintenance Workdays Calculator', () => {
  it('harus memformat tanggal ke format YYYY-MM-DD', () => {
    const d = new Date(2026, 9, 27); // 27 Oktober 2026
    expect(formatDateKey(d)).toBe('2026-10-27');
  });

  it('harus mengidentifikasi hari Sabtu dan Minggu sebagai akhir pekan', () => {
    // 24 Oktober 2026 adalah Sabtu
    const saturday = new Date(2026, 9, 24);
    expect(isWeekendOrHoliday(saturday)).toBe(true);

    // 25 Oktober 2026 adalah Minggu
    const sunday = new Date(2026, 9, 25);
    expect(isWeekendOrHoliday(sunday)).toBe(true);

    // 27 Oktober 2026 adalah Selasa (hari kerja)
    const tuesday = new Date(2026, 9, 27);
    expect(isWeekendOrHoliday(tuesday)).toBe(false);
  });

  it('harus mengidentifikasi hari libur nasional Indonesia', () => {
    // 17 Agustus 2026 (Hari Kemerdekaan RI)
    const independenceDay = new Date(2026, 7, 17);
    expect(isWeekendOrHoliday(independenceDay)).toBe(true);
  });

  it('harus menghitung sisa hari kerja hingga akhir tahun dengan benar', () => {
    const fromDate = new Date(2026, 11, 28); // 28 Desember 2026 (Senin)
    const result = calculateRemainingWorkDaysInYear(fromDate);

    expect(result.year).toBe(2026);
    expect(result.remainingWorkDays).toBeGreaterThan(0);
    expect(result.totalWorkDaysInYear).toBeGreaterThan(200);
  });

  it('harus menghitung target harian PM Daisha dengan pembulatan ke atas (Math.ceil)', () => {
    // 100 unit belum PM, sisa 20 hari kerja -> target 5 unit/hari
    expect(calculateDailyTarget(100, 20)).toBe(5);

    // 101 unit belum PM, sisa 20 hari kerja -> 5.05 dibulatkan ke atas jadi 6 unit/hari
    expect(calculateDailyTarget(101, 20)).toBe(6);

    // 0 unit belum PM -> target 0
    expect(calculateDailyTarget(0, 20)).toBe(0);
  });
});
