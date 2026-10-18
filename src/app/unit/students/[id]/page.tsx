'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Printer,
  Award,
  Calendar,
  Phone,
  School,
  History,
  Shield,
} from 'lucide-react';
import { Badge, StatusBadge } from '@/components/Badge';

interface StudentProfile {
  student: {
    _id: string;
    registrationNumber: string;
    fullName: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    height?: string;
    weight?: string;
    bloodGroup?: string;
    contactNumber: string;
    email?: string;
    address: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    parentName: string;
    relationship: string;
    parentContact: string;
    parentAddress: string;
    schoolName: string;
    schoolClass?: string;
    discipline: string;
    currentBelt: string;
    dateOfJoining: string;
    status: string;
    beltHistory: Array<{
      belt: string;
      awardedDate: string;
      remarks?: string;
    }>;
  };
  testRegistrations: Array<{
    _id: string;
    testEventId: {
      _id: string;
      name: string;
      code: string;
      testDate: string;
      status?: string;
    };
    targetBelt: string;
    status: string;
  }>;
  testResults: Array<{
    _id: string;
    testEventId: {
      _id: string;
      name: string;
      code: string;
    };
    resultStatus: string;
    marks?: number;
    beltAwarded?: string;
  }>;
}

export default function UnitStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch(`/api/students/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-900 rounded-lg"></div>
        <div className="h-64 bg-slate-900 rounded-xl"></div>
      </div>
    );
  }

  if (!data?.student) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">Student profile not found or unauthorized.</p>
        <Link href="/unit/students" className="mt-4 inline-block text-xs text-rose-400">
          ← Back to Students
        </Link>
      </div>
    );
  }

  const { student, testRegistrations, testResults } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/unit/students"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold uppercase tracking-wider text-white">
                {student.fullName}
              </h1>
              <Badge variant="belt">{student.currentBelt}</Badge>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-xs font-mono text-rose-400 mt-0.5">
              Reg No: {student.registrationNumber}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
        >
          <Printer className="h-3.5 w-3.5 text-slate-400" />
          <span>Print Profile</span>
        </button>
      </div>

      {/* Printable Sheet Header */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aim-logo.jpg" alt="AIM Academy" className="h-16 mx-auto mb-2 object-contain" />
        <h2 className="text-2xl font-black uppercase tracking-wider">
          ADVANCED INSTITUTE OF MARTIAL ARTS (AIM ACADEMY)
        </h2>
        <p className="text-xs uppercase tracking-widest font-bold text-slate-800">
          Govt. Reg No: WYD/176/2026 • Official Student Profile & Belt Record
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Malappuram | Kozhikode | Wayanad • Helpline: 8943839386 • info@aimacademy.org
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 printable-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-rose-500" />
              <span>Personal Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Age / DOB:</span>
                <span className="font-semibold text-white">
                  {student.age} yrs ({new Date(student.dateOfBirth).toLocaleDateString('en-IN')})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gender:</span>
                <span className="font-semibold text-white">{student.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Blood Group:</span>
                <span className="font-semibold text-white">{student.bloodGroup || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Height / Weight:</span>
                <span className="font-semibold text-white">
                  {student.height || '—'} / {student.weight || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Phone:</span>
                <span className="font-semibold text-white">{student.contactNumber}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-400 block text-[11px]">Address:</span>
                <span className="font-semibold text-white">
                  {student.address}, {student.city}, {student.district}, {student.state} - {student.pincode}
                </span>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mt-6 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>Parent / Guardian Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Guardian Name:</span>
                <span className="font-semibold text-white">{student.parentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Relationship:</span>
                <span className="font-semibold text-white">{student.relationship}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Number:</span>
                <span className="font-semibold text-white">{student.parentContact}</span>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mt-6 mb-4 flex items-center gap-2">
              <School className="h-4 w-4 text-sky-500" />
              <span>Academic Details</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">School / College:</span>
                <span className="font-semibold text-white">{student.schoolName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Class:</span>
                <span className="font-semibold text-white">{student.schoolClass || '—'}</span>
              </div>
            </div>
          </div>

          {/* Test Attendance & Results */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 printable-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" />
              <span>Belt Examination Participation</span>
            </h3>

            {testRegistrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2">Test Name</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Attempted Belt</th>
                      <th className="py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {testRegistrations.map((tr) => {
                      const res = testResults.find(
                        (r) => r.testEventId?._id === tr.testEventId?._id
                      );
                      return (
                        <tr key={tr._id}>
                          <td className="py-2.5 font-semibold text-white">
                            {tr.testEventId?.name}
                          </td>
                          <td className="py-2.5 text-slate-400">
                            {new Date(tr.testEventId?.testDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2.5">
                            <Badge variant="belt">{tr.targetBelt}</Badge>
                          </td>
                          <td className="py-2.5">
                            {res ? (
                              <StatusBadge status={res.resultStatus} />
                            ) : (
                              <span className="text-slate-400 text-[11px]">Pending Exam</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">No test participations recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Belt History */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 printable-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-amber-500" />
              <span>Belt Progression History</span>
            </h3>

            <div className="space-y-4">
              {student.beltHistory && student.beltHistory.length > 0 ? (
                student.beltHistory.map((bh, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-rose-900/60 pb-3 last:pb-0">
                    <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-rose-600 ring-2 ring-slate-950" />
                    <div className="flex items-center gap-2">
                      <Badge variant="belt">{bh.belt}</Badge>
                      <span className="text-[11px] text-slate-400">
                        {new Date(bh.awardedDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {bh.remarks && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">{bh.remarks}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Initial registration belt record.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
