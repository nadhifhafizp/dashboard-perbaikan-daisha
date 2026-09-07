'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import ConfirmModal from '@/components/ConfirmModal';
import { UserAccount, UserRole } from '@/lib/users';

export default function UserManager() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Selected User for edit/password
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    name: '',
    role: 'OPERATOR' as UserRole,
    description: '',
  });

  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    role: 'OPERATOR' as UserRole,
    description: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showFeedback = (type: FeedbackType, title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showFeedback('error', 'Gagal Memuat Akun', 'Tidak dapat mengambil daftar akun dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Handle Create User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.username.trim() || !addForm.password.trim() || !addForm.name.trim()) {
      showFeedback('error', 'Data Belum Lengkap', 'Username, password, dan nama lengkap wajib diisi.');
      return;
    }

    if (addForm.password.length < 6) {
      showFeedback('error', 'Password Terlalu Pendek', 'Password minimal harus 6 karakter.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Akun Berhasil Dibuat', data.message);
        setIsAddModalOpen(false);
        setAddForm({ username: '', password: '', name: '', role: 'OPERATOR', description: '' });
        void fetchUsers();
      } else {
        showFeedback('error', 'Gagal Membuat Akun', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // Handle Edit User Info
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeUser.id,
          ...editForm,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Akun Berhasil Diperbarui', data.message);
        setIsEditModalOpen(false);
        setActiveUser(null);
        void fetchUsers();
      } else {
        showFeedback('error', 'Gagal Memperbarui Akun', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // Handle Change Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showFeedback('error', 'Password Terlalu Pendek', 'Password baru minimal harus 6 karakter.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback('error', 'Konfirmasi Tidak Cocok', 'Password baru dan konfirmasi password tidak sama.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          id: activeUser.id,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Password Berhasil Diganti', `Password untuk akun "${activeUser.username}" berhasil diperbarui.`);
        setIsPasswordModalOpen(false);
        setActiveUser(null);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        showFeedback('error', 'Gagal Mengganti Password', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('success', 'Akun Berhasil Dihapus', data.message);
        setUserToDelete(null);
        void fetchUsers();
      } else {
        showFeedback('error', 'Gagal Menghapus Akun', data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Koneksi Terputus', 'Gagal menghubungi server.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Manajemen User */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span>👥</span> Manajemen Akun Pengguna
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kelola username, nama, peran (Admin / Operator), dan reset password langsung di database SQLite tanpa menyentuh file server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>➕</span>
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Tampilan Desktop: Tabel Pengguna */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    <span className="inline-block animate-spin mr-2">🔄</span> Memuat data akun...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Belum ada data akun pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-[10px] text-gray-400">ID #{u.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                      @{u.username}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {u.role === 'ADMIN' ? '👑 Admin' : '🔧 Operator'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                      {u.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUser(u);
                          setPasswordForm({ newPassword: '', confirmPassword: '' });
                          setIsPasswordModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px] transition cursor-pointer"
                        title="Ganti atau reset password akun ini"
                      >
                        🔑 Ganti Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUser(u);
                          setEditForm({
                            username: u.username,
                            name: u.name,
                            role: u.role,
                            description: u.description || '',
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[11px] transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-[11px] transition cursor-pointer"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tampilan Mobile: Kartu Akun Pengguna Responsif */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400 text-xs">
            <span className="inline-block animate-spin mr-2">🔄</span> Memuat data akun...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400 text-xs">
            Belum ada data akun pengguna.
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-black text-sm text-gray-900">{u.name}</div>
                  <div className="font-mono text-xs text-gray-500 font-bold">@{u.username}</div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wide uppercase ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {u.role === 'ADMIN' ? '👑 Admin' : '🔧 Operator'}
                </span>
              </div>

              {u.description && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  {u.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveUser(u);
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                    setIsPasswordModalOpen(true);
                  }}
                  className="flex-1 py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  🔑 Reset Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUser(u);
                    setEditForm({
                      username: u.username,
                      name: u.name,
                      role: u.role,
                      description: u.description || '',
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  onClick={() => setUserToDelete(u)}
                  className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Tambah Akun Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>➕</span> Tambah Akun Pengguna Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Lengkap / Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Teknisi Maintenance Reguler"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="operator_bengkel"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Peran (Role)</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
                  >
                    <option value="OPERATOR">OPERATOR (Input Saja)</option>
                    <option value="ADMIN">ADMIN (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Password (Min. 6 Karakter)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Deskripsi / Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan penanggung jawab atau lokasi plant..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Akun Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Akun */}
      {isEditModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>✏️</span> Edit Akun: @{activeUser.username}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Lengkap / Jabatan</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Peran (Role)</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
                  >
                    <option value="OPERATOR">OPERATOR (Input Saja)</option>
                    <option value="ADMIN">ADMIN (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ganti Password */}
      {isPasswordModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>🔑</span> Ganti Password: @{activeUser.username}
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Ubah kata sandi untuk akun <strong>{activeUser.name}</strong>. Password akan otomatis dienkripsi dengan salt SHA-512 di database.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Password Baru (Min. 6 Karakter)</label>
                <input
                  type="password"
                  required
                  placeholder="Ketik password baru..."
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password baru..."
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Akun */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Hapus Akun Pengguna?"
        message={`Apakah Anda yakin ingin menghapus akun "${userToDelete?.username}" (${userToDelete?.name})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Akun"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />

      {/* MODAL: Feedback Popup */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ ...feedback, isOpen: false })}
      />
    </div>
  );
}
