import { describe, it, expect } from 'vitest';
import { defineRoute, ApiError } from './defineRoute';
import { NextRequest } from 'next/server';

describe('lib/api/defineRoute - API Route Wrapper', () => {
  it('harus mengeksekusi handler dan menyematkan header x-request-id', async () => {
    const handler = defineRoute({
      handler: async ({ requestId }) => {
        return { success: true, message: 'Halo dari handler', requestId };
      },
    });

    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'x-request-id': 'custom-req-123' },
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe('custom-req-123');

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.requestId).toBe('custom-req-123');
  });

  it('harus memformat ApiError menjadi response error terstandar { error: { code, message, requestId } }', async () => {
    const handler = defineRoute({
      handler: async () => {
        throw new ApiError('Data tidak ditemukan', 404, 'NOT_FOUND');
      },
    });

    const req = new NextRequest('http://localhost:3000/api/test');
    const res = await handler(req);

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toBe('Data tidak ditemukan');
    expect(data.error.requestId).toBeTypeOf('string');
  });

  it('harus menangani uncaught error dengan status 500 dan format terstandar', async () => {
    const handler = defineRoute({
      handler: async () => {
        throw new Error('Database crash unexpected');
      },
    });

    const req = new NextRequest('http://localhost:3000/api/test');
    const res = await handler(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(data.error.message).toBe('Terjadi kesalahan internal pada server.');
    expect(data.error.requestId).toBeTypeOf('string');
  });

  it('harus menolak request jika ukuran payload melebihi maxBytes (413 Payload Too Large)', async () => {
    const handler = defineRoute({
      maxBytes: 100, // 100 bytes limit
      handler: async () => ({ ok: true }),
    });

    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'content-length': '200',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ longPayload: 'x'.repeat(150) }),
    });

    const res = await handler(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
