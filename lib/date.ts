// Utility helper untuk parsing dan formatting tanggal & jam Daisha secara konsisten

/**
 * Mengubah string tanggal atau serial number Excel menjadi format Indonesia: Tanggal/Bulan/Tahun (DD/MM/YYYY)
 * Opsional menyertakan Jam:Menit (HH:mm). Default: true.
 * Contoh:
 * - formatDisplayDate("2026-09-02 13:57", true)  -> "02/09/2026 13:57"
 * - formatDisplayDate("2026-09-02 13:57", false) -> "02/09/2026"
 */
export function formatDisplayDate(value: unknown, includeTime = true): string {
  if (value === null || value === undefined) return '-';
  const str = String(value).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';

  // 1. Tangani jika nilai adalah Excel Serial Number (misal: 46266.4055555556)
  const num = parseFloat(str);
  if (!isNaN(num) && num > 30000 && num < 70000 && !str.includes('-') && !str.includes('/') && !str.includes(':')) {
    try {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
      const yyyy = jsDate.getUTCFullYear();
      const mm = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(jsDate.getUTCDate()).padStart(2, '0');
      if (!includeTime) return `${dd}/${mm}/${yyyy}`;
      const hh = String(jsDate.getUTCHours()).padStart(2, '0');
      const min = String(jsDate.getUTCMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch {
      return str;
    }
  }

  // 2. Bersihkan ISO 'T'
  const clean = str.replace('T', ' ').split('.')[0].trim();
  const parts = clean.split(' ');
  const datePart = parts[0];
  const timePart = includeTime && parts[1] ? ` ${parts[1].slice(0, 5)}` : '';

  // 3. Jika format YYYY-MM-DD atau YYYY/MM/DD
  if (datePart.includes('-')) {
    const segs = datePart.split('-');
    if (segs.length === 3) {
      if (segs[0].length === 4) {
        // YYYY-MM-DD -> DD/MM/YYYY
        const [yyyy, mm, dd] = segs;
        return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}${timePart}`;
      } else if (segs[2].length === 4) {
        // DD-MM-YYYY -> DD/MM/YYYY
        const [dd, mm, yyyy] = segs;
        return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}${timePart}`;
      }
    }
  } else if (datePart.includes('/')) {
    const segs = datePart.split('/');
    if (segs.length === 3) {
      if (segs[0].length === 4) {
        // YYYY/MM/DD -> DD/MM/YYYY
        const [yyyy, mm, dd] = segs;
        return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}${timePart}`;
      } else if (segs[2].length === 4) {
        // Sudah DD/MM/YYYY
        const [dd, mm, yyyy] = segs;
        return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}${timePart}`;
      }
    }
  }

  return includeTime ? clean.slice(0, 16) : datePart;
}

export function formatDisplayDateOnly(value: unknown): string {
  return formatDisplayDate(value, false);
}


// Konversi format tanggal apa pun ke ISO Date (YYYY-MM-DD) untuk filtering & sorting
export function parseToISODate(value: unknown): string {
  if (!value || value === '-' || value === 'null' || value === 'undefined') return '';
  const str = String(value).trim().replace('T', ' ');
  const datePart = str.split(' ')[0];

  if (datePart.includes('/')) {
    const segs = datePart.split('/');
    if (segs.length === 3) {
      if (segs[0].length === 4) {
        return `${segs[0]}-${segs[1].padStart(2, '0')}-${segs[2].padStart(2, '0')}`;
      } else if (segs[2].length === 4) {
        return `${segs[2]}-${segs[1].padStart(2, '0')}-${segs[0].padStart(2, '0')}`;
      }
    }
  } else if (datePart.includes('-')) {
    const segs = datePart.split('-');
    if (segs.length === 3) {
      if (segs[0].length === 4) {
        return `${segs[0]}-${segs[1].padStart(2, '0')}-${segs[2].padStart(2, '0')}`;
      } else if (segs[2].length === 4) {
        return `${segs[2]}-${segs[1].padStart(2, '0')}-${segs[0].padStart(2, '0')}`;
      }
    }
  }

  return datePart;
}

// Konversi format tanggal apa pun ke millisecond timestamp
export function parseToTimestamp(value: unknown): number {
  if (!value || value === '-' || value === 'null' || value === 'undefined') return 0;
  if (value instanceof Date) return value.getTime();

  const num = typeof value === 'number' ? value : parseFloat(String(value).trim());
  if (!isNaN(num) && num > 30000 && num < 70000 && !String(value).includes('-') && !String(value).includes('/') && !String(value).includes(':')) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return excelEpoch.getTime() + num * 86400000;
  }

  const isoDate = parseToISODate(value);
  if (!isoDate) return 0;

  const str = String(value).trim().replace('T', ' ');
  const timePart = str.split(' ')[1] || '00:00';
  const [hhStr, mmStr] = timePart.split(':');
  const [yyyyStr, mStr, dStr] = isoDate.split('-');

  const yyyy = parseInt(yyyyStr, 10);
  const mm = parseInt(mStr, 10) - 1;
  const dd = parseInt(dStr, 10);
  const hh = parseInt(hhStr || '0', 10);
  const min = parseInt(mmStr || '0', 10);

  const parsed = new Date(yyyy, mm, dd, hh, min).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

// Format waktu saat ini untuk default datetime-local
export function getInitialDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

// Bersihkan format input datetime-local menjadi string YYYY-MM-DD HH:mm untuk dikirim ke API
export function cleanInputDateTime(inputVal: string): string {
  if (!inputVal || inputVal === '-') {
    const now = getInitialDateTime();
    return now.replace('T', ' ');
  }
  return inputVal.replace('T', ' ').slice(0, 16);
}

// Konversi string tanggal tersimpan menjadi format input datetime-local ("YYYY-MM-DDTHH:mm")
export function toDateTimeLocalValue(value: string | undefined | null): string {
  if (!value || value === '-' || value === 'null' || value === 'undefined') {
    return getInitialDateTime();
  }
  const isoDate = parseToISODate(value);
  if (isoDate) {
    const str = String(value).trim().replace('T', ' ');
    const timePart = (str.split(' ')[1] || '00:00').slice(0, 5);
    return `${isoDate}T${timePart}`;
  }
  return getInitialDateTime();
}
