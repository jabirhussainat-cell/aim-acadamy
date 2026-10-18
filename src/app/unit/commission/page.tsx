'use client';

import React, { useEffect, useState } from 'react';
import { Percent, CreditCard, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface CommissionData {
  totals: {
    gross: number;
    commission: number;
  };
  ledger: Array<{
    _id: string;
    date: string;
    grossAmount: number;
    commissionRate: number;
    commissionEarned: number;
    status: string;
    notes?: string;
    testEventId?: {
      name: string;
      code: string;
    };
  }>;
}

export default function UnitCommissionPage() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommission() {
      try {
        const res = await fetch('/api/finance');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load commission data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCommission();
  }, []);

  const totals = data?.totals || { gross: 0, commission: 0 };
  const ledger = data?.ledger || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Unit Commission & Earnings Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed ledger of 10% unit commission accrued on candidate test registrations.
        </p>
      </div>

      {/* Accounting Notice */}
      <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/20 text-xs text-amber-300 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold block">Accounting Notice:</span>
          <span className="text-[11px] text-slate-300 leading-relaxed block mt-0.5">
            Unit commission represents earnings accrued on confirmed test registrations.
            Amounts are displayed as accrued/earned and recorded in the official organizational ledger.
          </span>
        </div>
      </div>

      {/* Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Total Amount Paid by Unit</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            ₹{totals.gross.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total registration fees submitted</p>
        </div>

        <div className="p-5 rounded-xl border border-amber-900/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Total Commission Earned (Accrued)</span>
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-400">
            ₹{totals.commission.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">10% standard unit revenue earned</p>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Examination Event</th>
                <th className="py-3 px-4">Batch Gross Paid</th>
                <th className="py-3 px-4">Commission Rate</th>
                <th className="py-3 px-4">Commission Earned</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Loading commission ledger...
                  </td>
                </tr>
              ) : ledger.length > 0 ? (
                ledger.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-900/80 transition">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(l.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {l.testEventId?.name || '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      ₹{l.grossAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{l.commissionRate}%</td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      ₹{l.commissionEarned.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                      {l.notes || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      title="No commission records yet"
                      description="Commission earnings will record automatically upon completing paid candidate test batches."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
