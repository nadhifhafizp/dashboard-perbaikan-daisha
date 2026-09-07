import crypto from 'crypto';

/**
 * Menghasilkan hash password yang aman menggunakan algoritma PBKDF2 (SHA-512)
 * dengan salt acak 16 byte.
 * Format output: `${salt}:${hashHex}`
 */
export function hashPassword(password: string, customSalt?: string): string {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Memverifikasi kecocokan password teks polos dengan hash tersimpan.
 * Menggunakan crypto.timingSafeEqual untuk mencegah serangan timing attack.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // Jika hash tersimpan berformat salt:hash
  if (storedHash.includes(':')) {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(computedHash, 'hex'),
        Buffer.from(originalHash, 'hex')
      );
    } catch {
      return false;
    }
  }

  // Fallback untuk password plaintext lawas (jika ada data lama yang belum ter-hash)
  return password === storedHash;
}
