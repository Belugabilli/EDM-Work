'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  FileDown,
  MessageSquare,
  AlertCircle,
  Building,
  Hash,
} from 'lucide-react';
import { Complaint, ComplaintStatusHistory, Category } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { TimelineStepper } from '@/components/TimelineStepper';

export default function StudentComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params?.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintStatusHistory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) return;

    Promise.all([
      fetch(`/api/complaints/${complaintId}`).then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          throw new Error(data.error || 'Failed to load complaint');
        }
        return r.json();
      }),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([complaintData, categoriesData]) => {
        setComplaint(complaintData.complaint);
        setHistory(complaintData.history || []);
        if (categoriesData.categories) setCategories(categoriesData.categories);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [complaintId]);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading complaint details...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Unable to load complaint</h3>
        <p className="text-xs text-slate-500">{error || 'Complaint does not exist or access denied.'}</p>
        <Link
          href="/student/complaints"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Complaints</span>
        </Link>
      </div>
    );
  }

  const categoryName =
    categories.find((c) => c.category_id === complaint.category_id)?.category_name ||
    complaint.category_id;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button and quick status */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} size="lg" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-bold text-base text-[#002855]">
                {complaint.complaint_id}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {categoryName}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {complaint.subject}
            </h1>

            {/* Metadata Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  <strong>Location:</strong> {complaint.location}
                </span>
              </div>

              {/* Labeled Room No. (if any) */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Room No. (if any):</strong>{' '}
                  {complaint.room_no ? complaint.room_no : 'Not Specified'}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Submitted:</strong>{' '}
                  {new Date(complaint.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Last Updated:</strong>{' '}
                  {new Date(complaint.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Detailed Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                {complaint.description}
              </p>
            </div>

            {/* Private Attachment Access */}
            {complaint.attachment_url && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Complaint Attachment (Private & Secure)
                </h3>
                <a
                  href={`/api/attachments/${complaint.attachment_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Secure Attachment</span>
                </a>
              </div>
            )}
          </div>

          {/* Official Admin Response Card */}
          {complaint.admin_response ? (
            <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Official Administration Response</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap bg-white/80 p-4 rounded-xl border border-emerald-100">
                {complaint.admin_response}
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3 text-slate-500 text-xs">
              <Clock className="w-5 h-5 text-slate-400 shrink-0" />
              <span>
                Administrative review is currently in progress. An official response will appear here once submitted.
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Visual Timeline Stepper */}
        <div className="space-y-6">
          <TimelineStepper currentStatus={complaint.status} history={history} />
        </div>
      </div>
    </div>
  );
}
