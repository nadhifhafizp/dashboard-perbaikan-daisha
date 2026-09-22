'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket } from '@/types/ticket';
import { extractRawTicketArray, processRawTicketData } from '@/lib/ticketParser';

const API_URL = '/api/repair';

/** Timeout maksimal fetch data tiket sebelum dibatalkan (35 detik) */
const FETCH_TIMEOUT_MS = 35_000;


// Shared in-memory cache antar halaman (Dashboard, Admin, Riwayat, Input)
let sharedTicketCache: Ticket[] | null = null;
let lastFetchTimestamp = 0;
let inFlightFetchPromise: Promise<Ticket[]> | null = null;
const sharedListeners = new Set<(tickets: Ticket[]) => void>();

/**
 * Mengecek apakah dua daftar tiket identik secara struktural.
 * Menghindari pergantian referensi array jika tidak ada perubahan data di database.
 */
function areTicketListsEqual(prev: Ticket[] | null, next: Ticket[]): boolean {
  if (prev === next) return true;
  if (!prev || prev.length !== next.length) return false;

  for (let i = 0; i < prev.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (
      a.idTiketAsli !== b.idTiketAsli ||
      a.status !== b.status ||
      a.tglMasuk !== b.tglMasuk ||
      a.tglKeluar !== b.tglKeluar ||
      a.detail !== b.detail ||
      a.reason !== b.reason
    ) {
      return false;
    }
  }
  return true;
}

function notifySharedListeners(tickets: Ticket[]) {
  sharedTicketCache = tickets;
  sharedListeners.forEach((listener) => {
    try {
      listener(tickets);
    } catch (e) {
      console.error('[useTickets] Error notifying listener:', e);
    }
  });
}

/**
 * Broadcast perubahan tiket ke seluruh tab/jendela browser & desktop app
 */
export function broadcastTicketChange() {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('daisha_tickets_sync');
      bc.postMessage({ type: 'TICKET_CHANGED', timestamp: Date.now() });
      bc.close();
    }
  } catch {
    // Abaikan jika tidak didukung
  }
}

interface UseTicketsOptions {
  autoRefreshIntervalMs?: number; // default 15000ms (15 detik) untuk sinkronisasi antrean real-time
  initialFetch?: boolean;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { autoRefreshIntervalMs = 15_000, initialFetch = true } = options;
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>(() => sharedTicketCache || []);
  const [loading, setLoading] = useState<boolean>(() => !sharedTicketCache);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchTickets = useCallback(
    async (isSilent = false, forceFresh = false): Promise<Ticket[]> => {
      // Jika request sedang berjalan dan bukan force fresh, gunakan promise yang sama (deduplikasi)
      if (inFlightFetchPromise && !forceFresh) {
        return inFlightFetchPromise;
      }

      if (!isSilent) setIsRefreshing(true);
      setError(null);

      const runFetch = async (): Promise<Ticket[]> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        try {
          const fetchUrl = forceFresh ? `${API_URL}?fresh=${Date.now()}` : API_URL;
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
          lastFetchTimestamp = Date.now();

          // Anti-Looping & Anti Re-render: Cek apakah data benar-benar berubah
          if (areTicketListsEqual(sharedTicketCache, processed)) {
            // Data identik! Pertahankan referensi array yang sudah ada agar React TIDAK re-render
            return sharedTicketCache!;
          }

          // Data benar-benar ada perubahan: perbarui cache & notifikasi listener
          notifySharedListeners(processed);

          if (isMountedRef.current) {
            setTickets(processed);
            setError(null);
          }

          return processed;
        } catch (err: unknown) {
          clearTimeout(timeoutId);
          if (isMountedRef.current) {
            const msg = err instanceof Error ? err.message : 'Terjadi gangguan saat memuat tiket';
            setError(msg);
          }
          return sharedTicketCache || [];
        } finally {
          inFlightFetchPromise = null;
          if (isMountedRef.current) {
            setLoading(false);
            setIsRefreshing(false);
          }
        }
      };

      inFlightFetchPromise = runFetch();
      return inFlightFetchPromise;
    },
    [router]
  );

  // 1. Sinkronisasi listener in-memory antar komponen dalam React Tree
  useEffect(() => {
    isMountedRef.current = true;

    const handleSharedUpdate = (newTickets: Ticket[]) => {
      if (isMountedRef.current) {
        setTickets((prev) => (prev === newTickets ? prev : newTickets));
      }
    };
    sharedListeners.add(handleSharedUpdate);

    return () => {
      sharedListeners.delete(handleSharedUpdate);
    };
  }, []);

  // 2. BroadcastChannel & Window Focus Auto-Refresh (Dibatasi Throttle 10 Detik)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('daisha_tickets_sync');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'TICKET_CHANGED') {
            void fetchTickets(true, true);
          }
        };
      }
    } catch {
      // Abaikan jika tidak didukung
    }

    const handleFocusOrVisibility = () => {
      // Throttle: Jangan re-fetch jika baru saja fetch kurang dari 10 detik lalu
      if (Date.now() - lastFetchTimestamp < 10_000) return;

      if (document.visibilityState === 'visible' && isMountedRef.current) {
        void fetchTickets(true);
      }
    };

    window.addEventListener('visibilitychange', handleFocusOrVisibility);
    window.addEventListener('focus', handleFocusOrVisibility);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('visibilitychange', handleFocusOrVisibility);
      window.removeEventListener('focus', handleFocusOrVisibility);
    };
  }, [fetchTickets]);

  // 3. Initial Fetch & Background Interval Polling
  useEffect(() => {
    isMountedRef.current = true;

    if (initialFetch) {
      const isSilent = sharedTicketCache !== null;
      // Jika cache masih sangat baru (< 15 detik), tidak perlu re-fetch instan
      const isCacheRecent = sharedTicketCache !== null && Date.now() - lastFetchTimestamp < 15_000;
      if (!isCacheRecent) {
        queueMicrotask(() => {
          if (isMountedRef.current) {
            void fetchTickets(isSilent);
          }
        });
      }
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshIntervalMs && autoRefreshIntervalMs > 0) {
      intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          void fetchTickets(true);
        }
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
      notifySharedListeners(next);
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

