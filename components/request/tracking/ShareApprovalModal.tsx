'use client';

import React, { useState, useEffect } from 'react';
import { Share2, X, Copy, Check, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';

interface ShareApprovalModalProps {
  request: SectionRequestFull | null;
  role?: 'seksi' | 'special_project';
  onClose: () => void;
}

export default function ShareApprovalModal({
  request,
  role = 'seksi',
  onClose,
}: ShareApprovalModalProps) {
  const [selectedRole, setSelectedRole] = useState<'seksi' | 'special_project'>(role);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedRole(role);
  }, [role]);

  if (!request) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isSpecialProject = selectedRole === 'special_project';
  const roleQuery = isSpecialProject ? '&role=special_project' : '';

  const approvalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/request/approval?token=${request.approvalToken}${roleQuery}`
      : `/request/approval?token=${request.approvalToken}${roleQuery}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSpecialProject ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Simulasi &amp; Tautan Persetujuan
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {request.nomorRequest?.startsWith('REQ-') && request.nomorSurat
                  ? request.nomorSurat
                  : request.nomorRequest}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-8 sm:h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Tutup modal share approval"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Role Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedRole('seksi')}
            className={`py-2 px-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              !isSpecialProject
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>1. Atasan Seksi</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('special_project')}
            className={`py-2 px-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isSpecialProject
                ? 'bg-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Atasan S.Project</span>
          </button>
        </div>

        {/* Role Explanation */}
        <div
          className={`p-3 rounded-xl border text-xs leading-relaxed ${
            isSpecialProject
              ? 'bg-purple-50/70 border-purple-200 text-purple-950'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {isSpecialProject ? (
            <div>
              <span className="font-bold block mb-0.5 text-purple-900">
                Persetujuan &amp; Penugasan Workshop (8210 / 820):
              </span>
              Tautan simulasi untuk <strong>Manager 8210 &amp; Dept Head 820</strong>. Keputusan
              persetujuan, catatan instruksi pengerjaan, dan perubahan status langsung tersimpan
              ke dalam database sistem.
            </div>
          ) : (
            <div>
              <span className="font-bold block mb-0.5 text-slate-900">
                Persetujuan Formulir Seksi Pemohon:
              </span>
              Tautan tanda tangan Atasan Seksi (
              <strong>{request.emailAtasanSeksi || 'Atasan Seksi'}</strong>) pada dokumen resmi
              ENG-KP-011 kotak Foreman sebelum diteruskan ke PIC Workshop.
            </div>
          )}
        </div>

        {/* URL Box */}
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-xs rounded-lg transition cursor-pointer"
          >
            Tutup
          </button>
          <a
            href={approvalUrl}
            target="_blank"
            rel="noreferrer"
            className={`h-10 px-4 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 shadow-xs ${
              isSpecialProject ? 'bg-purple-600 hover:bg-purple-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>
              {isSpecialProject ? 'Buka Approval S.Project' : 'Buka Approval Seksi'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
