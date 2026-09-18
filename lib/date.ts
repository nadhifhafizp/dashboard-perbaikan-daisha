// Utility helper untuk parsing dan formatting tanggal & jam Daisha secara konsisten

function parseSegments(datePart: string): [string, string, string] | null {
  const segs = datePart.split(/[-/]/);
  if (segs.length !== 3) return null;
  return segs[0].length === 4
    ? [segs[0], segs[1].padStart(2, '0'), segs[2].padStart(2, '0')] // YYYY, MM, DD
    : [segs[2], segs[1].padStart(2, '0'), segs[0].padStart(2, '0')]; // DD, MM, YYYY -> YYYY, MM, DD
}

export function formatDisplayDate(value: unknown, includeTime = true): string {
  if (value === null || value === undefined) return '-';
  const str = String(value).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';

  const num = parseFloat(str);
  if (!isNaN(num) && num > 30000 && num < 70000 && !/[-/:]/.test(str)) {
    const d = new Date(Date.UTC(1899, 11, 30) + num * 86400000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
    return includeTime ? `${dateStr} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` : dateStr;
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

export function parseToTimestamp(value: unknown): number {
  if (!value || value === '-' || value === 'null' || value === 'undefined') return 0;
  if (value instanceof Date) return value.getTime();

  const num = typeof value === 'number' ? value : parseFloat(String(value).trim());
  if (!isNaN(num) && num > 30000 && num < 70000 && !/[-/:]/.test(String(value))) {
    return Date.UTC(1899, 11, 30) + num * 86400000;
  }

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
