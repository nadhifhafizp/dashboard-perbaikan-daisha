'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export default function Sidebar({
  isMobileMenuOpen,
  onCloseMobileMenu,
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isOperator, openLogoutModal, isLoggingOut } = useAuth();

  const navLinks = [
    ...(!isOperator
      ? [
          {
            href: '/',
            label: 'Dashboard Rekap',
            icon: '📊',
          },
        ]
      : []),
    {
      href: '/input',
      label: 'Input Perbaikan',
      icon: '📝',
    },
    {
      href: '/riwayat',
      label: 'Riwayat & Status',
      icon: '📋',
    },
    ...(!isOperator
      ? [
          {
            href: '/admin',
            label: 'Admin Action Panel',
            icon: '⚙️',
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-red-700 text-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Brand Logo */}
      <div className="hidden md:flex p-6 text-center border-b border-red-600 flex-col items-center justify-center min-h-30 bg-white">
        <Image
          src="/logo-bs.png"
          alt="Logo Bridgestone"
          width={180}
          height={48}
          className="h-12 w-auto object-contain"
          style={{ width: 'auto', height: '3rem' }}
          priority
        />
        <span className="text-[11px] font-black text-gray-900 mt-3 tracking-widest uppercase">
          Daisha Maintenance
        </span>
      </div>

      {/* User Badge Info */}
      {currentUser && (
        <div className="p-4 bg-red-800/80 border-b border-red-600 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white text-red-700 flex items-center justify-center font-black text-sm shrink-0 shadow">
            {currentUser.role === 'ADMIN' ? '👔' : '🛠️'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {currentUser.name || currentUser.username}
            </p>
            <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-red-900/80 text-red-200 mt-0.5">
              {currentUser.role}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Menu Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-white text-red-700 shadow-md font-bold'
                  : 'text-red-100 hover:bg-red-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Tombol Logout di Sidebar */}
        <div className="pt-4 mt-4 border-t border-red-500/50">
          <button
            type="button"
            onClick={openLogoutModal}
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
  );
}
