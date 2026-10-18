'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AimLogo } from '@/components/AimLogo';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  CalendarCheck,
  CalendarPlus,
  CreditCard,
  Percent,
  Award,
  Globe,
  Settings,
  History,
  PlusCircle,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  role: 'SUPER_ADMIN' | 'UNIT';
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const superAdminLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    {
      label: 'Students',
      icon: Users,
      subItems: [
        { label: 'All Students', href: '/admin/students', icon: Users },
        { label: 'Add Student', href: '/admin/students/add', icon: UserPlus },
      ],
    },
    {
      label: 'Units',
      icon: Building2,
      subItems: [
        { label: 'All Units', href: '/admin/units', icon: Building2 },
        { label: 'Add Unit', href: '/admin/units/add', icon: PlusCircle },
        { label: 'Affiliation Requests', href: '/admin/affiliation-requests', icon: ClipboardList },
      ],
    },
    {
      label: 'Belt Tests',
      icon: CalendarCheck,
      subItems: [
        { label: 'All Test Events', href: '/admin/tests', icon: CalendarCheck },
        { label: 'Create Test', href: '/admin/tests/create', icon: CalendarPlus },
        { label: 'Test Registrations', href: '/admin/tests/registrations', icon: ClipboardList },
      ],
    },
    { label: 'Payments & Finance', href: '/admin/finance', icon: CreditCard },
    { label: 'Website CMS & Masters', href: '/admin/cms', icon: Globe },
    { label: 'Pricing & Commission', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: History },
  ];

  const unitLinks = [
    { label: 'Unit Dashboard', href: '/unit', icon: LayoutDashboard },
    {
      label: 'My Students',
      icon: Users,
      subItems: [
        { label: 'All Students', href: '/unit/students', icon: Users },
        { label: 'Add Student', href: '/unit/students/add', icon: UserPlus },
      ],
    },
    {
      label: 'Belt Testing',
      icon: CalendarCheck,
      subItems: [
        { label: 'Available Tests', href: '/unit/tests', icon: CalendarCheck },
        { label: 'Register Students', href: '/unit/tests/register', icon: Award },
        { label: 'Batches & History', href: '/unit/registrations', icon: ClipboardList },
      ],
    },
    { label: 'Payment History', href: '/unit/payments', icon: CreditCard },
    { label: 'Unit Commission', href: '/unit/commission', icon: Percent },
    { label: 'Student Results', href: '/unit/results', icon: Award },
    { label: 'Unit Profile', href: '/unit/profile', icon: Building2 },
  ];

  const links = role === 'SUPER_ADMIN' ? superAdminLinks : unitLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-950/95 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto p-4`}
      >
        <div className="space-y-6">
          <div className="px-2 pt-1 pb-2 border-b border-slate-900">
            <AimLogo size="sm" subtitle="Govt. Reg: WYD/176/2026" />
            <div className="mt-3 inline-block px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              {role === 'SUPER_ADMIN' ? 'SUPER ADMIN PORTAL' : 'UNIT MANAGEMENT'}
            </div>
          </div>

          <nav className="space-y-1.5">
            {links.map((item) => {
              if (item.subItems) {
                return (
                  <div key={item.label} className="pt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400">
                      <item.icon className="h-4 w-4 text-rose-500/80" />
                      <span>{item.label}</span>
                    </div>
                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-800 pl-3">
                      {item.subItems.map((sub) => {
                        const active = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={onClose}
                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                              active
                                ? 'bg-rose-600 text-white font-semibold shadow-sm shadow-rose-950'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                          >
                            <sub.icon className="h-3.5 w-3.5" />
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'bg-rose-600 text-white font-semibold shadow-sm shadow-rose-950'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 px-2 text-[11px] text-slate-400">
          <p>AIM Martial Arts Academy</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Contact: 8943839386</p>
        </div>
      </aside>
    </>
  );
}
