'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface SectionUnit {
  noDaisha: string;
  namaDaisha: string;
  ukuran: string;
  seksi: string;
}

interface CacheStore {
  timestamp: number;
  units: SectionUnit[];
  types: string[];
}

const memoryCache = new Map<string, CacheStore>();

export function useSectionDaishaUnits(targetSeksi: string) {
  const [units, setUnits] = useState<SectionUnit[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanSeksi = (targetSeksi || '').trim();

  const fetchUnits = useCallback(async (seksiToFetch: string, force = false) => {
    if (!seksiToFetch) return;

    const cacheKey = seksiToFetch.toLowerCase();
    const cached = memoryCache.get(cacheKey);

    // Cache berlaku 5 menit di client-side
    if (!force && cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      setUnits(cached.units);
      setTypes(cached.types);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/catalog/units?seksi=${encodeURIComponent(seksiToFetch)}`);
      if (!res.ok) {
        throw new Error('Gagal memuat data unit Daisha');
      }

      const data = await res.json();
      if (data.success) {
        const fetchedUnits = data.units || [];
        const fetchedTypes = data.types || [];

        memoryCache.set(cacheKey, {
          timestamp: Date.now(),
          units: fetchedUnits,
          types: fetchedTypes,
        });

        setUnits(fetchedUnits);
        setTypes(fetchedTypes);
      }
    } catch (err: unknown) {
      console.error('Failed to load section units:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cleanSeksi) {
      void fetchUnits(cleanSeksi);
    }
  }, [cleanSeksi, fetchUnits]);

  // Helper untuk mencari unit berdasarkan nomor teks atau tipe
  const searchUnits = useCallback(
    (query: string, filterType?: string): SectionUnit[] => {
      let filtered = units;

      if (filterType && filterType !== 'ALL') {
        filtered = filtered.filter(
          (u) => u.namaDaisha.toLowerCase() === filterType.toLowerCase()
        );
      }

      if (!query.trim()) return filtered.slice(0, 30); // Tampilkan 30 unit pertama jika tanpa search

      const cleanQuery = query.trim().toUpperCase().replace(/[\s\-_]/g, '');
      const rawUpper = query.trim().toUpperCase();

      return filtered
        .filter((u) => {
          const uClean = u.noDaisha.toUpperCase().replace(/[\s\-_]/g, '');
          return uClean.includes(cleanQuery) || u.noDaisha.toUpperCase().includes(rawUpper);
        })
        .slice(0, 50); // Maksimal 50 sugesti cepat
    },
    [units]
  );

  // Set lookup map untuk verifikasi instan apakah suatu noDaisha terdaftar di seksi ini
  const unitMap = useMemo(() => {
    const map = new Map<string, SectionUnit>();
    units.forEach((u) => {
      map.set(u.noDaisha.trim().toUpperCase(), u);
      // Normalized key tanpa spasi & tanda hubung
      map.set(u.noDaisha.trim().toUpperCase().replace(/[\s\-_]/g, ''), u);
    });
    return map;
  }, [units]);

  const findUnit = useCallback(
    (noDaisha: string): SectionUnit | null => {
      if (!noDaisha.trim()) return null;
      const upper = noDaisha.trim().toUpperCase();
      if (unitMap.has(upper)) return unitMap.get(upper)!;
      const clean = upper.replace(/[\s\-_]/g, '');
      if (unitMap.has(clean)) return unitMap.get(clean)!;
      return null;
    },
    [unitMap]
  );

  return {
    units,
    types,
    loading,
    error,
    refreshUnits: () => fetchUnits(cleanSeksi, true),
    searchUnits,
    findUnit,
  };
}
