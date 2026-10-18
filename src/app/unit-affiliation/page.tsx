'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AimLogo } from '@/components/AimLogo';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Send,
  Printer,
  ChevronRight,
  Sparkles,
  Users2,
  GraduationCap,
} from 'lucide-react';

const KERALA_DISTRICTS = [
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
  'Palakkad',
  'Thrissur',
  'Ernakulam',
  'Kottayam',
  'Idukki',
  'Alappuzha',
  'Pathanamthitta',
  'Kollam',
  'Thiruvananthapuram',
  'Other / Outside Kerala',
];

const AVAILABLE_DISCIPLINES = [
  'Kung Fu / Wushu',
  'Wushu Sanda & Combat',
  'Karate-Do',
  'Taekwondo',
  'Kickboxing',
  'Traditional Weapons / Kobudo',
  'Self Defense & Fitness',
];

export default function UnitAffiliationPage() {
  const [formData, setFormData] = useState({
    unitName: '',
    headPerson: '',
    contactNumber: '',
    email: '',
    district: 'Wayanad',
    city: '',
    address: '',
    pincode: '',
    disciplinesOffered: ['Kung Fu / Wushu'],
    instructorQualifications: '',
    activeStudentsCount: '30',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    applicationNumber: string;
    unitName: string;
    headPerson: string;
    createdAt: string;
  } | null>(null);

  function handleDisciplineToggle(discipline: string) {
    setFormData((prev) => {
      const exists = prev.disciplinesOffered.includes(discipline);
      if (exists) {
        return {
          ...prev,
          disciplinesOffered: prev.disciplinesOffered.filter((d) => d !== discipline),
        };
      } else {
        return {
          ...prev,
          disciplinesOffered: [...prev.disciplinesOffered, discipline],
        };
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (formData.disciplinesOffered.length === 0) {
      setError('Please select at least one martial arts discipline offered at your unit.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/affiliation-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit affiliation application');
      }

      setSubmittedData({
        applicationNumber: data.applicationNumber,
        unitName: formData.unitName,
        headPerson: formData.headPerson,
        createdAt: new Date().toISOString(),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your application.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30 text-amber-200 text-xs py-2 px-4 text-center font-semibold tracking-wider flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>GOVT. REG NO: <strong className="text-white font-bold">WYD/176/2026</strong></span>
        </span>
        <span className="hidden sm:inline text-amber-500/60">•</span>
        <span>UNIT AFFILIATION APPLICATION DESK</span>
        <span className="hidden sm:inline text-amber-500/60">•</span>
        <a href="tel:8943839386" className="text-white hover:text-amber-400 font-bold transition flex items-center gap-1">
          <Phone className="h-3 w-3 text-rose-400" />
          <span>Helpline: 8943839386</span>
        </a>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <AimLogo size="md" subtitle="Govt. Reg No: WYD/176/2026" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition"
            >
              ← Back to Homepage
            </Link>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {submittedData ? (
          /* Success Confirmation View */
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-slate-900/90 p-8 sm:p-12 shadow-2xl relative text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              Application Successfully Logged
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Unit Affiliation Request Submitted!
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Thank you for applying to affiliate your martial arts dojo with <strong>Advanced Institute of Martial Arts (AIM ACADEMY)</strong> under <strong>Govt. Reg No: WYD/176/2026</strong>.
            </p>

            {/* Application Tracking Card */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-950 border border-amber-500/40 max-w-lg mx-auto text-left shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Reference No</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{submittedData.applicationNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                    PENDING BOARD REVIEW
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Proposed Unit:</span>
                  <span className="font-semibold text-white">{submittedData.unitName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chief Instructor:</span>
                  <span className="font-semibold text-white">{submittedData.headPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submission Date:</span>
                  <span className="font-medium text-slate-300">
                    {new Date(submittedData.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps Guidance */}
            <div className="mt-8 p-5 rounded-xl bg-slate-950/60 border border-slate-800 max-w-lg mx-auto text-xs text-slate-300 text-left space-y-2">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Next Verification Steps:</span>
              </h4>
              <p>1. Our executive board and Chief Examiner review instructor qualifications within 48 to 72 hours.</p>
              <p>2. Once approved, your unit code (e.g. <code>UNIT-102</code>) and secure portal login credentials will be provisioned.</p>
              <p>3. You will be able to enroll candidates for standardized ₹400 belt grading and earn 10% unit commission.</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold uppercase tracking-wider transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Application Slip</span>
              </button>

              <a
                href="tel:8943839386"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg transition"
              >
                <Phone className="h-4 w-4" />
                <span>Helpline: 8943839386</span>
              </a>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
              >
                <span>Return to Home</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Application Form View */
          <div>
            {/* Header intro */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-600/40 text-xs font-bold uppercase tracking-wider mb-3">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Institutional Affiliation Application</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                Apply for Unit Affiliation
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Affiliate your martial arts dojo or training academy with <strong>Advanced Institute of Martial Arts (AIM ACADEMY)</strong> under <strong>Govt. Reg No: WYD/176/2026</strong>. Expand your student certifications, standardized belt testing, and organizational backing.
              </p>
            </div>

            {/* Benefits highlights banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-slate-900/60 text-center">
                <Award className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-white uppercase">Govt. Certified</span>
                <span className="text-[10px] text-slate-400">WYD/176/2026</span>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-900/40 bg-slate-900/60 text-center">
                <GraduationCap className="h-5 w-5 text-rose-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-white uppercase">Standardized Tests</span>
                <span className="text-[10px] text-slate-400">₹400 / Candidate</span>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-900/40 bg-slate-900/60 text-center">
                <Users2 className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-white uppercase">10% Unit Commission</span>
                <span className="text-[10px] text-slate-400">Accrued on Batches</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
                <Shield className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-white uppercase">3 Regional Hubs</span>
                <span className="text-[10px] text-slate-400">MLP • KKD • WYD</span>
              </div>
            </div>

            {/* The Form */}
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-10 shadow-2xl space-y-8">
              {error && (
                <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Application Submission Notice:</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* SECTION 1: Unit & Organization Details */}
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800 mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span>1. Unit & Training Hall Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Proposed Unit / Dojo Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wayanad Dragon Dojo / Malappuram Combat Unit"
                      value={formData.unitName}
                      onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Operating District <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                    >
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      City / Town / Village <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kalpetta, Manjeri, Vadakara"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 673121"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Complete Training Hall / Dojo Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Building name, street, landmarks, full address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Chief Instructor / Contact Person */}
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span>2. Chief Instructor & Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Unit Head / Chief Instructor <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name with title"
                      value={formData.headPerson}
                      onChange={(e) => setFormData({ ...formData, headPerson: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contact Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="instructor@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Martial Arts Disciplines & Student Roster */}
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800 mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>3. Disciplines Offered & Current Student Base</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Disciplines Taught at the Dojo <span className="text-rose-500">* (Select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {AVAILABLE_DISCIPLINES.map((disc) => {
                        const checked = formData.disciplinesOffered.includes(disc);
                        return (
                          <button
                            type="button"
                            key={disc}
                            onClick={() => handleDisciplineToggle(disc)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                              checked
                                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded flex items-center justify-center border text-[10px] ${
                                checked ? 'bg-amber-500 border-amber-400 text-black' : 'border-slate-700'
                              }`}
                            >
                              {checked && '✓'}
                            </div>
                            <span className="truncate">{disc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Approximate Active Students Count <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 35"
                        value={formData.activeStudentsCount}
                        onChange={(e) => setFormData({ ...formData, activeStudentsCount: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Chief Instructor Credentials & Experience <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2nd Dan Black Belt, 8 yrs coaching, NIS participant"
                        value={formData.instructorQualifications}
                        onChange={(e) =>
                          setFormData({ ...formData, instructorQualifications: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Additional Remarks / Academy Background (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tournaments participated, dojo history, current affiliation status, or questions"
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400">
                  By submitting, you apply for formal recognition under <strong>AIM Academy (WYD/176/2026)</strong>.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-950 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Submitting Application...' : 'Submit Unit Affiliation Application'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AimLogo size="xs" subtitle="Govt. Reg No: WYD/176/2026" />
          <p className="text-center sm:text-left">
            AIM Academy Central Board • Malappuram • Kozhikode • Wayanad • Helpline: 8943839386
          </p>
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider text-xs">
            Portal Login →
          </Link>
        </div>
      </footer>
    </div>
  );
}
