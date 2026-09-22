'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, LogOut } from 'lucide-react';
import PwaInstaller from '../common/PwaInstaller';

export default function PortalNavbar() {
  const { currentUser, openLogoutModal, isLoggingOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Sisi Kiri: Logo Bridgestone & Nama Sistem */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md flex items-center">
              <Image
                src="/logo-bs.png"
                alt="Logo Bridgestone"
                width={120}
                height={28}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-900 tracking-wide">
              Workshop Management
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              PT Bridgestone Tire Indonesia
            </span>
          </div>
        </div>

        {/* Sisi Kanan: User Info & Tombol Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* PWA Installer */}
          <div className="hidden lg:block">
            <PwaInstaller buttonStyle="compact" />
          </div>

          {/* User Badge Info */}
          {currentUser && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center text-xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-800 leading-tight truncate max-w-[120px]">
                  {currentUser.name || currentUser.username}
                </p>
                <span className="text-[10px] font-semibold text-red-600">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          {/* Tombol Logout */}
          <button
            type="button"
            onClick={openLogoutModal}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-700 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
            title="Keluar dari akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
