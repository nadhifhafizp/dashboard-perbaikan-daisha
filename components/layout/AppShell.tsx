'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import PortalNavbar from '@/components/layout/PortalNavbar';
import ConfirmModal from '@/components/ConfirmModal';
import { Menu } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isPortalPage = pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const {
    isLogoutModalOpen,
    isLoggingOut,
    closeLogoutModal,
    executeLogout,
  } = useAuth();

  // Muat status preferensi sidebar desktop dari localStorage saat inisialisasi
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_desktop_collapsed');
      if (saved === 'true') {
        setIsDesktopCollapsed(true);
      }
    } catch {
      // Abaikan jika localStorage dibatasi browser
    }
  }, []);

  const handleToggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_desktop_collapsed', String(next));
      } catch {
        // Abaikan jika localStorage dibatasi browser
      }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B untuk toggle sidebar di desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleDesktopCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Khusus Portal Utama (/): Tampilan landing page bersih, lebar penuh, TANPA sidebar
  if (isPortalPage) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <PortalNavbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-5 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          © 2026 PT Bridgestone Tire Indonesia • Workshop & Special Project Management
        </footer>
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="Konfirmasi Keluar (Logout)"
          message="Apakah Anda yakin ingin keluar dari akun sistem Workshop Management?"
          confirmText="Ya, Keluar"
          cancelText="Batal"
          isLoading={isLoggingOut}
          loadingText="Keluar dari sesi..."
          onConfirm={executeLogout}
          onCancel={closeLogoutModal}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans overflow-hidden relative">
      {/* Mobile Top Navbar */}
      <MobileNav
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Backdrop saat Mobile Drawer terbuka */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-25 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        isDesktopCollapsed={isDesktopCollapsed}
        onToggleDesktopCollapse={handleToggleDesktopCollapse}
      />

      {/* Tombol Hamburger Desktop Murni Ikon (Hanya muncul saat Sidebar tersembunyi) */}
      {isDesktopCollapsed && (
        <button
          type="button"
          onClick={handleToggleDesktopCollapse}
          className="hidden md:flex fixed top-3.5 left-3.5 z-40 p-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-700 rounded-xl shadow-md border border-slate-200 transition-all hover:scale-105 cursor-pointer"
          title="Buka Sidebar (Ctrl+B)"
          aria-label="Buka Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pb-20 md:pb-0 transition-all duration-300 ${
          isDesktopCollapsed ? 'md:pl-14' : ''
        }`}
      >
        {children}
      </main>

      {/* Global Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar (Logout)"
        message="Apakah Anda yakin ingin keluar dari akun sistem Daisha Maintenance?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        isLoading={isLoggingOut}
        loadingText="Keluar dari sesi..."
        onConfirm={executeLogout}
        onCancel={closeLogoutModal}
      />
    </div>
  );
}
