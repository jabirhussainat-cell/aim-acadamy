import React from 'react';
import Link from 'next/link';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FolderOpen,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 my-4">
      <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 ring-1 ring-slate-700/50">
        <Icon className="w-7 h-7 text-rose-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {(actionText && actionHref) && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm shadow-rose-900/40"
        >
          {actionText}
        </Link>
      )}
      {(actionText && onAction && !actionHref) && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm shadow-rose-900/40"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
