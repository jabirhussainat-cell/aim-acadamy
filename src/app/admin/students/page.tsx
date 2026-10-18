'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Badge, StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface StudentItem {
  _id: string;
  registrationNumber: string;
  fullName: string;
  discipline: string;
  currentBelt: string;
  age: number;
  gender: string;
  contactNumber: string;
  parentName: string;
  parentContact: string;
  status: string;
  unitId?: {
    _id: string;
    name: string;
    unitCode: string;
    city: string;
  };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedBelt, setSelectedBelt] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [unitsList, setUnitsList] = useState<Array<{ _id: string; name: string; unitCode: string }>>([]);

  // Fetch units for filter dropdown
  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await fetch('/api/units');
        if (res.ok) {
          const data = await res.json();
          setUnitsList(data.units || []);
        }
      } catch (err) {
        console.error('Failed to load units filter:', err);
      }
    }
    loadUnits();
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (selectedUnit !== 'all') params.set('unitId', selectedUnit);
      if (selectedDiscipline !== 'all') params.set('discipline', selectedDiscipline);
      if (selectedBelt !== 'all') params.set('belt', selectedBelt);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedUnit, selectedDiscipline, selectedBelt, selectedStatus]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  async function handleArchive(id: string, name: string) {
    if (!confirm(`Are you sure you want to archive student ${name}?`)) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadStudents();
      }
    } catch (err) {
      console.error('Error archiving student:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Student Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Total {totalCount} registered students across all affiliated units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export?type=students"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/admin/students/add"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register Student</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, reg no, phone..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:border-rose-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
          >
            <option value="all">All Units</option>
            {unitsList.map((u) => (
              <option key={u._id} value={u._id}>
                {u.unitCode} - {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedBelt}
            onChange={(e) => {
              setSelectedBelt(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
          >
            <option value="all">All Belts</option>
            <option value="White">White Belt</option>
            <option value="Yellow">Yellow Belt</option>
            <option value="Orange">Orange Belt</option>
            <option value="Green">Green Belt</option>
            <option value="Blue">Blue Belt</option>
            <option value="Purple">Purple Belt</option>
            <option value="Brown">Brown Belt</option>
            <option value="Black Belt 1st Dan">Black Belt 1st Dan</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Reg Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Current Belt</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-900/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      {student.registrationNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {student.fullName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="belt">{student.currentBelt}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{student.discipline}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {student.unitId ? `${student.unitId.unitCode} (${student.unitId.city})` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {student.age} yrs • {student.gender}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{student.parentName}</div>
                      <div className="text-[10px] text-slate-400">{student.parentContact}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/students/${student._id}`}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition"
                          title="View Profile"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleArchive(student._id, student.fullName)}
                          className="p-1.5 rounded-md hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition"
                          title="Archive Student"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12">
                    <EmptyState
                      title="No students found"
                      description="No students match the current search filters."
                      actionText="Register Student"
                      actionHref="/admin/students/add"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-4 py-3">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
