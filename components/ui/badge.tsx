import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-red-600 text-white shadow hover:bg-red-700',
  secondary: 'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
  destructive: 'border-transparent bg-rose-500 text-white shadow hover:bg-rose-600',
  outline: 'text-slate-700 border-slate-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function badgeVariants({
  variant = 'default',
  className = '',
}: {
  variant?: BadgeVariant | null;
  className?: string;
} = {}) {
  return cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variant && variantClasses[variant],
    className
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}

export { Badge };

