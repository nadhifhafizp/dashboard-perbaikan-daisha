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
  // Default sidebar selalu tertutup (collapsed) saat awal dibuka
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);

  const {
    isLogoutModalOpen,
    isLoggingOut,
    closeLogoutModal,
    executeLogout,
  } = useAuth();

  // Bersihkan preferensi lama di localStorage agar tidak memaksa sidebar terbuka saat reload
  useEffect(() => {
    try {
      localStorage.removeItem('sidebar_desktop_collapsed');
    } catch {
      // Abaikan jika localStorage dibatasi browser
    }
  }, []);

  const handleToggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => !prev);
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
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col transition-colors duration-150">
        <PortalNavbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <footer className="py-4 text-center text-xs text-[var(--text-subtle)] font-normal border-t border-[var(--border)] bg-[var(--card)] transition-colors duration-150">
          © 2026 PT Bridgestone Tire Indonesia • Workshop & Special Project Management
        </footer>
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="Konfirmasi Keluar (Logout)"
          message="Apakah Anda yakin ingin keluar dari akun sistem Workshop Management?"
          confirmText="Keluar dari Akun"
          cancelText="Tetap di Sini"
          isLoading={isLoggingOut}
          loadingText="Keluar dari sesi…"
          onConfirm={executeLogout}
          onCancel={closeLogoutModal}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--background)] text-[var(--foreground)] font-sans overflow-hidden relative transition-colors duration-150">
      {/* Skip to Main Content Link for Keyboard / Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-md focus:outline-hidden"
      >
        Lewati ke konten utama
      </a>

      {/* Mobile Top Navbar */}
      <MobileNav
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Backdrop saat Mobile Drawer terbuka */}
      {isMobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup menu navigasi"
          className="fixed inset-0 bg-slate-900/50 z-25 md:hidden backdrop-blur-xs cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              setIsMobileMenuOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        isDesktopCollapsed={isDesktopCollapsed}
        onToggleDesktopCollapse={handleToggleDesktopCollapse}
      />

      {/* Tombol Hamburger Desktop (Hanya muncul saat Sidebar tersembunyi) */}
      {isDesktopCollapsed && (
        <button
          type="button"
          onClick={handleToggleDesktopCollapse}
          className="hidden md:flex fixed top-3.5 left-3.5 z-40 p-2 bg-[var(--card)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg border border-[var(--border)] transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600"
          title="Buka Sidebar (Ctrl+B)"
          aria-label="Buka Sidebar navigasi"
        >
          <Menu className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`flex-1 overflow-x-hidden overflow-y-auto bg-[var(--background)] pb-20 md:pb-0 transition-all duration-300 ${
          isDesktopCollapsed ? 'md:pl-12' : ''
        }`}
      >
        {children}
      </main>

      {/* Global Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar (Logout)"
        message="Apakah Anda yakin ingin keluar dari akun sistem Daisha Maintenance?"
        confirmText="Keluar dari Akun"
        cancelText="Tetap di Sini"
        isLoading={isLoggingOut}
        loadingText="Keluar dari sesi…"
        onConfirm={executeLogout}
        onCancel={closeLogoutModal}
      />
    </div>
  );
}
