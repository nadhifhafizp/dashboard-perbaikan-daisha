import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { DAFTAR_SEKSI } from '@/lib/masterData';
import { SECTION_METAS, findDaishaCodeSpec } from '@/lib/daishaVariants';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';
import { syncDaishaMasterFromCatalog, insertNewDaishaUnits } from '@/lib/daishaCatalogSync';
import { invalidateMaintenanceCache } from '@/app/api/maintenance/route';

interface SymptomObj {
  id: number;
  description: string;
}

interface ComponentObj {
  id: number;
  name: string;
  symptoms: SymptomObj[];
}

interface VariantObj {
  id: number;
  name: string;
  ukuran?: string | null;
  susunan?: string | null;
  tipe?: string | null;
  codePrefix?: string | null;
  padLength?: number | null;
  minNumber?: number | null;
  maxNumber?: number | null;
  totalUnits?: number | null;
  rangeFormat?: string | null;
  badgeColor?: string | null;
}

interface CatalogCacheData {
  success: boolean;
  seksiList: string[];
  sections: Array<{
    id: number;
    name: string;
    colorName: string | null;
    badgeBg: string | null;
    textColor: string | null;
    borderColor: string | null;
    accentBorder: string | null;
  }>;
  catalog: Record<string, unknown>;
  tree: Array<unknown>;
}

function invalidateCatalogCache(): void {
  // In-memory cache is fully disabled in favor of real-time Postgres queries
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/catalog - Mengambil data katalog Daisha, Komponen, dan Gejala dari TWMSDamageCatalog & TWMSDaishaCatalog
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  const rateLimit = checkRateLimit(`catalog_get:${auth.ip}`, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan katalog. Silakan coba sesaat lagi.' }, { status: 429 });
  }

  try {
    // 1. Ambil seluruh data hierarki dari TWMSDamageCatalog
    const rows = await sql`
      SELECT 
        "Id" AS id,
        "DaishaType" AS daisha_type,
        COALESCE("SectionName", 'Building') AS section_name,
        "ComponentName" AS component_name,
        "SymptomDesc" AS symptom_desc
      FROM "TWMSDamageCatalog"
      ORDER BY "DaishaType" ASC, "ComponentName" ASC NULLS LAST, "SymptomDesc" ASC NULLS LAST
    `;

    // 2. Hitung jumlah unit armada per jenis dari TWMSDaishaCatalog dan ambil sampel kode
    const unitStats = await sql`
      SELECT 
        "DaishaType" AS daisha_type,
        COUNT(*)::int AS total_units,
        MIN("UnitCode") AS sample_code
      FROM "TWMSDaishaCatalog"
      WHERE "IsActive" = TRUE
      GROUP BY "DaishaType"
    `;
    const unitMap = new Map<string, { daisha_type: string; total_units: number; sample_code: string }>();
    unitStats.forEach((u) => {
      if (u.daisha_type) {
        unitMap.set(u.daisha_type.toLowerCase(), {
          daisha_type: u.daisha_type,
          total_units: u.total_units,
          sample_code: u.sample_code || '',
        });
      }
    });

    // 3. Ambil varian ukuran dari TWMSDaishaCatalog
    const sizeRows = await sql`
      SELECT 
        "DaishaType" AS daisha_type,
        "SizeSpec" AS size,
        COUNT(*)::int AS count,
        MIN("UnitCode") AS min_code,
        MAX("UnitCode") AS max_code
      FROM "TWMSDaishaCatalog"
      WHERE "IsActive" = TRUE AND "SizeSpec" IS NOT NULL AND "SizeSpec" != 'NONE'
      GROUP BY "DaishaType", "SizeSpec"
      ORDER BY "DaishaType", "SizeSpec"
    `;
    const sizeMap = new Map<string, VariantObj[]>();
    sizeRows.forEach((s) => {
      const key = s.daisha_type?.toLowerCase();
      if (!key) return;
      if (!sizeMap.has(key)) sizeMap.set(key, []);

      const upperSize = (s.size || '').toUpperCase().trim();
      const isVertical = key.includes('vertical');
      const isGtRing = key.includes('gt ring');
      let codePrefix = '';
      let variantName = `${s.daisha_type} ${s.size}`;

      if (upperSize === 'LARGE') {
        codePrefix = 'L';
        if (isVertical) variantName = 'Vertical-Big/Large';
      } else if (upperSize === 'MEDIUM') {
        codePrefix = 'M';
        if (isVertical) variantName = 'Vertical-Medium';
      } else if (upperSize === 'SMALL') {
        codePrefix = 'S';
        if (isVertical) variantName = 'Vertical-Small';
      }

      // Jika unit berkategori GT Ring dan min_code memiliki prefix susunan (S3, S4, M3, L3)
      if (s.min_code) {
        const cleanMin = s.min_code.trim().toUpperCase().replace(/[\s\-_]/g, '');
        if (isGtRing) {
          const gtMatch = cleanMin.match(/^([SML][34]?)/);
          if (gtMatch && gtMatch[1]) {
            codePrefix = gtMatch[1];
          }
        }
      }

      sizeMap.get(key)!.push({
        id: sizeMap.get(key)!.length + 1,
        name: variantName,
        ukuran: s.size,
        totalUnits: s.count,
        codePrefix: codePrefix,
        padLength: isVertical ? 5 : isGtRing ? 4 : 4,
        rangeFormat: s.min_code && s.max_code ? `${s.min_code} s/d ${s.max_code}` : '',
      });
    });

    // Standarisasi Varian GT Ring (S3, S4, M3, L3) sesuai pengkodean resmi 29 Daisha
    const gtRingKey = 'gt ring';
    if ((!sizeMap.has(gtRingKey) || sizeMap.get(gtRingKey)!.length === 0) && (unitMap.get(gtRingKey)?.total_units || 0) > 0) {
      const existingUnits = unitMap.get(gtRingKey)?.total_units || 0;
      const quarter = Math.floor(existingUnits / 4);
      sizeMap.set(gtRingKey, [
        {
          id: 1,
          name: 'GT Ring Small Susun 3',
          ukuran: 'Small',
          susunan: 'Susun 3',
          codePrefix: 'S3',
          padLength: 4,
          totalUnits: quarter,
          rangeFormat: 'S30001 s/d S3...',
        },
        {
          id: 2,
          name: 'GT Ring Small Susun 4',
          ukuran: 'Small',
          susunan: 'Susun 4',
          codePrefix: 'S4',
          padLength: 4,
          totalUnits: quarter,
          rangeFormat: 'S40001 s/d S4...',
        },
        {
          id: 3,
          name: 'GT Ring Medium Susun 3',
          ukuran: 'Medium',
          susunan: 'Susun 3',
          codePrefix: 'M3',
          padLength: 4,
          totalUnits: quarter,
          rangeFormat: 'M30001 s/d M3...',
        },
        {
          id: 4,
          name: 'GT Ring Large Susun 3',
          ukuran: 'Large',
          susunan: 'Susun 3',
          codePrefix: 'L3',
          padLength: 4,
          totalUnits: existingUnits - quarter * 3,
          rangeFormat: 'L30001 s/d L3...',
        },
      ]);
    }

    const defaultSectionRows = Object.values(SECTION_METAS).map((s, idx) => ({
      id: idx + 1,
      name: s.name as string,
      colorName: s.colorName,
      badgeBg: s.badgeBg,
      textColor: s.textColor,
      borderColor: s.borderColor,
      accentBorder: s.accentBorder,
    }));

    // Kelompokkan per DaishaType
    const groupedDaisha = new Map<
      string,
      {
        id: number;
        name: string;
        seksi: string;
        codePrefix: string;
        totalUnits: number;
        componentsMap: Map<string, { id: number; name: string; symptoms: SymptomObj[] }>;
        variants: VariantObj[];
      }
    >();

    for (const r of rows) {
      if (!r.daisha_type) continue;
      const typeKey = r.daisha_type.trim();
      if (!groupedDaisha.has(typeKey)) {
        const variants = sizeMap.get(typeKey.toLowerCase()) || [];
        const stats = unitMap.get(typeKey.toLowerCase());
        let codePrefix = '';

        // Hanya isi codePrefix induk jika Daisha TIDAK memiliki varian dan memiliki unit aktif
        if (variants.length === 0 && (stats?.total_units || 0) > 0) {
          const canonical = findDaishaCodeSpec(typeKey);
          codePrefix = canonical?.codePrefix || '';
          if (!codePrefix && stats?.sample_code) {
            const m1 = stats.sample_code.match(/^([A-Za-z0-9\/\-]+?)(?:\d{3,5})$/);
            if (m1 && m1[1]) {
              codePrefix = m1[1];
            } else {
              const m2 = stats.sample_code.match(/^([A-Za-z\/\-]+)/);
              if (m2 && m2[1]) codePrefix = m2[1];
            }
          }
        }

        const variantUnitsSum = variants.reduce((acc, v) => acc + (v.totalUnits || 0), 0);
        const effectiveTotalUnits = variants.length > 0 ? variantUnitsSum : (stats?.total_units || 0);

        groupedDaisha.set(typeKey, {
          id: r.id,
          name: typeKey,
          seksi: r.section_name,
          codePrefix: codePrefix,
          totalUnits: effectiveTotalUnits,
          componentsMap: new Map(),
          variants: variants,
        });
      }

      const d = groupedDaisha.get(typeKey)!;
      if (r.component_name && r.component_name.trim()) {
        const compKey = r.component_name.trim();
        if (!d.componentsMap.has(compKey)) {
          d.componentsMap.set(compKey, {
            id: r.id,
            name: compKey,
            symptoms: [],
          });
        }
        const c = d.componentsMap.get(compKey)!;
        if (r.symptom_desc && r.symptom_desc.trim()) {
          const symDesc = r.symptom_desc.trim();
          if (!c.symptoms.some((s) => s.description === symDesc)) {
            c.symptoms.push({
              id: r.id,
              description: symDesc,
            });
          }
        }
      }
    }

    // Pastikan daisha yang terdaftar di TWMSDaishaCatalog tetapi belum punya komponen di TWMSDamageCatalog tetap tampil
    for (const [key, stats] of unitMap) {
      const matchFound = Array.from(groupedDaisha.keys()).some(
        (k) => k.toLowerCase() === key
      );
      if (!matchFound) {
        const variants = sizeMap.get(key) || [];
        let codePrefix = '';
        if (variants.length === 0 && (stats.total_units || 0) > 0) {
          const canonical = findDaishaCodeSpec(stats.daisha_type);
          codePrefix = canonical?.codePrefix || '';
          if (!codePrefix && stats.sample_code) {
            const m1 = stats.sample_code.match(/^([A-Za-z0-9\/\-]+?)(?:\d{3,5})$/);
            if (m1 && m1[1]) codePrefix = m1[1];
          }
        }

        const variantUnitsSum = variants.reduce((acc, v) => acc + (v.totalUnits || 0), 0);
        const effectiveTotalUnits = variants.length > 0 ? variantUnitsSum : (stats.total_units || 0);

        groupedDaisha.set(stats.daisha_type, {
          id: Math.floor(Math.random() * 1000000),
          name: stats.daisha_type,
          seksi: 'Building',
          codePrefix: codePrefix,
          totalUnits: effectiveTotalUnits,
          componentsMap: new Map(),
          variants: variants,
        });
      }
    }

    const rawCatalog: Record<string, unknown> = {};
    const tree: Array<unknown> = [];

    for (const [name, d] of groupedDaisha) {
      const jenisKerusakan: Record<string, string[]> = {};
      const components = Array.from(d.componentsMap.values());
      components.forEach((c) => {
        jenisKerusakan[c.name] = c.symptoms.map((s) => s.description);
      });

      rawCatalog[name] = {
        seksi: d.seksi,
        codePrefix: d.codePrefix,
        totalUnits: d.totalUnits,
        jenisKerusakan,
        variants: d.variants,
      };

      tree.push({
        id: d.id,
        name: d.name,
        seksi: d.seksi,
        codePrefix: d.codePrefix,
        totalUnits: d.totalUnits,
        components,
        variants: d.variants,
      });
    }

    const seksiSet = new Set<string>(DAFTAR_SEKSI);
    defaultSectionRows.forEach((s) => seksiSet.add(s.name));
    for (const [, d] of groupedDaisha) {
      if (d.seksi) seksiSet.add(d.seksi);
    }

    const responsePayload: CatalogCacheData = {
      success: true,
      seksiList: Array.from(seksiSet).sort(),
      sections: defaultSectionRows,
      catalog: rawCatalog,
      tree,
    };

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data katalog dari database.',
        catalog: {},
        seksiList: DAFTAR_SEKSI,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/catalog - Menambah Daisha Baru, Komponen Baru, atau Gejala Baru ke TWMSDamageCatalog
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  const sizeCheck = validatePayloadSize(request, 256 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  const rateLimit = checkRateLimit(`catalog_post:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak operasi perubahan katalog.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const body = await request.json();
    const action = sanitizeText(body.action, 50);

    // 1. Tambah jenis daisha baru (Model Standar atau Multi-Varian)
    if (action === 'ADD_DAISHA') {
      const name = sanitizeText(body.name, 100);
      const seksi = sanitizeText(body.seksi, 50) || 'Building';
      const hasVariants = Boolean(body.hasVariants);
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Unit', 0, 10000).value;
      const variants = Array.isArray(body.variants) ? body.variants : [];

      if (!name) {
        return NextResponse.json({ error: 'Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const [existing] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog" 
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${name})) 
        LIMIT 1
      `;
      if (existing) {
        return NextResponse.json({ error: `Jenis Daisha "${name}" sudah terdaftar di katalog.` }, { status: 400 });
      }

      const [newDaisha] = await sql`
        INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "UpdateDate")
        VALUES (${name}, ${seksi}, NOW())
        RETURNING "Id" AS id, "DaishaType" AS name, "SectionName" AS seksi
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_DAISHA',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newDaisha.id,
        details: `Nama: ${newDaisha.name}, Seksi: ${newDaisha.seksi}, Varian: ${hasVariants ? variants.length : 0}`,
      });

      if (hasVariants && variants.length > 0) {
        for (const v of variants) {
          const vName = sanitizeText(v.name, 50);
          if (!vName) continue;
          const vPrefix = sanitizeText(v.codePrefix, 20)?.toUpperCase().trim() || null;
          const vUnits = validatePositiveInt(v.totalUnits ?? 0, 'Unit Varian', 0, 10000).value;
          if (vUnits > 0) {
            await insertNewDaishaUnits(newDaisha.name, newDaisha.seksi, vPrefix, vUnits, vName);
          }
        }
      } else if (!hasVariants && totalUnits > 0) {
        await insertNewDaishaUnits(newDaisha.name, newDaisha.seksi, codePrefix || null, totalUnits, 'NONE');
      }

      await syncDaishaMasterFromCatalog();
      invalidateMaintenanceCache();

      return NextResponse.json({
        success: true,
        message: `Jenis Daisha "${newDaisha.name}" berhasil ditambahkan ke Seksi ${newDaisha.seksi}.`,
        data: newDaisha,
      });
    }

    // 2. Tambah Komponen Baru ke Jenis Daisha
    if (action === 'ADD_COMPONENT') {
      const daishaName = sanitizeText(body.daishaName || body.name_daisha, 100);
      const daishaId = body.daishaId ? Number(body.daishaId) : null;
      const name = sanitizeText(body.name, 100);

      if (!name) {
        return NextResponse.json({ error: 'Nama Komponen wajib diisi.' }, { status: 400 });
      }

      let targetDaishaType = daishaName;
      let targetSection = sanitizeText(body.seksi, 50) || 'Building';

      if (targetDaishaType) {
        const [dRow] = await sql`
          SELECT "SectionName" FROM "TWMSDamageCatalog" 
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetDaishaType})) 
          LIMIT 1
        `;
        if (dRow && dRow.SectionName) {
          targetSection = dRow.SectionName;
        }
      } else if (daishaId) {
        const [dRow] = await sql`SELECT "DaishaType", "SectionName" FROM "TWMSDamageCatalog" WHERE "Id" = ${daishaId} LIMIT 1`;
        if (dRow) {
          targetDaishaType = dRow.DaishaType;
          targetSection = dRow.SectionName || 'Building';
        }
      }

      if (!targetDaishaType) {
        return NextResponse.json({ error: 'Jenis Daisha tidak ditemukan.' }, { status: 404 });
      }

      const [exists] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetDaishaType}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${name}))
        LIMIT 1
      `;
      if (exists) {
        return NextResponse.json({ error: `Komponen "${name}" sudah ada pada Daisha ini.` }, { status: 400 });
      }

      // Jika ada baris placeholder daisha yang ComponentName-nya NULL, kita update baris itu
      const [placeholder] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetDaishaType}))
          AND "ComponentName" IS NULL
        LIMIT 1
      `;

      let newComp;
      if (placeholder) {
        [newComp] = await sql`
          UPDATE "TWMSDamageCatalog"
          SET "ComponentName" = ${name}, "SectionName" = ${targetSection}, "UpdateDate" = NOW()
          WHERE "Id" = ${placeholder.Id}
          RETURNING "Id" AS id, "ComponentName" AS name
        `;
      } else {
        [newComp] = await sql`
          INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "ComponentName", "UpdateDate")
          VALUES (${targetDaishaType}, ${targetSection}, ${name}, NOW())
          RETURNING "Id" AS id, "ComponentName" AS name
        `;
      }

      recordAuditLog({
        action: 'CATALOG_ADD_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newComp.id,
        details: `Komponen: ${name}, Daisha: ${targetDaishaType}`,
      });

      invalidateMaintenanceCache();

      return NextResponse.json({
        success: true,
        message: `Komponen "${name}" berhasil ditambahkan ke ${targetDaishaType}.`,
        data: { id: newComp.id, name, symptoms: [] },
      });
    }

    // 3. Tambah Detail Gejala Kerusakan ke Komponen
    if (action === 'ADD_SYMPTOM') {
      const daishaName = sanitizeText(body.daishaName, 100);
      const componentName = sanitizeText(body.componentName, 100);
      const description = sanitizeText(body.description, 255);

      if (!description) {
        return NextResponse.json({ error: 'Deskripsi gejala kerusakan wajib diisi.' }, { status: 400 });
      }

      let targetType = daishaName;
      let targetComp = componentName;
      let targetSeksi = sanitizeText(body.seksi, 50) || 'Building';

      if (targetType && targetComp) {
        const [cRow] = await sql`
          SELECT "SectionName" FROM "TWMSDamageCatalog" 
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetType}))
            AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${targetComp}))
          LIMIT 1
        `;
        if (cRow && cRow.SectionName) targetSeksi = cRow.SectionName;
      } else {
        const compId = body.componentId ? Number(body.componentId) : null;
        if (compId) {
          const [cRow] = await sql`SELECT "DaishaType", "ComponentName", "SectionName" FROM "TWMSDamageCatalog" WHERE "Id" = ${compId} LIMIT 1`;
          if (cRow) {
            targetType = cRow.DaishaType;
            targetComp = cRow.ComponentName;
            targetSeksi = cRow.SectionName || 'Building';
          }
        }
      }

      if (!targetType || !targetComp) {
        return NextResponse.json({ error: 'Komponen tidak ditemukan di katalog.' }, { status: 404 });
      }

      const [exists] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetType}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${targetComp}))
          AND LOWER(TRIM("SymptomDesc")) = LOWER(TRIM(${description}))
        LIMIT 1
      `;
      if (exists) {
        return NextResponse.json({ error: 'Gejala kerusakan ini sudah ada pada komponen tersebut.' }, { status: 400 });
      }

      // Jika ada baris komponen yang SymptomDesc-nya NULL, kita isi baris itu
      const [placeholder] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetType}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${targetComp}))
          AND "SymptomDesc" IS NULL
        LIMIT 1
      `;

      let newSym;
      if (placeholder) {
        [newSym] = await sql`
          UPDATE "TWMSDamageCatalog"
          SET "SymptomDesc" = ${description}, "UpdateDate" = NOW()
          WHERE "Id" = ${placeholder.Id}
          RETURNING "Id" AS id, "SymptomDesc" AS description
        `;
      } else {
        [newSym] = await sql`
          INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "ComponentName", "SymptomDesc", "UpdateDate")
          VALUES (${targetType}, ${targetSeksi}, ${targetComp}, ${description}, NOW())
          RETURNING "Id" AS id, "SymptomDesc" AS description
        `;
      }

      recordAuditLog({
        action: 'CATALOG_ADD_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newSym.id,
        details: `Gejala: ${description}, Komponen: ${targetComp}`,
      });

      invalidateMaintenanceCache();

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil ditambahkan.`,
        data: { id: newSym.id, description },
      });
    }

    // 4. Tambah Varian Baru
    if (action === 'ADD_VARIANT') {
      const daishaName = sanitizeText(body.daishaName || body.name_daisha, 100);
      const seksi = sanitizeText(body.seksi, 50) || 'Building';
      const ukuran = sanitizeText(body.ukuran, 50) || sanitizeText(body.susunan, 50) || sanitizeText(body.tipe, 50) || sanitizeText(body.name, 50) || 'STANDARD';
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Unit', 0, 10000).value;

      if (!daishaName) {
        return NextResponse.json({ error: 'Nama Daisha wajib ditentukan.' }, { status: 400 });
      }

      const cleanPrefix = (codePrefix || '').trim().toUpperCase();

      if (totalUnits > 0) {
        // Cek apakah ada unit unassigned (SizeSpec 'NONE' / NULL) yang prefix-nya cocok dengan varian ini
        let unassignedUnits: Array<{ Id: number; UnitCode: string }> = [];
        if (cleanPrefix) {
          unassignedUnits = await sql`
            SELECT "Id", "UnitCode" 
            FROM "TWMSDaishaCatalog"
            WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
              AND "IsActive" = TRUE
              AND ("SizeSpec" IS NULL OR "SizeSpec" = 'NONE')
              AND "UnitCode" LIKE ${cleanPrefix + '%'}
            ORDER BY "Id" ASC
            LIMIT ${totalUnits}
          `;
        }

        if (unassignedUnits.length > 0) {
          const idsToUpdate = unassignedUnits.map((u) => u.Id);
          await sql`
            UPDATE "TWMSDaishaCatalog"
            SET "SizeSpec" = ${ukuran},
                "SectionName" = COALESCE(${seksi}, "SectionName"),
                "UpdateDate" = NOW()
            WHERE "Id" = ANY(${idsToUpdate})
          `;

          const remainingNeeded = totalUnits - unassignedUnits.length;
          if (remainingNeeded > 0) {
            await insertNewDaishaUnits(daishaName, seksi, cleanPrefix || null, remainingNeeded, ukuran);
          }
        } else {
          await insertNewDaishaUnits(daishaName, seksi, cleanPrefix || null, totalUnits, ukuran);
        }

        // Deaktivasi unit non-varian lama (SizeSpec NONE) agar tidak menjadi unit orphan/hantu yang tercampur
        await sql`
          UPDATE "TWMSDaishaCatalog"
          SET "IsActive" = FALSE, "UpdateDate" = NOW()
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND ("SizeSpec" IS NULL OR "SizeSpec" = 'NONE')
        `;
      }

      await syncDaishaMasterFromCatalog();
      invalidateMaintenanceCache();

      return NextResponse.json({
        success: true,
        message: `Varian "${ukuran}" berhasil ditambahkan ke ${daishaName} (${totalUnits} unit).`,
      });
    }

    // 5. Update Daisha / Varian / Komponen / Gejala
    if (action === 'EDIT_DAISHA' || action === 'UPDATE_DAISHA') {
      let oldName = sanitizeText(body.oldName, 100);
      const newName = sanitizeText(body.newName || body.name, 100);
      const seksi = sanitizeText(body.seksi, 50);
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = body.totalUnits !== undefined && body.totalUnits !== null ? Number(body.totalUnits) : undefined;

      if (!newName) {
        return NextResponse.json({ error: 'Nama Daisha wajib diisi.' }, { status: 400 });
      }

      // Jika oldName belum terdefinisi atau sama dengan newName tetapi ada body.id, cari nama lama dari database
      if ((!oldName || oldName === newName) && body.id) {
        const [dRow] = await sql`SELECT "DaishaType" FROM "TWMSDamageCatalog" WHERE "Id" = ${Number(body.id)} LIMIT 1`;
        if (dRow && dRow.DaishaType) {
          oldName = dRow.DaishaType;
        }
      }
      const actualOldName = oldName || newName;

      // Update di TWMSDamageCatalog
      await sql`
        UPDATE "TWMSDamageCatalog"
        SET 
          "DaishaType" = ${newName},
          "SectionName" = COALESCE(${seksi}, "SectionName"),
          "UpdateDate" = NOW()
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${actualOldName}))
      `;

      // Update di TWMSDaishaCatalog
      await sql`
        UPDATE "TWMSDaishaCatalog"
        SET 
          "DaishaType" = ${newName},
          "SectionName" = COALESCE(${seksi}, "SectionName"),
          "UpdateDate" = NOW()
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${actualOldName}))
      `;

      const oldCodePrefix = sanitizeText(body.oldCodePrefix, 20)?.toUpperCase().trim() || '';
      const cleanPrefix = codePrefix ? sanitizeText(codePrefix, 20)?.toUpperCase().trim() : '';

      // Update Prefix Kode Unit HANYA jika prefix benar-benar diubah oleh pengguna
      if (cleanPrefix && oldCodePrefix && cleanPrefix !== oldCodePrefix) {
        try {
          await sql`
            UPDATE "TWMSDaishaCatalog"
            SET "UnitCode" = ${cleanPrefix} || SUBSTRING("UnitCode" FROM ${oldCodePrefix.length + 1}),
                "UpdateDate" = NOW()
            WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${newName}))
              AND "IsActive" = TRUE
              AND "UnitCode" LIKE ${oldCodePrefix + '%'}
              AND "UnitCode" NOT IN (
                SELECT "UnitCode" FROM "TWMSRepairTicket"
                UNION
                SELECT "UnitCode" FROM "TWMSMaintenanceLog"
              )
              AND (${cleanPrefix} || SUBSTRING("UnitCode" FROM ${oldCodePrefix.length + 1})) NOT IN (
                SELECT "UnitCode" FROM "TWMSDaishaCatalog"
              )
          `;
        } catch (prefixErr) {
          console.warn('Prefix rename warning:', prefixErr);
        }
      }

      // Periksa apakah Daisha ini memiliki varian
      const [variantCheck] = await sql`
        SELECT COUNT(*)::int as count 
        FROM "TWMSDaishaCatalog" 
        WHERE "IsActive" = TRUE 
          AND LOWER(TRIM("DaishaType")) = LOWER(TRIM(${newName}))
          AND "SizeSpec" IS NOT NULL AND "SizeSpec" != 'NONE'
      `;
      const hasVariants = (variantCheck?.count || 0) > 0;

      // Sinkronkan Jumlah Populasi Unit HANYA untuk Daisha yang tidak menggunakan sistem varian
      if (!hasVariants && totalUnits !== undefined && !isNaN(totalUnits) && totalUnits >= 0) {
        const [activeCountRow] = await sql`
          SELECT count(*)::int as count 
          FROM "TWMSDaishaCatalog" 
          WHERE "IsActive" = TRUE AND LOWER(TRIM("DaishaType")) = LOWER(TRIM(${newName}))
        `;
        const currentCount = activeCountRow?.count || 0;

        if (totalUnits > currentCount) {
          const needed = totalUnits - currentCount;
          await insertNewDaishaUnits(
            newName, 
            seksi || 'Building', 
            cleanPrefix || oldCodePrefix || null, 
            needed, 
            'NONE'
          );
        } else if (totalUnits < currentCount) {
          const excess = currentCount - totalUnits;
          await sql`
            WITH excess AS (
              SELECT "Id" 
              FROM "TWMSDaishaCatalog" 
              WHERE "IsActive" = TRUE AND LOWER(TRIM("DaishaType")) = LOWER(TRIM(${newName}))
              ORDER BY "Id" DESC
              LIMIT ${excess}
            )
            UPDATE "TWMSDaishaCatalog"
            SET "IsActive" = FALSE, "UpdateDate" = NOW()
            WHERE "Id" IN (SELECT "Id" FROM excess)
          `;
        }
      }

      await syncDaishaMasterFromCatalog();
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Jenis Daisha "${newName}" berhasil diperbarui.` });
    }

    if (action === 'EDIT_VARIANT' || action === 'UPDATE_VARIANT') {
      const daishaName = sanitizeText(body.daishaName, 100);
      const oldUkuran = sanitizeText(body.oldUkuran || body.ukuran || body.name, 50);
      const newUkuran = sanitizeText(body.ukuran || body.newName || body.name, 50) || 'STANDARD';
      const seksi = sanitizeText(body.seksi, 50);
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = body.totalUnits !== undefined && body.totalUnits !== null ? Number(body.totalUnits) : undefined;

      if (!daishaName) {
        return NextResponse.json({ error: 'Nama Daisha wajib ditentukan untuk varian.' }, { status: 400 });
      }

      // Update nama varian (SizeSpec) di TWMSDaishaCatalog
      if (oldUkuran && oldUkuran !== 'NONE' && newUkuran !== oldUkuran) {
        await sql`
          UPDATE "TWMSDaishaCatalog"
          SET 
            "SizeSpec" = ${newUkuran},
            "SectionName" = COALESCE(${seksi}, "SectionName"),
            "UpdateDate" = NOW()
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("SizeSpec")) = LOWER(TRIM(${oldUkuran}))
        `;
      }

      const oldCodePrefix = sanitizeText(body.oldCodePrefix, 20)?.toUpperCase().trim() || '';
      const cleanPrefix = codePrefix ? sanitizeText(codePrefix, 20)?.toUpperCase().trim() : '';

      // Update prefix kode untuk varian ini jika benar-benar diubah
      if (cleanPrefix && oldCodePrefix && cleanPrefix !== oldCodePrefix) {
        try {
          await sql`
            UPDATE "TWMSDaishaCatalog"
            SET "UnitCode" = ${cleanPrefix} || SUBSTRING("UnitCode" FROM ${oldCodePrefix.length + 1}),
                "UpdateDate" = NOW()
            WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
              AND LOWER(TRIM("SizeSpec")) = LOWER(TRIM(${newUkuran}))
              AND "IsActive" = TRUE 
              AND "UnitCode" LIKE ${oldCodePrefix + '%'}
              AND "UnitCode" NOT IN (
                SELECT "UnitCode" FROM "TWMSRepairTicket"
                UNION
                SELECT "UnitCode" FROM "TWMSMaintenanceLog"
              )
              AND (${cleanPrefix} || SUBSTRING("UnitCode" FROM ${oldCodePrefix.length + 1})) NOT IN (
                SELECT "UnitCode" FROM "TWMSDaishaCatalog"
              )
          `;
        } catch (vPrefErr) {
          console.warn('Variant prefix update warning:', vPrefErr);
        }
      }

      // Sinkronkan populasi unit varian jika diubah
      if (totalUnits !== undefined && !isNaN(totalUnits) && totalUnits >= 0) {
        const [variantCountRow] = await sql`
          SELECT count(*)::int as count 
          FROM "TWMSDaishaCatalog" 
          WHERE "IsActive" = TRUE 
            AND LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("SizeSpec")) = LOWER(TRIM(${newUkuran}))
        `;
        const vCount = variantCountRow?.count || 0;
        if (totalUnits > vCount) {
          await insertNewDaishaUnits(
            daishaName, 
            seksi || 'Building', 
            cleanPrefix || oldCodePrefix || null, 
            totalUnits - vCount, 
            newUkuran
          );
        } else if (totalUnits < vCount) {
          const excess = vCount - totalUnits;
          await sql`
            WITH excess AS (
              SELECT "Id" 
              FROM "TWMSDaishaCatalog" 
              WHERE "IsActive" = TRUE 
                AND LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
                AND LOWER(TRIM("SizeSpec")) = LOWER(TRIM(${newUkuran}))
              ORDER BY "Id" DESC
              LIMIT ${excess}
            )
            UPDATE "TWMSDaishaCatalog"
            SET "IsActive" = FALSE, "UpdateDate" = NOW()
            WHERE "Id" IN (SELECT "Id" FROM excess)
          `;
        }
      }

      await syncDaishaMasterFromCatalog();
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Varian daisha berhasil diperbarui.` });
    }

    if (action === 'EDIT_COMPONENT' || action === 'UPDATE_COMPONENT') {
      let daishaName = sanitizeText(body.daishaName, 100);
      let oldName = sanitizeText(body.oldName, 100);
      const newName = sanitizeText(body.newName || body.name, 100);

      if (!newName) {
        return NextResponse.json({ error: 'Nama komponen wajib diisi.' }, { status: 400 });
      }

      if ((!daishaName || !oldName) && body.id) {
        const [row] = await sql`SELECT "DaishaType", "ComponentName" FROM "TWMSDamageCatalog" WHERE "Id" = ${Number(body.id)} LIMIT 1`;
        if (row) {
          if (!daishaName) daishaName = row.DaishaType;
          if (!oldName) oldName = row.ComponentName;
        }
      }
      const actualOldName = oldName || newName;

      if (daishaName) {
        await sql`
          UPDATE "TWMSDamageCatalog"
          SET "ComponentName" = ${newName}, "UpdateDate" = NOW()
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${actualOldName}))
        `;
      } else {
        await sql`
          UPDATE "TWMSDamageCatalog"
          SET "ComponentName" = ${newName}, "UpdateDate" = NOW()
          WHERE LOWER(TRIM("ComponentName")) = LOWER(TRIM(${actualOldName}))
        `;
      }

      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Komponen "${newName}" berhasil diperbarui.` });
    }

    if (action === 'EDIT_SYMPTOM' || action === 'UPDATE_SYMPTOM') {
      let daishaName = sanitizeText(body.daishaName, 100);
      let componentName = sanitizeText(body.componentName, 100);
      let oldDesc = sanitizeText(body.oldDescription || body.oldDesc, 255);
      const newDesc = sanitizeText(body.newDescription || body.newDesc || body.name || body.description, 255);

      if (!newDesc) {
        return NextResponse.json({ error: 'Deskripsi gejala tidak boleh kosong.' }, { status: 400 });
      }

      if (body.id) {
        const [row] = await sql`SELECT "DaishaType", "ComponentName", "SymptomDesc" FROM "TWMSDamageCatalog" WHERE "Id" = ${Number(body.id)} LIMIT 1`;
        if (row) {
          daishaName = daishaName || row.DaishaType;
          componentName = componentName || row.ComponentName;
          oldDesc = oldDesc || row.SymptomDesc;
        }
      }

      if (body.id) {
        await sql`
          UPDATE "TWMSDamageCatalog"
          SET "SymptomDesc" = ${newDesc}, "UpdateDate" = NOW()
          WHERE "Id" = ${Number(body.id)}
        `;
      } else if (daishaName && componentName && oldDesc) {
        await sql`
          UPDATE "TWMSDamageCatalog"
          SET "SymptomDesc" = ${newDesc}, "UpdateDate" = NOW()
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
            AND LOWER(TRIM("SymptomDesc")) = LOWER(TRIM(${oldDesc}))
        `;
      }

      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Gejala kerusakan berhasil diperbarui.` });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memproses katalog.';
    console.error('Error in POST /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/catalog - Mengupdate Daisha / Komponen / Gejala
 */
export async function PUT(request: Request) {
  return POST(request);
}

/**
 * DELETE /api/catalog - Hapus data dari TWMSDamageCatalog (Khusus role ADMIN)
 */
export async function DELETE(request: Request) {
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  const rateLimit = checkRateLimit(`catalog_delete:${auth.ip}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan penghapusan.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const { searchParams } = new URL(request.url);
    let type = searchParams.get('type') || '';
    let action = searchParams.get('action') || '';
    let idParam = searchParams.get('id');
    let daishaName = sanitizeText(searchParams.get('daisha') || searchParams.get('daishaName') || searchParams.get('name') || '', 100);
    let componentName = sanitizeText(searchParams.get('component') || searchParams.get('componentName') || '', 100);
    let symptomDesc = sanitizeText(searchParams.get('symptom') || searchParams.get('symptomDesc') || searchParams.get('description') || '', 255);
    let ukuran = sanitizeText(searchParams.get('ukuran') || '', 20);

    try {
      const body = await request.json();
      if (body.type) type = body.type;
      if (body.action) action = body.action;
      if (body.id) idParam = String(body.id);
      if (body.daishaName) daishaName = sanitizeText(body.daishaName, 100);
      if (body.componentName) componentName = sanitizeText(body.componentName, 100);
      if (body.symptomDesc) symptomDesc = sanitizeText(body.symptomDesc, 255);
      if (body.ukuran) ukuran = sanitizeText(body.ukuran, 20);
      if (body.name && !daishaName) daishaName = sanitizeText(body.name, 100);
    } catch {}

    const isDaisha = type === 'daisha' || action === 'DELETE_DAISHA';
    const isComponent = type === 'component' || action === 'DELETE_COMPONENT';
    const isSymptom = type === 'symptom' || action === 'DELETE_SYMPTOM';
    const isVariant = type === 'variant' || action === 'DELETE_VARIANT';

    // 1. HAPUS DAISHA
    if (isDaisha) {
      if (!daishaName && idParam) {
        const [row] = await sql`SELECT "DaishaType" FROM "TWMSDamageCatalog" WHERE "Id" = ${Number(idParam)} LIMIT 1`;
        if (row) daishaName = row.DaishaType;
      }

      if (daishaName) {
        // Ambil semua DamageCatalog Id yang terkait untuk unlink FK
        const damageRows = await sql`
          SELECT "Id" FROM "TWMSDamageCatalog" 
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
        `;
        const damageIds = damageRows.map((r) => r.Id);
        if (damageIds.length > 0) {
          await sql`
            UPDATE "TWMSRepairTicketDetail"
            SET "DamageCatalogId" = NULL
            WHERE "DamageCatalogId" = ANY(${damageIds})
          `;
        }

        await sql`
          DELETE FROM "TWMSDamageCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
        `;

        // Soft-delete seluruh unit armada jenis ini
        await sql`
          UPDATE "TWMSDaishaCatalog"
          SET "IsActive" = FALSE, "UpdateDate" = NOW()
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
        `;

        // Hapus permanen unit yang tidak memiliki riwayat tiket/log
        await sql`
          DELETE FROM "TWMSDaishaCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND "UnitCode" NOT IN (
              SELECT "UnitCode" FROM "TWMSRepairTicket"
              UNION
              SELECT "UnitCode" FROM "TWMSMaintenanceLog"
            )
        `;

        await syncDaishaMasterFromCatalog();
        invalidateMaintenanceCache();
        return NextResponse.json({ success: true, message: `Jenis Daisha "${daishaName}" beserta seluruh komponennya berhasil dihapus.` });
      }
    }

    // 2. HAPUS KOMPONEN
    if (isComponent) {
      if ((!daishaName || !componentName) && idParam) {
        const [row] = await sql`SELECT "DaishaType", "ComponentName" FROM "TWMSDamageCatalog" WHERE "Id" = ${Number(idParam)} LIMIT 1`;
        if (row) {
          daishaName = row.DaishaType;
          componentName = row.ComponentName;
        }
      }

      if (daishaName && componentName) {
        const compRows = await sql`
          SELECT "Id" FROM "TWMSDamageCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
        `;
        const compIds = compRows.map((r) => r.Id);
        if (compIds.length > 0) {
          await sql`
            UPDATE "TWMSRepairTicketDetail"
            SET "DamageCatalogId" = NULL
            WHERE "DamageCatalogId" = ANY(${compIds})
          `;
        }

        await sql`
          DELETE FROM "TWMSDamageCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
        `;

        // Cek apakah masih ada baris lain untuk DaishaType ini di TWMSDamageCatalog
        const [remaining] = await sql`
          SELECT "Id" FROM "TWMSDamageCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
          LIMIT 1
        `;
        // Jika tidak ada baris sama sekali, pertahankan nama DaishaType dengan membuat placeholder ComponentName NULL
        if (!remaining) {
          await sql`
            INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "UpdateDate")
            VALUES (${daishaName}, 'Building', NOW())
          `;
        }

        invalidateMaintenanceCache();
        return NextResponse.json({ success: true, message: `Komponen "${componentName}" berhasil dihapus dari ${daishaName}.` });
      }
    }

    // 3. HAPUS GEJALA
    if (isSymptom) {
      let targetIds: number[] = [];

      if (daishaName && componentName && symptomDesc) {
        const rows = await sql`
          SELECT "Id", "DaishaType", "ComponentName" FROM "TWMSDamageCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
            AND LOWER(TRIM("SymptomDesc")) = LOWER(TRIM(${symptomDesc}))
        `;
        targetIds = rows.map((r) => r.Id);
      } else if (idParam) {
        const [sRow] = await sql`SELECT "Id", "DaishaType", "ComponentName" FROM "TWMSDamageCatalog" WHERE "Id" = ${Number(idParam)} LIMIT 1`;
        if (sRow) {
          daishaName = sRow.DaishaType;
          componentName = sRow.ComponentName;
          targetIds = [sRow.Id];
        }
      }

      if (targetIds.length > 0) {
        await sql`
          UPDATE "TWMSRepairTicketDetail"
          SET "DamageCatalogId" = NULL
          WHERE "DamageCatalogId" = ANY(${targetIds})
        `;

        await sql`
          DELETE FROM "TWMSDamageCatalog"
          WHERE "Id" = ANY(${targetIds})
        `;
      }

      if (daishaName && componentName) {
        // Cek apakah masih ada baris komponen ini
        const [compRem] = await sql`
          SELECT "Id" FROM "TWMSDamageCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
          LIMIT 1
        `;
        // Jika baris komponen habis karena semua gejala terhapus, sisakan baris komponen tanpa gejala
        if (!compRem) {
          await sql`
            INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "ComponentName", "UpdateDate")
            VALUES (${daishaName}, 'Building', ${componentName}, NOW())
          `;
        }
      }

      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: 'Gejala kerusakan berhasil dihapus.' });
    }

    // 4. HAPUS VARIAN
    if (isVariant) {
      if (daishaName && ukuran && ukuran !== 'NONE') {
        await sql`
          UPDATE "TWMSDaishaCatalog"
          SET "IsActive" = FALSE, "UpdateDate" = NOW()
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("SizeSpec")) = LOWER(TRIM(${ukuran}))
        `;

        await sql`
          DELETE FROM "TWMSDaishaCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND LOWER(TRIM("SizeSpec")) = LOWER(TRIM(${ukuran}))
            AND "UnitCode" NOT IN (
              SELECT "UnitCode" FROM "TWMSRepairTicket"
              UNION
              SELECT "UnitCode" FROM "TWMSMaintenanceLog"
            )
        `;

        // Periksa apakah masih ada varian lain yang aktif untuk Daisha ini
        const [remainingVariants] = await sql`
          SELECT COUNT(*)::int as count
          FROM "TWMSDaishaCatalog"
          WHERE "IsActive" = TRUE 
            AND LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND "SizeSpec" IS NOT NULL AND "SizeSpec" != 'NONE'
        `;
        if ((remainingVariants?.count || 0) === 0) {
          // Tidak ada varian lain, nonaktifkan sisa unit non-varian orphan agar tidak muncul unit hantu
          await sql`
            UPDATE "TWMSDaishaCatalog"
            SET "IsActive" = FALSE, "UpdateDate" = NOW()
            WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
              AND ("SizeSpec" IS NULL OR "SizeSpec" = 'NONE')
          `;
        }
      } else if (daishaName) {
        await sql`
          UPDATE "TWMSDaishaCatalog"
          SET "IsActive" = FALSE, "UpdateDate" = NOW()
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
        `;

        await sql`
          DELETE FROM "TWMSDaishaCatalog"
          WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
            AND "UnitCode" NOT IN (
              SELECT "UnitCode" FROM "TWMSRepairTicket"
              UNION
              SELECT "UnitCode" FROM "TWMSMaintenanceLog"
            )
        `;
      }

      await syncDaishaMasterFromCatalog();
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: 'Varian daisha berhasil dihapus.' });
    }

    // Fallback: hapus by raw id
    if (idParam) {
      const id = validatePositiveInt(idParam, 'ID', 1).value;
      await sql`
        UPDATE "TWMSRepairTicketDetail"
        SET "DamageCatalogId" = NULL
        WHERE "DamageCatalogId" = ${id}
      `;
      await sql`DELETE FROM "TWMSDamageCatalog" WHERE "Id" = ${id}`;
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: 'Item katalog berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Parameter penghapusan tidak lengkap.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data dari katalog.';
    console.error('Error in DELETE /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
