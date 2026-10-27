'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DAFTAR_SEKSI } from '@/lib/masterData';

export interface SymptomItem {
  id: number;
  description: string;
}

export interface ComponentItem {
  id: number;
  name: string;
  symptoms: SymptomItem[];
}

export interface DaishaVariantItem {
  id: number;
  name: string;
  ukuran?: string;
  susunan?: string;
  tipe?: string;
  codePrefix?: string;
  padLength?: number;
  minNumber?: number;
  maxNumber?: number;
  totalUnits?: number;
  rangeFormat?: string;
  badgeColor?: string;
}

export interface SectionItem {
  id: number;
  name: string;
  colorName?: string | null;
  badgeBg?: string | null;
  textColor?: string | null;
  borderColor?: string | null;
  accentBorder?: string | null;
}

export interface DaishaTreeItem {
  id: number;
  name: string;
  seksi: string;
  codePrefix?: string;
  totalUnits?: number;
  components: ComponentItem[];
  variants?: DaishaVariantItem[];
}

export type CatalogMap = Record<
  string,
  {
    seksi: string;
    codePrefix?: string;
    totalUnits?: number;
    jenisKerusakan: Record<string, string[]>;
    variants?: DaishaVariantItem[];
  }
>;

let globalCatalogCache: CatalogMap | null = null;
let globalSeksiCache: string[] | null = null;
let globalSectionsCache: SectionItem[] | null = null;
let globalTreeCache: DaishaTreeItem[] | null = null;
let lastCatalogFetchTimestamp = 0;

export function useDaishaCatalog() {
  const [catalog, setCatalog] = useState<CatalogMap>(() => globalCatalogCache || {});
  const [seksiList, setSeksiList] = useState<string[]>(() => globalSeksiCache || [...DAFTAR_SEKSI]);
  const [sections, setSections] = useState<SectionItem[]>(() => globalSectionsCache || []);
  const [tree, setTree] = useState<DaishaTreeItem[]>(() => globalTreeCache || []);
  const [loading, setLoading] = useState(() => !globalCatalogCache);

  const fetchCatalog = useCallback(async (force = false) => {
    // Lewati jika cache masih baru (< 5 menit) dan tidak dipaksa
    if (!force && globalCatalogCache && Date.now() - lastCatalogFetchTimestamp < 5 * 60 * 1000) {
      return;
    }

    try {
      if (force) setLoading(true);
      const url = force ? `/api/catalog?t=${Date.now()}` : '/api/catalog';
      const res = await fetch(url, {
        cache: force ? 'no-store' : 'default',
        headers: {
          'Cache-Control': force ? 'no-cache' : 'default',
        },
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data.success && data.catalog) {
        globalCatalogCache = data.catalog;
        globalSeksiCache = data.seksiList;
        globalSectionsCache = data.sections || [];
        globalTreeCache = data.tree;
        lastCatalogFetchTimestamp = Date.now();

        setCatalog(data.catalog);
        setSeksiList(data.seksiList);
        setSections(data.sections || []);
        setTree(data.tree);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic catalog:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCatalog = useCallback(async () => {
    globalCatalogCache = null;
    globalSeksiCache = null;
    globalSectionsCache = null;
    globalTreeCache = null;
    lastCatalogFetchTimestamp = 0;
    await fetchCatalog(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('daisha-catalog-updated'));
    }
  }, [fetchCatalog]);

  useEffect(() => {
    void fetchCatalog();

    const handleCatalogUpdate = () => {
      void fetchCatalog(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('daisha-catalog-updated', handleCatalogUpdate);
      return () => {
        window.removeEventListener('daisha-catalog-updated', handleCatalogUpdate);
      };
    }
  }, [fetchCatalog]);

  const daishaList = useMemo(() => {
    return Object.keys(catalog).sort();
  }, [catalog]);

  const getDaishaBySeksi = useCallback(
    (seksi?: string): string[] => {
      if (!seksi || seksi.toLowerCase() === 'all seksi') return daishaList;
      return Object.entries(catalog)
        .filter(
          ([, data]) =>
            data.seksi.toLowerCase() === seksi.toLowerCase() ||
            data.seksi.toLowerCase() === 'all seksi'
        )
        .map(([nama]) => nama)
        .sort();
    },
    [catalog, daishaList]
  );

  const getKomponenKerusakan = useCallback(
    (namaDaisha?: string): string[] => {
      if (namaDaisha && catalog[namaDaisha]) {
        return Object.keys(catalog[namaDaisha].jenisKerusakan).sort();
      }
      return Array.from(
        new Set(Object.values(catalog).flatMap((d) => Object.keys(d.jenisKerusakan)))
      ).sort();
    },
    [catalog]
  );

  const getDetailKerusakan = useCallback(
    (namaDaisha?: string, komponen?: string): string[] => {
      if (!namaDaisha || !komponen || !catalog[namaDaisha]) return [];
      return catalog[namaDaisha].jenisKerusakan[komponen] || [];
    },
    [catalog]
  );

  const getVariantsForDaisha = useCallback(
    (namaDaisha?: string): DaishaVariantItem[] => {
      if (!namaDaisha) return [];
      if (catalog[namaDaisha]?.variants && catalog[namaDaisha].variants!.length > 0) {
        return catalog[namaDaisha].variants!;
      }
      const item = tree.find((d) => d.name.toLowerCase() === namaDaisha.toLowerCase());
      return item?.variants || [];
    },
    [catalog, tree]
  );

  return {
    catalog,
    seksiList,
    sections,
    daishaList,
    tree,
    loading,
    refreshCatalog,
    getDaishaBySeksi,
    getKomponenKerusakan,
    getDetailKerusakan,
    getVariantsForDaisha,
  };
}
