'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  isOpen: boolean;
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  onError?: (errorMessage: string) => void;
}

export default function QrScannerModal({
  isOpen,
  onScanSuccess,
  onClose,
  onError,
}: QrScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
            setIsCameraActive(false);
          });
      }
      return;
    }

    let isCancelled = false;

    // Berikan jeda sejenak agar DOM reader-camera siap dirender
    const timer = setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('reader-camera-modal');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            if (!isCancelled) {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Frame scanning interval callback - abaikan
          }
        );

        if (!isCancelled) {
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error('Gagal membuka kamera:', err);
        if (!isCancelled && onError) {
          onError('Gagal membuka kamera. Pastikan izin kamera browser sudah diaktifkan.');
        }
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
            setIsCameraActive(false);
          });
      }
    };
  }, [isOpen, onScanSuccess, onError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden transform transition-all animate-scale-up p-5 text-white">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h3 className="text-sm font-black uppercase tracking-wider">
              Scan Barcode / QR Daisha
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div
            id="reader-camera-modal"
            className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-slate-700 bg-black min-h-[220px]"
          ></div>

          <p className="text-slate-300 text-xs mt-3.5 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {isCameraActive
              ? 'Arahkan kamera tepat ke barcode atau QR unit Daisha...'
              : 'Menghubungkan ke sensor kamera perangkat...'}
          </p>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow transition cursor-pointer"
          >
            Tutup Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
