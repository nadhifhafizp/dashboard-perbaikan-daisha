import { UserRole } from './users';
import { constantTimeCompare, generateHmacSignature } from './crypto';

/**
 * Mengambil SESSION_SECRET dari environment variable.
 * Wajib diisi di .env.local — aplikasi akan error jika tidak ada.
 */
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      '[Auth] SESSION_SECRET tidak ditemukan di environment variables. ' +
      'Pastikan variabel ini sudah diisi di environment variables sebelum menjalankan aplikasi.'
    );
  }
  return secret;
}

export const SESSION_COOKIE_NAME = 'daisha_auth_session';

export interface SessionPayload {
  username: string;
  role: UserRole;
  name?: string;
}

export interface VerificationResult {
  valid: boolean;
  user?: SessionPayload;
}

/**
 * Buat signed session token mandiri (stateless HMAC).
 * Format: base64(username)|role|timestamp|base64(name)|hmac_signature
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const timestamp = Date.now().toString();
  const encodedUsername = Buffer.from(payload.username).toString('base64');
  const encodedName = Buffer.from(payload.name || payload.username).toString('base64');
  const data = `${encodedUsername}|${payload.role}|${timestamp}|${encodedName}`;
  const signature = generateHmacSignature(data, getSecret());
  return `${data}|${signature}`;
}

/**
 * Verifikasi session token secara instan di memori (0 roundtrip ke database).
 */
export async function parseAndVerifySession(token: string | undefined | null): Promise<VerificationResult> {
  if (!token) return { valid: false };

  try {
    let cleanToken = token;
    try {
      if (token.includes('%')) {
        cleanToken = decodeURIComponent(token);
      }
    } catch {
      // Abaikan jika bukan format encoded
    }

    const parts = cleanToken.split('|');
    if (parts.length !== 4 && parts.length !== 5) return { valid: false };

    // Format 5-part baru: encodedUsername|role|timestamp|encodedName|signature
    if (parts.length === 5) {
      const [encodedUsername, role, timestampStr, encodedName, providedSignature] = parts;
      const timestamp = parseInt(timestampStr, 10);

      if (isNaN(timestamp)) return { valid: false };

      // Kadaluwarsa token: 12 jam (sesuai shift kerja pabrik)
      const MAX_AGE_MS = 12 * 60 * 60 * 1000;
      if (Date.now() - timestamp > MAX_AGE_MS) {
        return { valid: false };
      }

      const data = `${encodedUsername}|${role}|${timestampStr}|${encodedName}`;
      const expectedSignature = generateHmacSignature(data, getSecret());

      if (!constantTimeCompare(providedSignature, expectedSignature)) {
        return { valid: false };
      }

      const username = Buffer.from(encodedUsername, 'base64').toString('utf8');
      const name = Buffer.from(encodedName, 'base64').toString('utf8');

      return {
        valid: true,
        user: {
          username,
          role: role as UserRole,
          name,
        },
      };
    }

    // Format 4-part lama (kompatibilitas backward jika ada token lama aktif)
    const [encodedUsername, role, timestampStr, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return { valid: false };

    const MAX_AGE_MS = 12 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE_MS) {
      return { valid: false };
    }

    const data = `${encodedUsername}|${role}|${timestampStr}`;
    const expectedSignature = generateHmacSignature(data, getSecret());

    if (!constantTimeCompare(providedSignature, expectedSignature)) {
      return { valid: false };
    }

    const username = Buffer.from(encodedUsername, 'base64').toString('utf8');
    return {
      valid: true,
      user: {
        username,
        role: role as UserRole,
        name: username,
      },
    };
  } catch (err) {
    console.error('Token verification error:', err);
    return { valid: false };
  }
}
