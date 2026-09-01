'use client';

import React, { useEffect } from 'react';

export type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackModalProps {
  isOpen: boolean;
  type?: FeedbackType;
  title: string;
  message: string;
  detail?: string;
  buttonText?: string;
  autoCloseMs?: number;
  onClose: () => void;
}

export default function FeedbackModal({
  isOpen,
  type = 'success',
  title,
  message,
  detail,
  buttonText = "Tutup",
  autoCloseMs,
  onClose,
}: FeedbackModalProps) {
  useEffect(() => {
    if (!isOpen || !autoCloseMs) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up">
        
        <div className="p-6 text-center">
          
          {/* Status Icon */}
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
            type === 'success' 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : type === 'error'
              ? 'bg-red-50 text-red-600 border border-red-100'
              : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
            {type === 'success' ? (
              <span className="text-2xl">✅</span>
            ) : type === 'error' ? (
              <span className="text-2xl">❌</span>
            ) : (
              <span className="text-2xl">ℹ️</span>
            )}
          </div>

          <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{message}</p>

          {detail && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-700 text-left truncate">
              {detail}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 px-4 font-black text-xs rounded-xl shadow transition ${
              type === 'success' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20' 
                : type === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {buttonText}
          </button>
        </div>

      </div>
    </div>
  );
}
