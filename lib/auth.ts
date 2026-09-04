import { UserRole, findUserByUsername } from './users';
import { constantTimeCompare, generateHmacSignature } from './crypto';


/**
 * Mengambil SESSION_SECRET dari environment variable.
 * Wajib diisi di .env.local — aplikasi akan error jika tidak ada.
 * Ini mencegah secret hardcoded masuk ke source code / version control.
 */
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      '[Auth] SESSION_SECRET tidak ditemukan di environment variables. ' +
      'Pastikan variabel ini sudah diisi di .env.local sebelum menjalankan aplikasi.'
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
 * Buat signed session token.
 * Format: base64(username)|role|timestamp|hmac_signature
 * Username di-encode Base64 untuk menghindari konflik karakter pemisah '|'.
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const timestamp = Date.now().toString();
  // Encode username ke Base64 agar karakter apapun (termasuk '|') tidak merusak format token
  const encodedUsername = Buffer.from(payload.username).toString('base64');
  const data = `${encodedUsername}|${payload.role}|${timestamp}`;
  const signature = await generateHmacSignature(data, getSecret());
  return `${data}|${signature}`;
}

// Verifikasi session token
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const res = await parseAndVerifySession(token);
  return res.valid;
}

// Verifikasi khusus untuk role ADMIN
export async function verifyAdminSession(token: string | undefined | null): Promise<boolean> {
  const res = await parseAndVerifySession(token);
  return res.valid && res.user?.role === 'ADMIN';
}

// Verifikasi session token dan decode informasinya
export async function parseAndVerifySession(token: string | undefined | null): Promise<VerificationResult> {
  if (!token) return { valid: false };

  try {
    const parts = token.split('|');
    if (parts.length !== 4) return { valid: false };

    const [encodedUsername, role, timestampStr, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return { valid: false };

    // Kadaluwarsa token: 7 hari
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE_MS) {
      return { valid: false };
    }

    const data = `${encodedUsername}|${role}|${timestampStr}`;
    const expectedSignature = await generateHmacSignature(data, getSecret());

    if (!constantTimeCompare(providedSignature, expectedSignature)) {
      return { valid: false };
    }

    // Decode Base64 username
    const username = Buffer.from(encodedUsername, 'base64').toString('utf8');
    const matchedUser = findUserByUsername(username);

    return {
      valid: true,
      user: {
        username,
        role: role as UserRole,
        name: matchedUser ? matchedUser.name : username,
      },
    };
  } catch (err) {
    console.error('Token verification error:', err);
    return { valid: false };
  }
}
