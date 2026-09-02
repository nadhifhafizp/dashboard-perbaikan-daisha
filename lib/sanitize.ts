/**
 * Helper untuk membersihkan dan sanitasi input teks, menghapus karakter kontrol berbahaya,
 * serta mencegah HTML / XSS injection pada form input dan API handler.
 */
export function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Hapus karakter kontrol ASCII berbahaya
    .replace(/[<>]/g, '')            // Hapus karakter pembuka/penutup tag HTML
    .slice(0, maxLength);
}
