'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export default function AddUnitPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    unitCode: '',
    name: '',
    headPerson: '',
    contactNumber: '',
    email: '',
    password: '',
    address: '',
    city: '',
    district: '',
    state: 'Kerala',
    pincode: '',
    country: 'India',
    associatedInstructor: '',
    disciplinesOffered: ['Karate-Do'],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleDisciplineToggle(disc: string) {
    setFormData((prev) => {
      const exists = prev.disciplinesOffered.includes(disc);
      if (exists) {
        return {
          ...prev,
          disciplinesOffered: prev.disciplinesOffered.filter((d) => d !== disc),
        };
      } else {
        return { ...prev, disciplinesOffered: [...prev.disciplinesOffered, disc] };
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create unit');
      }

      setSuccess(`Unit "${data.unit.name}" created successfully with Code: ${data.unit.unitCode}`);
      setTimeout(() => {
        router.push('/admin/units');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/units"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Add New Training Unit
          </h1>
          <p className="text-xs text-slate-400">
            Creates a unit record and provisions its secure login account credentials.
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
        {/* Unit Basic Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Building2 className="h-4 w-4 text-rose-500" />
            <span>Unit Identity & Head Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unit Name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Central Dojo Kochi"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Unit Code (Optional)
              </label>
              <input
                type="text"
                name="unitCode"
                value={formData.unitCode}
                onChange={handleChange}
                placeholder="e.g. UNIT-101 (Leave blank to auto-generate)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unit Head / Master in Charge *
              </label>
              <input
                type="text"
                required
                name="headPerson"
                value={formData.headPerson}
                onChange={handleChange}
                placeholder="Instructor / Person Responsible"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Official phone number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Login Account Provisioning */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Lock className="h-4 w-4 text-amber-500" />
            <span>Unit Account Login Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Login Email *
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="unit101@aimacademy.org"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Initial Account Password *
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Location & Disciplines */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <MapPin className="h-4 w-4 text-sky-500" />
            <span>Address & Disciplines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Complete Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Dojo / Training Center building & road"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
              <input
                type="text"
                required
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

            <div className="sm:col-span-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Disciplines Offered by this Unit:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Karate-Do', 'Taekwondo', 'Kung Fu / Wushu', 'Kickboxing'].map((disc) => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => handleDisciplineToggle(disc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      formData.disciplinesOffered.includes(disc)
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {disc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            href="/admin/units"
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
            <span>{loading ? 'Creating Unit...' : 'Create Unit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
