'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Users,
  Award,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Printer,
  Shield,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Badge, StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface TestOption {
  _id: string;
  name: string;
  code: string;
  discipline: string;
  testDate: string;
  venue: string;
  examinerMaster: string;
  feePerStudent: number;
  status: string;
  registrationCloseDate: string;
}

interface StudentOption {
  _id: string;
  registrationNumber: string;
  fullName: string;
  currentBelt: string;
  age: number;
  gender: string;
  status: string;
  isEligible: boolean;
  alreadyRegistered: boolean;
  defaultTargetBelt: string;
  targetBeltOptions: string[];
}

function UnitTestRegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTestId = searchParams.get('testId');

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Data states
  const [openTests, setOpenTests] = useState<TestOption[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId || '');
  const [selectedTest, setSelectedTest] = useState<TestOption | null>(null);

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentTargetBelts, setStudentTargetBelts] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Batch & Payment result states
  const [createdBatch, setCreatedBatch] = useState<any | null>(null);
  const [orderInfo, setOrderInfo] = useState<any | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load available tests on mount
  useEffect(() => {
    async function loadTests() {
      try {
        const res = await fetch('/api/tests?status=Registration%20Open');
        if (res.ok) {
          const json = await res.json();
          const filtered = (json.tests || []).filter((t: TestOption) => {
            return new Date(t.registrationCloseDate) >= new Date();
          });
          setOpenTests(filtered);

          if (initialTestId) {
            const matched = filtered.find((t: TestOption) => t._id === initialTestId);
            if (matched) {
              setSelectedTestId(matched._id);
              setSelectedTest(matched);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load open tests:', err);
      }
    }
    loadTests();
  }, [initialTestId]);

  // When selectedTestId changes, fetch unit students eligibility
  useEffect(() => {
    if (!selectedTestId) return;

    async function loadEligibility() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tests/${selectedTestId}/eligibility`);
        if (res.ok) {
          const json = await res.json();
          setSelectedTest(json.testEvent);
          setStudents(json.students || []);

          // Pre-populate target belts defaults
          const defaultMap: Record<string, string> = {};
          (json.students || []).forEach((s: StudentOption) => {
            defaultMap[s._id] = s.defaultTargetBelt || s.currentBelt;
          });
          setStudentTargetBelts(defaultMap);
        } else {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load eligible students');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error checking eligibility');
      } finally {
        setLoading(false);
      }
    }
    loadEligibility();
  }, [selectedTestId]);

  // Filtered students for Step 2
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q) ||
        s.currentBelt.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  // Toggle student selection
  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function selectAllEligible() {
    const eligibleIds = students.filter((s) => s.isEligible).map((s) => s._id);
    setSelectedStudentIds(eligibleIds);
  }

  function deselectAll() {
    setSelectedStudentIds([]);
  }

  // Selected student objects
  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedStudentIds.includes(s._id));
  }, [students, selectedStudentIds]);

  // Calculation in Step 4
  const feePerStudent = selectedTest?.feePerStudent || 400;
  const studentCount = selectedStudents.length;
  const grossAmount = studentCount * feePerStudent;
  const commissionRate = 10; // 10%
  const commissionAmount = Math.round((grossAmount * commissionRate) / 100);
  const organizationShare = grossAmount - commissionAmount;

  // Step 4 -> 5: Create Batch & Order
  async function handleProceedToPayment() {
    setError(null);
    setIsProcessingPayment(true);

    try {
      // 1. Create Batch on server
      const batchPayload = {
        testEventId: selectedTest?._id,
        studentRegistrations: selectedStudents.map((s) => ({
          studentId: s._id,
          targetBelt: studentTargetBelts[s._id] || s.defaultTargetBelt || s.currentBelt,
        })),
      };

      const batchRes = await fetch('/api/registration-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload),
      });

      const batchData = await batchRes.json();
      if (!batchRes.ok) {
        throw new Error(batchData.error || 'Failed to create registration batch');
      }

      setCreatedBatch(batchData.batch);

      // 2. Create Payment Order on server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchData.batch._id }),
      });

      const orderData = await orderRes.json();
      setOrderInfo(orderData);
      setCurrentStep(5);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setIsProcessingPayment(false);
    }
  }

  // Complete Payment Verification in Step 5
  async function handleVerifyPayment(simulatedData?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) {
    if (!createdBatch) return;

    setIsProcessingPayment(true);
    setError(null);

    try {
      const payload = {
        batchId: createdBatch._id,
        razorpayOrderId: simulatedData?.razorpayOrderId || orderInfo?.orderId || `order_${Date.now()}`,
        razorpayPaymentId: simulatedData?.razorpayPaymentId || `pay_${Date.now()}`,
        razorpaySignature: simulatedData?.razorpaySignature || 'sig_demo',
        paymentMethod: 'ONLINE_CHECKOUT',
      };

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment signature verification failed');
      }

      setVerificationResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsProcessingPayment(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Header */}
      <div className="border-b border-slate-800 pb-5 no-print">
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Unit Examination Registration & Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select test event, pick existing unit students, confirm attempted belt ranks, and complete payment.
        </p>

        {/* 5-Step Stepper */}
        <div className="mt-6 grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { step: 1, title: '1. Select Test' },
            { step: 2, title: '2. Select Students' },
            { step: 3, title: '3. Target Belts' },
            { step: 4, title: '4. Fee & Commission' },
            { step: 5, title: '5. Pay & Confirm' },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-2 rounded-lg border transition ${
                currentStep === s.step
                  ? 'bg-rose-950/60 border-rose-600 text-white font-bold shadow-xs'
                  : currentStep > s.step
                  ? 'bg-slate-900 border-slate-800 text-emerald-400 font-semibold'
                  : 'bg-slate-950 border-slate-900 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider truncate">
                {currentStep > s.step ? '✓ Done' : s.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs no-print">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= STEP 1: SELECT TEST EVENT ================= */}
      {currentStep === 1 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-rose-500" />
              <span>Step 1: Choose Available Examination Event</span>
            </h3>
            <span className="text-xs text-slate-400">{openTests.length} open tests available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {openTests.length > 0 ? (
              openTests.map((t) => {
                const isSelected = selectedTestId === t._id;
                return (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSelectedTestId(t._id);
                      setSelectedTest(t);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-600 ring-1 ring-rose-500 shadow-md shadow-rose-950'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-rose-400 border border-slate-800">
                          {t.code}
                        </span>
                        <StatusBadge status={t.status} />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{t.name}</h4>
                      <p className="text-xs text-rose-400 font-semibold mb-2">{t.discipline}</p>
                      <div className="space-y-1 text-xs text-slate-400">
                        <div>Exam Date: {new Date(t.testDate).toLocaleDateString('en-IN')}</div>
                        <div>Venue: {t.venue}</div>
                        <div>Registration Deadline: {new Date(t.registrationCloseDate).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Fee per candidate:</span>
                      <span className="font-bold text-white text-sm">₹{t.feePerStudent}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                No examination events are currently open for registration.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={!selectedTestId}
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition disabled:opacity-40"
            >
              <span>Next: Select Candidates</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: SELECT EXISTING UNIT STUDENTS ================= */}
      {currentStep === 2 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-500" />
                <span>Step 2: Select Candidates from Your Unit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test: {selectedTest?.name} ({selectedTest?.discipline})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllEligible}
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Select All Eligible
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-400 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Student Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search candidate by name, registration number, or belt..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:border-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Candidates Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-10">Select</th>
                  <th className="py-2.5 px-3">Reg Number</th>
                  <th className="py-2.5 px-3">Candidate Name</th>
                  <th className="py-2.5 px-3">Current Belt</th>
                  <th className="py-2.5 px-3">Age / Gender</th>
                  <th className="py-2.5 px-3">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s._id);
                    return (
                      <tr
                        key={s._id}
                        onClick={() => {
                          if (s.isEligible) toggleStudent(s._id);
                        }}
                        className={`transition ${
                          !s.isEligible
                            ? 'opacity-40 cursor-not-allowed bg-slate-950/40'
                            : isSelected
                            ? 'bg-rose-950/30 hover:bg-rose-950/40 cursor-pointer'
                            : 'hover:bg-slate-900/80 cursor-pointer'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            disabled={!s.isEligible}
                            checked={isSelected}
                            onChange={() => toggleStudent(s._id)}
                            className="h-4 w-4 rounded-sm border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-400">
                          {s.registrationNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {s.fullName}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="belt">{s.currentBelt}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {s.age} yrs • {s.gender}
                        </td>
                        <td className="py-2.5 px-3">
                          {s.alreadyRegistered ? (
                            <span className="text-[11px] text-amber-400">Already Enrolled</span>
                          ) : s.isEligible ? (
                            <span className="text-[11px] text-emerald-400 font-semibold">Eligible</span>
                          ) : (
                            <span className="text-[11px] text-rose-400">Ineligible</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching students found in this unit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">
                {selectedStudentIds.length} candidate(s) selected
              </span>
              <button
                disabled={selectedStudentIds.length === 0}
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition disabled:opacity-40"
              >
                <span>Next: Choose Belts</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: SELECT TARGET BELTS ================= */}
      {currentStep === 3 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Step 3: Select Belt Rank Attempted by Each Candidate</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Confirm the target belt for each of the {selectedStudents.length} candidate(s).
            </p>
          </div>

          <div className="space-y-3">
            {selectedStudents.map((student) => (
              <div
                key={student._id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{student.fullName}</span>
                    <span className="font-mono text-[10px] text-rose-400">
                      ({student.registrationNumber})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Current Rank:</span>
                    <Badge variant="belt">{student.currentBelt}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Attempting:</span>
                  <select
                    value={studentTargetBelts[student._id] || student.defaultTargetBelt}
                    onChange={(e) =>
                      setStudentTargetBelts((prev) => ({
                        ...prev,
                        [student._id]: e.target.value,
                      }))
                    }
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-hidden font-semibold"
                  >
                    {student.targetBeltOptions.map((tb) => (
                      <option key={tb} value={tb}>
                        {tb}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold"
            >
              ← Back
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition"
            >
              <span>Next: Fee & Commission Calculation</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: CALCULATE PAYMENT & COMMISSION ================= */}
      {currentStep === 4 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>Step 4: Examination Fee & Unit Commission Summary</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review authoritative server-side calculation and expected unit earnings before payment.
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Total Candidates
              </span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {studentCount} Students
              </span>
              <span className="text-[11px] text-slate-400">@ ₹{feePerStudent} per student</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Total Registration Amount
              </span>
              <span className="text-2xl font-bold text-rose-500 mt-1 block">
                ₹{grossAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">Combined batch payment</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Unit Commission (10%)
              </span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">
                ₹{commissionAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">Earned and accrued to your unit</span>
            </div>
          </div>

          {/* Selected Candidates Summary Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Reg No</th>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Current Belt</th>
                  <th className="py-2.5 px-3">Attempted Belt</th>
                  <th className="py-2.5 px-3 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-3 font-mono text-rose-400">{s.registrationNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{s.fullName}</td>
                    <td className="py-2.5 px-3">{s.currentBelt}</td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {studentTargetBelts[s._id] || s.defaultTargetBelt}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-emerald-400">
                      ₹{feePerStudent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold"
            >
              ← Back
            </button>

            <button
              disabled={isProcessingPayment}
              onClick={handleProceedToPayment}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950 transition disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              <span>
                {isProcessingPayment
                  ? 'Generating Batch & Checkout...'
                  : `Proceed to Pay ₹${grossAmount.toLocaleString('en-IN')}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: PAY & CONFIRM ================= */}
      {currentStep === 5 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-rose-500" />
              <span>Step 5: Payment Gateway Checkout & Confirmation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Batch: <span className="font-mono text-rose-400 font-bold">{createdBatch?.batchNumber}</span> • Total Amount: <span className="text-white font-bold">₹{createdBatch?.grossAmount}</span>
            </p>
          </div>

          {/* Payment Status Box */}
          {verificationResult ? (
            /* Successful Payment Confirmation */
            <div className="p-6 rounded-2xl border border-emerald-800/80 bg-emerald-950/20 text-center space-y-4 printable-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/aim-logo.jpg" alt="AIM Academy" className="h-14 mx-auto mb-1 object-contain" />
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Govt. Reg No: WYD/176/2026 • Official Examination Receipt
              </div>

              <div className="h-12 w-12 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white uppercase tracking-wider">
                  Payment Verified & Registrations Confirmed!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Receipt Number: <span className="font-mono font-bold text-emerald-400">{verificationResult.receiptNumber}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your unit commission of <span className="text-amber-400 font-bold">₹{createdBatch?.commissionAmount}</span> has been accrued to your ledger.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-3 no-print">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>

                <Link
                  href="/unit/registrations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition"
                >
                  <span>View Unit Batches</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Payment Action Box */
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Examination Event:</span>
                  <span className="font-semibold text-white">{selectedTest?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Candidates:</span>
                  <span className="font-semibold text-white">{studentCount} Students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Fee:</span>
                  <span className="font-bold text-rose-400">₹{grossAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Accrued Commission (10%):</span>
                  <span className="font-bold text-amber-400">₹{commissionAmount}</span>
                </div>
              </div>

              {/* Gateway Configuration Note */}
              <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/20 text-xs text-amber-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  <span>Payment Gateway Integration Note</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The application is configured to process payments through Razorpay on the server.
                  Server-side order creation and signature verification are fully enforced.
                </p>

                {orderInfo?.configured === false && (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                    <p className="font-semibold text-white">To enable Live/Test Razorpay Gateway Checkout:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                      <li>Obtain Razorpay Key ID and Secret from https://dashboard.razorpay.com</li>
                      <li>Configure <code className="text-rose-400">RAZORPAY_KEY_ID</code> and <code className="text-rose-400">RAZORPAY_KEY_SECRET</code> in <code className="text-rose-400">.env</code></li>
                      <li>Restart dev server to launch Razorpay popup checkout</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Checkout / Verification Action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  disabled={isProcessingPayment}
                  onClick={() => handleVerifyPayment()}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>
                    {isProcessingPayment
                      ? 'Verifying Payment on Server...'
                      : `Complete Payment of ₹${grossAmount}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UnitTestRegisterWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          Loading Test Registration Wizard...
        </div>
      }
    >
      <UnitTestRegisterWizard />
    </Suspense>
  );
}
