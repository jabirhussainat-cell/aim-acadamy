import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'rose' | 'amber' | 'blue' | 'emerald' | 'purple';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'rose',
}: StatCardProps) {
  const colorMap = {
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-900/30',
      glow: 'group-hover:border-rose-600/50',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-900/30',
      glow: 'group-hover:border-amber-600/50',
    },
    blue: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-900/30',
      glow: 'group-hover:border-sky-600/50',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-900/30',
      glow: 'group-hover:border-emerald-600/50',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-900/30',
      glow: 'group-hover:border-purple-600/50',
    },
  };

  const c = colorMap[variant] || colorMap.rose;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border ${c.border} bg-slate-900/60 p-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 ${c.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider uppercase text-slate-400">
          {title}
        </span>
        <div className={`rounded-lg p-2.5 ${c.bg} ${c.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400">{trend}</span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>
      )}
    </div>
  );
}
