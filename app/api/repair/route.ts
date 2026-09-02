import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';

const POWER_AUTOMATE_GET_URL = process.env.POWER_AUTOMATE_GET_URL || "";
const POWER_AUTOMATE_POST_URL = process.env.POWER_AUTOMATE_POST_URL || "";

// In-Memory Server Cache untuk meniadakan lag Excel Online (18-30s menjadi 1ms)
let serverTicketCache: unknown = null;
let serverCacheTime = 0;
const CACHE_TTL_MS = 60000; // Cache berlaku 60 detik selama tidak ada mutasi data

function clearServerCache() {
  serverTicketCache = null;
  serverCacheTime = 0;
}

// 1. FUNGSI GET (Mengambil data dari Power Automate/Excel Online dengan Cache Cerdas)
export async function GET(request: Request) {
  // Proteksi: Wajib login (Admin atau Operator)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(sessionCookie);

  if (!session.valid || !session.user) {
    return NextResponse.json(
      { error: "Akses ditolak. Sesi login diperlukan untuk melihat data perbaikan." },
      { status: 401 }
    );
  }

  // Cek apakah dipaksa bypass cache (?fresh=true)
  const { searchParams } = new URL(request.url);
  const forceFresh = searchParams.get('fresh') === 'true';

  // Jika ada cache valid dan tidak dipaksa fresh, kirim instan dalam 0.001 detik!
  if (!forceFresh && serverTicketCache && Date.now() - serverCacheTime < CACHE_TTL_MS) {
    return NextResponse.json(serverTicketCache, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'no-store',
      },
    });
  }

  if (!POWER_AUTOMATE_GET_URL) {
    return NextResponse.json(
      { error: "Konfigurasi server belum lengkap (POWER_AUTOMATE_GET_URL tidak ditemukan)" },
      { status: 500 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort(new DOMException('Power Automate request timeout (30s)', 'AbortError'));
      } catch {
        controller.abort();
      }
    }, 30000);

    const response = await fetch(POWER_AUTOMATE_GET_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Power Automate GET failed with status: ${response.status}`);
      // Fallback ke cache sebelumnya jika ada, daripada melempar error 502
      if (serverTicketCache) {
        return NextResponse.json(serverTicketCache, {
          headers: { 'X-Cache': 'STALE_FALLBACK' },
        });
      }
      return NextResponse.json(
        { error: `Gagal mengambil data dari server eksternal (Status: ${response.status})` },
        { status: 502 }
      );
    }

    const data = await response.json();
    // Simpan ke in-memory cache server
    serverTicketCache = data;
    serverCacheTime = Date.now();

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error: unknown) {
    console.error("API GET Error:", error);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? "Koneksi ke server Power Automate timeout (30 detik). Silakan coba segarkan lagi." : "Gagal memuat data server" },
      { status: isTimeout ? 504 : 500 }
    );
  }
}

// 2. FUNGSI POST (Create, Update, Delete tiket dengan RBAC Ketat)
export async function POST(request: Request) {
  // Proteksi Autentikasi Umum
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(sessionCookie);

  if (!session.valid || !session.user) {
    return NextResponse.json(
      { error: "Akses ditolak. Silakan login terlebih dahulu sebelum melakukan aksi." },
      { status: 401 }
    );
  }

  if (!POWER_AUTOMATE_POST_URL) {
    return NextResponse.json(
      { error: "Konfigurasi server belum lengkap (POWER_AUTOMATE_POST_URL tidak ditemukan)" },
      { status: 500 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Format request tidak valid, harus JSON" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action = sanitizeString(body.action).toUpperCase();

    if (!action || !['CREATE', 'UPDATE', 'DELETE', 'EDIT_TICKET'].includes(action)) {
      return NextResponse.json(
        { error: "Aksi tidak valid. Hanya 'CREATE', 'UPDATE', 'DELETE', atau 'EDIT_TICKET' yang diizinkan." },
        { status: 400 }
      );
    }

    let payload: Record<string, string> = {};

    // 2.1 CREATE (Bisa dilakukan oleh Operator maupun Admin)
    if (action === 'CREATE') {
      const idTiket = sanitizeString(body.idTiket, 50);
      const waktuMasuk = sanitizeString(body.waktuMasuk, 30);
      const namaPelapor = sanitizeString(body.namaPelapor, 100);
      const seksi = sanitizeString(body.seksi, 50);
      const namaDaisha = sanitizeString(body.namaDaisha, 100);
      const noDaisha = sanitizeString(body.noDaisha, 50);
      const kategori = sanitizeString(body.kategori, 500);
      const detail = sanitizeString(body.detail, 2000);

      // Validasi kelengkapan data form laporan
      if (!namaPelapor || !seksi || !namaDaisha || !noDaisha || !kategori) {
        return NextResponse.json(
          { error: "Field wajib (Nama Pelapor, Seksi, Nama Daisha, No Daisha, Kategori) tidak boleh kosong." },
          { status: 400 }
        );
      }

      payload = {
        action: 'CREATE',
        idTiket: idTiket || `TCK-${Date.now()}`,
        waktuMasuk: waktuMasuk || new Date().toISOString().slice(0, 16).replace('T', ' '),
        waktuKeluar: '-',
        status: 'Open',
        namaPelapor,
        seksi,
        namaDaisha,
        noDaisha,
        kategori,
        detail: detail || '-'
      };
    } 
    // 2.2 UPDATE (KHUSUS ROLE ADMIN)
    else if (action === 'UPDATE') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: "Akses ditolak. Hanya akun ADMIN yang berhak memperbarui status perbaikan tiket." },
          { status: 403 }
        );
      }

      const idTiket = sanitizeString(body.idTiket, 50);
      const status = sanitizeString(body.status, 20);
      const waktuKeluar = sanitizeString(body.waktuKeluar, 30);
      const catatan = sanitizeString(body.catatan, 500);

      if (!idTiket) {
        return NextResponse.json(
          { error: "ID Tiket wajib diisi untuk melakukan update." },
          { status: 400 }
        );
      }

      // Validasi aturan alur: Tiket yang diproses tidak boleh dikembalikan ke status Open
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (!['Progress', 'Done', 'Scrap'].includes(normalizedStatus)) {
        return NextResponse.json(
          { error: "Status tidak valid. Tiket yang sedang/sudah diproses tidak dapat dikembalikan ke status 'Open'." },
          { status: 400 }
        );
      }

      payload = {
        action: 'UPDATE',
        idTiket,
        status: normalizedStatus,
        waktuKeluar: waktuKeluar || '-',
        catatan: catatan || '-'
      };
    } 
    // 2.3 DELETE / BATALKAN TIKET (Role ADMIN atau OPERATOR pembatalan)
    else if (action === 'DELETE') {
      const idTiket = sanitizeString(body.idTiket, 50);
      if (!idTiket) {
        return NextResponse.json(
          { error: "ID Tiket wajib diisi untuk membatalkan tiket." },
          { status: 400 }
        );
      }

      payload = {
        action: 'DELETE',
        idTiket,
      };
    }
    // 2.4 EDIT_TICKET (Koreksi data tiket Open oleh Pelapor/Operator)
    else if (action === 'EDIT_TICKET') {
      const idTiket = sanitizeString(body.idTiket, 50);
      const waktuMasuk = sanitizeString(body.waktuMasuk, 30);
      const namaPelapor = sanitizeString(body.namaPelapor, 100);
      const seksi = sanitizeString(body.seksi, 50);
      const namaDaisha = sanitizeString(body.namaDaisha, 100);
      const noDaisha = sanitizeString(body.noDaisha, 50);
      const kategori = sanitizeString(body.kategori, 500);
      const detail = sanitizeString(body.detail, 2000);

      if (!idTiket || !noDaisha) {
        return NextResponse.json(
          { error: "ID Tiket dan Nomor Daisha wajib diisi untuk melakukan koreksi." },
          { status: 400 }
        );
      }

      // Step 1: Hapus data lama di Excel
      const deleteController = new AbortController();
      const deleteTimeout = setTimeout(() => deleteController.abort(), 20000);
      await fetch(POWER_AUTOMATE_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", idTiket }),
        signal: deleteController.signal,
      }).catch(err => console.error("Edit Delete Step Error:", err));
      clearTimeout(deleteTimeout);

      // Step 2: Kirim data baru hasil koreksi ke Excel
      payload = {
        action: 'CREATE',
        idTiket,
        waktuMasuk: waktuMasuk || new Date().toISOString().slice(0, 16).replace('T', ' '),
        waktuKeluar: '-',
        status: 'Open',
        namaPelapor: namaPelapor || session.user.name || 'Operator',
        seksi: seksi || '-',
        namaDaisha: namaDaisha || '-',
        noDaisha: noDaisha.toUpperCase(),
        kategori: kategori || 'Umum',
        detail: detail || '-'
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(POWER_AUTOMATE_POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Power Automate POST failed with status: ${response.status}`);
      return NextResponse.json(
        { error: `Gagal memproses data ke server eksternal (Status: ${response.status})` },
        { status: 502 }
      );
    }

    // Hapus cache server seketika agar pembacaan berikutnya langsung mengambil data ter-update
    clearServerCache();

    return NextResponse.json({
      success: true,
      message: `Aksi ${action} berhasil diproses`,
    });
  } catch (error: unknown) {
    console.error("API POST Error:", error);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? "Koneksi ke server timeout (30 detik)" : "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}