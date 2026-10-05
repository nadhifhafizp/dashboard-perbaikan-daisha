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

    // Cari di tabel Daisha (bisa match exact atau match nomor urut misal "45" atau "S-045")
    let daisha = await sql`
      SELECT id, nomor_daisha, jenis, ukuran, last_maintenance_date
      FROM "Daisha"
      WHERE UPPER(nomor_daisha) = ${nomor.toUpperCase()}
      LIMIT 1
    `;

    // Jika tidak ditemukan dengan exact match, coba cari berdasarkan pattern nomor
    if (daisha.length === 0) {
      const numOnly = nomor.replace(/\D/g, '');
      if (numOnly) {
        const padded = String(parseInt(numOnly, 10)).padStart(3, '0');
        daisha = await sql`
          SELECT id, nomor_daisha, jenis, ukuran, last_maintenance_date
          FROM "Daisha"
          WHERE nomor_daisha ILIKE ${'%' + padded + '%'} OR nomor_daisha ILIKE ${'%' + nomor + '%'}
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

      // Ambil log terakhir
      const lastLog = await sql`
        SELECT jenis_pekerjaan, tanggal_pengerjaan, admin_id, catatan
        FROM "MaintenanceLog"
        WHERE daisha_id = ${unit.id}
        ORDER BY tanggal_pengerjaan DESC
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
        ukuran: unit.ukuran,
        last_maintenance_date: unit.last_maintenance_date,
      },
      isRecent,
      daysAgo,
      lastDate: formattedDate,
      lastJobType,
      warningMessage,
    });
  } catch (error: any) {
    console.error('Error checking Daisha status:', error);
    return NextResponse.json(
      { error: 'Gagal mengecek data daisha: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
