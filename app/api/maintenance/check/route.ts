import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/maintenance/check?nomor=...
 * Endpoint pengecekan real-time status Daisha saat admin mengetik nomor Daisha.
 * Memberikan validasi cerdas (Smart Validation) jika unit baru diperbaiki/dimaintenance dalam 30 hari terakhir.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawNomor = searchParams.get('nomor') || '';
    const nomor = sanitizeText(rawNomor, 50).trim();

    if (!nomor) {
      return NextResponse.json({ exists: false, isRecent: false });
    }

    // Cari di tabel TWMSDaishaCatalog menggunakan index UPPER(TRIM(...))
    let daisha = await sql`
      SELECT 
        "Id" AS id, 
        "UnitCode" AS nomor_daisha, 
        "DaishaType" AS jenis, 
        "SizeSpec" AS ukuran, 
        "SectionName" AS seksi, 
        "DaishaType" AS nama_daisha, 
        "LastPMDate" AS last_maintenance_date
      FROM "TWMSDaishaCatalog"
      WHERE UPPER(TRIM("UnitCode")) = UPPER(TRIM(${nomor}))
      LIMIT 1
    `;

    // Jika tidak ditemukan dengan exact match, coba cari berdasarkan pattern nomor
    if (daisha.length === 0) {
      const numOnly = nomor.replace(/\D/g, '');
      if (numOnly) {
        const padded = String(parseInt(numOnly, 10)).padStart(3, '0');
        daisha = await sql`
          SELECT 
            "Id" AS id, 
            "UnitCode" AS nomor_daisha, 
            "DaishaType" AS jenis, 
            "SizeSpec" AS ukuran, 
            "SectionName" AS seksi, 
            "DaishaType" AS nama_daisha, 
            "LastPMDate" AS last_maintenance_date
          FROM "TWMSDaishaCatalog"
          WHERE "UnitCode" ILIKE ${'%' + padded + '%'} OR "UnitCode" ILIKE ${'%' + nomor + '%'}
          LIMIT 1
        `;
      }
    }

    if (daisha.length === 0) {
      return NextResponse.json({
        exists: false,
        isRecent: false,
        searchedQuery: nomor,
      });
    }

    const unit = daisha[0];
    const lastDate = unit.last_maintenance_date ? new Date(unit.last_maintenance_date) : null;
    let isRecent = false;
    let daysAgo: number | null = null;
    let warningMessage: string | null = null;
    let formattedDate: string | null = null;
    let lastJobType = 'maintenance rutin';

    if (lastDate) {
      const now = new Date();
      const diffMs = Math.abs(now.getTime() - lastDate.getTime());
      daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      formattedDate = lastDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // Ambil log terakhir dari TWMSMaintenanceLog
      const lastLog = await sql`
        SELECT "WorkType" AS jenis_pekerjaan, "CheckDate" AS tanggal_pengerjaan, "InspectorBy" AS admin_id, "Notes" AS catatan
        FROM "TWMSMaintenanceLog"
        WHERE "UnitCode" = ${unit.nomor_daisha} AND "RecordType" = 'PM'
        ORDER BY "CheckDate" DESC
        LIMIT 1
      `;

      if (lastLog.length > 0 && lastLog[0].jenis_pekerjaan === 'REPAIR') {
        lastJobType = 'perbaikan (repair)';
      }

      // Cek apakah dalam rentang 30 hari terakhir
      if (daysAgo <= 30) {
        isRecent = true;
        warningMessage = `Peringatan: Daisha nomor [${unit.nomor_daisha}] ini sudah mengalami ${lastJobType} pada periode [${formattedDate}] (${daysAgo} hari yang lalu). Lanjutkan input?`;
      }
    }

    return NextResponse.json({
      exists: true,
      daisha: {
        id: unit.id,
        nomor_daisha: unit.nomor_daisha,
        jenis: unit.jenis,
        nama_daisha: unit.nama_daisha,
        ukuran: unit.ukuran,
        seksi: unit.seksi,
        last_maintenance_date: unit.last_maintenance_date,
      },
      isRecent,
      daysAgo,
      lastDate: formattedDate,
      lastJobType,
      warningMessage,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('Error checking Daisha status:', error);
    return NextResponse.json(
      { error: 'Gagal mengecek data daisha: ' + errMessage },
      { status: 500 }
    );
  }
}
