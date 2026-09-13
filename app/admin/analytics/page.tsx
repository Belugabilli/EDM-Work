'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  PieChart,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface AnalyticsData {
  total: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  resolutionRate: string;
  avgResolutionHours: string;
  resolvedCount: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load analytics');
        }
        return res.json();
      })
      .then((resData) => setData(resData))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Campus Grievance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time performance metrics aggregated directly from Google Sheets data.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Live Google Sheets Calculation</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-500">Aggregating complaint metrics...</div>
      ) : !data ? (
        <div className="py-20 text-center text-xs text-slate-500">No data available.</div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/80">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Total Complaints
              </span>
              <div className="text-3xl font-extrabold text-white mt-1">{data.total}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Logged to date</span>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/80">
              <span className="text-xs text-emerald-400 uppercase font-semibold">
                Resolution Rate
              </span>
              <div className="text-3xl font-extrabold text-emerald-300 mt-1">
                {data.resolutionRate}%
              </div>
              <span className="text-[11px] text-emerald-400/80 mt-1 block">
                {data.resolvedCount} complaints resolved
              </span>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/80">
              <span className="text-xs text-blue-400 uppercase font-semibold">
                Avg Resolution Time
              </span>
              <div className="text-3xl font-extrabold text-blue-300 mt-1">
                {data.avgResolutionHours} hrs
              </div>
              <span className="text-[11px] text-blue-400/80 mt-1 block">Turnaround speed</span>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/80">
              <span className="text-xs text-amber-400 uppercase font-semibold">
                Active Queue
              </span>
              <div className="text-3xl font-extrabold text-amber-300 mt-1">
                {data.total - data.resolvedCount}
              </div>
              <span className="text-[11px] text-amber-400/80 mt-1 block">Pending action</span>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700/80 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Complaints by Status</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(data.statusCounts).map(([status, count]) => {
                  const pct = data.total > 0 ? ((count / data.total) * 100).toFixed(0) : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{status}</span>
                        <span className="text-slate-400">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status === 'RESOLVED'
                              ? 'bg-emerald-500'
                              : status === 'IN_PROGRESS'
                              ? 'bg-blue-500'
                              : status === 'UNDER_REVIEW'
                              ? 'bg-amber-500'
                              : status === 'REJECTED'
                              ? 'bg-rose-500'
                              : status === 'ESCALATED'
                              ? 'bg-purple-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700/80 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>Complaints by Priority</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(data.priorityCounts).map(([priority, count]) => {
                  const pct = data.total > 0 ? ((count / data.total) * 100).toFixed(0) : 0;
                  return (
                    <div key={priority} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{priority}</span>
                        <span className="text-slate-400">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            priority === 'URGENT'
                              ? 'bg-red-500'
                              : priority === 'HIGH'
                              ? 'bg-orange-500'
                              : priority === 'MEDIUM'
                              ? 'bg-blue-500'
                              : 'bg-slate-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Grievance Distribution Across Categories</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.categoryCounts).map(([catName, count]) => (
                <div key={catName} className="p-4 rounded-xl bg-slate-900/60 border border-slate-750">
                  <span className="text-xs text-slate-400 truncate block">{catName}</span>
                  <div className="text-xl font-bold text-white mt-1">{count}</div>
                  <span className="text-[11px] text-slate-500">
                    {data.total > 0 ? `${((count / data.total) * 100).toFixed(1)}% of total` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
