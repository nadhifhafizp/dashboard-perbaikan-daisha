import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './passwords';

describe('lib/passwords - PBKDF2 SHA-512 Security Module', () => {
  it('harus menghasilkan string hash dengan format salt:hash', () => {
    const plain = 'SecretPassword123!';
    const hash = hashPassword(plain);

    expect(hash).toContain(':');
    const [salt, derived] = hash.split(':');
    expect(salt).toHaveLength(32); // 16 bytes hex = 32 chars
    expect(derived).toHaveLength(128); // 64 bytes hex = 128 chars
  });

  it('harus menghasilkan salt yang berbeda untuk password yang sama', () => {
    const plain = 'SecretPassword123!';
    const hash1 = hashPassword(plain);
    const hash2 = hashPassword(plain);

    expect(hash1).not.toBe(hash2);
    expect(verifyPassword(plain, hash1)).toBe(true);
    expect(verifyPassword(plain, hash2)).toBe(true);
  });

  it('harus memvalidasi password benar dan menolak password salah', () => {
    const password = 'Bridgestone2026@Workshop';
    const hash = hashPassword(password);

    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
    expect(verifyPassword('bridgestone2026@workshop', hash)).toBe(false); // Case sensitive
  });

  it('harus menangani input kosong dengan aman', () => {
    expect(verifyPassword('', 'someHash')).toBe(false);
    expect(verifyPassword('password', '')).toBe(false);
  });

  it('harus mendukung custom salt', () => {
    const customSalt = '1234567890abcdef1234567890abcdef';
    const hash = hashPassword('testPass', customSalt);
    expect(hash.startsWith(customSalt + ':')).toBe(true);
  });
});
