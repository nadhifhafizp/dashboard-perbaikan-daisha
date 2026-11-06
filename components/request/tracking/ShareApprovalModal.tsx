'use client';

import React, { useState, useEffect } from 'react';
import { Share2, X, Copy, Check, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';

interface ShareApprovalModalProps {
  request: SectionRequestFull | null;
  role?: 'spv_seksi' | 'manajer_seksi' | 'special_project' | 'seksi';
  onClose: () => void;
}

export default function ShareApprovalModal({
  request,
  role = 'spv_seksi',
  onClose,
}: ShareApprovalModalProps) {
  const [selectedRole, setSelectedRole] = useState<'spv_seksi' | 'manajer_seksi' | 'special_project'>(() => {
    if (role === 'special_project') return 'special_project';
    if (role === 'manajer_seksi') return 'manajer_seksi';
    if (request?.flowStep === 'STEP_2B_WAITING_MANAJER_SEKSI') return 'manajer_seksi';
    if (
      request?.flowStep === 'STEP_5_MENUNGGU_ATASAN_SPROJECT' ||
      request?.status === 'Menunggu Assign S.Project'
    ) {
      return 'special_project';
    }
    return 'spv_seksi';
  });
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (role === 'special_project') setSelectedRole('special_project');
    else if (role === 'manajer_seksi') setSelectedRole('manajer_seksi');
    else if (request?.flowStep === 'STEP_2B_WAITING_MANAJER_SEKSI') setSelectedRole('manajer_seksi');
    else if (
      request?.flowStep === 'STEP_5_MENUNGGU_ATASAN_SPROJECT' ||
      request?.status === 'Menunggu Assign S.Project'
    ) {
      setSelectedRole('special_project');
    } else setSelectedRole('spv_seksi');
  }, [role, request]);

  if (!request) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const roleQuery = `&role=${selectedRole}`;

  const approvalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/request/approval?token=${request.approvalToken}${roleQuery}`
      : `/request/approval?token=${request.approvalToken}${roleQuery}`;

  const isSpecialProject = selectedRole === 'special_project';
  const isManajerSeksi = selectedRole === 'manajer_seksi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSpecialProject
                  ? 'bg-purple-100 text-purple-700'
                  : isManajerSeksi
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tautan Persetujuan Digital (Approval)
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

        {/* Tab Role Switcher (3 Tahap Approval) */}
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedRole('spv_seksi')}
            className={`py-2 px-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 text-[11px] sm:text-xs truncate ${
              selectedRole === 'spv_seksi'
                ? 'bg-white text-amber-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">1. Spv Seksi</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('manajer_seksi')}
            className={`py-2 px-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 text-[11px] sm:text-xs truncate ${
              selectedRole === 'manajer_seksi'
                ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">2. Manajer</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('special_project')}
            className={`py-2 px-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 text-[11px] sm:text-xs truncate ${
              isSpecialProject
                ? 'bg-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. S.Project</span>
          </button>
        </div>

        {/* Role Explanation */}
        <div
          className={`p-3 rounded-xl border text-xs leading-relaxed ${
            isSpecialProject
              ? 'bg-purple-50/70 border-purple-200 text-purple-950'
              : isManajerSeksi
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          {isSpecialProject ? (
            <div>
              <span className="font-bold block mb-0.5 text-purple-900">
                Persetujuan &amp; Penugasan Special Project (Tahap 3):
              </span>
              Tautan keputusan resmi GO / Tolak untuk <strong>Manager Special Project (8236)</strong>. Penomoran surat resmi dan assign bengkel diterbitkan pada tahap ini.
            </div>
          ) : isManajerSeksi ? (
            <div>
              <span className="font-bold block mb-0.5 text-emerald-900">
                Persetujuan Manajer Seksi Pemohon (Tahap 2):
              </span>
              Tautan tanda tangan digital untuk <strong>{request.namaManajerSeksi || `Manajer (${request.kodeSeksi || 'Pemohon'})`}</strong>. Setelah disetujui Manajer, permohonan resmi diteruskan ke Workshop Produksi.
            </div>
          ) : (
            <div>
              <span className="font-bold block mb-0.5 text-amber-900">
                Persetujuan Supervisor Seksi Pemohon (Tahap 1):
              </span>
              Tautan tanda tangan digital untuk <strong>{request.foreman || request.namaAtasanSeksi || 'Spv Seksi'}</strong> sebelum dilanjutkan ke Manajer Seksi.
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
              isSpecialProject
                ? 'bg-purple-600 hover:bg-purple-700'
                : isManajerSeksi
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>
              {isSpecialProject
                ? 'Buka Approval S.Project'
                : isManajerSeksi
                ? 'Buka Approval Manajer'
                : 'Buka Approval Spv'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
