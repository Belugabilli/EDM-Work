'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User as UserIcon, Shield, Menu, X } from 'lucide-react';
import { AuthSessionUser } from '@/types';

interface NavbarProps {
  portal: 'student' | 'admin';
  user?: AuthSessionUser | null;
  onToggleSidebar?: () => void;
}

export function Navbar({ portal, user, onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (portal === 'student') {
      fetch('/api/notifications')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [portal]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const isAdmin = portal === 'admin';

  return (
    <header
      className={`sticky top-0 z-40 w-full ${
        isAdmin ? 'glass-nav-dark text-white' : 'glass-nav text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg lg:hidden ${
                isAdmin ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-600'
              }`}
              aria-label="Toggle Sidebar Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-md bg-white p-0.5 shadow-xs shrink-0">
              <Image
                src="/vit-bhopal-logo.png"
                alt="VIT Bhopal Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold tracking-tight text-sm sm:text-base ${isAdmin ? 'text-white' : 'text-[#002855]'}`}>
                  VIT Bhopal University
                </span>
                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {isAdmin ? 'Admin Portal' : 'Student Portal'}
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
                {isAdmin ? 'Campus Grievance Management' : 'Complaint Redressal Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* Right User actions */}
        <div className="flex items-center gap-3">
          {/* Notifications link for students */}
          {portal === 'student' && (
            <Link
              href="/student/notifications"
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Info Pill */}
          {user && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${
                isAdmin
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
              }`}
            >
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
              )}
              <div className="flex flex-col text-left">
                <span className="font-semibold leading-tight max-w-[120px] sm:max-w-[160px] truncate">
                  {user.name}
                </span>
                {user.student_id && (
                  <span className="text-[10px] text-slate-400 leading-none">
                    {user.student_id}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isAdmin
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20'
                : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200'
            }`}
            title="Sign out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
