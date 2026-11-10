'use client';

import React, { useState } from 'react';
import {
  FileText,
  UserCheck,
  Inbox,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Wrench,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FlowStepCode, WORKFLOW_STEPS } from '@/lib/workflowConstants';

interface FlowchartTrackerProps {
  currentStep?: string;
  isCompact?: boolean;
}

const FLOW_ORDER: FlowStepCode[] = [
  'STEP_1_SUBMITTED',
  'STEP_2_WAITING_ATASAN_SEKSI',
  'STEP_3_DITERIMA_WORKSHOP',
  'STEP_4_EVALUASI_WORKSHOP',
  'STEP_5_MENUNGGU_ATASAN_SPROJECT',
  'STEP_6_DALAM_PENGERJAAN',
  'STEP_7_PEKERJAAN_SELESAI',
  'STEP_8_SELESAI',
];

const STEP_ICONS: Record<string, React.ReactNode> = {
  STEP_1_SUBMITTED: <FileText className="w-3.5 h-3.5" />,
  STEP_2_WAITING_ATASAN_SEKSI: <UserCheck className="w-3.5 h-3.5" />,
  STEP_2B_WAITING_MANAJER_SEKSI: <UserCheck className="w-3.5 h-3.5" />,
  STEP_3_DITERIMA_WORKSHOP: <Inbox className="w-3.5 h-3.5" />,
  STEP_4_EVALUASI_WORKSHOP: <ClipboardCheck className="w-3.5 h-3.5" />,
  STEP_5_MENUNGGU_ATASAN_SPROJECT: <UserCheck className="w-3.5 h-3.5" />,
  STEP_5_DITOLAK: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
  STEP_6_DALAM_PENGERJAAN: <Wrench className="w-3.5 h-3.5" />,
  STEP_7_PEKERJAAN_SELESAI: <CheckSquare className="w-3.5 h-3.5" />,
  STEP_8_SELESAI: <CheckCircle2 className="w-3.5 h-3.5" />,
};

export default function FlowchartTracker({
  currentStep = 'STEP_2_WAITING_ATASAN_SEKSI',
  isCompact = false,
}: FlowchartTrackerProps) {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const isRejected = currentStep === 'STEP_5_DITOLAK';

  let activeIndex = FLOW_ORDER.indexOf(currentStep as FlowStepCode);
  if (activeIndex === -1) {
    if (currentStep === 'STEP_5_DITOLAK') activeIndex = 4;
    else activeIndex = 1;
  }

  const activeStepCode = FLOW_ORDER[activeIndex] || 'STEP_4_EVALUASI_WORKSHOP';
  const activeStepInfo = WORKFLOW_STEPS[activeStepCode] || WORKFLOW_STEPS.STEP_4_EVALUASI_WORKSHOP;
  const progressPercent = Math.min(100, Math.round(((activeIndex + 1) / FLOW_ORDER.length) * 100));

  if (isCompact) {
    const currentInfo = WORKFLOW_STEPS[currentStep as FlowStepCode] || WORKFLOW_STEPS.STEP_2_WAITING_ATASAN_SEKSI;
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-red-600" />
        <span className="text-slate-500 font-normal">Status:</span>
        <span>{currentInfo.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-3 sm:p-3.5 space-y-2.5 transition">
      {/* Header: Status Ringkas & Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              isRejected
                ? 'bg-rose-600 text-white'
                : 'bg-red-600 text-white shadow-xs'
            }`}
          >
            {isRejected ? <XCircle className="w-3.5 h-3.5" /> : STEP_ICONS[activeStepCode]}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-900">
              {isRejected ? 'Permohonan Ditolak' : `Tahap ${activeIndex + 1}: ${activeStepInfo.label}`}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">
              PIC: <strong className="text-slate-700">{activeStepInfo.actor}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
            {isRejected ? 'Ditolak' : `${activeIndex + 1} / 8 (${progressPercent}%)`}
          </span>
          <button
            type="button"
            onClick={() => setShowAllSteps((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition cursor-pointer"
          >
            <span>{showAllSteps ? 'Ringkas' : 'Alur 8 Tahap'}</span>
            {showAllSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isRejected ? 'bg-rose-500' : 'bg-red-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Expanded Step Ribbon */}
      {showAllSteps && (
        <div className="pt-2 border-t border-slate-200/80 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
            {FLOW_ORDER.map((code, idx) => {
              const stepInfo = WORKFLOW_STEPS[code];
              const isPassed = idx < activeIndex;
              const isCurrent = idx === activeIndex && !isRejected;
              const isStepRejected = isRejected && idx === 4;

              return (
                <div
                  key={code}
                  className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-between min-h-[58px] ${
                    isStepRejected
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : isCurrent
                      ? 'bg-red-50 border-red-300 text-red-950 font-bold shadow-2xs'
                      : isPassed
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                      isStepRejected
                        ? 'bg-rose-600 text-white'
                        : isCurrent
                        ? 'bg-red-600 text-white'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className="text-[10px] leading-tight line-clamp-2 w-full font-medium">
                    {stepInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
