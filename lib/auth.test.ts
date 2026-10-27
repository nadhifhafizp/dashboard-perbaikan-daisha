import { describe, it, expect, beforeAll } from 'vitest';
import { createSessionToken, parseAndVerifySession, SessionPayload } from './auth';
import { parseAndVerifySessionEdge } from './authEdge';

describe('lib/auth & lib/authEdge — Cryptographic Session Token Module', () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = 'test-secret-key-bridgestone-daisha-security-2026';
  });

  const samplePayload: SessionPayload = {
    username: 'teknisi_bengkel',
    role: 'OPERATOR',
    name: 'Budi Santoso',
    seksi: 'Building',
  };

  it('harus membuat token sesi yang valid dan dapat diverifikasi di Node.js runtime', async () => {
    const token = await createSessionToken(samplePayload);
    expect(token).toBeTypeOf('string');
    expect(token.split('|').length).toBe(6);

    const result = await parseAndVerifySession(token);
    expect(result.valid).toBe(true);
    expect(result.user?.username).toBe('teknisi_bengkel');
    expect(result.user?.role).toBe('OPERATOR');
    expect(result.user?.name).toBe('Budi Santoso');
    expect(result.user?.seksi).toBe('Building');
  });

  it('harus dapat diverifikasi secara identik di Edge Runtime (Web Crypto API)', async () => {
    const token = await createSessionToken(samplePayload);
    const resultEdge = await parseAndVerifySessionEdge(token);

    expect(resultEdge.valid).toBe(true);
    expect(resultEdge.user?.username).toBe('teknisi_bengkel');
    expect(resultEdge.user?.role).toBe('OPERATOR');
    expect(resultEdge.user?.name).toBe('Budi Santoso');
    expect(resultEdge.user?.seksi).toBe('Building');
  });

  it('harus menolak token yang tanda tangannya (HMAC) diubah (Tampering Attack)', async () => {
    const token = await createSessionToken(samplePayload);
    const parts = token.split('|');
    // Ubah signature karakter terakhir
    parts[parts.length - 1] = parts[parts.length - 1].replace(/[0-9a-f]/i, (c) => (c === 'a' ? 'b' : 'a'));
    const tamperedToken = parts.join('|');

    const resultNode = await parseAndVerifySession(tamperedToken);
    expect(resultNode.valid).toBe(false);

    const resultEdge = await parseAndVerifySessionEdge(tamperedToken);
    expect(resultEdge.valid).toBe(false);
  });

  it('harus menolak token jika payload username/role diubah tanpa merevisi signature', async () => {
    const token = await createSessionToken(samplePayload);
    const parts = token.split('|');
    // Ganti role OPERATOR menjadi ADMIN
    parts[1] = 'ADMIN';
    const tamperedToken = parts.join('|');

    const result = await parseAndVerifySession(tamperedToken);
    expect(result.valid).toBe(false);
  });

  it('harus menolak token yang kadaluwarsa (> 12 jam)', async () => {
    // Buat token dengan timestamp 13 jam lalu
    const oldTimestamp = (Date.now() - 13 * 60 * 60 * 1000).toString();
    const encodedUsername = Buffer.from('expired_user').toString('base64');
    const encodedName = Buffer.from('Expired User').toString('base64');
    const encodedSeksi = Buffer.from('').toString('base64');
    const data = `${encodedUsername}|OPERATOR|${oldTimestamp}|${encodedName}|${encodedSeksi}`;

    const crypto = await import('crypto');
    const sig = crypto.createHmac('sha256', process.env.SESSION_SECRET!).update(data).digest('hex');
    const expiredToken = `${data}|${sig}`;

    const result = await parseAndVerifySession(expiredToken);
    expect(result.valid).toBe(false);
  });

  it('harus menangani token kosong atau malformed dengan aman', async () => {
    expect((await parseAndVerifySession('')).valid).toBe(false);
    expect((await parseAndVerifySession(null)).valid).toBe(false);
    expect((await parseAndVerifySession('corrupt|token')).valid).toBe(false);
    expect((await parseAndVerifySession('random-garbage-string-12345')).valid).toBe(false);
  });
});
