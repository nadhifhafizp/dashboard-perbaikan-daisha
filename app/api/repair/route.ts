import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';

const POWER_AUTOMATE_GET_URL = process.env.POWER_AUTOMATE_GET_URL || "";
const POWER_AUTOMATE_POST_URL = process.env.POWER_AUTOMATE_POST_URL || "";

// Helper untuk membersihkan dan sanitasi input teks serta mencegah injection
function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Hapus karakter kontrol ASCII berbahaya
    .replace(/[<>]/g, '')            // Hapus karakter pembuka tag HTML
    .slice(0, maxLength);
}

// 1. FUNGSI GET (Mengambil data dari Power Automate/Excel Online)
export async function GET() {
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

  if (!POWER_AUTOMATE_GET_URL) {
    return NextResponse.json(
      { error: "Konfigurasi server belum lengkap (POWER_AUTOMATE_GET_URL tidak ditemukan)" },
      { status: 500 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(POWER_AUTOMATE_GET_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 }, // Hindari caching data perbaikan yang kadaluwarsa
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Power Automate GET failed with status: ${response.status}`);
      return NextResponse.json(
        { error: `Gagal mengambil data dari server eksternal (Status: ${response.status})` },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API GET Error:", error);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? "Koneksi ke server timeout (15 detik)" : "Gagal memuat data server" },
      { status: 500 }
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

    if (!action || !['CREATE', 'UPDATE', 'DELETE'].includes(action)) {
      return NextResponse.json(
        { error: "Aksi tidak valid. Hanya 'CREATE', 'UPDATE', atau 'DELETE' yang diizinkan." },
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
    // 2.3 DELETE (KHUSUS ROLE ADMIN)
    else if (action === 'DELETE') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: "Akses ditolak. Hanya akun ADMIN yang berhak menghapus tiket perbaikan." },
          { status: 403 }
        );
      }

      const idTiket = sanitizeString(body.idTiket, 50);
      if (!idTiket) {
        return NextResponse.json(
          { error: "ID Tiket wajib diisi untuk menghapus tiket." },
          { status: 400 }
        );
      }

      payload = {
        action: 'DELETE',
        idTiket,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

    return NextResponse.json({
      success: true,
      message: `Aksi ${action} berhasil diproses`,
    });
  } catch (error: unknown) {
    console.error("API POST Error:", error);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? "Koneksi ke server timeout (15 detik)" : "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}