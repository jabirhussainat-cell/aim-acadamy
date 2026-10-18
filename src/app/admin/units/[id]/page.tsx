'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  Percent,
  CalendarCheck,
  Phone,
  Mail,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { StatusBadge, Badge } from '@/components/Badge';

interface UnitDetails {
  unit: {
    _id: string;
    unitCode: string;
    name: string;
    headPerson: string;
    contactNumber: string;
    email: string;
    address: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    disciplinesOffered: string[];
    status: string;
    registrationDate: string;
  };
  metrics: {
    totalStudents: number;
    activeStudents: number;
    totalBatches: number;
    totalGrossPaid: number;
    totalCommission: number;
  };
  recentBatches: Array<{
    _id: string;
    batchNumber: string;
    testEventId: { name: string; code: string; testDate: string };
    studentCount: number;
    grossAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
}

export default function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<UnitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  async function loadUnit() {
    try {
      const res = await fetch(`/api/units/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load unit details:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnit();
  }, [id]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword) return;

    try {
      const res = await fetch(`/api/units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setPasswordStatus('Password updated successfully');
        setNewPassword('');
        setTimeout(() => setPasswordStatus(null), 3000);
      }
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  }

  async function handleToggleStatus() {
    if (!data?.unit) return;
    const targetStatus = data.unit.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        loadUnit();
      }
    } catch (err) {
      console.error('Failed to toggle unit status:', err);
    } finally {
      setStatusLoading(false);
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

  if (!data?.unit) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">Unit not found.</p>
        <Link href="/admin/units" className="mt-4 inline-block text-xs text-rose-400">
          ← Back to Units
        </Link>
      </div>
    );
  }

  const { unit, metrics, recentBatches } = data;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/units"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold uppercase tracking-wider text-white">
                {unit.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900/50">
                {unit.unitCode}
              </span>
              <StatusBadge status={unit.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Head: {unit.headPerson} • Registered on {new Date(unit.registrationDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
              unit.status === 'ACTIVE'
                ? 'bg-rose-950/40 text-rose-300 border-rose-900/50 hover:bg-rose-900/60'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/60'
            }`}
          >
            {unit.status === 'ACTIVE' ? 'Deactivate Unit' : 'Activate Unit'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Active Students
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {metrics.activeStudents}
          </span>
          <span className="text-[10px] text-slate-400">{metrics.totalStudents} total registered</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Test Batches
          </span>
          <span className="text-2xl font-bold text-sky-400 mt-1 block">
            {metrics.totalBatches}
          </span>
          <span className="text-[10px] text-slate-400">Enrolled test batches</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Gross Payments
          </span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            ₹{metrics.totalGrossPaid.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">Total fees paid</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Accrued Commission
          </span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            ₹{metrics.totalCommission.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">10% unit earnings</span>
        </div>
      </div>

      {/* Unit Profile & Account Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-rose-500" />
              <span>Unit Contact & Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Number:</span>
                <span className="font-semibold text-white">{unit.contactNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Official Email:</span>
                <span className="font-semibold text-white">{unit.email}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Address:</span>
                <span className="font-semibold text-white">
                  {unit.address}, {unit.city}, {unit.district}, {unit.state} - {unit.pincode}
                </span>
              </div>
              <div className="sm:col-span-2 pt-2">
                <span className="text-slate-400 block text-[11px] mb-1.5">Disciplines Offered:</span>
                <div className="flex flex-wrap gap-1.5">
                  {unit.disciplinesOffered.map((d) => (
                    <Badge key={d} variant="outline">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Batches by this Unit */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-sky-500" />
              <span>Test Registration Batches</span>
            </h3>

            {recentBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2">Batch No</th>
                      <th className="py-2">Test Name</th>
                      <th className="py-2">Students</th>
                      <th className="py-2">Gross Amount</th>
                      <th className="py-2">Payment Status</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentBatches.map((b) => (
                      <tr key={b._id}>
                        <td className="py-2.5 font-mono font-bold text-rose-400">{b.batchNumber}</td>
                        <td className="py-2.5 text-white font-medium">{b.testEventId?.name}</td>
                        <td className="py-2.5 text-slate-300">{b.studentCount}</td>
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
              <p className="text-xs text-slate-400 py-3">No test batches enrolled yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Account Management & Password Reset */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500" />
              <span>Reset Unit Account Password</span>
            </h3>

            {passwordStatus && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 text-xs mb-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{passwordStatus}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  New Password for {unit.email}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Quick link to view unit students */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-rose-500" />
              <span>Unit Students</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              View or filter all students registered under this unit.
            </p>
            <Link
              href={`/admin/students?unitId=${unit._id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              <span>View {metrics.totalStudents} Students</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
