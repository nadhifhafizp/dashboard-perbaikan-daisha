/**
 * lib/materialArea.ts - Utilitas Kalkulasi Dimensi, Luas Plat, dan Normalisasi Material
 * 
 * Sesuai PRD WS3 (Pemecahan EvaluationModal):
 * Memisahkan logika kalkulasi luas dan normalisasi data material dari komponen UI.
 */

export interface PlateAreaResult {
  cm2: number;
  m2: number;
}

export interface ClientMaterialItem {
  id: number;
  sectionRequestId?: number;
  namaKomponen: string;
  tipe: 'SPAREPART' | 'MATERIAL';
  qty: number;
  satuan: string;
  dimensi?: string;
  potongStok?: boolean;
  qtyPotongStok?: number;
  keterangan?: string;
}

/**
 * Menghitung luas plat dalam cm² dan m² dari panjang dan lebar (dalam cm)
 */
export function calculatePlateArea(panjangStr: string, lebarStr: string): PlateAreaResult | null {
  if (!panjangStr || !lebarStr) return null;
  const p = parseFloat(panjangStr.replace(',', '.'));
  const l = parseFloat(lebarStr.replace(',', '.'));
  if (!isNaN(p) && !isNaN(l) && p > 0 && l > 0) {
    const areaCm2 = p * l;
    return {
      cm2: Math.round(areaCm2 * 100) / 100,
      m2: Math.round((areaCm2 / 10000) * 10000) / 10000,
    };
  }
  return null;
}

/**
 * Memformat string dimensi plat dari panjang, lebar, dan ketebalan
 */
export function formatPlateDimension(panjang: string, lebar: string, tebal?: string): string {
  const p = panjang.trim();
  const l = lebar.trim();
  const t = tebal?.trim();
  const tebalStr = t ? `, tebal ${t}mm` : '';
  return `${p} cm × ${l} cm${tebalStr}`;
}

/**
 * Mengurai dan menormalkan array material mentah dari database ke bentuk ClientMaterialItem
 */
export function normalizeMaterialsClient(raw: unknown): ClientMaterialItem[] {
  if (!raw) return [];
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  const result: Record<string, unknown>[] = [];
  for (const item of parsed) {
    if (!item) continue;
    if (typeof item === 'string') {
      try {
        const inner = JSON.parse(item);
        if (Array.isArray(inner)) {
          result.push(...inner);
        } else if (inner && typeof inner === 'object') {
          result.push(inner);
        }
      } catch {
        // ignore
      }
    } else if (typeof item === 'object') {
      result.push(item);
    }
  }

  return result
    .filter((m) => m && (m.namaKomponen || m.id))
    .map((m) => {
      const nama = String(m.namaKomponen || '');
      const lower = nama.toLowerCase();
      const isMat =
        m.tipe === 'MATERIAL' ||
        lower.includes('plat') ||
        lower.includes('cat') ||
        lower.includes('las') ||
        lower.includes('pipa') ||
        lower.includes('hollow') ||
        lower.includes('siku') ||
        m.satuan === 'cm²' ||
        m.satuan === 'm²';

      return {
        id: Number(m.id) || Date.now(),
        sectionRequestId: m.sectionRequestId ? Number(m.sectionRequestId) : undefined,
        namaKomponen: nama,
        tipe: (m.tipe || (isMat ? 'MATERIAL' : 'SPAREPART')) as 'SPAREPART' | 'MATERIAL',
        qty: Number(m.qty) || 1,
        satuan: String(m.satuan || (isMat ? 'cm²' : 'Pcs')),
        dimensi: m.dimensi ? String(m.dimensi) : undefined,
        potongStok: Boolean(m.potongStok),
        qtyPotongStok: m.qtyPotongStok !== undefined ? Number(m.qtyPotongStok) : undefined,
        keterangan: m.keterangan ? String(m.keterangan) : undefined,
      };
    });
}
