'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  CalendarCheck,
  CreditCard,
  Percent,
  TrendingUp,
  UserPlus,
  PlusCircle,
  CalendarPlus,
  ArrowUpRight,
  ShieldAlert,
  Award,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Badge, StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalStudents: number;
    activeStudents: number;
    totalUnits: number;
    activeUnits: number;
    upcomingTests: number;
    completedTests: number;
    totalConfirmedRegistrations: number;
    totalGross: number;
    totalCommission: number;
    totalOrgShare: number;
    pendingBatchesCount: number;
  };
  charts: {
    studentGrowth: Array<{ label: string; students: number }>;
    studentsByUnit: Array<{ name: string; code: string; count: number }>;
    beltDistribution: Array<{ belt: string; count: number }>;
    resultsDistribution: Array<{ status: string; count: number }>;
    monthlyRevenue: Array<{ month: string; gross: number; commission: number; orgShare: number }>;
  };
  recent: {
    tests: Array<{
      _id: string;
      name: string;
      code: string;
      discipline: string;
      testDate: string;
      status: string;
    }>;
    batches: Array<{
      _id: string;
      batchNumber: string;
      unitId: { name: string; unitCode: string };
      testEventId: { name: string; code: string };
      studentCount: number;
      grossAmount: number;
      paymentStatus: string;
      createdAt: string;
    }>;
    payments: Array<{
      _id: string;
      receiptNumber: string;
      amount: number;
      status: string;
      createdAt: string;
      unitId: { name: string; unitCode: string };
    }>;
  };
}

const COLORS = ['#e11d48', '#d97706', '#0284c7', '#059669', '#7c3aed', '#db2777', '#ca8a04', '#64748b'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-900 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/60 rounded-xl border border-slate-800"></div>
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalStudents: 0,
    activeStudents: 0,
    totalUnits: 0,
    activeUnits: 0,
    upcomingTests: 0,
    completedTests: 0,
    totalConfirmedRegistrations: 0,
    totalGross: 0,
    totalCommission: 0,
    totalOrgShare: 0,
    pendingBatchesCount: 0,
  };

  const charts = data?.charts || {
    studentGrowth: [],
    studentsByUnit: [],
    beltDistribution: [],
    resultsDistribution: [],
    monthlyRevenue: [],
  };

  return (
    <div className="space-y-8">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Super Admin Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized monitoring of units, students, examinations, collections, and commission ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/students/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Student</span>
          </Link>
          <Link
            href="/admin/units/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-rose-500" />
            <span>Add Unit</span>
          </Link>
          <Link
            href="/admin/tests/create"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-amber-500" />
            <span>Create Test</span>
          </Link>
          <Link
            href="/admin/affiliation-requests"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 transition shadow-sm"
          >
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Affiliation Requests</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={summary.totalStudents}
          subtitle={`${summary.activeStudents} active practitioners`}
          icon={Users}
          variant="rose"
        />
        <StatCard
          title="Affiliated Units"
          value={summary.totalUnits}
          subtitle={`${summary.activeUnits} active training units`}
          icon={Building2}
          variant="blue"
        />
        <StatCard
          title="Upcoming Belt Tests"
          value={summary.upcomingTests}
          subtitle={`${summary.completedTests} tests completed to date`}
          icon={CalendarCheck}
          variant="amber"
        />
        <StatCard
          title="Confirmed Registrations"
          value={summary.totalConfirmedRegistrations}
          subtitle="Across all grading tests"
          icon={Award}
          variant="emerald"
        />
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-rose-900/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/20 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Gross Collections</span>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            ₹{summary.totalGross.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total payments collected from unit registrations</p>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Unit Commissions Accrued</span>
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-400">
            ₹{summary.totalCommission.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">10% standard commission accrued to affiliated units</p>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Organization Net Share</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-400">
            ₹{summary.totalOrgShare.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Net revenue attributable to academy headquarters</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Student Registration Growth */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Student Registration Growth
              </h3>
              <p className="text-xs text-slate-400">Monthly new student admissions</p>
            </div>
            <Users className="h-4 w-4 text-rose-500" />
          </div>

          <div className="h-64 w-full">
            {charts.studentGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.studentGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                  />
                  <Bar dataKey="students" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly student data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Belt Rank Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Belt & Rank Distribution
              </h3>
              <p className="text-xs text-slate-400">Active students by current belt</p>
            </div>
            <Award className="h-4 w-4 text-amber-500" />
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
                No belt distribution records available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Active Students by Unit */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Units by Student Count
              </h3>
              <p className="text-xs text-slate-400">Active practitioners per affiliated dojo</p>
            </div>
            <Building2 className="h-4 w-4 text-sky-500" />
          </div>

          <div className="h-64 w-full">
            {charts.studentsByUnit.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={charts.studentsByUnit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="code" stroke="#64748b" fontSize={11} width={70} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No units with active students found yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Examination Results Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Examination Results Breakdown
              </h3>
              <p className="text-xs text-slate-400">Pass, fail, and attendance stats across tests</p>
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
                Results will appear here once examinations are conducted and published.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sections: Tests, Registrations, Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming / Recent Tests */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Test Events
            </h3>
            <Link href="/admin/tests" className="text-xs text-rose-400 hover:text-rose-300 flex items-center">
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {data?.recent?.tests && data.recent.tests.length > 0 ? (
            <div className="space-y-3">
              {data.recent.tests.map((t) => (
                <div key={t._id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {t.name}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t.discipline}</span>
                    <span>{new Date(t.testDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tests scheduled"
              description="Create the first martial arts belt testing event."
              actionText="Create Test"
              actionHref="/admin/tests/create"
            />
          )}
        </div>

        {/* Recent Registration Batches */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Recent Unit Batches
            </h3>
            <Link href="/admin/tests/registrations" className="text-xs text-rose-400 hover:text-rose-300 flex items-center">
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
                    {b.unitId?.name} ({b.studentCount} students)
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>₹{b.grossAmount}</span>
                    <span>{new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No registrations yet"
              description="Batches enrolled by units will appear here."
            />
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Recent Transactions
            </h3>
            <Link href="/admin/finance" className="text-xs text-rose-400 hover:text-rose-300 flex items-center">
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
                  <div className="mt-1 text-[11px] text-slate-400">{p.unitId?.name}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400">₹{p.amount}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No payment transactions"
              description="Transactions recorded via payment checkout will show here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
