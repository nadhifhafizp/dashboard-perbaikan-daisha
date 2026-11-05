'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PenTool, RotateCcw, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface SignaturePadProps {
  value?: string | null;
  onChange: (dataUrl: string) => void;
  signerName?: string;
  roleLabel?: string;
  className?: string;
  required?: boolean;
}

export default function SignaturePad({
  value,
  onChange,
  signerName = 'Nama Pejabat',
  roleLabel = 'Tanda Tangan / Paraf',
  className = '',
  required = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isDummyActive, setIsDummyActive] = useState(false);

  // Sync state dengan initial value
  useEffect(() => {
    if (value && value.startsWith('data:image/')) {
      setHasDrawn(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    }
  }, [value]);

  // Inisialisasi canvas resolution untuk retina/sharp drawing
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
      }
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  // Koordinat relatif canvas
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setIsDummyActive(false);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setIsDummyActive(false);
    onChange('');
  };

  // Generate Tanda Tangan Dummy Otomatis (1 Klik)
  const handleGenerateDummy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width / 2;
    const h = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Paraf & Flurish bergaya kaligrafi
    ctx.save();
    ctx.strokeStyle = '#1e3a8a'; // Blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Paraf loop artifisial
    ctx.beginPath();
    const startX = 30;
    const centerY = h * 0.55;

    ctx.moveTo(startX, centerY);
    ctx.bezierCurveTo(startX + 20, centerY - 35, startX + 50, centerY + 30, startX + 75, centerY - 15);
    ctx.bezierCurveTo(startX + 90, centerY - 40, startX + 110, centerY + 25, startX + 130, centerY - 5);
    ctx.bezierCurveTo(startX + 145, centerY - 20, startX + 160, centerY + 20, startX + 180, centerY);
    // Garis bawah meliuk (underline flourish)
    ctx.moveTo(startX + 10, centerY + 20);
    ctx.quadraticCurveTo(startX + 90, centerY + 35, startX + 220, centerY + 10);
    ctx.stroke();

    // 2. Tulisan Nama Digital Font
    ctx.font = 'italic bold 15px cursive, "Brush Script MT", "Segoe Script", sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(signerName || 'Bridgestone PIC', startX + 20, centerY - 2);

    // 3. Stempel Digital Verifikasi Bridgestone
    ctx.font = 'bold 8.5px "Courier New", monospace';
    ctx.fillStyle = '#059669'; // Emerald
    ctx.fillText(`✓ DIGITALLY SIGNED & APPROVED`, startX + 25, centerY + 34);

    ctx.restore();

    setHasDrawn(true);
    setIsDummyActive(true);
    onChange(canvas.toDataURL('image/png'));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-red-600" />
          <span>{roleLabel}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGenerateDummy}
            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Buat tanda tangan otomatis resmi dalam 1 klik"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Tanda Tangan Dummy (Otomatis)</span>
          </button>
          {hasDrawn && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
              title="Hapus coretan tanda tangan"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hapus</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden shadow-2xs">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 touch-none cursor-crosshair bg-slate-50/40"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1 select-none">
            <PenTool className="w-5 h-5 text-slate-300" />
            <span className="text-xs font-medium">
              Goreskan tanda tangan di sini (Mouse / Layar Sentuh)
            </span>
            <span className="text-xs text-slate-600">
              atau klik tombol &quot;Tanda Tangan Dummy (Otomatis)&quot; di atas
            </span>
          </div>
        )}

        {hasDrawn && (
          <div className="absolute bottom-1.5 right-2 pointer-events-none flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{isDummyActive ? 'Tanda Tangan Dummy Otomatis' : 'Tanda Tangan Manual Tersimpan'}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600">
        Tanda tangan ini akan dicantumkan secara digital pada lembar cetak formulir resmi <strong>ENG-KP-011</strong>.
      </p>
    </div>
  );
}

