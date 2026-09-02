// Primitif Kriptografi untuk Autentikasi & Keamanan Sesi

/**
 * Perbandingan string waktu-konstan untuk mencegah timing attacks pada verifikasi token & password
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Konversi ArrayBuffer ke Hex String
 */
export function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Buat HMAC Signature menggunakan Web Crypto API (didukung di Node.js, Edge, & Browser)
 */
export async function generateHmacSignature(data: string, secret: string): Promise<string> {
  const secretBuffer = new TextEncoder().encode(secret) as unknown as BufferSource;
  const dataBuffer = new TextEncoder().encode(data) as unknown as BufferSource;

  const key = await crypto.subtle.importKey(
    'raw',
    secretBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
  return bufToHex(signature);
}
