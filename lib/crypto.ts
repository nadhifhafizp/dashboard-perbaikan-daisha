import crypto from 'crypto';

// ponytail: fallback Web Crypto dihapus — auth.ts selalu Node.js, bukan Edge Runtime

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function generateHmacSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}
