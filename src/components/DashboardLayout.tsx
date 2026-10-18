'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'SUPER_ADMIN' | 'UNIT';
}

interface UserProfile {
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'UNIT';
  adminIndex?: number;
  unit?: {
    name: string;
    unitCode: string;
  } | null;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        user={user}
        onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
        isMobileOpen={mobileMenuOpen}
      />

      <div className="flex flex-1">
        <Sidebar
          role={role}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
