'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import { Complaint, User } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { ProfileOnboardingModal } from '@/components/ProfileOnboardingModal';

export default function StudentDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Fetch complaints
    fetch('/api/complaints')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch complaints');
        }
        return res.json();
      })
      .then((data) => {
        setComplaints(data.complaints || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));

    // Fetch profile to verify if details (Phone, Reg No, Department, Branch, Year) are complete
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          setProfile(data.profile);
          const p = data.profile;
          if (!p.phone || !p.student_id || !p.department || !p.branch || !p.year) {
            setShowOnboarding(true);
          }
        }
      })
      .catch((err) => console.warn('Could not check profile completion:', err));
  }, []);

  const totalComplaints = complaints.length;
  const activeComplaints = complaints.filter((c) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'ESCALATED'].includes(c.status)
  ).length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Grievance Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your submitted campus grievances and view administrative updates in real-time.
          </p>
        </div>

        <Link
          href="/student/submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#002855] text-white font-semibold text-sm hover:bg-[#134074] transition-all shadow-xs hover:shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Complaint</span>
        </Link>
      </div>

      {/* Profile Incomplete Banner */}
      {profile && (!profile.phone || !profile.student_id || !profile.department || !profile.branch || !profile.year) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">Student Profile Incomplete</h2>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Please complete your Phone Number, Registration Number, Department, Branch, and Current Year of Study.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all shrink-0 cursor-pointer shadow-xs"
          >
            Complete Profile
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Complaints
            </span>
            <div className="text-3xl font-extrabold text-[#002855] mt-1">
              {loading ? '...' : totalComplaints}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Lifetime records</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Grievances
            </span>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">
              {loading ? '...' : activeComplaints}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">In review / progress</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {loading ? '...' : resolvedComplaints}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Successfully closed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest filed issues and their current resolution state</p>
          </div>
          <Link
            href="/student/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : recentComplaints.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Inbox className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-700">No complaints registered yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              If you are facing an issue with hostel, mess, academics or IT, lodge a ticket now.
            </p>
            <Link
              href="/student/submit"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lodge a Complaint</span>
            </Link>
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (< md) for Android and iPhones */}
            <div className="md:hidden divide-y divide-slate-100">
              {recentComplaints.map((item) => (
                <Link
                  key={item.complaint_id}
                  href={`/student/complaints/${item.complaint_id}`}
                  className="block p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#002855]">{item.complaint_id}</span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1.5 line-clamp-1">{item.subject}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span className="truncate max-w-[60%]">{item.location}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop & Tablet Table (>= md) */}
            <div className="hidden md:block divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Complaint ID</th>
                    <th className="py-3.5 px-6">Subject</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentComplaints.map((item) => (
                    <tr key={item.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-[#002855]">
                        {item.complaint_id}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900 max-w-[220px] truncate">
                        {item.subject}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {item.location} {item.room_no ? `(Rm: ${item.room_no})` : ''}
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/student/complaints/${item.complaint_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Student Profile Onboarding Modal */}
      {profile && (
        <ProfileOnboardingModal
          user={profile}
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onSuccess={(updated) => {
            setProfile((prev) => (prev ? { ...prev, ...updated } : null));
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}
