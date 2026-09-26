/**
 * lib/passwords.ts — Modul Keamanan Kriptografi Password Pengguna
 * 
 * ============================================================================
 * SPESIFIKASI KEAMANAN:
 * 1. Algoritma: PBKDF2 (Password-Based Key Derivation Function 2)
 * 2. Hashing Engine: SHA-512 (Secure Hash Algorithm 512-bit)
 * 3. Salt: 16-byte kriptografis acak (crypto.randomBytes) per akun (mencegah Rainbow Table Attack)
 * 4. Iteration Count: 10.000 iterasi (mempersulit serangan Brute-Force / Dictionary Attack)
 * 5. Proteksi Verifikasi: Constant-Time comparison via `crypto.timingSafeEqual` (anti Timing Attack)
 * ============================================================================
 */
import crypto from 'crypto';

/**
 * Menghasilkan hash password yang aman dengan salt unik per user.
 * 
 * Format penyimpanan di database: `${saltHex}:${hashHex}`
 * 
 * @param password - Password plaintext yang diinput user
 * @param customSalt - Salt opsional (default: di-generate acak 16-byte)
 * @returns String kombinasi salt dan hash siap disimpan ke database
 */
export function hashPassword(password: string, customSalt?: string): string {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Memverifikasi validitas password login terhadap hash yang tersimpan di database.
 * 
 * @param password - Password plaintext yang dicoba oleh user saat login
 * @param storedHash - Nilai hash tersimpan dari database (format `salt:hash`)
 * @returns Boolean `true` jika password valid, `false` jika salah
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // Format hash standar sistem: salt:hash
  if (storedHash.includes(':')) {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    
    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    try {
      // Membandingkan buffer dalam waktu konstan untuk mencegah penyerang
      // mengukur mikrodetik respon per karakter (Timing Attack).
      return crypto.timingSafeEqual(
        Buffer.from(computedHash, 'hex'),
        Buffer.from(originalHash, 'hex')
      );
    } catch {
      return false;
    }
  }

  // Fallback untuk backward compatibility jika ada akun lama sebelum migrasi hashing
  return password === storedHash;
}
