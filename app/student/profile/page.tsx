'use client';

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertCircle,
  Hash,
  Shield,
} from 'lucide-react';
import { User } from '@/types';
import { VIT_DEPARTMENTS, VIT_BRANCHES, STUDY_YEARS } from '@/components/ProfileOnboardingModal';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [phone, setPhone] = useState('');
  const [regNo, setRegNo] = useState('');
  const [department, setDepartment] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [roomNo, setRoomNo] = useState(''); // Labeled: Room No. (if any) - OPTIONAL

  useEffect(() => {
    fetch('/api/profile')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load profile');
        }
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          const p = data.profile;
          setProfile(p);
          setPhone(p.phone || '');
          setRegNo(p.student_id || '');
          const cleanDept = p.department?.replace(/\s*\([A-Z]+\)$/, '').trim() || '';
          setDepartment(VIT_DEPARTMENTS.includes(cleanDept) ? cleanDept : (p.department || ''));
          setBranch(p.branch || '');
          setYear(p.year || STUDY_YEARS[0]);
          setRoomNo(p.room_no || '');
        }
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      setSaving(false);
      return;
    }

    if (!regNo.trim()) {
      setErrorMsg('Please enter your university Registration Number.');
      setSaving(false);
      return;
    }

    if (!department) {
      setErrorMsg('Please select your academic department.');
      setSaving(false);
      return;
    }

    if (!branch) {
      setErrorMsg('Please select your branch of study.');
      setSaving(false);
      return;
    }

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
      if (!res.ok) throw new Error(data.error || 'Failed to save profile changes');

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profile_modal_dismissed', 'true');
        localStorage.setItem('profile_modal_dismissed', 'true');
      }

      setSuccessMsg('Profile updated successfully in university database.');
      if (profile) {
        setProfile({
          ...profile,
          phone: cleanPhone,
          student_id: regNo.trim().toUpperCase(),
          department,
          branch,
          year,
          room_no: roomNo.trim(),
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading student profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered institutional and academic credentials at VIT Bhopal University.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
          <UserIcon className="w-6 h-6" />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {profile && (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          {/* Readonly Google Account Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Google Account Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {profile.name}
                </span>
              </div>

              {/* University Email */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Institutional Email
                </span>
                <span className="text-sm font-medium text-slate-800 mt-1 block truncate">
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Academic Details Section */}
          <div className="pt-6 border-t border-slate-200 space-y-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Academic & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Registration Number (Student ID) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reg. No. (Student ID) *
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. 25BCE10632"
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-[#002855]"
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / School *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
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

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Branch *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
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

              {/* Current Year of Study */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Year of Study *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
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

              {/* STRICT REQUIREMENT: Room No. (if any) — OPTIONAL */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Room No. (if any)
                  </label>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </div>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="e.g. Block 1, Room 304 (or leave blank if Day Scholar)"
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#002855] text-white font-semibold text-xs hover:bg-[#134074] transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
