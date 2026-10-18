'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Award,
  CalendarCheck,
  CreditCard,
  Percent,
  PlusCircle,
  ArrowUpRight,
  UserPlus,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StatusBadge, Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface UnitAnalytics {
  summary: {
    totalStudents: number;
    activeStudents: number;
    upcomingTestsAvailable: number;
    enrolledUpcomingStudents: number;
    completedTestsAttended: number;
    totalAmountPaid: number;
    totalCommissionEarned: number;
  };
  charts: {
    beltDistribution: Array<{ belt: string; count: number }>;
    resultsDistribution: Array<{ status: string; count: number }>;
  };
  recent: {
    payments: Array<{
      _id: string;
      receiptNumber: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
    batches: Array<{
      _id: string;
      batchNumber: string;
      studentCount: number;
      grossAmount: number;
      paymentStatus: string;
      testEventId: { name: string; code: string; testDate: string };
      createdAt: string;
    }>;
  };
}

const COLORS = ['#e11d48', '#d97706', '#0284c7', '#059669', '#7c3aed', '#db2777'];

export default function UnitDashboardPage() {
  const [data, setData] = useState<UnitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load unit analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-900 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalStudents: 0,
    activeStudents: 0,
    upcomingTestsAvailable: 0,
    enrolledUpcomingStudents: 0,
    completedTestsAttended: 0,
    totalAmountPaid: 0,
    totalCommissionEarned: 0,
  };

  const charts = data?.charts || { beltDistribution: [], resultsDistribution: [] };

  return (
    <div className="space-y-8">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Unit Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your dojo students, register for upcoming belt tests, and track accrued commission.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/unit/students/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <UserPlus className="h-3.5 w-3.5 text-rose-500" />
            <span>Add Student</span>
          </Link>

          <Link
            href="/unit/tests/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950 transition"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Register for Test</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unit Students"
          value={summary.totalStudents}
          subtitle={`${summary.activeStudents} active practitioners`}
          icon={Users}
          variant="rose"
        />
        <StatCard
          title="Open Tests Available"
          value={summary.upcomingTestsAvailable}
          subtitle="Examination opportunities"
          icon={CalendarCheck}
          variant="blue"
        />
        <StatCard
          title="Total Paid by Unit"
          value={`₹${summary.totalAmountPaid.toLocaleString('en-IN')}`}
          subtitle="Total examination fees paid"
          icon={CreditCard}
          variant="emerald"
        />
        <StatCard
          title="Commission Earned"
          value={`₹${summary.totalCommissionEarned.toLocaleString('en-IN')}`}
          subtitle="10% accrued earnings"
          icon={Percent}
          variant="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Belt Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Unit Belt Distribution
              </h3>
              <p className="text-xs text-slate-400">Current ranks of your students</p>
            </div>
            <Award className="h-4 w-4 text-rose-500" />
          </div>

          <div className="h-64 w-full">
            {charts.beltDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.beltDistribution}
                    dataKey="count"
                    nameKey="belt"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={(entry: any) => `${entry.belt || entry.name}: ${entry.count || entry.value}`}
                    labelLine={false}
                  >
                    {charts.beltDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Register students to view your unit's belt rank breakdown.
              </div>
            )}
          </div>
        </div>

        {/* Results Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Published Student Results
              </h3>
              <p className="text-xs text-slate-400">Performance of your students across examinations</p>
            </div>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="h-64 w-full">
            {charts.resultsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.resultsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Results will display here once published by the board.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Batches & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Recent Registration Batches
            </h3>
            <Link href="/unit/registrations" className="text-xs text-rose-400 hover:text-rose-300 flex items-center">
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {data?.recent?.batches && data.recent.batches.length > 0 ? (
            <div className="space-y-3">
              {data.recent.batches.map((b) => (
                <div key={b._id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white">{b.batchNumber}</span>
                    <StatusBadge status={b.paymentStatus} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {b.testEventId?.name} ({b.studentCount} candidates)
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">₹{b.grossAmount}</span>
                    <span>{new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No test batches enrolled"
              description="Enroll students into available tests to generate batches."
              actionText="Register for Test"
              actionHref="/unit/tests/register"
            />
          )}
        </div>

        {/* Recent Payment Receipts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Payment Receipts
            </h3>
            <Link href="/unit/payments" className="text-xs text-rose-400 hover:text-rose-300 flex items-center">
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {data?.recent?.payments && data.recent.payments.length > 0 ? (
            <div className="space-y-3">
              {data.recent.payments.map((p) => (
                <div key={p._id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white">{p.receiptNumber}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">₹{p.amount}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No payments made yet"
              description="Receipts for paid test batches will appear here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
