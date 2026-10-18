'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Award,
  Users,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function CreateTestPage() {
  const router = useRouter();

  const [disciplines, setDisciplines] = useState<Array<{ name: string; beltHierarchy: string[] }>>([]);
  const [masters, setMasters] = useState<Array<{ name: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discipline: 'Karate-Do',
    description: 'Official National Belt Examination & Grading Event',
    testDate: '',
    startTime: '09:00 AM',
    endTime: '04:00 PM',
    venue: '',
    examinerMaster: '',
    registrationOpenDate: new Date().toISOString().split('T')[0],
    registrationCloseDate: '',
    feePerStudent: 400,
    status: 'Registration Open',
    instructions:
      'Students must appear in full clean uniform (gi/dobok) with their current belt. Arrive at least 30 minutes prior to scheduled start time.',
    eligibleCurrentBelts: [] as string[],
    availableTargetBelts: [] as string[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, sRes] = await Promise.all([fetch('/api/cms'), fetch('/api/settings')]);
        if (cRes.ok) {
          const cData = await cRes.json();
          setDisciplines(cData.disciplines || []);
          setMasters(cData.masters || []);
          if (cData.masters?.length > 0) {
            setFormData((prev) => ({ ...prev, examinerMaster: cData.masters[0].name }));
          }
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.settings?.defaultTestFee) {
            setFormData((prev) => ({ ...prev, feePerStudent: sData.settings.defaultTestFee }));
          }
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Current discipline's belts
  const currentDisciplineDoc = disciplines.find((d) => d.name === formData.discipline);
  const beltList = currentDisciplineDoc?.beltHierarchy || [
    'White Belt',
    'Yellow Belt',
    'Orange Belt',
    'Green Belt',
    'Blue Belt',
    'Purple Belt',
    'Brown Belt',
    'Black Belt 1st Dan',
  ];

  function toggleEligibleBelt(belt: string) {
    setFormData((prev) => {
      const exists = prev.eligibleCurrentBelts.includes(belt);
      return {
        ...prev,
        eligibleCurrentBelts: exists
          ? prev.eligibleCurrentBelts.filter((b) => b !== belt)
          : [...prev.eligibleCurrentBelts, belt],
      };
    });
  }

  function toggleTargetBelt(belt: string) {
    setFormData((prev) => {
      const exists = prev.availableTargetBelts.includes(belt);
      return {
        ...prev,
        availableTargetBelts: exists
          ? prev.availableTargetBelts.filter((b) => b !== belt)
          : [...prev.availableTargetBelts, belt],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create test event');
      }

      setSuccess(`Test event "${data.testEvent.name}" created successfully! Code: ${data.testEvent.code}`);
      setTimeout(() => {
        router.push('/admin/tests');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/tests"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Create Belt Testing Event
          </h1>
          <p className="text-xs text-slate-400">
            Schedule an examination, set student registration fee, and open enrollment.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Event Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <CalendarCheck className="h-4 w-4 text-rose-500" />
            <span>1. Test Event Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. National Belt Grading Examination Autumn 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Test Code (Optional)
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. TEST-2026-01 (Auto-generated if empty)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Discipline *
              </label>
              <select
                name="discipline"
                value={formData.discipline}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              >
                {disciplines.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Initial Event Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              >
                <option value="Registration Open">Registration Open</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fee per Student (INR) *
              </label>
              <input
                type="number"
                required
                name="feePerStudent"
                value={formData.feePerStudent}
                onChange={handleChange}
                min={0}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Schedule, Venue & Examiners */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>2. Schedule, Venue & Examiners</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Examination Date *
              </label>
              <input
                type="date"
                required
                name="testDate"
                value={formData.testDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                placeholder="e.g. 09:00 AM"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
              <input
                type="text"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                placeholder="e.g. 04:00 PM"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Venue Location *
              </label>
              <input
                type="text"
                required
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Indoor Stadium / Central Dojo / Hall"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Accredited Examiner / Master *
              </label>
              <input
                type="text"
                required
                name="examinerMaster"
                value={formData.examinerMaster}
                onChange={handleChange}
                placeholder="Examiner Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registration Open Date *
              </label>
              <input
                type="date"
                required
                name="registrationOpenDate"
                value={formData.registrationOpenDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registration Closing Deadline *
              </label>
              <input
                type="date"
                required
                name="registrationCloseDate"
                value={formData.registrationCloseDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Belts Allowed */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Award className="h-4 w-4 text-emerald-500" />
            <span>3. Belt Eligibility & Instructions</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Current Belts Eligible to Enter this Test (Leave empty for all belts):
            </label>
            <div className="flex flex-wrap gap-2">
              {beltList.map((belt) => (
                <button
                  key={belt}
                  type="button"
                  onClick={() => toggleEligibleBelt(belt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    formData.eligibleCurrentBelts.includes(belt)
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {belt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Instructions for Candidates & Units
            </label>
            <textarea
              name="instructions"
              rows={3}
              value={formData.instructions}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            href="/admin/tests"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating Event...' : 'Create Test Event'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
