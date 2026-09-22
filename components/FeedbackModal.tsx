'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackModalProps {
  isOpen: boolean;
  type?: FeedbackType;
  title: string;
  message: string;
  detail?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
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
  secondaryButtonText,
  onSecondaryClick,
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      aria-describedby="feedback-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in no-print"
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden transform transition-all animate-scale-up">
        
        <div className="p-5 text-center">
          
          {/* Status Icon */}
          <div className={`mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg ${
            type === 'success' 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' 
              : type === 'error'
              ? 'bg-red-50 text-red-600 border border-red-200/60' 
              : 'bg-blue-50 text-blue-600 border border-blue-200/60'
          }`}>
            {type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            ) : type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
            ) : (
              <Info className="w-5 h-5 text-blue-600" aria-hidden="true" />
            )}
          </div>

          <h3 id="feedback-modal-title" className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
          <p id="feedback-modal-desc" className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">{message}</p>

          {detail && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono font-medium text-slate-700 text-left truncate">
              {detail}
            </div>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
          {secondaryButtonText && onSecondaryClick && (
            <button
              type="button"
              onClick={onSecondaryClick}
              className="w-full h-9 px-3.5 font-medium text-xs rounded-lg shadow-2xs transition bg-slate-900 hover:bg-slate-800 text-white cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              {secondaryButtonText}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`w-full h-9 px-3.5 font-medium text-xs rounded-lg shadow-2xs transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              type === 'success' && secondaryButtonText
                ? 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 focus:ring-slate-300'
                : type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
                : type === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                : 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-700'
            }`}
          >
            {buttonText}
          </button>
        </div>

      </div>
    </div>
  );
}
