'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { masterDataDaisha, DAFTAR_SEKSI } from '@/lib/masterData';

export interface SymptomItem {
  id: number;
  description: string;
}

export interface ComponentItem {
  id: number;
  name: string;
  symptoms: SymptomItem[];
}

export interface DaishaTreeItem {
  id: number;
  name: string;
  seksi: string;
  components: ComponentItem[];
}

export type CatalogMap = Record<string, { seksi: string; jenisKerusakan: Record<string, string[]> }>;

function getInitialTree(): DaishaTreeItem[] {
  let idCounter = 1;
  return Object.entries(masterDataDaisha).map(([name, info]) => ({
    id: idCounter++,
    name,
    seksi: info.seksi || 'All seksi',
    components: Object.entries(info.jenisKerusakan).map(([compName, symptoms]) => ({
      id: idCounter++,
      name: compName,
      symptoms: (symptoms || []).map((desc) => ({
        id: idCounter++,
        description: desc,
      })),
    })),
  }));
}

let globalCatalogCache: CatalogMap | null = null;
let globalSeksiCache: string[] | null = null;
let globalTreeCache: DaishaTreeItem[] | null = null;

export function useDaishaCatalog() {
  const [catalog, setCatalog] = useState<CatalogMap>(globalCatalogCache || masterDataDaisha);
  const [seksiList, setSeksiList] = useState<string[]>(globalSeksiCache || DAFTAR_SEKSI);
  const [tree, setTree] = useState<DaishaTreeItem[]>(() => globalTreeCache || getInitialTree());
  const [loading, setLoading] = useState(false);


  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/catalog');
      if (!res.ok) return;

      const data = await res.json();
      if (data.success && data.catalog) {
        globalCatalogCache = data.catalog;
        globalSeksiCache = data.seksiList;
        globalTreeCache = data.tree;

        setCatalog(data.catalog);
        setSeksiList(data.seksiList);
        setTree(data.tree);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic catalog:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCatalog();
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

  return {
    catalog,
    seksiList,
    daishaList,
    tree,
    loading,
    refreshCatalog: fetchCatalog,
    getDaishaBySeksi,
    getKomponenKerusakan,
    getDetailKerusakan,
  };
}
