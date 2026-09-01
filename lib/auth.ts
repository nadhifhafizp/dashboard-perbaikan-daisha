import { UserRole, findUserByUsername } from './users';

const DEFAULT_SECRET = 'daisha_bridgestone_secure_token_secret_key_2026';

function getSecret(): string {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
}

// Perbandingan string waktu-konstan untuk mencegah timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Konversi ArrayBuffer ke Hex String
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Buat HMAC Signature menggunakan Web Crypto
async function generateHmacSignature(data: string, secret: string): Promise<string> {
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
