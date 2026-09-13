import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '@/types';
import { Clock, AlertCircle, CheckCircle, Flame, ArrowUpRight, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const normStatus = (status || '').toUpperCase() as ComplaintStatus;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  switch (normStatus) {
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>Submitted</span>
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Under Review</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span>In Progress</span>
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Resolved</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <Ban className="w-3.5 h-3.5 text-rose-500" />
          <span>Rejected</span>
        </span>
      );
    case 'ESCALATED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />
          <span>Escalated</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
}

interface PriorityBadgeProps {
  priority: ComplaintPriority | string;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const normPriority = (priority || '').toUpperCase() as ComplaintPriority;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide uppercase',
    md: 'text-xs px-2.5 py-1 font-medium tracking-wide uppercase',
  }[size];

  switch (normPriority) {
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          Low
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}
        >
          Medium
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-orange-50 text-orange-800 border border-orange-200 ${sizeClasses}`}
        >
          High
        </span>
      );
    case 'URGENT':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}
        >
          <Flame className="w-3 h-3 mr-1 text-red-600 animate-pulse" />
          Urgent
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 ${sizeClasses}`}
        >
          {priority}
        </span>
      );
  }
}
