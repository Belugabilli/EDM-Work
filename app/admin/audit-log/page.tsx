'use client';

import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuditLog } from '@/types';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch audit logs');
        }
        return res.json();
      })
      .then((data) => setLogs(data.logs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.log_id.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_id.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_id.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable administrative and student actions logged directly in the Google Sheets Audit_Log tab.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
          <History className="w-5 h-5" />
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
            placeholder="Search by actor, entity ID, or details..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE_COMPLAINT">CREATE_COMPLAINT</option>
          <option value="UPDATE_STATUS">UPDATE_STATUS</option>
          <option value="ASSIGN_COMPLAINT">ASSIGN_COMPLAINT</option>
          <option value="ADMIN_RESPONSE">ADMIN_RESPONSE</option>
          <option value="CREATE_CATEGORY">CREATE_CATEGORY</option>
          <option value="UPDATE_CATEGORY">UPDATE_CATEGORY</option>
          <option value="UPDATE_USER">UPDATE_USER</option>
          <option value="UPDATE_SETTING">UPDATE_SETTING</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading audit records...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-6">Log ID</th>
                  <th className="py-3.5 px-6">Actor ID</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Entity Type</th>
                  <th className="py-3.5 px-6">Entity ID</th>
                  <th className="py-3.5 px-6">Details</th>
                  <th className="py-3.5 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {filteredLogs.map((l) => (
                  <tr key={l.log_id} className="hover:bg-slate-750/50">
                    <td className="py-4 px-6 font-mono text-slate-400">{l.log_id}</td>
                    <td className="py-4 px-6 font-medium text-white max-w-[140px] truncate">
                      {l.actor_id}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 text-[10px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{l.entity_type}</td>
                    <td className="py-4 px-6 font-mono text-amber-400">{l.entity_id}</td>
                    <td className="py-4 px-6 text-slate-300 max-w-[260px] truncate">
                      {l.details}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400">
                      {new Date(l.timestamp).toLocaleString()}
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
