'use client';

import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  Hash,
  BookOpen,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { User } from '@/types';

export const VIT_DEPARTMENTS = [
  'School of Computing Science and Engineering',
  'School of Computer Science Engineering and Artificial Intelligence',
  'School of Electrical and Electronics Engineering',
  'School of Mechanical Engineering',
  'School of Biosciences, Engineering and Technology',
  'School of Architecture',
  'VIT Business School',
  'School of Advanced Sciences and Languages',
  'Other',
];

export const VIT_BRANCHES = [
  'B.Tech Computer Science & Engineering',
  'B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning)',
  'B.Tech Computer Science & Engineering (Cyber Security & Digital Forensics)',
  'B.Tech Computer Science & Engineering (Cloud Computing & Automation)',
  'B.Tech Computer Science & Engineering (Gaming Technology)',
  'B.Tech Computer Science & Engineering (Health Informatics)',
  'B.Tech Computer Science & Engineering (E-Commerce Technology)',
  'B.Tech Computer Science & Engineering (Education Technology)',
  'B.Tech Electronics & Communication Engineering',
  'B.Tech Electronics & Communication Engineering (Artificial Intelligence & Cybernetics)',
  'B.Tech Mechanical Engineering',
  'B.Tech Mechanical Engineering (Artificial Intelligence & Robotics)',
  'B.Tech Aerospace Engineering',
  'B.Tech Bioengineering',
  'B.Arch (Bachelor of Architecture)',
  'BBA (Bachelor of Business Administration)',
  'Integrated M.Tech (Computer Science & Engineering)',
  'Integrated M.Tech (AI & Bioinformatics)',
  'M.Tech Artificial Intelligence',
  'M.Tech Computer Science & Engineering (Cyber Security & Digital Forensics)',
  'M.Tech Computer Science & Engineering (Computational and Data Science)',
  'M.Tech Artificial Intelligence & Data Science',
  'M.Tech VLSI Design',
  'MCA (Master of Computer Applications)',
  'Other',
];

export const STUDY_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year / Integrated',
];

interface Props {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Partial<User>) => void;
}

export function ProfileOnboardingModal({ user, isOpen, onClose, onSuccess }: Props) {
  const [phone, setPhone] = useState(user.phone || '');
  const [regNo, setRegNo] = useState(user.student_id || '');
  const [department, setDepartment] = useState(() => {
    if (!user.department) return '';
    const clean = user.department.replace(/\s*\([A-Z]+\)$/, '').trim();
    return VIT_DEPARTMENTS.includes(clean) ? clean : user.department;
  });
  const [branch, setBranch] = useState(user.branch || '');
  const [year, setYear] = useState(user.year || STUDY_YEARS[0]);
  const [roomNo, setRoomNo] = useState(user.room_no || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile contact number.');
      return;
    }

    if (!regNo.trim()) {
      setError('Please provide your university Registration Number / Student ID.');
      return;
    }

    if (!department) {
      setError('Please select your academic department.');
      return;
    }

    if (!branch) {
      setError('Please select your branch of study.');
      return;
    }

    if (!year) {
      setError('Please select your current year of study.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          student_id: regNo.trim().toUpperCase(),
          department,
          branch,
          year,
          room_no: roomNo.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save student profile');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profile_modal_dismissed', 'true');
        localStorage.setItem('profile_modal_dismissed', 'true');
      }

      onSuccess({
        phone: cleanPhone,
        student_id: regNo.trim().toUpperCase(),
        department,
        branch,
        year,
        room_no: roomNo.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#002855] text-white p-6 sm:p-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Complete Your Student Profile
              </h2>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Verify your institutional information for seamless grievance tracking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('profile_modal_dismissed', 'true');
                localStorage.setItem('profile_modal_dismissed', 'true');
              }
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Email & Name Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Student Name</span>
              <span className="font-semibold text-slate-800">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Email Address</span>
              <span className="font-semibold text-slate-800 truncate block">{user.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Reg. No. / Student ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reg. No. (Student ID) *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 25BCE10632"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department *
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                required
              >
                <option value="" disabled>Select your School / Department</option>
                {VIT_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Branch *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                required
              >
                <option value="" disabled>Select your Branch / Programme</option>
                {VIT_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Year of Study (NO Academic Year) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Year of Study *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                >
                  {STUDY_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Room No. (if any) - Strictly Optional */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Room No. (if any)
              </label>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </div>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                placeholder="e.g. Block 1, Room 304 (or leave blank if Day Scholar)"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('profile_modal_dismissed', 'true');
                  localStorage.setItem('profile_modal_dismissed', 'true');
                }
                onClose();
              }}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#002855] text-white font-semibold text-xs hover:bg-[#134074] transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving Details...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
