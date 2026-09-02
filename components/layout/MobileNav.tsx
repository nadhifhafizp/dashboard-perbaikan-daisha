'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <>
      {/* Top Mobile Bar (Hanya di layar kecil) */}
      <div className="md:hidden bg-red-700 text-white flex items-center justify-between p-4 shadow-md z-20">
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded">
          <Image
            src="/logo-bs.png"
            alt="Logo Bridgestone"
            width={120}
            height={24}
            className="h-6 w-auto object-contain"
            style={{ width: 'auto', height: '1.5rem' }}
            priority
          />
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
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              pathname === '/' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
            }`}
          >
            <span className="text-base">📊</span>
            <span className="text-[10px] mt-0.5">Rekap</span>
          </Link>
        )}

        <Link
          href="/input"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            pathname === '/input' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-base">📝</span>
          <span className="text-[10px] mt-0.5">Input</span>
        </Link>

        <Link
          href="/riwayat"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            pathname === '/riwayat' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-base">📋</span>
          <span className="text-[10px] mt-0.5">Riwayat</span>
        </Link>

        {!isOperator && (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              pathname === '/admin' ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
            }`}
          >
            <span className="text-base">⚙️</span>
            <span className="text-[10px] mt-0.5">Admin</span>
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
