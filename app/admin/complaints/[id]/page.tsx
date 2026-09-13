'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  FileDown,
  MessageSquare,
  Send,
  UserCheck,
  Shield,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  History,
  Hash,
} from 'lucide-react';
import {
  Complaint,
  User as UserType,
  ComplaintStatusHistory,
  AuditLog,
  AdminUser,
  ComplaintStatus,
} from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { TimelineStepper } from '@/components/TimelineStepper';

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params?.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [student, setStudent] = useState<UserType | null>(null);
  const [history, setHistory] = useState<ComplaintStatusHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Action Form States
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('SUBMITTED');
  const [statusComment, setStatusComment] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [adminResponseText, setAdminResponseText] = useState('');

  const loadData = () => {
    Promise.all([
      fetch(`/api/admin/complaints/${complaintId}`).then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
    ])
      .then(([complaintData, usersData]) => {
        if (complaintData.complaint) {
          setComplaint(complaintData.complaint);
          setSelectedStatus(complaintData.complaint.status);
          setAssignedAdmin(complaintData.complaint.assigned_to || '');
          setAdminResponseText(complaintData.complaint.admin_response || '');
        }
        if (complaintData.student) setStudent(complaintData.student);
        if (complaintData.history) setHistory(complaintData.history);
        if (complaintData.auditLogs) setAuditLogs(complaintData.auditLogs);
        if (usersData.admins) setAdmins(usersData.admins);
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (complaintId) loadData();
  }, [complaintId]);

  // Handler: Change Status
  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          comment: statusComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setMessage({ type: 'success', text: `Status successfully updated to ${selectedStatus}` });
      setStatusComment('');
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Assign Complaint
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: assignedAdmin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign complaint');

      setMessage({ type: 'success', text: `Complaint assigned to ${assignedAdmin}` });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Post Response
  const handlePostResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminResponseText.trim()) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: adminResponseText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post admin response');

      setMessage({ type: 'success', text: 'Official administrative response posted and student notified.' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading complaint inspection...</div>;
  }

  if (!complaint) {
    return (
      <div className="text-center py-20">
        <h2 className="text-sm font-semibold text-slate-300">Complaint not found</h2>
        <Link href="/admin/complaints" className="text-xs text-blue-400 mt-2 inline-block">
          Return to All Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </Link>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} size="lg" />
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-200'
              : 'bg-red-950/60 border border-red-700 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint + Student Details + Admin Responses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Details Card */}
          <div className="bg-slate-800/80 p-6 sm:p-8 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-lg text-blue-400">
                {complaint.complaint_id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                Category: {complaint.category_id}
              </span>
            </div>

            <h1 className="text-xl font-bold text-white">{complaint.subject}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-750">
                <span className="text-slate-500 block text-[11px]">Location</span>
                <span className="font-semibold text-white mt-0.5 block">{complaint.location}</span>
              </div>

              {/* Labeled Room No. (if any) */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-750">
                <span className="text-slate-500 block text-[11px]">Room No. (if any)</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {complaint.room_no || 'Not Specified'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-750">
                <span className="text-slate-500 block text-[11px]">Submission Timestamp</span>
                <span className="text-slate-300 mt-0.5 block">
                  {new Date(complaint.created_at).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-750">
                <span className="text-slate-500 block text-[11px]">Assigned Administrator</span>
                <span className="text-amber-400 font-semibold mt-0.5 block">
                  {complaint.assigned_to || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Full Description
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-750 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Private Attachment Access */}
            {complaint.attachment_url && (
              <div className="pt-3 border-t border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Complaint Attachment (Private & Authorized)
                </span>
                <a
                  href={`/api/attachments/${complaint.attachment_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold border border-blue-500/30 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Private Attachment</span>
                </a>
              </div>
            )}
          </div>

          {/* Student Information Card (NO SECTION) */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Student Profile Record (NO Section)</span>
            </h3>

            {student ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/50">
                  <span className="text-slate-500 text-[11px] block">Student Name</span>
                  <span className="font-semibold text-white mt-0.5 block">{student.name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/50">
                  <span className="text-slate-500 text-[11px] block">Student ID</span>
                  <span className="font-mono font-semibold text-blue-400 mt-0.5 block">
                    {student.student_id || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/50">
                  <span className="text-slate-500 text-[11px] block">Email Address</span>
                  <span className="text-slate-300 mt-0.5 block truncate">{student.email}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/50">
                  <span className="text-slate-500 text-[11px] block">Department</span>
                  <span className="text-slate-300 mt-0.5 block">{student.department || 'N/A'}</span>
                </div>
                {student.branch && (
                  <div className="p-2.5 rounded-xl bg-slate-900/50">
                    <span className="text-slate-500 text-[11px] block">Branch</span>
                    <span className="text-slate-300 mt-0.5 block">{student.branch}</span>
                  </div>
                )}
                <div className="p-2.5 rounded-xl bg-slate-900/50">
                  <span className="text-slate-500 text-[11px] block">Current Year of Study</span>
                  <span className="text-slate-300 mt-0.5 block">{student.year || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/50">
                  <span className="text-slate-500 text-[11px] block">Room No. (if any)</span>
                  <span className="text-slate-300 mt-0.5 block">{student.room_no || 'None'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Student identity: {complaint.user_id}</p>
            )}
          </div>

          {/* Official Admin Response Form */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Post Official Administration Response</span>
            </h3>

            <form onSubmit={handlePostResponse} className="space-y-3">
              <textarea
                rows={3}
                value={adminResponseText}
                onChange={(e) => setAdminResponseText(e.target.value)}
                placeholder="Provide official resolution update or student instructions (this will be sent to the student)..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'Saving...' : 'Post Response to Student'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Status History Stepper */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
            <TimelineStepper currentStatus={complaint.status} history={history} />
          </div>
        </div>

        {/* Right 1 Col: Administration Actions (Status & Assignment) */}
        <div className="space-y-6">
          {/* Action 1: Change Status */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Update Complaint Status</span>
            </h3>

            <form onSubmit={handleStatusChange} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ESCALATED">ESCALATED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Status Remarks / Comment</label>
                <textarea
                  rows={2}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Internal rationale or update log..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                Apply Status Change
              </button>
            </form>
          </div>

          {/* Action 2: Assign Admin */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Assign Complaint</span>
            </h3>

            <form onSubmit={handleAssign} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Administrator</label>
                <select
                  value={assignedAdmin}
                  onChange={(e) => setAssignedAdmin(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Unassigned --</option>
                  {admins.map((a) => (
                    <option key={a.admin_id} value={a.name || a.email}>
                      {a.name} ({a.department} - {a.role})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                Update Assignment
              </button>
            </form>
          </div>

          {/* Action 3: Audit Trail Log */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>Complaint Audit Trail</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-slate-500 text-[11px]">No specific audit entries recorded.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.log_id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-750">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold uppercase text-blue-400">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 mt-1 text-[11px]">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
