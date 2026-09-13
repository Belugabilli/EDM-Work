'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Search,
  CheckCircle2,
  Ban,
  AlertCircle,
  Filter,
  UserCheck,
} from 'lucide-react';
import { User, AdminUser } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
        if (data.admins) setAdmins(data.admins);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update user status');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user role');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.student_id && u.student_id.toLowerCase().includes(search.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.account_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            User Accounts & Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Student registrations and administrative privileges stored in the Google Sheets Users tab.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold">
            {users.length} Total Users
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
            {admins.length} Campus Admins
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading user database...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500">No users found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-6">User ID</th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Year</th>
                  <th className="py-3.5 px-6">Room No. (if any)</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {filteredUsers.map((u) => {
                  const isActive = u.account_status === 'ACTIVE';
                  return (
                    <tr key={u.user_id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-slate-400">
                        {u.user_id}
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">
                        {u.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-blue-400">
                        {u.student_id || '—'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {u.department || 'General'}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {u.year || '—'}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {u.room_no || <span className="text-slate-500 italic">None</span>}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border focus:outline-none transition-all cursor-pointer ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                              : u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                          }`}
                        >
                          <option value="STUDENT" className="bg-slate-900 text-slate-200">
                            Student
                          </option>
                          <option value="ADMIN" className="bg-slate-900 text-amber-300">
                            Admin
                          </option>
                          <option value="SUPER_ADMIN" className="bg-slate-900 text-purple-300">
                            Super Admin
                          </option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {u.account_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleStatusToggle(u.user_id, u.account_status)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            isActive
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {isActive ? 'Block' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
