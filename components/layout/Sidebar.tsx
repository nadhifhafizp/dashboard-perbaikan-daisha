'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  PenSquare,
  ClipboardList,
  Settings,
  LogOut,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import PwaInstaller from '../common/PwaInstaller';
import { useServerInfo } from '@/hooks/useServerInfo';

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
  const { serverInfo, copied, copyUrl } = useServerInfo();

  const navLinks = [
    ...(!isOperator
      ? [
          {
            href: '/',
            label: 'Analitik & Rekap',
            icon: LayoutDashboard,
          },
        ]
      : []),
    {
      href: '/input',
      label: 'Lapor Kerusakan',
      icon: PenSquare,
    },
    {
      href: '/riwayat',
      label: 'Status Tiket',
      icon: ClipboardList,
    },
    ...(!isOperator
      ? [
          {
            href: '/admin',
            label: 'Panel Bengkel',
            icon: Settings,
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
      <div className="hidden md:flex p-5 text-center border-b border-red-600 flex-col items-center justify-center bg-white">
        <Image
          src="/logo-bs.png"
          alt="Logo Bridgestone"
          width={180}
          height={48}
          className="h-12 w-auto object-contain"
          style={{ width: 'auto', height: '3rem' }}
          priority
        />
        <div className="mt-2.5 flex flex-col items-center w-full">
          <span className="text-[11px] font-black text-gray-900 tracking-widest uppercase">
            Daisha Maintenance
          </span>
          {serverInfo && (
            <button
              type="button"
              onClick={copyUrl}
              className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-full text-[10px] font-bold text-emerald-800 transition cursor-pointer shadow-2xs group"
              title="Klik untuk menyalin URL akses jaringan lokal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono">IP: {serverInfo.ip}:{serverInfo.port}</span>
              <span className="text-[9px] text-emerald-600 group-hover:text-emerald-950 ml-0.5 font-sans">
                {copied ? '✓ Salin' : '📋'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* User Badge Info */}
      {currentUser && (
        <div className="p-4 bg-red-800/80 border-b border-red-600 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white text-red-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {currentUser.role === 'ADMIN' ? (
              <ShieldCheck className="w-5 h-5 text-red-700" />
            ) : (
              <Wrench className="w-5 h-5 text-red-700" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {currentUser.name || currentUser.username}
            </p>
            <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-red-900/80 text-red-200 mt-0.5">
              {currentUser.role}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Menu Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobileMenu}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-red-700 shadow-sm font-bold scale-[1.02]'
                  : 'text-red-100 hover:bg-red-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-700' : 'text-red-200'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Instalasi App Desktop untuk PC Client */}
        <div className="pt-4 mt-4 border-t border-red-600/60">
          <PwaInstaller buttonStyle="sidebar" className="mb-3" />
          
          {/* Tombol Logout di Sidebar */}
          <button
            type="button"
            onClick={openLogoutModal}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-red-800/80 hover:bg-red-900 text-red-100 transition-all disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-300" />
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

