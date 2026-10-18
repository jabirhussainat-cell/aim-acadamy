'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Printer,
  Edit3,
  Building2,
  Award,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  School,
  CheckCircle2,
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
    country: string;

    parentName: string;
    relationship: string;
    parentContact: string;
    parentAltContact?: string;
    parentEmail?: string;
    parentAddress: string;

    schoolName: string;
    schoolClass?: string;
    educationalQualification?: string;
    discipline: string;
    currentBelt: string;
    dateOfJoining: string;
    status: string;
    notes?: string;

    unitId: {
      _id: string;
      name: string;
      unitCode: string;
      headPerson: string;
      contactNumber: string;
      city: string;
      state: string;
    };

    beltHistory: Array<{
      belt: string;
      awardedDate: string;
      testName?: string;
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
    currentBeltAtRegistration: string;
    targetBelt: string;
    feePaid: number;
    status: string;
  }>;
  testResults: Array<{
    _id: string;
    testEventId: {
      _id: string;
      name: string;
      code: string;
      testDate: string;
    };
    currentBelt: string;
    targetBelt: string;
    resultStatus: string;
    marks?: number;
    beltAwarded?: string;
    examinerMaster?: string;
  }>;
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch(`/api/students/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load student details:', err);
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
        <p className="text-slate-400 text-sm">Student profile not found.</p>
        <Link href="/admin/students" className="mt-4 inline-block text-xs text-rose-400">
          ← Back to Students
        </Link>
      </div>
    );
  }

  const { student, testRegistrations, testResults } = data;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>Print Profile</span>
          </button>
        </div>
      </div>

      {/* Printable Official Profile Card Header (Visible in Print) */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aim-logo.jpg" alt="AIM Academy" className="h-16 mx-auto mb-2 object-contain" />
        <h2 className="text-2xl font-black uppercase tracking-wider">
          ADVANCED INSTITUTE OF MARTIAL ARTS (AIM ACADEMY)
        </h2>
        <p className="text-xs uppercase tracking-widest font-bold text-slate-800">
          Govt. Reg No: WYD/176/2026 • Official Student Registration & Belt Record
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Malappuram | Kozhikode | Wayanad • Helpline: 8943839386 • info@aimacademy.org
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Guardian Info */}
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
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <span className="font-semibold text-white">{student.email || '—'}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-400 block text-[11px]">Residential Address:</span>
                <span className="font-semibold text-white">
                  {student.address}, {student.city}, {student.district}, {student.state} - {student.pincode}
                </span>
              </div>
            </div>

            {/* Guardian Section */}
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
                <span className="text-slate-400 block text-[11px]">Primary Contact:</span>
                <span className="font-semibold text-white">{student.parentContact}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Alternate Contact:</span>
                <span className="font-semibold text-white">{student.parentAltContact || '—'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Guardian Address:</span>
                <span className="font-semibold text-white">{student.parentAddress}</span>
              </div>
            </div>

            {/* Academic Information */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mt-6 mb-4 flex items-center gap-2">
              <School className="h-4 w-4 text-sky-500" />
              <span>Academic Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">School / College:</span>
                <span className="font-semibold text-white">{student.schoolName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Class / Standard:</span>
                <span className="font-semibold text-white">{student.schoolClass || '—'}</span>
              </div>
            </div>
          </div>

          {/* Test & Grading Examination History */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 printable-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" />
              <span>Examination & Test Records</span>
            </h3>

            {testRegistrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2">Test Name</th>
                      <th className="py-2">Test Date</th>
                      <th className="py-2">Attempted Belt</th>
                      <th className="py-2">Registration Status</th>
                      <th className="py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {testRegistrations.map((tr) => {
                      const result = testResults.find(
                        (res) => res.testEventId?._id === tr.testEventId?._id
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
                            <StatusBadge status={tr.status} />
                          </td>
                          <td className="py-2.5">
                            {result ? (
                              <StatusBadge status={result.resultStatus} />
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
              <p className="text-xs text-slate-400 py-3">No test participation recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Training Unit & Belt History */}
        <div className="space-y-6">
          {/* Training Unit Affiliation Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 printable-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-rose-500" />
              <span>Training Unit</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Unit Code</span>
                <p className="font-mono font-bold text-rose-400 text-sm">{student.unitId?.unitCode}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Unit Name</span>
                <p className="font-semibold text-white">{student.unitId?.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Head Person / Instructor</span>
                <p className="font-medium text-slate-300">{student.unitId?.headPerson}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Location</span>
                <p className="text-slate-300">
                  {student.unitId?.city}, {student.unitId?.state}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Discipline</span>
                <p className="font-bold text-white mt-0.5">{student.discipline}</p>
              </div>
            </div>
          </div>

          {/* Belt Progression Timeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 printable-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-amber-500" />
              <span>Belt Progression Timeline</span>
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
