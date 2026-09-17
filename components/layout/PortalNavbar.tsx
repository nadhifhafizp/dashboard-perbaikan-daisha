'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useServerInfo } from '@/hooks/useServerInfo';
import { ShieldCheck, LogOut, Check, Copy, Wifi } from 'lucide-react';
import PwaInstaller from '../common/PwaInstaller';

export default function PortalNavbar() {
  const { currentUser, openLogoutModal, isLoggingOut } = useAuth();
  const { serverInfo, copied, copyUrl } = useServerInfo();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Sisi Kiri: Logo Bridgestone & Nama Sistem */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg flex items-center">
              <Image
                src="/logo-bs.png"
                alt="Logo Bridgestone"
                width={130}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-black text-slate-900 tracking-wider uppercase">
              Workshop Management
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              PT Bridgestone Tire Indonesia
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Server IP, User Info & Tombol Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* IP Server Badge */}
          {serverInfo && (
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 transition cursor-pointer shadow-2xs group"
              title="Klik untuk menyalin URL akses LAN"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono text-[10.5px] hidden md:inline">
                IP: {serverInfo.ip}:{serverInfo.port}
              </span>
              <span className="font-mono text-[10.5px] md:hidden">
                {serverInfo.ip}
              </span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-emerald-600 opacity-70 group-hover:opacity-100" />
              )}
            </button>
          )}

          {/* PWA Installer */}
          <div className="hidden lg:block">
            <PwaInstaller buttonStyle="compact" />
          </div>

          {/* User Badge Info */}
          {currentUser && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                  {currentUser.name || currentUser.username}
                </p>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-red-700">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
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
