'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { Category, ComplaintPriority } from '@/types';

export default function SubmitComplaintPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [roomNo, setRoomNo] = useState(''); // OPTIONAL: Room No. (if any)
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [file, setFile] = useState<File | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0].category_id);
          }
        }
      })
      .catch((err) => console.error('Failed to load categories:', err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selected.type)) {
        setError('Invalid file type. Please upload a PDF, JPG, or PNG document.');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!categoryId) {
      setError('Please select a complaint category.');
      return;
    }
    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 15) {
      setError('Description must be at least 15 characters long.');
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrl = '';

      // Upload file to Google Drive if selected
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('complaint_id', `PENDING-${Date.now()}`);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload attachment to Google Drive.');
        }

        attachmentUrl = uploadData.fileId;
      }

      // Submit complaint
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          subject: subject.trim(),
          description: description.trim(),
          location: location.trim(),
          room_no: roomNo.trim(), // Optional
          priority,
          attachment_url: attachmentUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit complaint to Google Sheets.');
      }

      setCreatedComplaintId(data.complaint_id);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (createdComplaintId) {
      navigator.clipboard.writeText(createdComplaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Lodge Campus Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit your complaint to the concerned university department. Provide accurate details to expedite resolution.
        </p>
      </div>

      {/* Success Modal */}
      {createdComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Complaint Registered!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your grievance has been logged into the Google Sheets database and queued for administrative review.
            </p>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-mono font-bold text-base text-[#002855]">
                {createdComplaintId}
              </span>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`/student/complaints/${createdComplaintId}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#002855] text-white font-semibold text-xs hover:bg-[#134074] transition-colors flex items-center justify-center gap-2"
              >
                <span>Track Complaint Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/student/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 font-medium">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Complaint Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Complaint Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCategories}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              {loadingCategories ? (
                <option>Loading categories...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name} ({cat.department})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="LOW">Low (General Query)</option>
              <option value="MEDIUM">Medium (Standard Issue)</option>
              <option value="HIGH">High (Urgent Attention)</option>
              <option value="URGENT">Urgent (Emergency/Safety)</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of the grievance (e.g., Water leakage in Hostel Block 2)"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            minLength={5}
          />
        </div>

        {/* Location and Optional Room No. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hostel Block 1, Lab Complex, Mess 2"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* STRICT REQUIREMENT: Room No. (if any) — OPTIONAL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Room No. (if any)
              </label>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </div>
            <input
              type="text"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              placeholder="e.g. B-314 or Lab 102 (if applicable)"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Detailed Description *
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue thoroughly with relevant times, specifics, and background..."
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            minLength={15}
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Minimum 15 characters. Be as precise as possible.
          </span>
        </div>

        {/* File Attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Attachment (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
            {file ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 truncate">
                  <File className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-left truncate">
                    <p className="text-xs font-semibold text-blue-900 truncate">{file.name}</p>
                    <p className="text-[10px] text-blue-600">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1 rounded-md text-blue-700 hover:bg-blue-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-10 h-10 mx-auto text-slate-400" />
                <p className="text-xs font-medium text-slate-700 mt-2">
                  Upload photo proof or supporting document
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF, JPG, or PNG (Max 10MB). Stored securely and privately.
                </p>
                <label className="mt-3 inline-block cursor-pointer px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#002855] text-white font-semibold text-xs hover:bg-[#134074] transition-all shadow-xs hover:shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Registering Complaint...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
