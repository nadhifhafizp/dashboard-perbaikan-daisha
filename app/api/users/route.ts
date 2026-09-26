import { NextResponse } from 'next/server';
import {
  getAllUsers,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  UserRole,
} from '@/lib/users';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';

/**
 * GET /api/users - Mengambil daftar seluruh pengguna (Khusus role ADMIN)
 */
export async function GET(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION (Khusus ADMIN)
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (60 req/menit)
  const rateLimit = checkRateLimit(`users_get:${auth.ip}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan data pengguna.' }, { status: 429 });
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

/**
 * POST /api/users - Tambah akun baru ATAU Reset/Ubah Password (Khusus role ADMIN)
 */
export async function POST(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION (Khusus ADMIN)
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD SIZE LIMIT (Maksimal 64KB)
  const sizeCheck = validatePayloadSize(request, 64 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (20 req/menit)
  const rateLimit = checkRateLimit(`users_post:${auth.ip}`, 20, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak operasi pengguna.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const action = sanitizeText(body.action, 50);

    // 1. Reset / Ubah Password
    if (action === 'CHANGE_PASSWORD') {
      const id = validatePositiveInt(body.id, 'ID Akun', 1).value;
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

      if (!body.id || !newPassword) {
        return NextResponse.json({ error: 'ID akun dan password baru wajib diisi.' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password baru minimal harus 6 karakter.' }, { status: 400 });
      }

      await changeUserPassword(id, newPassword);

      recordAuditLog({
        action: 'USER_PASSWORD_RESET',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
      });

      return NextResponse.json({
        success: true,
        message: 'Password berhasil diperbarui.',
      });
    }

    // 2. Buat Akun Baru
    const username = sanitizeText(body.username, 50).toLowerCase();
    const password = typeof body.password === 'string' ? body.password.trim() : '';
    const name = sanitizeText(body.name, 100);
    const roleInput = sanitizeText(body.role, 20);
    const seksi = sanitizeText(body.seksi, 50);
    const description = sanitizeText(body.description, 255);

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, dan nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username minimal harus 3 karakter.' }, { status: 400 });
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username hanya boleh huruf kecil, angka, dan underscore (_).' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal harus 6 karakter.' }, { status: 400 });
    }

    const validRoles: UserRole[] = ['ADMIN', 'OPERATOR', 'USER_SEKSI'];
    const assignedRole: UserRole = validRoles.includes(roleInput as UserRole) ? (roleInput as UserRole) : 'OPERATOR';

    const newUser = await createUser({
      username,
      passwordPlain: password,
      name,
      role: assignedRole,
      seksi: seksi || undefined,
      description: description || undefined,
    });

    recordAuditLog({
      action: 'USER_CREATE',
      ip: auth.ip,
      user: auth.user?.username,
      role: auth.user?.role,
      status: 'SUCCESS',
      targetId: newUser.id,
      details: `Username: ${newUser.username}, Role: ${newUser.role}`,
    });

    return NextResponse.json({
      success: true,
      message: `Akun "${newUser.username}" (${newUser.role}) berhasil dibuat.`,
      user: newUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses data pengguna.';
    console.error('Error in POST /api/users:', error);
    recordAuditLog({
      action: 'USER_POST_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PUT /api/users - Edit informasi pengguna (nama, username, role, deskripsi)
 */
export async function PUT(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION (Khusus ADMIN)
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD SIZE LIMIT (Maksimal 64KB)
  const sizeCheck = validatePayloadSize(request, 64 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (30 req/menit)
  const rateLimit = checkRateLimit(`users_put:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan update.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const id = validatePositiveInt(body.id, 'ID Akun', 1).value;
    const username = body.username ? sanitizeText(body.username, 50).toLowerCase() : undefined;
    const name = body.name ? sanitizeText(body.name, 100) : undefined;
    const roleInput = body.role ? sanitizeText(body.role, 20) : undefined;
    const seksi = body.seksi !== undefined ? sanitizeText(body.seksi, 50) : undefined;
    const description = body.description !== undefined ? sanitizeText(body.description, 255) : undefined;

    if (!body.id) {
      return NextResponse.json({ error: 'ID akun wajib disertakan.' }, { status: 400 });
    }

    if (username && !/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username hanya boleh huruf kecil, angka, dan underscore (_).' }, { status: 400 });
    }

    const validRoles: UserRole[] = ['ADMIN', 'OPERATOR', 'USER_SEKSI'];
    const assignedRole = roleInput && validRoles.includes(roleInput as UserRole) ? (roleInput as UserRole) : undefined;

    const updatedUser = await updateUser(id, {
      username,
      name,
      role: assignedRole,
      seksi,
      description,
    });

    recordAuditLog({
      action: 'USER_UPDATE',
      ip: auth.ip,
      user: auth.user?.username,
      role: auth.user?.role,
      status: 'SUCCESS',
      targetId: id,
      details: `Username: ${updatedUser.username}, Role: ${updatedUser.role}`,
    });

    return NextResponse.json({
      success: true,
      message: `Data akun "${updatedUser.username}" berhasil diperbarui.`,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui data pengguna.';
    console.error('Error in PUT /api/users:', error);
    recordAuditLog({
      action: 'USER_PUT_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/users?id=xxx - Hapus akun pengguna (Khusus role ADMIN)
 */
export async function DELETE(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION (Khusus ADMIN)
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (20 req/menit)
  const rateLimit = checkRateLimit(`users_delete:${auth.ip}`, 20, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan penghapusan.' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ error: 'Parameter ID wajib disertakan.' }, { status: 400 });
    }

    const id = validatePositiveInt(idParam, 'ID', 1).value;
    await deleteUser(id);

    recordAuditLog({
      action: 'USER_DELETE',
      ip: auth.ip,
      user: auth.user?.username,
      role: auth.user?.role,
      status: 'SUCCESS',
      targetId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dihapus.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus pengguna.';
    console.error('Error in DELETE /api/users:', error);
    recordAuditLog({
      action: 'USER_DELETE_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
