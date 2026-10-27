'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Mail, ExternalLink } from 'lucide-react';
import { SubmittedData } from './types';

interface SubmittedSuccessModalProps {
  data: SubmittedData | null;
  onClose: () => void;
}

export default function SubmittedSuccessModal({
  data,
  onClose,
}: SubmittedSuccessModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!data) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 animate-scale-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulir Request Berhasil Dikirim!</h3>
            <p className="text-xs text-slate-500">
              No. Request: <strong className="font-mono text-slate-800">{data.nomorRequest}</strong>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 space-y-2">
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            Tautan persetujuan tanda tangan (assign) telah dibuat untuk Atasan Seksi ({data.namaAtasan || data.emailAtasan}):
          </p>
          <div className="p-2 bg-white rounded-lg border border-slate-300 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-700 truncate select-all">
              {data.approvalLink}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(data.approvalLink)}
              className="shrink-0 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2 border-t border-slate-100">
          <a
            href={data.mailtoUrl}
            className="w-full sm:w-auto h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Kirim Email</span>
          </a>
          <a
            href={data.approvalLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Approval</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto h-10 px-4 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-medium text-xs rounded-lg transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
