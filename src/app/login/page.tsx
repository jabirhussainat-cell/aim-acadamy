'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AimLogo } from '@/components/AimLogo';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [activeTab, setActiveTab] = useState<'SUPER_ADMIN' | 'UNIT'>('SUPER_ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Check role matches tab or route appropriately
      if (data.user.role === 'SUPER_ADMIN') {
        router.push(redirectPath || '/admin');
      } else {
        router.push(redirectPath || '/unit');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: 'SUPER_ADMIN' | 'UNIT') {
    setActiveTab(tab);
    setError(null);
    setEmail('');
    setPassword('');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background martial arts decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-950/20 via-slate-950/50 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-block hover:scale-105 transition-transform">
          <AimLogo size="xl" showText={false} />
        </Link>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-white uppercase">
          AIM ACADEMY
        </h2>
        <p className="mt-1 text-center text-xs tracking-wider uppercase text-amber-400 font-bold">
          Govt. Reg No: WYD/176/2026
        </p>
        <p className="mt-0.5 text-center text-[11px] tracking-wider uppercase text-slate-400">
          Management & Test Registration Platform
        </p>

        {/* Tab switch */}
        <div className="mt-6 flex rounded-lg bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => handleTabChange('SUPER_ADMIN')}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
              activeTab === 'SUPER_ADMIN'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Super Admin Portal
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('UNIT')}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
              activeTab === 'UNIT'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unit User Portal
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800/80 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 backdrop-blur">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                {activeTab === 'SUPER_ADMIN' ? 'Super Admin Email' : 'Unit Account Email'}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === 'SUPER_ADMIN'
                      ? 'superadmin1@aimacademy.org'
                      : 'unit@aimacademy.org'
                  }
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-950 hover:bg-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to {activeTab === 'SUPER_ADMIN' ? 'Super Admin' : 'Unit'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {activeTab === 'SUPER_ADMIN' && (
            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">Super Admin Access:</p>
              <p>
                Initial 4 Super Admin accounts are bootstrapped via secure environment variables.
                Run <code className="bg-slate-950 text-rose-400 px-1 py-0.5 rounded">npm run seed</code> to initialize or update.
              </p>
            </div>
          )}

          {activeTab === 'UNIT' && (
            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">Unit Account Note:</p>
              <p>
                Unit login credentials are created and managed by authorized Super Admins under the
                Units management panel.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-rose-400 transition"
          >
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Loading authentication portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
