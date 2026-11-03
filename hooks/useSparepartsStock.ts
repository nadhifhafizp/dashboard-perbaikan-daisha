'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface SparepartStockItem {
  id?: number;
  namaKomponen: string;
  kategori: string;
  stokGudang: number;
  satuan: string;
  minStok: number;
  lokasi?: string | null;
  lastRestock?: string | null;
}

export interface StockCalculationResult {
  found: boolean;
  sparepart: SparepartStockItem | null;
  namaKomponen: string;
  stokGudang: number;
  satuan: string;
  minStok: number;
  lokasi: string;
  qtyNeeded: number;
  sisaSetelahPakai: number;
  isCukup: boolean;
  isLow: boolean;
  isZero: boolean;
  statusBadge: {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
}

// Cache in-memory client-side untuk menghindari refetch berulang saat modal buka-tutup
let cachedSpareparts: SparepartStockItem[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 detik

export function useSparepartsStock() {
  const [spareparts, setSpareparts] = useState<SparepartStockItem[]>(cachedSpareparts || []);
  const [isLoading, setIsLoading] = useState(!cachedSpareparts);
  const [error, setError] = useState<string | null>(null);

  const fetchSpareparts = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cachedSpareparts && now - lastFetchTimestamp < CACHE_TTL_MS) {
      setSpareparts(cachedSpareparts);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/spareparts');
      if (res.status === 401 || res.status === 403) {
        // Non-admin fallback jika API terbatas
        setSpareparts([]);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.spareparts)) {
        cachedSpareparts = data.spareparts;
        lastFetchTimestamp = now;
        setSpareparts(data.spareparts);
      } else {
        setError(data.error || 'Gagal memuat inventaris sparepart');
      }
    } catch (err) {
      setError('Terjadi kendala saat menghubungi server stok sparepart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSpareparts();
  }, [fetchSpareparts]);

  /**
   * Helper cerdas mencocokkan nama komponen kerusakan (misal: "Roda Depan", "Bearing", dll.)
   * dengan daftar inventaris suku cadang di gudang.
   */
  const findMatchingSparepart = useCallback(
    (query: string | null | undefined): SparepartStockItem | undefined => {
      if (!query || !spareparts.length) return undefined;
      const cleanQ = query.trim().toLowerCase();

      // 1. Direct exact match
      const exact = spareparts.find(
        (s) => s.namaKomponen.toLowerCase() === cleanQ
      );
      if (exact) return exact;

      // 2. Contains match
      const contains = spareparts.find(
        (s) =>
          s.namaKomponen.toLowerCase().includes(cleanQ) ||
          cleanQ.includes(s.namaKomponen.toLowerCase())
      );
      if (contains) return contains;

      // 3. Domain keyword heuristic untuk komponen Daisha Bridgestone
      if (cleanQ.includes('roda') || cleanQ.includes('kestor') || cleanQ.includes('caster') || cleanQ.includes('swivel')) {
        const rodaPart = spareparts.find((s) => {
          const n = s.namaKomponen.toLowerCase();
          return n.includes('roda') || n.includes('caster') || n.includes('kestor');
        });
        if (rodaPart) return rodaPart;
      }

      if (cleanQ.includes('bearing') || cleanQ.includes('laher')) {
        const bearingPart = spareparts.find((s) => s.namaKomponen.toLowerCase().includes('bearing'));
        if (bearingPart) return bearingPart;
      }

      if (cleanQ.includes('handle') || cleanQ.includes('gagang') || cleanQ.includes('pegangan')) {
        const handlePart = spareparts.find((s) => {
          const n = s.namaKomponen.toLowerCase();
          return n.includes('handle') || n.includes('gagang');
        });
        if (handlePart) return handlePart;
      }

      if (cleanQ.includes('stopper') || cleanQ.includes('rem')) {
        const stopperPart = spareparts.find((s) => {
          const n = s.namaKomponen.toLowerCase();
          return n.includes('stopper') || n.includes('rem') || n.includes('brake');
        });
        if (stopperPart) return stopperPart;
      }

      if (cleanQ.includes('plat') || cleanQ.includes('lantai') || cleanQ.includes('base')) {
        const platPart = spareparts.find((s) => {
          const n = s.namaKomponen.toLowerCase();
          return n.includes('plat') || n.includes('sheet');
        });
        if (platPart) return platPart;
      }

      return undefined;
    },
    [spareparts]
  );

  /**
   * Menghitung sisa stok aktual dan estimasi sisa setelah pemakaian (deduction).
   */
  const getStockInfo = useCallback(
    (query: string | null | undefined, qtyNeeded = 1): StockCalculationResult => {
      const sp = findMatchingSparepart(query);
      const qty = Math.max(1, qtyNeeded);

      if (!sp) {
        return {
          found: false,
          sparepart: null,
          namaKomponen: query || 'Komponen',
          stokGudang: 0,
          satuan: 'Pcs',
          minStok: 0,
          lokasi: '-',
          qtyNeeded: qty,
          sisaSetelahPakai: 0,
          isCukup: false,
          isLow: false,
          isZero: true,
          statusBadge: {
            label: 'Belum Terdaftar di Gudang',
            bgClass: 'bg-slate-100',
            textClass: 'text-slate-600',
            borderClass: 'border-slate-200',
          },
        };
      }

      const stokGudang = Number(sp.stokGudang) || 0;
      const minStok = Number(sp.minStok) || 0;
      const sisaSetelahPakai = stokGudang - qty;
      const isZero = stokGudang <= 0;
      const isCukup = stokGudang >= qty;
      const isLow = !isZero && stokGudang <= minStok;

      let statusBadge = {
        label: `Tersedia: ${stokGudang} ${sp.satuan}`,
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
      };

      if (isZero) {
        statusBadge = {
          label: `Stok Habis (0 ${sp.satuan})`,
          bgClass: 'bg-red-50',
          textClass: 'text-red-700',
          borderClass: 'border-red-200',
        };
      } else if (!isCukup) {
        statusBadge = {
          label: `Stok Kurang (Sisa: ${stokGudang} ${sp.satuan})`,
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-800',
          borderClass: 'border-amber-300',
        };
      } else if (isLow) {
        statusBadge = {
          label: `Stok Menipis: ${stokGudang} ${sp.satuan}`,
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-700',
          borderClass: 'border-amber-200',
        };
      }

      return {
        found: true,
        sparepart: sp,
        namaKomponen: sp.namaKomponen,
        stokGudang,
        satuan: sp.satuan || 'Pcs',
        minStok,
        lokasi: sp.lokasi || '-',
        qtyNeeded: qty,
        sisaSetelahPakai,
        isCukup,
        isLow,
        isZero,
        statusBadge,
      };
    },
    [findMatchingSparepart]
  );

  return {
    spareparts,
    isLoading,
    error,
    refresh: () => fetchSpareparts(true),
    findMatchingSparepart,
    getStockInfo,
  };
}

