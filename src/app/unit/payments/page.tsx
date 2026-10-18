'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, Printer, Download } from 'lucide-react';
import { StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface PaymentItem {
  _id: string;
  receiptNumber: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
  batchId?: {
    batchNumber: string;
    studentCount: number;
    testEventId?: {
      name: string;
      code: string;
    };
  };
}

export default function UnitPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch('/api/finance');
        if (res.ok) {
          const json = await res.json();
          setPayments(json.payments || []);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Unit Payment History & Receipts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction records and official payment receipts for test registrations.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
        >
          <Printer className="h-3.5 w-3.5 text-slate-400" />
          <span>Print Receipts</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 printable-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Gateway Payment ID</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Loading payments...
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
                      {p.batchId?.batchNumber || '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{p.paymentMethod || 'Online'}</td>
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
                      title="No payment records found"
                      description="Receipts will be generated here upon completing test batch checkouts."
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
