import React from 'react';

export function UrgensiBadge({ urgensi }: { urgensi: string }) {
  const dotColor =
    urgensi === 'Critical'
      ? 'bg-red-600'
      : urgensi === 'Urgent'
      ? 'bg-amber-500'
      : 'bg-emerald-600';
  const textColor =
    urgensi === 'Critical'
      ? 'text-red-700 bg-red-50 border border-red-200/60'
      : urgensi === 'Urgent'
      ? 'text-amber-800 bg-amber-50 border border-amber-200/60'
      : 'text-slate-700 bg-slate-100 border border-slate-200/60';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${textColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{urgensi}</span>
    </span>
  );
}
export default UrgensiBadge;
