'use client';

import './globals.css';
import Link from 'next/link';
import { useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <html lang="id">
      <body className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans overflow-hidden">
        
        {/* === MOBILE NAVBAR (Hanya di HP) === */}
        <div className="md:hidden bg-red-700 text-white flex items-center justify-between p-4 shadow-md z-20">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded">
            <img src="/logo-bs.png" alt="Logo Bridgestone" className="h-6 w-auto object-contain" />
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-red-800 text-white focus:outline-none font-bold text-sm"
          >
            {isMobileMenuOpen ? '✕ Tutup' : '☰ Menu'}
          </button>
        </div>

        {/* === SIDEBAR (Statis di Desktop, Drawer di HP) === */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-30 w-64 bg-red-700 text-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          <div className="hidden md:flex p-6 text-center border-b border-red-600 flex-col items-center justify-center min-h-30 bg-white">
            <img src="/logo-bs.png" alt="Logo Bridgestone" className="h-12 w-auto object-contain" />
            <span className="text-[11px] font-bold text-gray-800 mt-3 tracking-widest uppercase">Daisha Management</span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto mt-14 md:mt-0">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              Dashboard
            </Link> 

            <Link href="/input" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              Form Laporan
            </Link>

            <Link href="/inventory" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              Data Sparepart
            </Link>

            <div className="my-3 border-t border-red-500/50"></div>

            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold bg-gray-900 hover:bg-gray-800 text-yellow-400 shadow-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Admin Panel
            </Link>
          </nav>
          
          <div className="p-4 border-t border-red-600 text-xs font-medium text-center text-red-200">
            © 2026 PT Bridgestone
          </div>
        </aside>

        {/* === KONTEN UTAMA === */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}