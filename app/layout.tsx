'use client';

import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SessionPayload } from '@/lib/auth';
import ConfirmModal from '@/components/ConfirmModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isLoginPage) return;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage]);

  const executeLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const isOperator = currentUser?.role === 'OPERATOR';

  return (
    <html lang="id">
      <body className={isLoginPage ? "bg-gray-900 font-sans min-h-screen" : "flex flex-col md:flex-row h-screen bg-gray-100 font-sans overflow-hidden"}>
        {isLoginPage ? (
          children
        ) : (
          <>
            {/* === MOBILE NAVBAR (Hanya di HP) === */}
            <div className="md:hidden bg-red-700 text-white flex items-center justify-between p-4 shadow-md z-20">
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded">
                <Image src="/logo-bs.png" alt="Logo Bridgestone" width={120} height={24} className="h-6 w-auto object-contain" priority />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg bg-red-800 text-white focus:outline-none font-bold text-sm"
                >
                  {isMobileMenuOpen ? '✕ Tutup' : '☰ Menu'}
                </button>
              </div>
            </div>

            {/* === SIDEBAR (Statis di Desktop, Drawer di HP) === */}
            <aside className={`
              fixed md:static inset-y-0 left-0 z-30 w-64 bg-red-700 text-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              {/* Brand Logo */}
              <div className="hidden md:flex p-6 text-center border-b border-red-600 flex-col items-center justify-center min-h-30 bg-white">
                <Image src="/logo-bs.png" alt="Logo Bridgestone" width={180} height={48} className="h-12 w-auto object-contain" priority />
                <span className="text-[11px] font-black text-gray-900 mt-3 tracking-widest uppercase">Daisha Maintenance</span>
              </div>

              {/* User Badge Info */}
              {currentUser && (
                <div className="p-4 bg-red-800/80 border-b border-red-600 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white text-red-700 flex items-center justify-center font-black text-sm shrink-0 shadow">
                    {currentUser.role === 'ADMIN' ? '👔' : '🛠️'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name || currentUser.username}</p>
                    <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-red-900/80 text-red-200 mt-0.5">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Menu Links */}
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {/* Menu Dashboard Rekapitulasi (Khusus Admin / Supervisor) */}
                {!isOperator && (
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      pathname === '/' 
                        ? 'bg-white text-red-700 shadow-md font-bold' 
                        : 'text-red-100 hover:bg-red-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">📊</span>
                    Dashboard Rekap
                  </Link>
                )}

                {/* Menu Input Form Perbaikan (Bisa diakses Operator & Admin) */}
                <Link
                  href="/input"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    pathname === '/input' 
                      ? 'bg-white text-red-700 shadow-md font-bold' 
                      : 'text-red-100 hover:bg-red-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">📝</span>
                  Input Perbaikan
                </Link>

                {/* Menu Admin Action Panel (Khusus Admin / Supervisor) */}
                {!isOperator && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      pathname === '/admin' 
                        ? 'bg-white text-red-700 shadow-md font-bold' 
                        : 'text-red-100 hover:bg-red-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">⚙️</span>
                    Admin Action Panel
                  </Link>
                )}

                {/* Tombol Logout di Sidebar */}
                <div className="pt-4 mt-4 border-t border-red-500/50">
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-900/60 hover:bg-red-950 text-red-100 transition disabled:opacity-50 cursor-pointer"
                  >
                    <span>🚪</span>
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </nav>

              <div className="p-4 border-t border-red-600 text-xs font-medium text-center text-red-200">
                © 2026 PT Bridgestone
              </div>
            </aside>

            {/* === KONTEN UTAMA === */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
              {children}
            </main>

            {/* Interactive Logout Confirm Modal */}
            <ConfirmModal
              isOpen={isLogoutModalOpen}
              title="Konfirmasi Keluar (Logout)"
              message="Apakah Anda yakin ingin keluar dari akun sistem Daisha Maintenance?"
              confirmText="Ya, Keluar"
              cancelText="Batal"
              isLoading={isLoggingOut}
              loadingText="Keluar dari sesi..."
              onConfirm={executeLogout}
              onCancel={() => !isLoggingOut && setIsLogoutModalOpen(false)}
            />
          </>
        )}
      </body>
    </html>
  );
}