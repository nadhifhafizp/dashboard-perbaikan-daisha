'use client';

import React, { useState, useEffect } from 'react';
import { Download, Monitor, CheckCircle, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstaller({
  className = '',
  buttonStyle = 'sidebar',
}: {
  className?: string;
  buttonStyle?: 'sidebar' | 'banner' | 'compact';
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // 1. Cek apakah aplikasi sudah berjalan dalam mode Desktop Standalone
    const checkStandalone = () => {
      const isWindowStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
      const isAppMode = isWindowStandalone || isNavigatorStandalone;
      setIsStandalone(isAppMode);
      if (isAppMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    // 2. Daftarkan Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 3. Tangkap event beforeinstallprompt dari browser Desktop (Chrome, Edge, dll)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Aplikasi berhasil diinstal ke desktop!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('[PWA] Error during prompt:', err);
        setShowManualGuide(true);
      }
    } else {
      // Jika browser belum memicu prompt otomatis (misal Edge/Chrome versi tertentu atau sudah pernah dismiss),
      // tampilkan petunjuk ringkas 2 langkah mudah
      setShowManualGuide(true);
    }
  };

  // Jika sudah dibuka langsung sebagai aplikasi desktop native, tampilkan status terpasang
  if (isStandalone) {
    if (buttonStyle === 'compact') return null;
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-[11px] font-semibold ${className}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="truncate">Desktop App Aktif</span>
      </div>
    );
  }

  return (
    <>
      {buttonStyle === 'sidebar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white shadow-xs border border-red-600/60 transition-all cursor-pointer group ${className}`}
          title="Install aplikasi ini di desktop komputer Anda"
        >
          <div className="flex items-center gap-2.5">
            <Monitor className="w-4 h-4 text-red-200 group-hover:text-white transition" />
            <span className="text-left leading-tight">
              <span className="block font-black">Install Aplikasi</span>
              <span className="block text-[10px] text-red-200 font-normal">Desktop Komputer</span>
            </span>
          </div>
          <Download className="w-3.5 h-3.5 text-red-200 group-hover:translate-y-0.5 transition" />
        </button>
      )}

      {buttonStyle === 'compact' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-800 text-white text-[11px] font-bold transition cursor-pointer ${className}`}
          title="Install Aplikasi Desktop"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {buttonStyle === 'banner' && (
        <div className={`p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-lg">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-black">Gunakan sebagai Aplikasi Desktop</strong>
              <span className="text-[11px] text-slate-600">Buka tanpa address bar browser, lebih cepat & praktis.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      )}

      {/* Modal Panduan Installasi Cepat (Jika browser tidak menampilkan pop-up otomatis) */}
      {showManualGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Install Daisha ke Desktop</h3>
                  <p className="text-[11px] text-slate-500">Aplikasi web-based dengan kenyamanan desktop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="font-medium">
                Untuk menginstal aplikasi ini langsung ke desktop Windows / PC Anda melalui browser Chrome atau Microsoft Edge:
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Lihat ke Address Bar (Bilah Alamat URL)</strong>
                    <span className="text-[11px] text-slate-600">
                      Di sebelah kanan kolom URL (dekat tombol bintang bookmark), cari ikon <strong>Komputer/Monitor dengan panah bawah (⤓)</strong> atau tombol <strong>(+) Aplikasi tersedia</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 border-t border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Klik &quot;Install&quot; / &quot;Pasang&quot;</strong>
                    <span className="text-[11px] text-slate-600">
                      Aplikasi akan otomatis terpasang di Desktop, Start Menu, dan Taskbar Windows dengan jendela mandiri tanpa tab browser.
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                💡 <strong>Tips:</strong> Aplikasi tetap tersambung secara live ke database SQLite server dan otomatis memperbarui data secara real-time.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManualGuide(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
