'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Printer,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { Badge, StatusBadge } from '@/components/Badge';

interface TestResultItem {
  _id: string;
  currentBelt: string;
  targetBelt: string;
  resultStatus: 'Pass' | 'Fail' | 'Absent' | 'Pending';
  marks?: number;
  examinerComments?: string;
  examinerMaster?: string;
  beltAwarded?: string;
  isPublished: boolean;
  beltUpdatedInProfile: boolean;
  studentId: {
    _id: string;
    fullName: string;
    registrationNumber: string;
    gender: string;
  };
  unitId: {
    _id: string;
    name: string;
    unitCode: string;
    headPerson: string;
    city: string;
  };
}

interface ResultsResponse {
  testEvent: {
    _id: string;
    name: string;
    code: string;
    discipline: string;
    testDate: string;
    venue: string;
    examinerMaster: string;
    resultsPublished: boolean;
    resultsPublishedAt?: string;
  };
  results: TestResultItem[];
}

export default function TestResultsManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<ResultsResponse | null>(null);
  const [resultsList, setResultsList] = useState<TestResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadResults() {
    try {
      const res = await fetch(`/api/tests/${id}/results`);
      if (res.ok) {
        const json: ResultsResponse = await res.json();
        setData(json);
        setResultsList(json.results || []);
      }
    } catch (err) {
      console.error('Failed to load test results:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, [id]);

  function handleResultChange(
    resultId: string,
    field: keyof TestResultItem,
    value: unknown
  ) {
    setResultsList((prev) =>
      prev.map((r) => {
        if (r._id === resultId) {
          const updated = { ...r, [field]: value };
          // If status set to Pass, default beltAwarded to targetBelt if not already set
          if (field === 'resultStatus' && value === 'Pass' && !updated.beltAwarded) {
            updated.beltAwarded = updated.targetBelt;
          }
          return updated;
        }
        return r;
      })
    );
  }

  async function handleSaveResults() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = resultsList.map((r) => ({
        resultId: r._id,
        resultStatus: r.resultStatus,
        marks: r.marks,
        examinerComments: r.examinerComments,
        examinerMaster: r.examinerMaster || data?.testEvent.examinerMaster,
        beltAwarded: r.beltAwarded || r.targetBelt,
      }));

      const res = await fetch(`/api/tests/${id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_RESULTS', results: payload }),
      });

      if (res.ok) {
        setMessage('Results saved successfully!');
        loadResults();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to save results');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save error');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(publish: boolean) {
    if (
      publish &&
      !confirm('Are you sure you want to publish these examination results? They will become immediately visible to units.')
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tests/${id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: publish ? 'PUBLISH_RESULTS' : 'UNPUBLISH_RESULTS' }),
      });

      if (res.ok) {
        setMessage(publish ? 'Results published to Units!' : 'Results unpublished.');
        loadResults();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyBeltProgression() {
    const unpromotedPassCount = resultsList.filter(
      (r) => r.resultStatus === 'Pass' && !r.beltUpdatedInProfile
    ).length;

    if (unpromotedPassCount === 0) {
      alert('All passing candidates have already had their belt rank promoted in their profiles.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to apply belt rank progression to ${unpromotedPassCount} passing candidate(s)? This will update their current belt in their profile and add an entry to their belt history.`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tests/${id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_BELT_PROGRESSION' }),
      });

      const resData = await res.json();
      if (res.ok) {
        setMessage(resData.message || 'Belt progression applied successfully!');
        loadResults();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Progression error:', err);
    } finally {
      setSaving(false);
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

  const { testEvent } = data;
  const passCount = resultsList.filter((r) => r.resultStatus === 'Pass').length;
  const failCount = resultsList.filter((r) => r.resultStatus === 'Fail').length;
  const pendingCount = resultsList.filter((r) => r.resultStatus === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/tests/${testEvent._id}`}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold uppercase tracking-wider text-white">
                Results & Belt Progression
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900/50">
                {testEvent.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {testEvent.name} • Examiner: {testEvent.examinerMaster}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>Print Sheet</span>
          </button>

          <button
            onClick={handleSaveResults}
            disabled={saving || resultsList.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Marks</span>
          </button>

          <button
            onClick={() => handleTogglePublish(!testEvent.resultsPublished)}
            disabled={saving || resultsList.length === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition disabled:opacity-50 ${
              testEvent.resultsPublished
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{testEvent.resultsPublished ? 'Unpublish' : 'Publish Results'}</span>
          </button>

          <button
            onClick={handleApplyBeltProgression}
            disabled={saving || passCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950 transition disabled:opacity-50"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Promote Passing Belts</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Printable Sheet Header */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h2 className="text-2xl font-black uppercase tracking-wider">AIM MARTIAL ARTS ACADEMY</h2>
        <h3 className="text-base font-bold uppercase mt-1">Official Belt Grading Examination Results Sheet</h3>
        <p className="text-xs text-slate-700 mt-1">
          Event: {testEvent.name} ({testEvent.code}) • Discipline: {testEvent.discipline} • Date: {new Date(testEvent.testDate).toLocaleDateString('en-IN')}
        </p>
        <p className="text-xs text-slate-700">Examiner: {testEvent.examinerMaster} • Venue: {testEvent.venue}</p>
      </div>

      {/* Summary Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] uppercase text-slate-400">Total Candidates</span>
          <span className="text-xl font-bold text-white block mt-0.5">{resultsList.length}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] uppercase text-slate-400">Passed Candidates</span>
          <span className="text-xl font-bold text-emerald-400 block mt-0.5">{passCount}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] uppercase text-slate-400">Failed / Re-test</span>
          <span className="text-xl font-bold text-rose-400 block mt-0.5">{failCount}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] uppercase text-slate-400">Publication Status</span>
          <span className="text-xs font-bold text-white block mt-1.5">
            {testEvent.resultsPublished ? (
              <span className="text-emerald-400">Published to Units</span>
            ) : (
              <span className="text-amber-400">Unpublished (Admin only)</span>
            )}
          </span>
        </div>
      </div>

      {/* Results Entry Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 printable-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Reg No</th>
                <th className="py-3 px-3">Candidate Name</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Current Belt</th>
                <th className="py-3 px-3">Target Belt</th>
                <th className="py-3 px-3">Result Status</th>
                <th className="py-3 px-3">Score / Marks</th>
                <th className="py-3 px-3">Awarded Belt</th>
                <th className="py-3 px-3">Examiner Remarks</th>
                <th className="py-3 px-3 text-center no-print">Profile Promoted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {resultsList.length > 0 ? (
                resultsList.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-900/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-rose-400">
                      {res.studentId?.registrationNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {res.studentId?.fullName}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {res.unitId?.unitCode}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="belt">{res.currentBelt}</Badge>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">
                      {res.targetBelt}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={res.resultStatus}
                        onChange={(e) =>
                          handleResultChange(res._id, 'resultStatus', e.target.value)
                        }
                        className={`rounded-md px-2 py-1 text-xs font-semibold border outline-hidden ${
                          res.resultStatus === 'Pass'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : res.resultStatus === 'Fail'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : res.resultStatus === 'Absent'
                            ? 'bg-slate-950 text-slate-400 border-slate-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={res.marks ?? ''}
                        onChange={(e) =>
                          handleResultChange(res._id, 'marks', e.target.value)
                        }
                        placeholder="e.g. 85"
                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-rose-500 focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={res.beltAwarded || (res.resultStatus === 'Pass' ? res.targetBelt : '')}
                        onChange={(e) =>
                          handleResultChange(res._id, 'beltAwarded', e.target.value)
                        }
                        placeholder="Awarded Belt"
                        className="w-32 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-rose-500 focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={res.examinerComments || ''}
                        onChange={(e) =>
                          handleResultChange(res._id, 'examinerComments', e.target.value)
                        }
                        placeholder="Examiner comments"
                        className="w-40 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-rose-500 focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-3 text-center no-print">
                      {res.beltUpdatedInProfile ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-400 font-semibold gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Promoted</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not yet</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                    No candidates currently registered for this test.
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
