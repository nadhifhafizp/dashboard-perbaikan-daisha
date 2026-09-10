'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useServerInfo } from '@/hooks/useServerInfo';

interface MobileNavProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function MobileNav({
  isMobileMenuOpen,
  onToggleMobileMenu,
}: MobileNavProps) {
  const pathname = usePathname();
  const { isOperator, openLogoutModal } = useAuth();
  const { serverInfo, copied, copyUrl } = useServerInfo();

  return (
    <>
      {/* Top Mobile Bar (Hanya di layar kecil) */}
      <div className="md:hidden bg-red-700 text-white flex items-center justify-between p-3.5 shadow-md z-20">
        <div className="flex items-center gap-2">
          <div className="bg-white px-2.5 py-1 rounded flex items-center">
            <Image
              src="/logo-bs.png"
              alt="Logo Bridgestone"
              width={100}
              height={20}
              className="h-5 w-auto object-contain"
              style={{ width: 'auto', height: '1.25rem' }}
              priority
            />
          </div>
          {serverInfo && (
            <button
              type="button"
              onClick={copyUrl}
              className="px-2 py-1 bg-red-800/90 hover:bg-red-900 border border-red-500/60 rounded text-[10.5px] font-mono text-red-100 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              title="Salin alamat IP server"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{serverInfo.ip}:{serverInfo.port}</span>
              <span className="text-[9px]">{copied ? '✓' : '📋'}</span>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg bg-red-800 text-white focus:outline-none font-bold text-sm cursor-pointer"
        >
          {isMobileMenuOpen ? '✕ Tutup' : '☰ Menu'}
        </button>
      </div>

      {/* Bottom Navigation Bar (Khusus Smartphone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg">
        {!isOperator && (
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative ${
              pathname === '/' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
            }`}
          >
            <span className="text-base">📊</span>
            <span className="text-[10px] mt-0.5">Rekap</span>
            {pathname === '/' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />}
          </Link>
        )}

        <Link
          href="/input"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative ${
            pathname === '/input' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-base">📝</span>
          <span className="text-[10px] mt-0.5">Lapor</span>
          {pathname === '/input' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />}
        </Link>

        <Link
          href="/riwayat"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative ${
            pathname === '/riwayat' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-base">📋</span>
          <span className="text-[10px] mt-0.5">Status</span>
          {pathname === '/riwayat' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />}
        </Link>

        {!isOperator && (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative ${
              pathname === '/admin' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
            }`}
          >
            <span className="text-base">⚙️</span>
            <span className="text-[10px] mt-0.5">Bengkel</span>
            {pathname === '/admin' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />}
          </Link>
        )}

        <button
          type="button"
          onClick={openLogoutModal}
          className="flex flex-col items-center justify-center py-1 px-2 text-slate-500 hover:text-red-600 rounded-xl transition cursor-pointer"
        >
          <span className="text-base">🚪</span>
          <span className="text-[10px] mt-0.5">Keluar</span>
        </button>
      </nav>
    </>
  );
}
