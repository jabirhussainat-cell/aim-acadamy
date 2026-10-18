'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  MapPin,
  Users,
  Award,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { StatusBadge, Badge } from '@/components/Badge';

interface TestDetails {
  testEvent: {
    _id: string;
    name: string;
    code: string;
    discipline: string;
    description: string;
    testDate: string;
    startTime?: string;
    endTime?: string;
    venue: string;
    examinerMaster: string;
    registrationOpenDate: string;
    registrationCloseDate: string;
    feePerStudent: number;
    status: string;
    instructions?: string;
    resultsPublished: boolean;
  };
  batches: Array<{
    _id: string;
    batchNumber: string;
    unitId: {
      _id: string;
      name: string;
      unitCode: string;
      headPerson: string;
      contactNumber: string;
    };
    studentCount: number;
    grossAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
  summary: {
    totalBatches: number;
    totalPaidStudents: number;
    totalGrossCollections: number;
  };
}

export default function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<TestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  async function loadTest() {
    try {
      const res = await fetch(`/api/tests/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setStatus(json.testEvent?.status || '');
      }
    } catch (err) {
      console.error('Failed to load test details:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTest();
  }, [id]);

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await fetch(`/api/tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        setUpdateMsg(`Event status updated to "${newStatus}"`);
        loadTest();
        setTimeout(() => setUpdateMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-900 rounded-lg"></div>
        <div className="h-64 bg-slate-900 rounded-xl"></div>
      </div>
    );
  }

  if (!data?.testEvent) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">Test event not found.</p>
        <Link href="/admin/tests" className="mt-4 inline-block text-xs text-rose-400">
          ← Back to Tests
        </Link>
      </div>
    );
  }

  const { testEvent, batches, summary } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tests"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold uppercase tracking-wider text-white">
                {testEvent.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900/50">
                {testEvent.code}
              </span>
              <StatusBadge status={testEvent.status} />
            </div>
            <p className="text-xs text-rose-400 font-semibold mt-0.5">
              {testEvent.discipline} • ₹{testEvent.feePerStudent} per candidate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/admin/tests/${testEvent._id}/results`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition"
          >
            <Award className="h-4 w-4" />
            <span>Manage Results & Belts</span>
          </Link>
        </div>
      </div>

      {updateMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Confirmed Candidates
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {summary.totalPaidStudents}
          </span>
          <span className="text-[10px] text-slate-400">Enrolled and paid students</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Participating Units
          </span>
          <span className="text-2xl font-bold text-sky-400 mt-1 block">
            {batches.length}
          </span>
          <span className="text-[10px] text-slate-400">Total batches submitted</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Total Collections
          </span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            ₹{summary.totalGrossCollections.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">Verified fees collected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Details & Participating Batches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-rose-500" />
              <span>Event Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Examination Date:</span>
                <span className="font-semibold text-white">
                  {new Date(testEvent.testDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Time Window:</span>
                <span className="font-semibold text-white">
                  {testEvent.startTime || '09:00 AM'} - {testEvent.endTime || '04:00 PM'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Venue:</span>
                <span className="font-semibold text-white">{testEvent.venue}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Examiner Master:</span>
                <span className="font-semibold text-white">{testEvent.examinerMaster}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registration Window:</span>
                <span className="font-semibold text-white">
                  {new Date(testEvent.registrationOpenDate).toLocaleDateString('en-IN')} to{' '}
                  {new Date(testEvent.registrationCloseDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Results Published:</span>
                <span className="font-semibold text-white">
                  {testEvent.resultsPublished ? 'Yes (Visible to Units)' : 'No (Pending Super Admin publication)'}
                </span>
              </div>
              {testEvent.instructions && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Instructions:</span>
                  <p className="text-slate-300 italic">{testEvent.instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Participating Units & Batches */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-sky-500" />
              <span>Unit Registration Batches</span>
            </h3>

            {batches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2">Batch No</th>
                      <th className="py-2">Unit</th>
                      <th className="py-2">Students</th>
                      <th className="py-2">Gross Fee</th>
                      <th className="py-2">Payment Status</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {batches.map((b) => (
                      <tr key={b._id}>
                        <td className="py-2.5 font-mono font-bold text-rose-400">{b.batchNumber}</td>
                        <td className="py-2.5 text-white font-medium">
                          {b.unitId?.name} ({b.unitId?.unitCode})
                        </td>
                        <td className="py-2.5 text-slate-300 font-semibold">{b.studentCount}</td>
                        <td className="py-2.5 text-emerald-400 font-semibold">₹{b.grossAmount}</td>
                        <td className="py-2.5">
                          <StatusBadge status={b.paymentStatus} />
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {new Date(b.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">No unit registration batches submitted yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Status Controls */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Event Status Management</span>
            </h3>

            <div className="space-y-2">
              {[
                { label: 'Open for Registration', value: 'Registration Open', color: 'hover:bg-emerald-950/60 text-emerald-300 border-emerald-900/50' },
                { label: 'Close Registration', value: 'Registration Closed', color: 'hover:bg-amber-950/60 text-amber-300 border-amber-900/50' },
                { label: 'Mark Test Completed', value: 'Completed', color: 'hover:bg-blue-950/60 text-blue-300 border-blue-900/50' },
                { label: 'Set to Upcoming', value: 'Upcoming', color: 'hover:bg-slate-800 text-slate-300 border-slate-700' },
                { label: 'Cancel Event', value: 'Cancelled', color: 'hover:bg-rose-950/60 text-rose-300 border-rose-900/50' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={updating || testEvent.status === opt.value}
                  className={`w-full py-2 px-3 text-left rounded-lg text-xs font-semibold border transition ${
                    opt.color
                  } ${testEvent.status === opt.value ? 'bg-slate-800/90 ring-1 ring-white/20' : 'bg-slate-950'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    {testEvent.status === opt.value && (
                      <span className="text-[10px] text-rose-400 uppercase">Active</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
