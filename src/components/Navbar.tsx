'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AimLogo } from '@/components/AimLogo';
import {
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'UNIT';
    adminIndex?: number;
    unit?: {
      name: string;
      unitCode: string;
    } | null;
  } | null;
  onMenuToggle?: () => void;
  isMobileOpen?: boolean;
}

export function Navbar({ user, onMenuToggle, isMobileOpen }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  }

  const roleLabel =
    user?.role === 'SUPER_ADMIN'
      ? `Super Admin ${user.adminIndex ? `#${user.adminIndex}` : ''}`
      : user?.unit
      ? `${user.unit.unitCode} - ${user.unit.name}`
      : 'Unit User';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 group">
          <AimLogo size="xs" subtitle="Govt. Reg No: WYD/176/2026" />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-md hover:bg-slate-900"
          title="Open Public Website"
        >
          <span>Public Site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{user.name}</span>
              <span className="text-[10px] font-medium text-rose-400">{roleLabel}</span>
            </div>

            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="h-4 w-4" />
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-800 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm shadow-rose-900/40"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
