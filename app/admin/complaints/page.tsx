'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Shield,
  Download,
  AlertCircle,
  Inbox,
  User,
} from 'lucide-react';
import { Complaint, Category, AdminUser } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/complaints').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
    ])
      .then(([complaintsData, categoriesData, usersData]) => {
        if (complaintsData.complaints) setComplaints(complaintsData.complaints);
        if (categoriesData.categories) setCategories(categoriesData.categories);
        if (usersData.admins) setAdmins(usersData.admins);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categoryMap = new Map<string, string>();
  categories.forEach((c) => categoryMap.set(c.category_id, c.category_name));

  const filtered = complaints
    .filter((c) => {
      const matchesSearch =
        c.complaint_id.toLowerCase().includes(search.toLowerCase()) ||
        c.student_id?.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || c.category_id === categoryFilter;
      const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
      const matchesAssigned = assignedFilter === 'ALL' || c.assigned_to === assignedFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesAssigned;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            All Campus Grievances
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, filter, assign, and update complaints stored in the university Google Sheet.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80 flex flex-col lg:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, student, subject, or location..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ESCALATED">Escalated</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Sort order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-750 font-medium"
            title="Toggle Date Sort"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-500">Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 px-4 text-center">
            <Inbox className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-300">No complaints matched</h3>
            <p className="text-xs text-slate-500 mt-1">Try refining your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-6">Complaint ID</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Assigned To</th>
                  <th className="py-3.5 px-6">Created At</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {filtered.map((item) => (
                  <tr key={item.complaint_id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-400">
                      {item.complaint_id}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {item.student_id || item.user_id}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-400">
                      {categoryMap.get(item.category_id) || item.category_id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white max-w-[200px] truncate">
                      {item.subject}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {item.location} {item.room_no ? `• Rm: ${item.room_no}` : ''}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {item.assigned_to || (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
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
                        href={`/admin/complaints/${item.complaint_id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300"
                      >
                        <span>Inspect</span>
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
