'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket } from '@/types/ticket';
import { extractRawTicketArray, processRawTicketData } from '@/lib/ticketParser';

const API_URL = '/api/repair';

/** Timeout maksimal fetch data tiket sebelum dibatalkan (35 detik) */
const FETCH_TIMEOUT_MS = 35_000;


// Shared in-memory cache antar halaman (Dashboard, Admin, Riwayat)
let sharedTicketCache: Ticket[] | null = null;

interface UseTicketsOptions {
  autoRefreshIntervalMs?: number; // misalnya 45000ms untuk Dashboard
  initialFetch?: boolean;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { autoRefreshIntervalMs, initialFetch = true } = options;
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>(() => sharedTicketCache || []);
  const [loading, setLoading] = useState<boolean>(() => !sharedTicketCache);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchTickets = useCallback(
    async (isSilent = false, forceFresh = false): Promise<Ticket[]> => {
      if (!isSilent) setIsRefreshing(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        try {
          controller.abort(new DOMException('Timeout: Permintaan data melebihi 35 detik', 'AbortError'));
        } catch {
          controller.abort();
        }
      }, FETCH_TIMEOUT_MS);

      try {
        const fetchUrl = forceFresh ? `${API_URL}?fresh=true` : API_URL;
        const response = await fetch(fetchUrl, {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 401) {
          router.push('/login');
          return [];
        }

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || `Gagal mengambil data (Status: ${response.status})`);
        }

        const jsonResult = await response.json();
        const rawArray = extractRawTicketArray(jsonResult);
        const processed = processRawTicketData(rawArray);

        sharedTicketCache = processed;

        if (isMountedRef.current) {
          setTickets(processed);
          setError(null);
        }

        return processed;
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'));
        if (isMountedRef.current) {
          const msg = isAbort
            ? 'Koneksi ke server Power Automate lambat / timeout. Silakan klik muat ulang.'
            : err instanceof Error
            ? err.message
            : 'Terjadi gangguan saat memuat tiket';
          if (!isAbort) {
            console.warn('Fetch tickets notice:', err);
          }
          setError(msg);
        }
        return sharedTicketCache || [];
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [router]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (initialFetch) {
      const isSilent = sharedTicketCache !== null;
      queueMicrotask(() => {
        if (isMountedRef.current) {
          void fetchTickets(isSilent);
        }
      });
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshIntervalMs && autoRefreshIntervalMs > 0) {
      intervalId = setInterval(() => {
        fetchTickets(true);
      }, autoRefreshIntervalMs);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchTickets, initialFetch, autoRefreshIntervalMs]);

  // Helper untuk update manual state lokal tiket secara instan jika diperlukan
  const setLocalTickets = useCallback((updater: Ticket[] | ((prev: Ticket[]) => Ticket[])) => {
    setTickets((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sharedTicketCache = next;
      return next;
    });
  }, []);

  return {
    tickets,
    loading,
    isRefreshing,
    error,
    refresh: (isSilent = false, forceFresh = true) => fetchTickets(isSilent, forceFresh),
    setTickets: setLocalTickets,
  };
}
