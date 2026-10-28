import { describe, it, expect } from 'vitest';
import {
  formatDisplayDate,
  parseToTimestamp,
  getInitialDateTime,
  getAgingHours,
  matchesAgingFilter,
} from './date';

describe('lib/date - Asia/Jakarta (WIB) Date Utility', () => {
  it('harus memformat Date menjadi string DD/MM/YYYY HH:mm standar WIB', () => {
    // 2026-10-27 10:30 UTC = 17:30 WIB
    const d = new Date('2026-10-27T10:30:00Z');
    const formatted = formatDisplayDate(d);
    expect(formatted).toBe('27/10/2026 17:30');
  });

  it('harus memformat Date tanpa jam jika includeTime bernilai false', () => {
    const d = new Date('2026-10-27T10:30:00Z');
    const formatted = formatDisplayDate(d, false);
    expect(formatted).toBe('27/10/2026');
  });

  it('harus mengembalikan "-" untuk input kosong, null, atau tidak valid', () => {
    expect(formatDisplayDate(null)).toBe('-');
    expect(formatDisplayDate(undefined)).toBe('-');
    expect(formatDisplayDate('')).toBe('-');
    expect(formatDisplayDate('-')).toBe('-');
    expect(formatDisplayDate(new Date('invalid'))).toBe('-');
  });

  it('harus mengunci offset +07:00 pada parseToTimestamp ketika input tanpa offset', () => {
    // Input '2026-10-27 14:00' -> diinterpretasikan sebagai 14:00 WIB (+07:00)
    const ts = parseToTimestamp('2026-10-27 14:00');
    expect(ts).toBeGreaterThan(0);

    const d = new Date(ts);
    // Di UTC, 14:00 WIB adalah 07:00 UTC
    expect(d.getUTCHours()).toBe(7);
  });

  it('harus menghitung aging hours dan memfilter kategori aging dengan akurat', () => {
    const now = Date.now();
    // 5 jam yang lalu -> Today (< 24 jam)
    const fiveHoursAgo = new Date(now - 5 * 60 * 60 * 1000).toISOString();
    expect(getAgingHours(fiveHoursAgo)).toBeCloseTo(5, 0);
    expect(matchesAgingFilter(fiveHoursAgo, 'today')).toBe(true);
    expect(matchesAgingFilter(fiveHoursAgo, 'overdue')).toBe(false);

    // 30 jam yang lalu -> Overdue (>= 24 jam)
    const thirtyHoursAgo = new Date(now - 30 * 60 * 60 * 1000).toISOString();
    expect(matchesAgingFilter(thirtyHoursAgo, 'overdue')).toBe(true);
    expect(matchesAgingFilter(thirtyHoursAgo, 'critical')).toBe(false);

    // 80 jam yang lalu -> Critical (>= 72 jam)
    const eightyHoursAgo = new Date(now - 80 * 60 * 60 * 1000).toISOString();
    expect(matchesAgingFilter(eightyHoursAgo, 'critical')).toBe(true);
  });

  it('harus menghasilkan initial date time berformat YYYY-MM-DDTHH:mm', () => {
    const initial = getInitialDateTime();
    expect(initial).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});
