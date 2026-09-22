'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  detail,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDestructive = false,
  isLoading = false,
  loadingText = "Memproses...",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden transform transition-all animate-scale-up">
        
        {/* Header Icon & Title */}
        <div className="p-5 text-center">
          <div className={`mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-lg ${
            isDestructive ? 'bg-red-50 text-red-600 border border-red-200/60' : 'bg-amber-50 text-amber-600 border border-amber-200/60'
          }`}>
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isDestructive ? (
              <Trash2 className="w-5 h-5 text-red-600" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
            )}
          </div>

          <h3 id="confirm-modal-title" className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
          <p id="confirm-modal-desc" className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">{message}</p>

          {detail && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono font-medium text-slate-800 text-left truncate">
              {detail}
            </div>
          )}

          {isLoading && (
            <div className="mt-3.5 flex items-center justify-center gap-2 text-xs font-medium text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              <span>{loadingText}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg shadow-2xs transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-9 px-3.5 text-white font-medium text-xs rounded-lg shadow-2xs transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-900'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
