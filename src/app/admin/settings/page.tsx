'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Phone, Mail, Building, Percent, CreditCard } from 'lucide-react';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    tagline: '',
    contactPhone: '8943839386',
    contactEmail: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    defaultTestFee: 400,
    defaultCommissionRate: 10,
    currency: 'INR',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setFormData({
              organizationName: data.settings.organizationName || 'AIM Martial Arts Academy',
              tagline: data.settings.tagline || 'Excellence, Discipline, Mastery',
              contactPhone: data.settings.contactPhone || '8943839386',
              contactEmail: data.settings.contactEmail || 'info@aimacademy.org',
              address: data.settings.address || 'Central Dojo Headquarters',
              city: data.settings.city || 'Kochi',
              state: data.settings.state || 'Kerala',
              pincode: data.settings.pincode || '682001',
              defaultTestFee: data.settings.defaultTestFee ?? 400,
              defaultCommissionRate: data.settings.defaultCommissionRate ?? 10,
              currency: data.settings.currency || 'INR',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Organization settings and pricing updated successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update settings');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Organization Settings & Pricing
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default test examination fees, unit commission rates, and organization details.
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pricing & Commission Configuration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-rose-500" />
            <span>Test Examination Fee & Commission Rates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Test Fee per Student (INR) *
              </label>
              <input
                type="number"
                required
                min={0}
                name="defaultTestFee"
                value={formData.defaultTestFee}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard baseline fee (Initial: ₹400)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Unit Commission Percentage (%) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={100}
                name="defaultCommissionRate"
                value={formData.defaultCommissionRate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 focus:border-rose-500 focus:outline-hidden font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Unit retention/commission (Initial: 10%)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Code</label>
              <input
                type="text"
                disabled
                value={formData.currency}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 cursor-not-allowed uppercase"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Indian Rupee (INR - ₹)
              </span>
            </div>
          </div>
        </div>

        {/* Organization Identity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Building className="h-4 w-4 text-sky-500" />
            <span>Organization Contact Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                required
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Helpline Number *
              </label>
              <input
                type="text"
                required
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden font-bold"
              />
              <span className="text-[10px] text-rose-400 mt-1 block">
                Specified official phone: 8943839386
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
