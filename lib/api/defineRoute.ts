/**
 * lib/api/defineRoute.ts - API Route Handler Wrapper Terpadu (WS4.F4.1 & F4.5)
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * 1. Otomatisasi penegakan Autentikasi & RBAC.
 * 2. Rate Limiting terpusat per IP / User.
 * 3. Payload Body Size Checking (Anti-DoS).
 * 4. Tracing RequestId (`x-request-id`) pada header dan body error.
 * 5. Format Error Seragam: { error: { code, message, requestId } }.
 * 6. Pencatatan Slow Query / Slow Execution (> 500ms).
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/users';
import { requireAuth, checkRateLimit, validatePayloadSize, getClientIp, DEFAULT_MAX_PAYLOAD_BYTES } from '@/lib/security';
import { SessionPayload } from '@/lib/auth';
import { logger } from '@/lib/logger';

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface RouteContext<TBody = unknown> {
  request: NextRequest;
  body: TBody;
  user?: SessionPayload;
  ip: string;
  requestId: string;
  searchParams: URLSearchParams;
  params?: Record<string, string>;
}

export interface RouteConfig<TBody = unknown> {
  name?: string;
  roles?: UserRole[];
  requireAuth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs?: number;
  };
  maxBytes?: number;
  handler: (ctx: RouteContext<TBody>) => Promise<NextResponse | unknown>;
}

export function defineRoute<TBody = unknown>(config: RouteConfig<TBody>) {
  return async (request: NextRequest, props?: { params?: Promise<Record<string, string>> | Record<string, string> }) => {
    const startTime = Date.now();
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const ip = getClientIp(request);
    const handlerName = config.name || request.nextUrl.pathname;

    const setHeaders = (res: NextResponse) => {
      res.headers.set('x-request-id', requestId);
      return res;
    };

    try {
      // 1. Rate Limiting Check
      if (config.rateLimit) {
        const rateKey = `route:${request.method}:${handlerName}:${ip}`;
        const limitCheck = checkRateLimit(rateKey, config.rateLimit.maxRequests, config.rateLimit.windowMs);
        if (!limitCheck.allowed) {
          logger.warn(`Rate limit exceeded on ${handlerName}`, { requestId, ip, handlerName });
          return setHeaders(
            NextResponse.json(
              {
                error: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.',
                  requestId,
                },
              },
              { status: 429 }
            )
          );
        }
      }

      // 2. Payload Size Check
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const maxBytes = config.maxBytes || DEFAULT_MAX_PAYLOAD_BYTES;
        const sizeCheck = validatePayloadSize(request, maxBytes);
        if (!sizeCheck.ok) {
          return setHeaders(
            NextResponse.json(
              {
                error: {
                  code: 'PAYLOAD_TOO_LARGE',
                  message: `Ukuran payload melebihi batas maksimum (${(maxBytes / (1024 * 1024)).toFixed(1)} MB).`,
                  requestId,
                },
              },
              { status: 413 }
            )
          );
        }
      }

      // 3. Authentication & RBAC Check
      let user: SessionPayload | undefined;
      if (config.roles || config.requireAuth) {
        const auth = await requireAuth(request, config.roles);
        if (!auth.authorized) {
          const isUnauthenticated = !auth.user;
          return setHeaders(
            NextResponse.json(
              {
                error: {
                  code: isUnauthenticated ? 'UNAUTHORIZED' : 'FORBIDDEN',
                  message: isUnauthenticated
                    ? 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.'
                    : 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.',
                  requestId,
                },
              },
              { status: isUnauthenticated ? 401 : 403 }
            )
          );
        }
        user = auth.user;
      }

      // 4. Body Parsing
      let body: TBody = undefined as TBody;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            body = (await request.json()) as TBody;
          } catch {
            return setHeaders(
              NextResponse.json(
                {
                  error: {
                    code: 'INVALID_JSON',
                    message: 'Format data JSON tidak valid.',
                    requestId,
                  },
                },
                { status: 400 }
              )
            );
          }
        }
      }

      // 5. Params parsing
      let resolvedParams: Record<string, string> | undefined;
      if (props?.params) {
        resolvedParams = props.params instanceof Promise ? await props.params : props.params;
      }

      // 6. Invoke User Handler
      const result = await config.handler({
        request,
        body,
        user,
        ip,
        requestId,
        searchParams: request.nextUrl.searchParams,
        params: resolvedParams,
      });

      // 7. Measure Execution Time & Slow Warning
      const durationMs = Date.now() - startTime;
      logger.slow(handlerName, durationMs, 500, { requestId, ip, user: user?.username });

      if (result instanceof NextResponse) {
        return setHeaders(result);
      }

      return setHeaders(NextResponse.json(result));
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logger.error(`Handler error on ${handlerName}`, err, { requestId, ip, durationMs });

      if (err instanceof ApiError) {
        return setHeaders(
          NextResponse.json(
            {
              error: {
                code: err.code,
                message: err.message,
                requestId,
              },
            },
            { status: err.statusCode }
          )
        );
      }

      return setHeaders(
        NextResponse.json(
          {
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Terjadi kesalahan internal pada server.',
              requestId,
            },
          },
          { status: 500 }
        )
      );
    }
  };
}
