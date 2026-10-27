/**
 * lib/authEdge.ts — Verifikasi Sesi Stateless Kompatibel Edge Runtime (Next.js Middleware)
 *
 * Menggunakan Web Crypto API standar (crypto.subtle) dan TextDecoder
 * tanpa ketergantungan pada modul Node.js (crypto/Buffer), sehingga
 * dapat dieksekusi secepat kilat (0 DB roundtrip, <1ms) di Edge Middleware.
 */

export const SESSION_COOKIE_NAME = 'daisha_auth_session';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'USER_SEKSI';

export interface SessionPayload {
  username: string;
  role: UserRole;
  name?: string;
  seksi?: string | null;
}

export interface VerificationResult {
  valid: boolean;
  user?: SessionPayload;
}

function decodeBase64(str: string): string {
  try {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

async function verifyHmac(data: string, signatureHex: string, secret: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    if (signatureHex.length % 2 !== 0) return false;
    const sigBytes = new Uint8Array(signatureHex.length / 2);
    for (let i = 0; i < signatureHex.length; i += 2) {
      sigBytes[i / 2] = parseInt(signatureHex.substring(i, i + 2), 16);
    }

    return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
  } catch {
    return false;
  }
}

/**
 * Verifikasi token sesi secara instan di Edge Middleware
 */
export async function parseAndVerifySessionEdge(
  token: string | undefined | null,
  customSecret?: string
): Promise<VerificationResult> {
  if (!token) return { valid: false };

  const secret = customSecret || process.env.SESSION_SECRET;
  if (!secret) return { valid: false };

  try {
    let cleanToken = token;
    if (token.includes('%')) {
      try {
        cleanToken = decodeURIComponent(token);
      } catch {
        // ignore
      }
    }

    const parts = cleanToken.split('|');
    if (parts.length !== 4 && parts.length !== 5 && parts.length !== 6) {
      return { valid: false };
    }

    const MAX_AGE_MS = 12 * 60 * 60 * 1000;

    // Format 6 Bagian: encodedUsername|role|timestamp|encodedName|encodedSeksi|signature
    if (parts.length === 6) {
      const [encodedUsername, role, timestampStr, encodedName, encodedSeksi, providedSignature] = parts;
      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp) || Date.now() - timestamp > MAX_AGE_MS) return { valid: false };

      const data = `${encodedUsername}|${role}|${timestampStr}|${encodedName}|${encodedSeksi}`;
      const isValid = await verifyHmac(data, providedSignature, secret);
      if (!isValid) return { valid: false };

      return {
        valid: true,
        user: {
          username: decodeBase64(encodedUsername),
          role: role as UserRole,
          name: decodeBase64(encodedName),
          seksi: decodeBase64(encodedSeksi) || null,
        },
      };
    }

    // Format 5 Bagian: encodedUsername|role|timestamp|encodedName|signature
    if (parts.length === 5) {
      const [encodedUsername, role, timestampStr, encodedName, providedSignature] = parts;
      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp) || Date.now() - timestamp > MAX_AGE_MS) return { valid: false };

      const data = `${encodedUsername}|${role}|${timestampStr}|${encodedName}`;
      const isValid = await verifyHmac(data, providedSignature, secret);
      if (!isValid) return { valid: false };

      return {
        valid: true,
        user: {
          username: decodeBase64(encodedUsername),
          role: role as UserRole,
          name: decodeBase64(encodedName),
          seksi: null,
        },
      };
    }

    // Format 4 Bagian (Legacy)
    const [encodedUsername, role, timestampStr, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > MAX_AGE_MS) return { valid: false };

    const data = `${encodedUsername}|${role}|${timestampStr}`;
    const isValid = await verifyHmac(data, providedSignature, secret);
    if (!isValid) return { valid: false };

    const username = decodeBase64(encodedUsername);
    return {
      valid: true,
      user: {
        username,
        role: role as UserRole,
        name: username,
      },
    };
  } catch {
    return { valid: false };
  }
}
