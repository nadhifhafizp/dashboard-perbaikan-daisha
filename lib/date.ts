/**
 * lib/date.ts — Utilitas Parsing & Format Tanggal / Waktu Workshop Terstandarisasi WIB (Asia/Jakarta)
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * 1. Mengunci eksplisit zona waktu 'Asia/Jakarta' (WIB / UTC+7) pada seluruh formatting & kalkulasi
 *    sehingga aman dari selisih waktu 7 jam saat di-deploy ke server Vercel/Docker yang berbasis UTC.
 * 2. Menyeragamkan format tampilan Indonesia (DD/MM/YYYY HH:mm) untuk UI dan ekspor Excel.
 * 3. Parsing toleran antara format ISO-8601 (YYYY-MM-DDTHH:mm), lokal (DD/MM/YYYY), dan objek Date.
 * 4. Kalkulasi aging time (durasi antrean dalam jam) untuk SLA dan monitoring keterlambatan.
 * 5. Filter kondisi aging: Today (< 24 jam), Overdue (>= 24 jam), Critical (>= 72 jam).
 * ============================================================================
 */

export const JAKARTA_TIMEZONE = 'Asia/Jakarta';

function parseSegments(datePart: string): [string, string, string] | null {
  const segs = datePart.split(/[-/]/);
  if (segs.length !== 3) return null;
  return segs[0].length === 4
    ? [segs[0], segs[1].padStart(2, '0'), segs[2].padStart(2, '0')]
    : [segs[2], segs[1].padStart(2, '0'), segs[0].padStart(2, '0')];
}

/**
 * Memformat nilai tanggal menjadi string tampilan standar Indonesia: DD/MM/YYYY HH:mm
 * Secara eksplisit dikunci ke zona waktu Asia/Jakarta (WIB)
 */
export function formatDisplayDate(value: unknown, includeTime = true): string {
  if (value === null || value === undefined) return '-';
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '-';
    try {
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: JAKARTA_TIMEZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
      });
      return formatter.format(value).replace(/\./g, ':').replace(',', '');
    } catch {
      const pad = (n: number) => String(n).padStart(2, '0');
      const d = `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
      return includeTime ? `${d} ${pad(value.getHours())}:${pad(value.getMinutes())}` : d;
    }
  }

  const str = String(value).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';

  // Jika string merupakan ISO atau timestamp valid, gunakan Intl dengan timezone Asia/Jakarta
  if (str.includes('T') || str.includes('Z') || str.includes('+') || (str.includes('-') && str.length >= 10)) {
    const ts = parseToTimestamp(str);
    if (ts > 0) {
      return formatDisplayDate(new Date(ts), includeTime);
    }
  }

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

/**
 * Mengonversi nilai tanggal / waktu menjadi timestamp epoch (milidetik).
 * Jika string input tanpa offset timezone, secara otomatis dikunci ke offset Asia/Jakarta (+07:00).
 */
export function parseToTimestamp(value: unknown): number {
  if (!value || value === '-' || value === 'null' || value === 'undefined') return 0;
  if (value instanceof Date) return value.getTime();

  const str = String(value).trim();

  // Jika sudah memiliki penanda timezone UTC (Z) atau offset (+07:00 / -05:00)
  if (str.includes('Z') || str.includes('+') || (str.includes('-') && str.lastIndexOf('-') > 10)) {
    const ts = new Date(str).getTime();
    if (!isNaN(ts)) return ts;
  }

  const iso = parseToISODate(value);
  if (!iso) return 0;

  const timePart = (str.replace('T', ' ').split(' ')[1] || '00:00').slice(0, 5);
  // Kunci eksplisit ke offset WIB (+07:00) agar server UTC tidak bergeser 7 jam
  const jakartaIso = `${iso}T${timePart}:00+07:00`;
  const ts = new Date(jakartaIso).getTime();
  return isNaN(ts) ? 0 : ts;
}

/**
 * Mendapatkan string input awal (YYYY-MM-DDTHH:mm) terikat paten pada zona waktu Asia/Jakarta (WIB)
 */
export function getInitialDateTime(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: JAKARTA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const findPart = (type: string) => parts.find((p) => p.type === type)?.value || '';
    const yyyy = findPart('year');
    const mm = findPart('month');
    const dd = findPart('day');
    let hh = findPart('hour');
    if (hh === '24') hh = '00';
    const min = findPart('minute');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    const now = new Date(date);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
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
