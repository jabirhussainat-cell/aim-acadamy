'use client';

import React, { useEffect, useState } from 'react';
import { Award, Printer, Search, Download } from 'lucide-react';
import { Badge, StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface ResultItem {
  _id: string;
  currentBelt: string;
  targetBelt: string;
  resultStatus: string;
  marks?: number;
  examinerComments?: string;
  examinerMaster?: string;
  beltAwarded?: string;
  publishedAt?: string;
  studentId: {
    _id: string;
    fullName: string;
    registrationNumber: string;
  };
  testEventId: {
    _id: string;
    name: string;
    code: string;
    testDate: string;
    discipline: string;
  };
}

export default function UnitResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadPublishedResults() {
      try {
        // Fetch all open/completed tests then results
        const testsRes = await fetch('/api/tests');
        if (testsRes.ok) {
          const tJson = await testsRes.json();
          const allRes: ResultItem[] = [];

          for (const t of tJson.tests || []) {
            const rRes = await fetch(`/api/tests/${t._id}/results`);
            if (rRes.ok) {
              const rJson = await rRes.json();
              if (rJson.results) {
                allRes.push(...rJson.results);
              }
            }
          }
          setResults(allRes);
        }
      } catch (err) {
        console.error('Failed to load published results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublishedResults();
  }, []);

  const filteredResults = results.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.studentId?.fullName.toLowerCase().includes(q) ||
      r.studentId?.registrationNumber.toLowerCase().includes(q) ||
      r.testEventId?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Published Candidate Results
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official grading results published by the central examination board for your unit's students.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
        >
          <Printer className="h-3.5 w-3.5 text-slate-400" />
          <span>Print Result Sheets</span>
        </button>
      </div>

      {/* Printable Sheet Header */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h2 className="text-2xl font-black uppercase tracking-wider">AIM MARTIAL ARTS ACADEMY</h2>
        <p className="text-xs uppercase tracking-widest text-slate-700">Official Unit Student Examination Results</p>
      </div>

      {/* Search Bar */}
      <div className="relative no-print">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, registration number, or test..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:border-rose-500 focus:outline-hidden"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 printable-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Reg No</th>
                <th className="py-3 px-4">Examination Event</th>
                <th className="py-3 px-4">Attempted Belt</th>
                <th className="py-3 px-4">Result Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Awarded Rank</th>
                <th className="py-3 px-4">Examiner Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    Loading examination results...
                  </td>
                </tr>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-900/80 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      {r.studentId?.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      {r.studentId?.registrationNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {r.testEventId?.name} ({r.testEventId?.code})
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {r.targetBelt}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.resultStatus} />
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {r.marks !== undefined && r.marks !== null ? `${r.marks}/100` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {r.beltAwarded ? (
                        <Badge variant="belt">{r.beltAwarded}</Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                      {r.examinerComments || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      title="No published results found"
                      description="Examination results will appear here once finalized and published by the grading board."
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
