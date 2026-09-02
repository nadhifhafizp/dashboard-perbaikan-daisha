import { UserRole, findUserByUsername } from './users';
import { constantTimeCompare, generateHmacSignature } from './crypto';

// Re-export untuk backward compatibility jika ada file lain yang mengimpor dari auth
export { constantTimeCompare } from './crypto';

const DEFAULT_SECRET = 'daisha_bridgestone_secure_token_secret_key_2026';

function getSecret(): string {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
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

// Buat signed session token
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const timestamp = Date.now().toString();
  const data = `${payload.username}:${payload.role}:${timestamp}`;
  const signature = await generateHmacSignature(data, getSecret());
  return `${data}:${signature}`;
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
    const parts = token.split(':');
    if (parts.length !== 4) return { valid: false };

    const [username, role, timestampStr, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return { valid: false };

    // Kadaluwarsa token: 7 hari
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE_MS) {
      return { valid: false };
    }

    const data = `${username}:${role}:${timestampStr}`;
    const expectedSignature = await generateHmacSignature(data, getSecret());

    if (!constantTimeCompare(providedSignature, expectedSignature)) {
      return { valid: false };
    }

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
    console.error("Token verification error:", err);
    return { valid: false };
  }
}
