'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Percent,
  TrendingUp,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface FinanceData {
  totals: {
    gross: number;
    commission: number;
    orgShare: number;
  };
  payments: Array<{
    _id: string;
    receiptNumber: string;
    razorpayPaymentId?: string;
    amount: number;
    status: string;
    paymentMethod: string;
    paidAt?: string;
    createdAt: string;
    unitId: {
      name: string;
      unitCode: string;
    };
  }>;
  ledger: Array<{
    _id: string;
    date: string;
    grossAmount: number;
    commissionRate: number;
    commissionEarned: number;
    organizationShare: number;
    status: string;
    notes?: string;
    unitId: {
      name: string;
      unitCode: string;
    };
    testEventId?: {
      name: string;
      code: string;
    };
  }>;
  unitBreakdown: Array<{
    unitId: string;
    unitName: string;
    unitCode: string;
    totalGross: number;
    commissionEarned: number;
    orgShare: number;
    batchesCount: number;
  }>;
}

export default function AdminFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'UNITS' | 'LEDGER'>('TRANSACTIONS');

  useEffect(() => {
    async function loadFinance() {
      try {
        const res = await fetch('/api/finance');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load finance data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  const totals = data?.totals || { gross: 0, commission: 0, orgShare: 0 };
  const payments = data?.payments || [];
  const ledger = data?.ledger || [];
  const unitBreakdown = data?.unitBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Payments & Commission Accounting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time accounting of test registration fees, unit commissions, and organization revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/export?type=payments"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export Payments</span>
          </a>
          <a
            href="/api/export?type=commissions"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-amber-500" />
            <span>Export Commissions</span>
          </a>
        </div>
      </div>

      {/* Accounting Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-rose-900/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/20 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Gross Collections</span>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            ₹{totals.gross.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total fees paid across all tests</p>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Unit Commissions Accrued</span>
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-400">
            ₹{totals.commission.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Earned by affiliated units (10% snapshot)
          </p>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Organization Net Share</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-400">
            ₹{totals.orgShare.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Headquarters retained revenue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Transactions ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('UNITS')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'UNITS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Revenue by Unit ({unitBreakdown.length})
        </button>
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'LEDGER'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Commission Ledger ({ledger.length})
        </button>
      </div>

      {/* Tab 1: Payments Transactions */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Gateway Payment ID</th>
                  <th className="py-3 px-4">Unit Name / Code</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-900/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {p.razorpayPaymentId || '—'}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {p.unitId?.name} <span className="text-slate-400">({p.unitId?.unitCode})</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{p.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(p.paidAt || p.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <EmptyState
                        title="No payment transactions"
                        description="Completed test registration payments will show here."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Revenue by Unit */}
      {activeTab === 'UNITS' && (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Unit Code</th>
                  <th className="py-3 px-4">Unit Name</th>
                  <th className="py-3 px-4">Batches</th>
                  <th className="py-3 px-4">Gross Collected</th>
                  <th className="py-3 px-4">Unit Commission Earned</th>
                  <th className="py-3 px-4">Org Net Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {unitBreakdown.length > 0 ? (
                  unitBreakdown.map((u) => (
                    <tr key={u.unitId} className="hover:bg-slate-900/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">
                        {u.unitCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <Link href={`/admin/units/${u.unitId}`} className="hover:underline">
                          {u.unitName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{u.batchesCount}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        ₹{u.totalGross.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-amber-400 font-bold">
                        ₹{u.commissionEarned.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        ₹{u.orgShare.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <EmptyState
                        title="No unit revenue records"
                        description="Unit performance data will aggregate here after payments."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Commission Ledger */}
      {activeTab === 'LEDGER' && (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Test Event</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Commission Rate</th>
                  <th className="py-3 px-4">Earned Commission</th>
                  <th className="py-3 px-4">Org Share</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledger.length > 0 ? (
                  ledger.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-900/80 transition">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(l.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {l.unitId?.name} ({l.unitId?.unitCode})
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {l.testEventId?.name || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        ₹{l.grossAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{l.commissionRate}%</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">
                        ₹{l.commissionEarned.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        ₹{l.organizationShare.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <EmptyState
                        title="No ledger entries"
                        description="Accrued commission ledger records will appear here."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
