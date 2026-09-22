'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, X, RotateCcw, AlertTriangle } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  onError?: (errorMessage: string) => void;
}

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
];

export default function QrScannerModal({
  isOpen,
  onScanSuccess,
  onClose,
  onError,
}: QrScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showFlagsGuide, setShowFlagsGuide] = useState(false);

  // Helper untuk stop scanner dengan aman tanpa memicu crash DOM React
  const stopLiveScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
        }
      } catch {
        // Abaikan error saat stop
      }
      try {
        await scannerRef.current.clear();
      } catch {
        // Abaikan error saat clear
      }
      scannerRef.current = null;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopLiveScanner();
      setStreamError(null);
      setFileError(null);
      setIsProcessingFile(false);
      setIsInitializing(false);
      return;
    }

    let isCancelled = false;
    setIsInitializing(true);
    setStreamError(null);
    setFileError(null);

    const startCamera = async () => {
      // Pastikan scanner sebelumnya sudah bersih
      await stopLiveScanner();

      // Cek apakah browser mendukung getUserMedia
      const hasMediaDevices = typeof navigator !== 'undefined' && !!navigator?.mediaDevices?.getUserMedia;

      if (!hasMediaDevices) {
        if (!isCancelled) {
          setIsInitializing(false);
          setIsCameraActive(false);
          setStreamError(
            'Kamera tidak dapat diakses secara langsung. Anda dapat menggunakan opsi jepret foto barcode di bawah.'
          );
        }
        return;
      }

      try {
        const scanner = new Html5Qrcode('reader-camera-modal', {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              // Kotak bidik fleksibel menyesuaikan layar HP
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(minEdge * 0.8),
                height: Math.floor(minEdge * 0.6),
              };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isCancelled) {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Callback frame scanning saat belum mendeteksi kode - jangan log error
          }
        );

        if (!isCancelled) {
          setIsCameraActive(true);
          setIsInitializing(false);
          setStreamError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setIsCameraActive(false);
          setIsInitializing(false);
          setStreamError(
            'Kamera langsung diblokir oleh browser (keamanan HTTP). ' +
            'Ikuti 3 langkah cepat di bawah agar kamera langsung menyala di web.'
          );
        }
      }
    };

    // Jeda 200ms agar DOM elemen reader-camera-modal selesai dimount
    const timer = setTimeout(() => {
      startCamera();
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      stopLiveScanner();
    };
  }, [isOpen, onScanSuccess]);

  // Handler scan foto fallback
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileError(null);

    try {
      await stopLiveScanner();

      const scanner = new Html5Qrcode('reader-camera-modal', {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });
      scannerRef.current = scanner;

      // scanFile dengan false agar tidak merusak elemen DOM (mencegah removeChild error)
      const decodedText = await scanner.scanFile(file, false);
      if (decodedText) {
        onScanSuccess(decodedText);
      }
    } catch {
      setFileError(
        'Barcode / QR belum terbaca. Posisikan kamera lebih dekat, tegak lurus, dan pastikan gambar tajam.'
      );
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 rounded-xl shadow-xl border border-slate-700/80 overflow-hidden transform transition-all animate-scale-up p-5 text-white flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white">
                Scan Barcode / QR Daisha
              </h3>
              <p className="text-[11px] text-slate-400">Deteksi otomatis nomor unit Daisha</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input File Fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileScan}
        />

        {/* Frame Scanner (Wrapper terpisah agar React tidak konflik dengan DOM Html5Qrcode) */}
        <div className="flex flex-col items-center w-full">
          <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-black min-h-[240px] flex items-center justify-center">
            
            {/* DOM Container khusus Html5Qrcode - JANGAN masukkan anak elemen React di dalamnya */}
            <div id="reader-camera-modal" className="w-full h-full min-h-[240px]"></div>

            {/* Overlay Status Memuat / Menganalisis */}
            {isInitializing && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-10 p-4">
                <svg className="animate-spin h-8 w-8 text-red-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-bold text-white">Menghubungkan kamera langsung di web...</span>
              </div>
            )}

            {isProcessingFile && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-20 p-4">
                <svg className="animate-spin h-8 w-8 text-red-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-bold text-white">Menganalisis barcode dari gambar...</span>
              </div>
            )}
          </div>

          {/* Indikator Status Kamera */}
          <div className="text-slate-300 text-xs mt-2.5 font-medium text-center flex flex-col items-center gap-2">
            {isCameraActive ? (
              <span className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Kamera Langsung Aktif: Arahkan ke barcode unit Daisha
              </span>
            ) : isInitializing ? null : streamError ? (
              <>
                <span className="text-amber-400 font-semibold">Kamera langsung tertahan keamanan browser (HTTP)</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsInitializing(true);
                    setStreamError(null);
                    setFileError(null);
                    setTimeout(() => {
                      if (typeof window !== 'undefined') {
                        // Trigger start camera
                        const hasMedia = typeof navigator !== 'undefined' && !!navigator?.mediaDevices?.getUserMedia;
                        if (hasMedia) {
                          window.location.reload();
                        } else {
                          setIsInitializing(false);
                          setStreamError('Browser masih mengunci kamera. Pastikan sudah klik Relaunch di Chrome Flags.');
                        }
                      }
                    }, 500);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba Sambungkan Kamera Lagi</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Notifikasi Error jika file gagal terbaca */}
        {fileError && (
          <div className="mt-3 p-3 bg-red-950/70 border border-red-800 text-red-200 rounded-xl text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Tombol Opsi Jepret Foto Cepat (Sebagai alternatif) */}
        {streamError && !isCameraActive && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] text-slate-400 text-center">
              Gagal membuka streaming kamera langsung. Silakan gunakan tombol foto di bawah:
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>Jepret / Ambil Foto Barcode</span>
            </button>
          </div>
        )}

        {/* Tombol Tutup */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
