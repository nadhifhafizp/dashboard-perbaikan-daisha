'use client';

import React, { useState } from 'react';
import { Share2, X, Copy, Check, ExternalLink } from 'lucide-react';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';

interface ShareApprovalModalProps {
  request: SectionRequestFull | null;
  onClose: () => void;
}

export default function ShareApprovalModal({
  request,
  onClose,
}: ShareApprovalModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!request) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const approvalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/request/approval?token=${request.approvalToken}`
      : `/request/approval?token=${request.approvalToken}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-3.5 animate-scale-up">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-red-600" />
            <span>Link Persetujuan Atasan Seksi</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-8 sm:h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Tutup modal share approval"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Kirimkan link ini ke atasan seksi (
          <strong>{request.emailAtasanSeksi || 'Atasan'}</strong>) agar dapat
          meninjau dan menandatangani formulir permohonan{' '}
          <strong>{request.nomorRequest}</strong>:
        </p>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-800 truncate select-all">
            {approvalUrl}
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(approvalUrl)}
            className="shrink-0 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <a
            href={`/request/approval?token=${request.approvalToken}`}
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Approval</span>
          </a>
        </div>
      </div>
    </div>
  );
}
