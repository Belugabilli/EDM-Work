import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck2,
  Clock,
  ArrowRight,
  Sparkles,
  School,
  Lock,
  Headphones,
  CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Home | Campus Grievance & Incident Redressal Portal',
  description:
    'Official portal for VIT Bhopal University students and staff to lodge campus grievances, track resolution progress, and access administrative facilities transparently.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#002855] text-blue-100 text-xs py-2 px-4 text-center font-medium border-b border-blue-900">
        Official Grievance Redressal & Campus Incident Portal — VIT Bhopal University
      </div>

      {/* Main Header */}
      <header className="glass-nav sticky top-0 z-30 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 overflow-hidden rounded-lg bg-white p-1 shadow-xs border border-slate-200 shrink-0">
              <Image
                src="/vit-bhopal-logo.png"
                alt="VIT Bhopal Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl text-[#002855] tracking-tight block leading-tight">
                VIT Bhopal University
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Campus Complaint Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#002855] hover:bg-[#134074] transition-all shadow-sm hover:shadow"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:py-24">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Transparent Campus Redressal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Submit, Track, and Resolve Campus Grievances Transparently.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The unified digital complaint portal for students and faculty of VIT Bhopal University.
            Report issues in hostels, academics, mess, IT services, and infrastructure with real-time status tracking.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-[#002855] hover:bg-[#134074] transition-all shadow-md hover:shadow-lg"
            >
              <span>Sign In with University Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-bold text-[#002855]">100%</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Digital Audit Trail</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">&lt; 48 hrs</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Target Response Time</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-bold text-[#002855]">8+</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Campus Departments</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-bold text-amber-600">Live</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Status Stepper Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Designed Specifically for VIT Bhopal Campus Needs
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Modern workflow ensuring complaints reach the exact concerned administrator without delay.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 transition-card">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-5">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Seamless Grievance Submission</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Categorize complaints across Academics, Hostel, Mess, Transport, and IT. Attach images or PDFs securely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 transition-card">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Status Stepper</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Track complaint lifecycle transparently: Submitted → Under Review → In Progress → Resolved with administration remarks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 transition-card">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Administrative Governance</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Departmental assigning, official admin responses, and complete audit logging stored directly in Google Sheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#07172c] text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">VIT Bhopal University</span>
            <span>•</span>
            <span>Bhopal-Indore Highway, Kothrikalan, Sehore, Madhya Pradesh - 466114</span>
          </div>
          <div>
            <span>Campus Complaint Management System © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
