'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  School,
  Shield,
  Save,
} from 'lucide-react';

export default function AddStudentPage() {
  const router = useRouter();

  const [units, setUnits] = useState<Array<{ _id: string; name: string; unitCode: string; city: string }>>([]);
  const [disciplines, setDisciplines] = useState<Array<{ name: string; beltHierarchy: string[] }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    height: '',
    weight: '',
    bloodGroup: 'B+',
    contactNumber: '',
    email: '',
    address: '',
    city: '',
    district: '',
    state: 'Kerala',
    pincode: '',
    country: 'India',

    parentName: '',
    relationship: 'Father',
    parentContact: '',
    parentAltContact: '',
    parentEmail: '',
    useStudentAddress: true,
    parentAddress: '',

    schoolName: '',
    schoolClass: '',
    educationalQualification: '',
    discipline: 'Karate-Do',
    currentBelt: 'White Belt',
    unitId: '',
    instructor: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Calculate preview age
  const calculatedAge = formData.dateOfBirth
    ? Math.max(
        0,
        Math.floor(
          (new Date().getTime() - new Date(formData.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      )
    : null;

  useEffect(() => {
    async function loadMeta() {
      try {
        const [uRes, cRes] = await Promise.all([fetch('/api/units'), fetch('/api/cms')]);
        if (uRes.ok) {
          const uData = await uRes.json();
          setUnits(uData.units || []);
          if (uData.units?.length > 0) {
            setFormData((prev) => ({ ...prev, unitId: uData.units[0]._id }));
          }
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          setDisciplines(cData.disciplines || []);
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadMeta();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      setSuccess(`Student created successfully! Registration Number: ${data.student.registrationNumber}`);
      setTimeout(() => {
        router.push(`/admin/students/${data.student._id}`);
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  // Current discipline's belts
  const currentDisciplineDoc = disciplines.find((d) => d.name === formData.discipline);
  const availableBelts = currentDisciplineDoc?.beltHierarchy || [
    'White Belt',
    'Yellow Belt',
    'Orange Belt',
    'Green Belt',
    'Blue Belt',
    'Purple Belt',
    'Brown Belt',
    'Black Belt 1st Dan',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back button and title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/students"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Register New Student
          </h1>
          <p className="text-xs text-slate-400">
            Creates unique student registration number and assigns to training unit.
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
        {/* Section 1: Personal Information */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <User className="h-4 w-4 text-rose-500" />
            <span>1. Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Student full legal name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
              {calculatedAge !== null && (
                <span className="text-[10px] text-rose-400 mt-1 block">
                  Calculated Age: {calculatedAge} years old
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Number *</label>
              <input
                type="tel"
                required
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Height</label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 150 cm"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Weight</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 45 kg"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Residential Address *</label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House / Street / Area"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PIN / Postal Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 682001"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Parent / Guardian Information */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <User className="h-4 w-4 text-amber-500" />
            <span>2. Parent / Guardian Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Guardian full name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship *</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Contact Number *
              </label>
              <input
                type="tel"
                required
                name="parentContact"
                value={formData.parentContact}
                onChange={handleChange}
                placeholder="Guardian mobile number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alternate Contact</label>
              <input
                type="tel"
                name="parentAltContact"
                value={formData.parentAltContact}
                onChange={handleChange}
                placeholder="Alternate phone"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Email</label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                placeholder="parent@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-3 pt-2">
              <input
                type="checkbox"
                id="useStudentAddress"
                name="useStudentAddress"
                checked={formData.useStudentAddress}
                onChange={handleChange}
                className="h-4 w-4 rounded-sm border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="useStudentAddress" className="text-xs text-slate-300">
                Guardian resides at student's residential address
              </label>
            </div>

            {!formData.useStudentAddress && (
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Address</label>
                <input
                  type="text"
                  name="parentAddress"
                  value={formData.parentAddress}
                  onChange={handleChange}
                  placeholder="Address if different from student"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Academic & Martial Arts Information */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>3. Academic & Martial Arts Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">School Name *</label>
              <input
                type="text"
                required
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="School / College / Institution"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Standard</label>
              <input
                type="text"
                name="schoolClass"
                value={formData.schoolClass}
                onChange={handleChange}
                placeholder="e.g. 8th Grade"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Training Unit *</label>
              <select
                required
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              >
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.unitCode} - {u.name} ({u.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Martial Arts Discipline *</label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial / Current Belt *</label>
              <select
                name="currentBelt"
                value={formData.currentBelt}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              >
                {availableBelts.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instructor / Sensei</label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                placeholder="Instructor in charge"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            href="/admin/students"
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
            <span>{loading ? 'Registering Student...' : 'Register Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
