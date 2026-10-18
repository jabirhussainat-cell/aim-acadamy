'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  Building2,
  CalendarCheck,
  Eye,
  CreditCard,
} from 'lucide-react';
import { StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface BatchItem {
  _id: string;
  batchNumber: string;
  testEventId: {
    _id: string;
    name: string;
    code: string;
    testDate: string;
    discipline: string;
  };
  unitId: {
    _id: string;
    name: string;
    unitCode: string;
    city: string;
  };
  studentCount: number;
  feePerStudent: number;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  organizationShare: number;
  paymentStatus: string;
  createdAt: string;
  paymentId?: {
    receiptNumber: string;
    paidAt: string;
  };
}

export default function AdminTestRegistrationsPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await fetch('/api/registration-batches');
        if (res.ok) {
          const json = await res.json();
          setBatches(json.batches || []);
        }
      } catch (err) {
        console.error('Failed to load batches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            All Test Registration Batches
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organization-wide view of unit examination enrollment batches and payment statuses.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Test Event</th>
                <th className="py-3 px-4">Unit Name / Code</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4">Gross Amount</th>
                <th className="py-3 px-4">Unit Commission</th>
                <th className="py-3 px-4">Org Share</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading registration batches...
                  </td>
                </tr>
              ) : batches.length > 0 ? (
                batches.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      {b.batchNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {b.testEventId?.name} ({b.testEventId?.code})
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {b.unitId?.name} <span className="text-slate-400">({b.unitId?.unitCode})</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{b.studentCount}</td>
                    <td className="py-3 px-4 font-semibold text-white">₹{b.grossAmount}</td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">
                      ₹{b.commissionAmount} ({b.commissionRate}%)
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      ₹{b.organizationShare}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.paymentStatus} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12">
                    <EmptyState
                      title="No registration batches submitted"
                      description="Batches registered by units will appear here once submitted."
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
