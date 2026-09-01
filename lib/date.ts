// Utility helper untuk parsing dan formatting tanggal & jam Daisha secara konsisten

export function formatDateTime(value: unknown): string {
  if (value === null || value === undefined) return '-';
  const str = String(value).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';

  // 1. Tangani jika nilai adalah Excel Serial Number (misal: 46266.4055555556)
  const num = parseFloat(str);
  if (!isNaN(num) && num > 30000 && num < 70000 && !str.includes('-') && !str.includes('/') && !str.includes(':')) {
    try {
      // Excel epoch dimulai 30 Desember 1899
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
      
      const yyyy = jsDate.getUTCFullYear();
      const mm = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(jsDate.getUTCDate()).padStart(2, '0');
      const hh = String(jsDate.getUTCHours()).padStart(2, '0');
      const min = String(jsDate.getUTCMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch {
      return str;
    }
  }

  // 2. Tangani jika format mengandung 'T' dari input ISO (misal: 2026-09-01T10:15)
  if (str.includes('T')) {
    const clean = str.replace('T', ' ').split('.')[0];
    return clean.slice(0, 16);
  }

  // 3. Jika sudah berformat string normal (misal: 2026-09-01 10:15:00)
  if (str.length >= 16 && str.includes('-') && str.includes(':')) {
    return str.slice(0, 16);
  }

  return str;
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
