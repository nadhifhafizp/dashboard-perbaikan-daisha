'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Clock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const reason = searchParams.get('reason');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        let target = data.redirectUrl || '/input';
        if (from && from !== '/login') {
          if (data.user?.role === 'OPERATOR' && (from === '/' || from.startsWith('/admin') || from.startsWith('/request') || from.startsWith('/spareparts'))) {
            target = '/input';
          } else if (data.user?.role === 'USER_SEKSI' && (from === '/' || from.startsWith('/admin') || from.startsWith('/input') || from.startsWith('/spareparts'))) {
            target = '/request';
          } else {
            target = from;
          }
        }

        window.location.href = target;
        return;
      } else {
        setErrorMsg(data.error || 'Username atau kata sandi tidak valid.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Gagal terhubung ke server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">

        {/* Card Header */}
        <div className="pt-8 pb-5 px-6 text-center border-b border-slate-100 flex flex-col items-center justify-center bg-slate-50/50">
          <div className="mb-3 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
            <Image
              src="/logo-bs.png"
              alt="Logo Bridgestone"
              width={140}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Workshop Management System</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">PT Bridgestone Tire Indonesia</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {reason === 'idle' && !errorMsg && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-normal flex items-start gap-2.5 text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Sesi Berakhir (Idle Timeout)</p>
                <p className="mt-0.5 leading-relaxed text-[11px]">
                  Tidak ada aktivitas selama 30 menit demi keamanan. Silakan masuk kembali.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-medium text-slate-700 mb-1.5">
                Username / Akun
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username akun"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition font-medium"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition font-medium"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-md cursor-pointer focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-2xs transition disabled:opacity-50 text-xs mt-2 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-400 font-normal">
          © 2026 PT Bridgestone Tire Indonesia • Workshop Management
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-neutral-400 text-xs">Memuat sesi...</div>}>
      <LoginForm />
    </Suspense>
  );
}
