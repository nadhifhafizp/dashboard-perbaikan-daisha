import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAuth, checkRateLimit, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface SectionDaishaUnit {
  noDaisha: string;
  namaDaisha: string;
  ukuran: string;
  seksi: string;
}

interface SectionUnitsCacheItem {
  timestamp: number;
  units: SectionDaishaUnit[];
  types: string[];
}

// In-memory cache per seksi (TTL 5 menit)
const unitsCache = new Map<string, SectionUnitsCacheItem>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function invalidateSectionUnitsCache(seksi?: string) {
  if (seksi) {
    unitsCache.delete(seksi.toLowerCase());
  } else {
    unitsCache.clear();
  }
}

/**
 * GET /api/catalog/units?seksi=Building&q=S4&type=GT%20Ring
 * Mengambil daftar unit Daisha yang hanya dimiliki oleh seksi terkait
 */
export async function GET(request: Request) {
  // Verifikasi otorisasi sesi
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  // Pembatasan laju permintaan (rate limiting 120 req/menit)
  const rateLimit = checkRateLimit(`units_get:${auth.ip}`, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan data unit Daisha. Coba sesaat lagi.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const querySeksi = sanitizeText(searchParams.get('seksi') || '', 50);
    const searchQuery = sanitizeText(searchParams.get('q') || '', 50).toUpperCase();
    const filterType = sanitizeText(searchParams.get('type') || '', 100);

    // Tentukan seksi target: jika user adalah USER_SEKSI, paksa gunakan seksi miliknya
    let targetSeksi = querySeksi;
    if (auth.user?.role === 'USER_SEKSI') {
      targetSeksi = auth.user.seksi || querySeksi || 'Building';
    } else if (!targetSeksi) {
      targetSeksi = auth.user?.seksi || 'Building';
    }

    const cacheKey = targetSeksi.toLowerCase();
    let cached = unitsCache.get(cacheKey);

    if (!cached || Date.now() - cached.timestamp > CACHE_TTL_MS) {
      // Query langsung dari TWMSDaishaCatalog (10-tabel relational)
      const rows = await sql<SectionDaishaUnit[]>`
        SELECT 
          "UnitCode" AS "noDaisha",
          COALESCE("DaishaType", 'Daisha ' || ${targetSeksi}) AS "namaDaisha",
          COALESCE("SizeSpec", 'STANDARD') AS "ukuran",
          "SectionName" AS "seksi"
        FROM "TWMSDaishaCatalog"
        WHERE LOWER("SectionName") = LOWER(${targetSeksi})
          AND "UnitCode" IS NOT NULL AND TRIM("UnitCode") != '' AND TRIM("UnitCode") != '-'
        ORDER BY UPPER("UnitCode") ASC
      `;

      // Ekstrak tipe Daisha unik yang ada di seksi ini
      const typesSet = new Set<string>();
      rows.forEach((r) => {
        if (r.namaDaisha && r.namaDaisha.trim()) {
          typesSet.add(r.namaDaisha.trim());
        }
      });

      // Tambahkan juga dari TWMSDamageCatalog jika ada jenis resmi yang belum memiliki unit aktif
      try {
        const catalogTypes = await sql<Array<{ name: string }>>`
          SELECT DISTINCT "DaishaType" AS "name"
          FROM "TWMSDamageCatalog"
          WHERE LOWER("SectionName") = LOWER(${targetSeksi}) AND "DaishaType" IS NOT NULL
          ORDER BY "DaishaType" ASC
        `;
        catalogTypes.forEach((t) => {
          if (t.name) typesSet.add(t.name);
        });
      } catch {}

      cached = {
        timestamp: Date.now(),
        units: rows,
        types: Array.from(typesSet).sort(),
      };
      unitsCache.set(cacheKey, cached);
    }

    let resultUnits = cached.units;

    // Filter berdasarkan tipe Daisha jika dipilih
    if (filterType) {
      resultUnits = resultUnits.filter(
        (u) => u.namaDaisha.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Filter berdasarkan query pencarian teks
    if (searchQuery) {
      const cleanQ = searchQuery.replace(/[\s\-_]/g, '');
      resultUnits = resultUnits.filter((u) => {
        const noClean = u.noDaisha.toUpperCase().replace(/[\s\-_]/g, '');
        return noClean.includes(cleanQ) || u.noDaisha.toUpperCase().includes(searchQuery);
      });
    }

    return NextResponse.json({
      success: true,
      seksi: targetSeksi,
      totalUnits: cached.units.length,
      filteredCount: resultUnits.length,
      types: cached.types,
      units: resultUnits,
    });
  } catch (error) {
    console.error('Error in /api/catalog/units:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data unit Daisha seksi.' },
      { status: 500 }
    );
  }
}
