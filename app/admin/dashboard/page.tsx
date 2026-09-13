'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Flame,
  ArrowRight,
  Shield,
  Filter,
} from 'lucide-react';
import { Complaint } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/complaints')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch complaints');
        }
        return res.json();
      })
      .then((data) => {
        setComplaints(data.complaints || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const submitted = complaints.filter((c) => c.status === 'SUBMITTED').length;
  const underReview = complaints.filter((c) => c.status === 'UNDER_REVIEW').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
  const escalated = complaints.filter((c) => c.status === 'ESCALATED').length;

  const urgentComplaints = complaints.filter(
    (c) =>
      c.priority === 'URGENT' &&
      c.status !== 'RESOLVED' &&
      c.status !== 'REJECTED'
  );

  const recentComplaints = complaints.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>VIT Bhopal University Administration Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Grievance Redressal Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time status management, departmental assigning, and SLA tracking across campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/complaints"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Manage All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Complaints
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {loading ? '...' : total}
          </span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
            Submitted
          </span>
          <span className="text-2xl font-extrabold text-indigo-300 mt-1 block">
            {loading ? '...' : submitted}
          </span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
            Under Review
          </span>
          <span className="text-2xl font-extrabold text-amber-300 mt-1 block">
            {loading ? '...' : underReview}
          </span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-2xl font-extrabold text-blue-300 mt-1 block">
            {loading ? '...' : inProgress}
          </span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Resolved
          </span>
          <span className="text-2xl font-extrabold text-emerald-300 mt-1 block">
            {loading ? '...' : resolved}
          </span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
            Escalated
          </span>
          <span className="text-2xl font-extrabold text-purple-300 mt-1 block">
            {loading ? '...' : escalated}
          </span>
        </div>
      </div>

      {/* Urgent Issues Box */}
      {urgentComplaints.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-800/70 space-y-3">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span>High Priority & Urgent Campus Attention Required ({urgentComplaints.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentComplaints.map((item) => (
              <Link
                key={item.complaint_id}
                href={`/admin/complaints/${item.complaint_id}`}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-red-900/60 hover:border-red-500 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-400">
                      {item.complaint_id}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold truncate">
                      {item.subject}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {item.location} {item.room_no ? `• Rm: ${item.room_no}` : ''}
                  </span>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Student Grievances</h2>
            <p className="text-xs text-slate-400 mt-0.5">Directly connected to Google Sheets database</p>
          </div>
          <Link
            href="/admin/complaints"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Full Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading complaints...</div>
        ) : recentComplaints.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500">
            No complaints currently recorded in Google Sheets.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-6">Complaint ID</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Assigned To</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {recentComplaints.map((item) => (
                  <tr key={item.complaint_id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-400">
                      {item.complaint_id}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {item.student_id || item.user_id}
                    </td>
                    <td className="py-4 px-6 font-medium text-white max-w-[220px] truncate">
                      {item.subject}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {item.location} {item.room_no ? `• ${item.room_no}` : ''}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {item.assigned_to || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/complaints/${item.complaint_id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
