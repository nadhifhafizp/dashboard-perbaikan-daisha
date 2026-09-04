// Utility helper untuk parsing dan formatting tanggal & jam Daisha secara konsisten

/**
 * Mengubah string tanggal atau serial number Excel menjadi format Indonesia: Tanggal/Bulan/Tahun Jam:Menit (DD/MM/YYYY HH:mm)
 * Contoh: "2026-09-02 13:57" -> "02/09/2026 13:57"
 */
export function formatDisplayDate(value: unknown): string {
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
  const timePart = parts[1] ? ` ${parts[1].slice(0, 5)}` : '';

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

  return clean.slice(0, 16);
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
  const isoDate = parseToISODate(value);
  if (!isoDate) return 0;

  const str = String(value).trim().replace('T', ' ');
  const timePart = str.split(' ')[1] || '00:00';
  const parsed = new Date(`${isoDate}T${timePart.slice(0, 5)}`).getTime();
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
