'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Users,
  Award,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Badge, StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface TestItem {
  _id: string;
  name: string;
  code: string;
  discipline: string;
  testDate: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  examinerMaster: string;
  feePerStudent: number;
  status: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  isRegistrationWindowActive: boolean;
}

export default function UnitAvailableTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await fetch('/api/tests');
        if (res.ok) {
          const json = await res.json();
          setTests(json.tests || []);
        }
      } catch (err) {
        console.error('Failed to load tests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Available Belt Testing Examinations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Open testing events where you can enroll your unit students for belt grading.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse"></div>
          ))
        ) : tests.length > 0 ? (
          tests.map((test) => {
            const now = new Date();
            const isOpen =
              test.status === 'Registration Open' &&
              new Date(test.registrationCloseDate) >= now;

            return (
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
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>Exam: {new Date(test.testDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{test.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>Examiner: {test.examinerMaster}</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Deadline: {new Date(test.registrationCloseDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Fee per Candidate
                      </span>
                      <span className="font-bold text-white text-sm">₹{test.feePerStudent}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Unit Commission
                      </span>
                      <span className="font-bold text-amber-400 text-sm">10% Accrued</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800">
                  {isOpen ? (
                    <Link
                      href={`/unit/tests/register?testId=${test._id}`}
                      className="w-full py-2 px-3 text-center text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition flex items-center justify-center gap-1.5"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>Register Unit Candidates</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-3 text-center text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 cursor-not-allowed"
                    >
                      Registration Closed
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No upcoming tests available"
              description="New belt examinations scheduled by the central grading board will appear here."
            />
          </div>
        )}
      </div>
    </div>
  );
}
