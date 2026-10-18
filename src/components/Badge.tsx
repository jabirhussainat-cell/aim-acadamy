import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'belt' | 'outline';
  beltColor?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', beltColor, className = '' }: BadgeProps) {
  let variantClasses = 'bg-slate-800 text-slate-200 border-slate-700';

  if (variant === 'success') {
    variantClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
  } else if (variant === 'warning') {
    variantClasses = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
  } else if (variant === 'danger') {
    variantClasses = 'bg-rose-950/80 text-rose-400 border-rose-800/60';
  } else if (variant === 'info') {
    variantClasses = 'bg-blue-950/80 text-blue-400 border-blue-800/60';
  } else if (variant === 'outline') {
    variantClasses = 'bg-transparent text-slate-300 border-slate-700';
  }

  // Handle martial arts belts
  const text = String(children).toLowerCase();
  if (text.includes('white')) {
    variantClasses = 'bg-slate-200 text-slate-900 border-slate-300 font-semibold';
  } else if (text.includes('yellow')) {
    variantClasses = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
  } else if (text.includes('orange')) {
    variantClasses = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
  } else if (text.includes('green')) {
    variantClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (text.includes('blue')) {
    variantClasses = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
  } else if (text.includes('purple')) {
    variantClasses = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  } else if (text.includes('brown')) {
    variantClasses = 'bg-amber-900/40 text-amber-200 border-amber-800/60';
  } else if (text.includes('red')) {
    variantClasses = 'bg-red-900/40 text-red-200 border-red-800/60';
  } else if (text.includes('black')) {
    variantClasses = 'bg-black text-rose-400 border-rose-600/50 font-bold shadow-sm shadow-rose-950';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'pass':
    case 'paid':
    case 'confirmed':
    case 'registration open':
      return <Badge variant="success">{status}</Badge>;
    case 'upcoming':
    case 'pending':
    case 'draft':
    case 'accrued':
      return <Badge variant="warning">{status}</Badge>;
    case 'inactive':
    case 'fail':
    case 'cancelled':
    case 'archived':
    case 'failed':
      return <Badge variant="danger">{status}</Badge>;
    case 'absent':
    case 'registration closed':
    case 'completed':
      return <Badge variant="info">{status}</Badge>;
    default:
      return <Badge variant="default">{status || 'Unknown'}</Badge>;
  }
}
