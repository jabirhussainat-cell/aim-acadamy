'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  PlusCircle,
  Search,
  Download,
  Eye,
  Trash2,
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface UnitItem {
  _id: string;
  unitCode: string;
  name: string;
  headPerson: string;
  contactNumber: string;
  email: string;
  city: string;
  state: string;
  status: string;
  totalStudents: number;
  activeStudents: number;
}

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadUnits() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/units?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units || []);
      }
    } catch (err) {
      console.error('Failed to load units:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnits();
  }, [search, statusFilter]);

  async function handleDeactivate(id: string, name: string) {
    if (!confirm(`Are you sure you want to deactivate unit ${name}? This will also disable its login account.`))
      return;
    try {
      const res = await fetch(`/api/units/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadUnits();
      }
    } catch (err) {
      console.error('Failed to deactivate unit:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Unit Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage affiliated martial arts training units and their designated account credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/affiliation-requests"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 transition shadow-sm"
          >
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Affiliation Requests</span>
          </Link>

          <a
            href="/api/export?type=units"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/admin/units/add"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Unit</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by unit name, code, head person, city..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:border-rose-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Units Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Unit Code</th>
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Head Person</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Login Email</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Students (Active/Total)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    Loading units...
                  </td>
                </tr>
              ) : units.length > 0 ? (
                units.map((unit) => (
                  <tr key={unit._id} className="hover:bg-slate-900/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      {unit.unitCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {unit.name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{unit.headPerson}</td>
                    <td className="py-3 px-4 text-slate-400">{unit.contactNumber}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{unit.email}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {unit.city}, {unit.state}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-400">{unit.activeStudents}</span>
                      <span className="text-slate-400"> / {unit.totalStudents}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={unit.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/units/${unit._id}`}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition"
                          title="View Unit Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        {unit.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleDeactivate(unit._id, unit.name)}
                            className="p-1.5 rounded-md hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition"
                            title="Deactivate Unit"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12">
                    <EmptyState
                      title="No units found"
                      description="Add the first training unit to allow dojo registrations."
                      actionText="Add Unit"
                      actionHref="/admin/units/add"
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
