'use client';

import React from 'react';
import {
  FileText,
  UserCheck,
  Inbox,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Wrench,
  CheckSquare,
  Send,
  ArrowRight,
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
  const isRejected = currentStep === 'STEP_5_DITOLAK';

  // Cari index aktif
  let activeIndex = FLOW_ORDER.indexOf(currentStep as FlowStepCode);
  if (activeIndex === -1) {
    if (currentStep === 'STEP_5_DITOLAK') activeIndex = 4;
    else activeIndex = 1;
  }

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
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <span>Alur Proses Permohonan</span>
        </span>
        {isRejected ? (
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Ditolak
          </span>
        ) : (
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            Tahap {activeIndex + 1} dari 8
          </span>
        )}
      </div>

      {/* Visual Stepper */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[780px] justify-between relative px-1">
          {FLOW_ORDER.map((code, idx) => {
            const stepInfo = WORKFLOW_STEPS[code];
            const isPassed = idx < activeIndex;
            const isCurrent = idx === activeIndex && !isRejected;
            const isStepRejected = isRejected && idx === 4;

            return (
              <React.Fragment key={code}>
                {/* Node Box */}
                <div className="flex flex-col items-center text-center w-24 shrink-0 relative group">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isStepRejected
                        ? 'bg-rose-600 text-white'
                        : isCurrent
                        ? 'bg-red-600 text-white ring-4 ring-red-100'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : STEP_ICONS[code]}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-semibold leading-tight line-clamp-2 break-words text-center w-full min-h-[26px] ${
                      isStepRejected
                        ? 'text-rose-700'
                        : isCurrent
                        ? 'text-red-950 font-bold'
                        : isPassed
                        ? 'text-emerald-800'
                        : 'text-slate-600'
                    }`}
                    title={stepInfo.label}
                  >
                    {stepInfo.label}
                  </span>
                  <span className="text-xs text-slate-400 truncate w-full">
                    {stepInfo.actor}
                  </span>
                </div>

                {/* Arrow connector */}
                {idx < FLOW_ORDER.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-1">
                    <div
                      className={`h-0.5 w-full transition-all ${
                        idx < activeIndex ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
