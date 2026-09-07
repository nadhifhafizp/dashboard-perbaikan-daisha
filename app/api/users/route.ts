import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import {
  getAllUsers,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  UserRole,
} from '@/lib/users';

/**
 * Helper untuk verifikasi bahwa pemanggil adalah ADMIN yang sah.
 */
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(token);

  if (!session.valid || !session.user || session.user.role !== 'ADMIN') {
    return { authorized: false, response: NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 }) };
  }

  return { authorized: true, user: session.user };
}

/**
 * GET /api/users - Mengambil daftar seluruh pengguna
 */
export async function GET() {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

/**
 * POST /api/users - Tambah akun baru ATAU Reset/Ubah Password
 */
export async function POST(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action } = body;

    // 1. Reset / Ubah Password
    if (action === 'CHANGE_PASSWORD') {
      const { id, newPassword } = body;
      if (!id || !newPassword) {
        return NextResponse.json(
          { error: 'ID akun dan password baru wajib diisi.' },
          { status: 400 }
        );
      }

      await changeUserPassword(Number(id), String(newPassword));
      return NextResponse.json({
        success: true,
        message: 'Password berhasil diperbarui.',
      });
    }

    // 2. Buat Akun Baru
    const { username, password, name, role, description } = body;
    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, dan nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    const assignedRole: UserRole = role === 'ADMIN' ? 'ADMIN' : 'OPERATOR';

    const newUser = await createUser({
      username,
      passwordPlain: password,
      name,
      role: assignedRole,
      description,
    });

    return NextResponse.json({
      success: true,
      message: `Akun "${newUser.username}" (${newUser.role}) berhasil dibuat.`,
      user: newUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses data pengguna.';
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PUT /api/users - Edit informasi pengguna (nama, username, role, deskripsi)
 */
export async function PUT(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id, username, name, role, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID akun wajib disertakan.' }, { status: 400 });
    }

    const updatedUser = await updateUser(Number(id), {
      username,
      name,
      role: role as UserRole,
      description,
    });

    return NextResponse.json({
      success: true,
      message: `Data akun "${updatedUser.username}" berhasil diperbarui.`,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui data pengguna.';
    console.error('Error in PUT /api/users:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/users?id=xxx - Hapus akun pengguna
 */
export async function DELETE(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ error: 'Parameter ID wajib disertakan.' }, { status: 400 });
    }

    const id = Number(idParam);
    await deleteUser(id);

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dihapus.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus pengguna.';
    console.error('Error in DELETE /api/users:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
