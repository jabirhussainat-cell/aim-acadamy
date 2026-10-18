'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CalendarPlus,
  Search,
  Award,
  Eye,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { Badge, StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface TestItem {
  _id: string;
  name: string;
  code: string;
  discipline: string;
  testDate: string;
  venue: string;
  examinerMaster: string;
  feePerStudent: number;
  status: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  totalRegistered: number;
  confirmedRegistered: number;
  isRegistrationWindowActive: boolean;
  resultsPublished: boolean;
}

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadTests() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/tests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTests();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Belt Testing & Examination Events
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create examinations, configure deadlines, manage registrations, and publish grading results.
          </p>
        </div>

        <Link
          href="/admin/tests/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950 transition"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          <span>Create Test Event</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-hidden"
          >
            <option value="all">All Events</option>
            <option value="Registration Open">Registration Open</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Registration Closed">Registration Closed</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Test Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse"></div>
          ))
        ) : tests.length > 0 ? (
          tests.map((test) => (
            <div
              key={test._id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900/50">
                    {test.code}
                  </span>
                  <StatusBadge status={test.status} />
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{test.name}</h3>
                <p className="text-xs text-rose-400 font-semibold mb-3">{test.discipline}</p>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Exam Date: {new Date(test.testDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{test.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Examiner: {test.examinerMaster}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Fee per Student
                    </span>
                    <span className="font-bold text-white">₹{test.feePerStudent}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Registered
                    </span>
                    <span className="font-bold text-emerald-400">{test.confirmedRegistered}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-2">
                <Link
                  href={`/admin/tests/${test._id}`}
                  className="flex-1 py-1.5 px-3 text-center text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
                >
                  Manage Details
                </Link>
                <Link
                  href={`/admin/tests/${test._id}/results`}
                  className="flex-1 py-1.5 px-3 text-center text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm shadow-rose-950 flex items-center justify-center gap-1.5"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Results</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No test events scheduled"
              description="Create a belt grading test event to allow affiliated units to register students."
              actionText="Create Test Event"
              actionHref="/admin/tests/create"
            />
          </div>
        )}
      </div>
    </div>
  );
}
