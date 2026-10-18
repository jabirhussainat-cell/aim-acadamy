'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Award,
  Key,
  Copy,
  ExternalLink,
  ShieldAlert,
  Users2,
  RefreshCw,
} from 'lucide-react';

interface AffiliationRequestItem {
  _id: string;
  applicationNumber: string;
  unitName: string;
  headPerson: string;
  contactNumber: string;
  email: string;
  district: string;
  city: string;
  address: string;
  pincode: string;
  disciplinesOffered: string[];
  instructorQualifications: string;
  activeStudentsCount: number;
  additionalNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdUnitCode?: string;
  createdAt: string;
}

export default function AdminAffiliationRequestsPage() {
  const [requests, setRequests] = useState<AffiliationRequestItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  // Selected item for Detail Modal
  const [selectedRequest, setSelectedRequest] = useState<AffiliationRequestItem | null>(null);

  // Approve Modal State
  const [approvingItem, setApprovingItem] = useState<AffiliationRequestItem | null>(null);
  const [customUnitCode, setCustomUnitCode] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [assignedInstructor, setAssignedInstructor] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submittingApprove, setSubmittingApprove] = useState(false);

  // Post-Approval Credentials Card Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    unitCode: string;
    unitName: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Reject Modal State
  const [rejectingItem, setRejectingItem] = useState<AffiliationRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (activeTab !== 'all') query.set('status', activeTab);
      if (search) query.set('search', search);

      const res = await fetch(`/api/affiliation-requests?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to load requests');

      const data = await res.json();
      setRequests(data.requests || []);
      setCounts(data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err: unknown) {
      console.error(err);
      setMessage({ text: 'Failed to load affiliation requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  function handleOpenApprove(item: AffiliationRequestItem) {
    setApprovingItem(item);
    setAssignedInstructor(item.headPerson);
    setCustomUnitCode('');
    setInitialPassword(`AimUnit#${Math.floor(1000 + Math.random() * 9000)}`);
    setApprovalNotes('');
  }

  async function handleConfirmApprove(e: React.FormEvent) {
    e.preventDefault();
    if (!approvingItem) return;

    setSubmittingApprove(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/affiliation-requests/${approvingItem._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customUnitCode: customUnitCode.trim() || undefined,
          initialPassword: initialPassword.trim(),
          assignedInstructor: assignedInstructor.trim(),
          remarks: approvalNotes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      setCreatedCredentials({
        unitCode: data.unit.unitCode,
        unitName: data.unit.name,
        email: data.credentials.email,
        temporaryPassword: data.credentials.temporaryPassword,
      });

      setApprovingItem(null);
      fetchRequests();
      setMessage({ text: data.message, type: 'success' });
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Error approving affiliation', type: 'error' });
    } finally {
      setSubmittingApprove(false);
    }
  }

  async function handleConfirmReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingItem) return;

    setSubmittingReject(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/affiliation-requests/${rejectingItem._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject request');
      }

      setRejectingItem(null);
      fetchRequests();
      setMessage({ text: data.message, type: 'success' });
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Error rejecting affiliation', type: 'error' });
    } finally {
      setSubmittingReject(false);
    }
  }

  function handleCopyCredentials() {
    if (!createdCredentials) return;
    const text = `AIM ACADEMY UNIT LOGIN CREDENTIALS\nUnit: ${createdCredentials.unitName} (${createdCredentials.unitCode})\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}/login\nGovt. Reg No: WYD/176/2026`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header Title & Public Link button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Building2 className="h-4 w-4" />
              <span>Dojo Affiliations & Unit Requests</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-white uppercase tracking-tight">
              Unit Affiliation Requests
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Review public dojo affiliation applications, examine instructor credentials, and provision official Unit accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/unit-affiliation"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-600/30 transition shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
              <span>View Public Application Form</span>
            </Link>

            <button
              onClick={fetchRequests}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Refresh list"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Toast / Notification */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
              message.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/60 border-rose-800 text-rose-200'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Applications"
            value={counts.total}
            icon={Building2}
            variant="amber"
            subtitle="All logged applications"
          />
          <StatCard
            title="Pending Review"
            value={counts.pending}
            icon={Clock}
            variant="rose"
            subtitle="Awaiting board decision"
          />
          <StatCard
            title="Approved Units"
            value={counts.approved}
            icon={CheckCircle2}
            variant="emerald"
            subtitle="Provisioned active units"
          />
          <StatCard
            title="Rejected Requests"
            value={counts.rejected}
            icon={XCircle}
            variant="blue"
            subtitle="Did not meet criteria"
          />
        </div>

        {/* Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Requests ({counts.total})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'PENDING'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Pending Review</span>
              {counts.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  {counts.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'APPROVED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              onClick={() => setActiveTab('REJECTED')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search dojo, person, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Applications Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
              Loading affiliation applications...
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No affiliation requests found"
              description="When dojo instructors apply for affiliation via the public form, their requests will appear here for review and approval."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">App Ref & Date</th>
                    <th className="py-3 px-4">Proposed Unit</th>
                    <th className="py-3 px-4">Head Instructor</th>
                    <th className="py-3 px-4">District / Location</th>
                    <th className="py-3 px-4">Students & Disciplines</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-400 block">{r.applicationNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{r.unitName}</span>
                        {r.createdUnitCode && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            Unit Code: {r.createdUnitCode}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200 block">{r.headPerson}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{r.contactNumber}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200 block">{r.district}</span>
                        <span className="text-[10px] text-slate-400">{r.city}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-white font-bold block">{r.activeStudentsCount} Students</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                          {r.disciplinesOffered.slice(0, 2).join(', ')}
                          {r.disciplinesOffered.length > 2 && ` +${r.disciplinesOffered.length - 2}`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {r.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                            PENDING REVIEW
                          </span>
                        )}
                        {r.status === 'APPROVED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                            APPROVED
                          </span>
                        )}
                        {r.status === 'REJECTED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                            REJECTED
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
                            title="View Full Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {r.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleOpenApprove(r)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition"
                                title="Approve Request & Provision Unit"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectingItem(r);
                                  setRejectionReason('');
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                                title="Reject Request"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL 1: VIEW FULL APPLICATION DETAILS */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Application Dossier: {selectedRequest.applicationNumber}
                  </span>
                  <h3 className="text-lg font-black text-white uppercase">{selectedRequest.unitName}</h3>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Status bar */}
                <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Application Status</span>
                    <span className="font-bold text-white text-xs">{selectedRequest.status}</span>
                  </div>
                  {selectedRequest.createdUnitCode && (
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Associated Unit Code</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {selectedRequest.createdUnitCode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Chief Instructor</span>
                    <span className="font-semibold text-white">{selectedRequest.headPerson}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Contact Mobile</span>
                    <span className="font-semibold text-white">{selectedRequest.contactNumber}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Official Email</span>
                    <span className="font-semibold text-white truncate block">{selectedRequest.email}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Operating District</span>
                    <span className="font-semibold text-white">{selectedRequest.district}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Complete Training Hall Address</span>
                  <p className="font-medium text-slate-200 mt-0.5">
                    {selectedRequest.address}, {selectedRequest.city}, {selectedRequest.district} -{' '}
                    {selectedRequest.pincode}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">Disciplines Offered</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRequest.disciplinesOffered.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-semibold text-[11px]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Instructor Credentials & Experience</span>
                  <p className="font-medium text-slate-200 mt-0.5">{selectedRequest.instructorQualifications}</p>
                </div>

                {selectedRequest.additionalNotes && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Additional Applicant Remarks</span>
                    <p className="text-slate-300 mt-0.5 whitespace-pre-wrap">{selectedRequest.additionalNotes}</p>
                  </div>
                )}

                {selectedRequest.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200">
                    <span className="block font-bold text-[10px] text-rose-400 uppercase">Rejection Reason</span>
                    <p className="mt-0.5">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 hover:text-white"
                >
                  Close
                </button>

                {selectedRequest.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      const item = selectedRequest;
                      setSelectedRequest(null);
                      handleOpenApprove(item);
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-wider"
                  >
                    Proceed to Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: APPROVE AFFILIATION & PROVISION UNIT */}
        {approvingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-slate-950 p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase">Approve Unit Affiliation</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{approvingItem.applicationNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setApprovingItem(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmApprove} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Proposed Dojo</span>
                  <span className="font-bold text-white text-sm block">{approvingItem.unitName}</span>
                  <span className="text-slate-400 block mt-1">
                    Head: {approvingItem.headPerson} • District: {approvingItem.district}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Custom Unit Code (Leave blank for auto-generated UNIT-XXX)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UNIT-102 or WYD-01"
                    value={customUnitCode}
                    onChange={(e) => setCustomUnitCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white uppercase placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Initial Login Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setInitialPassword(`AimUnit#${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                    >
                      Regen
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Unit head logs in with their email ({approvingItem.email}) and this temporary password.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assigned Master / Instructor Overseeing Unit
                  </label>
                  <input
                    type="text"
                    value={assignedInstructor}
                    onChange={(e) => setAssignedInstructor(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Approval Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Approved after physical dojo inspection and NIS credential verification."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setApprovingItem(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApprove}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-wider shadow-md disabled:opacity-50"
                  >
                    {submittingApprove ? 'Creating Unit...' : 'Confirm & Create Unit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CREATED CREDENTIALS DISPLAY (POST APPROVAL) */}
        {createdCredentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border-2 border-emerald-500/50 bg-slate-950 p-6 shadow-2xl relative text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-black text-white uppercase">Official Unit Created!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Share these login credentials with the unit head so they can access their Unit Portal.
              </p>

              <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Unit Code:</span>
                  <span className="font-bold text-amber-400">{createdCredentials.unitCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Unit Name:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{createdCredentials.unitName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Login Email:</span>
                  <span className="font-bold text-emerald-400">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Temporary Password:</span>
                  <span className="font-bold text-rose-400">{createdCredentials.temporaryPassword}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleCopyCredentials}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                </button>

                <button
                  onClick={() => setCreatedCredentials(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: REJECT AFFILIATION */}
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-rose-900/60 bg-slate-950 p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase">Reject Affiliation</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{rejectingItem.applicationNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectingItem(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                <p className="text-slate-300">
                  Are you sure you want to reject the affiliation application from{' '}
                  <strong className="text-white">{rejectingItem.unitName}</strong>?
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rejection Reason (Recorded for audit)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Instructor credentials could not be verified; location outside current operating zones."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRejectingItem(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReject}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white uppercase tracking-wider shadow-md disabled:opacity-50"
                  >
                    {submittingReject ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
