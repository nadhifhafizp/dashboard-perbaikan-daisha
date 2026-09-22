'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import ConfirmModal from '@/components/ConfirmModal';
import { UserAccount, UserRole } from '@/lib/users';
import {
  Users,
  ShieldCheck,
  Building2,
  Wrench,
  Key,
  Edit3,
  Trash2,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';

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
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <span>Manajemen Akun Pengguna</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola username, nama, peran (Admin / Operator / Seksi), dan reset password langsung di database PostgreSQL terenkripsi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Tampilan Desktop: Tabel Pengguna */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Peran (Role)</th>
                <th className="py-3.5 px-4">Deskripsi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 inline-block animate-spin mr-2" /> Memuat data akun...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada data akun pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">ID #{u.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      @{u.username}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : u.role === 'USER_SEKSI'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {u.role === 'ADMIN' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin</span>
                          </>
                        ) : u.role === 'USER_SEKSI' ? (
                          <>
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Seksi</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Operator</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                      {u.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUser(u);
                          setPasswordForm({ newPassword: '', confirmPassword: '' });
                          setIsPasswordModalOpen(true);
                        }}
                        className="h-7 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 rounded-md font-medium text-[11px] transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="Ganti atau reset password akun ini"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Ganti Password</span>
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
                        className="h-7 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-medium text-[11px] transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        className="h-7 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md font-medium text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
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
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 inline-block animate-spin mr-2" /> Memuat data akun...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            Belum ada data akun pengguna.
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm text-slate-900">{u.name}</div>
                  <div className="font-mono text-xs text-slate-500 font-medium">@{u.username}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium uppercase ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : u.role === 'USER_SEKSI'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  {u.role === 'ADMIN' ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin</span>
                    </>
                  ) : u.role === 'USER_SEKSI' ? (
                    <>
                      <Building2 className="w-3 h-3" />
                      <span>Seksi</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-3 h-3" />
                      <span>Operator</span>
                    </>
                  )}
                </span>
              </div>

              {u.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {u.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveUser(u);
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                    setIsPasswordModalOpen(true);
                  }}
                  className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Reset Pass</span>
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
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserToDelete(u)}
                  className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium text-xs transition cursor-pointer flex items-center justify-center"
                  aria-label="Hapus Akun"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Tambah Akun Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-600" />
                <span>Tambah Akun Pengguna Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nama Lengkap / Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Teknisi Maintenance Reguler"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="operator_bengkel"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().trim() })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Peran (Role)</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-medium text-slate-800"
                  >
                    <option value="OPERATOR">OPERATOR (Input Daisha)</option>
                    <option value="USER_SEKSI">USER SEKSI (Request)</option>
                    <option value="ADMIN">ADMIN (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Password (Min. 6 Karakter)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Deskripsi / Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan penanggung jawab atau lokasi plant..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none resize-none text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-700" />
                <span>Edit Akun: @{activeUser.username}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nama Lengkap / Jabatan</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().trim() })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Peran (Role)</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-medium text-slate-800"
                  >
                    <option value="OPERATOR">OPERATOR (Input Daisha)</option>
                    <option value="USER_SEKSI">USER SEKSI (Request)</option>
                    <option value="ADMIN">ADMIN (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none resize-none text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Ganti Password: @{activeUser.username}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Ubah kata sandi untuk akun <strong>{activeUser.name}</strong>. Password akan otomatis dienkripsi dengan salt SHA-512 di database.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Password Baru (Min. 6 Karakter)</label>
                <input
                  type="password"
                  required
                  placeholder="Ketik password baru..."
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password baru..."
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-mono text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
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
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${userToDelete?.username}" (${userToDelete?.name}) dengan hak akses ${userToDelete?.role}? Pengguna ini tidak akan dapat login lagi ke sistem.`}
        confirmText="Hapus Akun"
        cancelText="Pertahankan Akun"
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
