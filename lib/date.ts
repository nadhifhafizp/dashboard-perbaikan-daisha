/**
 * lib/date.ts — Utilitas Parsing & Format Tanggal / Waktu Workshop
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * 1. Menyeragamkan format tanggal Indonesia (DD/MM/YYYY HH:mm) untuk UI dan ekspor Excel.
 * 2. Parsing toleran antara format ISO 8601 (YYYY-MM-DD), lokal (DD/MM/YYYY), dan objek Date.
 * 3. Kalkulasi aging time (durasi antrean dalam jam) untuk SLA dan monitoring keterlambatan.
 * 4. Filter kondisi aging: Today (< 24 jam), Overdue (>= 24 jam), Critical (>= 72 jam).
 * ============================================================================
 */

function parseSegments(datePart: string): [string, string, string] | null {
  const segs = datePart.split(/[-/]/);
  if (segs.length !== 3) return null;
  return segs[0].length === 4
    ? [segs[0], segs[1].padStart(2, '0'), segs[2].padStart(2, '0')]
    : [segs[2], segs[1].padStart(2, '0'), segs[0].padStart(2, '0')];
}

/**
 * Memformat nilai tanggal menjadi string tampilan standar: DD/MM/YYYY HH:mm
 */
export function formatDisplayDate(value: unknown, includeTime = true): string {
  if (value === null || value === undefined) return '-';
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
    return includeTime ? `${d} ${pad(value.getHours())}:${pad(value.getMinutes())}` : d;
  }
  const str = String(value).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';

  const clean = str.replace('T', ' ').split('.')[0].trim();
  const [datePart, timePart = ''] = clean.split(' ');
  const parsed = parseSegments(datePart);
  const formattedDate = parsed ? `${parsed[2]}/${parsed[1]}/${parsed[0]}` : datePart;
  return includeTime && timePart ? `${formattedDate} ${timePart.slice(0, 5)}` : formattedDate;
}

export function formatDisplayDateOnly(value: unknown): string {
  return formatDisplayDate(value, false);
}

export function parseToISODate(value: unknown): string {
  if (!value || value === '-' || value === 'null' || value === 'undefined') return '';
  const datePart = String(value).trim().replace('T', ' ').split(' ')[0];
  const parsed = parseSegments(datePart);
  return parsed ? `${parsed[0]}-${parsed[1]}-${parsed[2]}` : datePart;
}

export function parseToTimestamp(value: unknown): number {
  if (!value || value === '-' || value === 'null' || value === 'undefined') return 0;
  if (value instanceof Date) return value.getTime();

  const iso = parseToISODate(value);
  if (!iso) return 0;

  const time = String(value).trim().replace('T', ' ').split(' ')[1] || '00:00';
  const [hh = '0', mm = '0'] = time.split(':');
  const [yyyy, m, d] = iso.split('-').map(Number);
  const ts = new Date(yyyy, m - 1, d, Number(hh), Number(mm)).getTime();
  return isNaN(ts) ? 0 : ts;
}

export function getInitialDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function cleanInputDateTime(inputVal: string): string {
  return inputVal && inputVal !== '-' ? inputVal.replace('T', ' ').slice(0, 16) : getInitialDateTime().replace('T', ' ');
}

export function toDateTimeLocalValue(value: string | undefined | null): string {
  if (!value || value === '-' || value === 'null' || value === 'undefined') return getInitialDateTime();
  const iso = parseToISODate(value);
  if (!iso) return getInitialDateTime();
  const time = (String(value).trim().replace('T', ' ').split(' ')[1] || '00:00').slice(0, 5);
  return `${iso}T${time}`;
}

export function getAgingHours(tglMasuk: unknown): number {
  const ts = parseToTimestamp(tglMasuk);
  if (!ts) return 0;
  return Math.max(0, (Date.now() - ts) / (1000 * 60 * 60));
}

export function matchesAgingFilter(tglMasuk: unknown, filter: string): boolean {
  if (!filter || filter === 'all') return true;
  const hours = getAgingHours(tglMasuk);
  if (filter === 'today') return hours < 24;
  if (filter === 'overdue') return hours >= 24;
  if (filter === 'critical') return hours >= 72;
  return true;
}
