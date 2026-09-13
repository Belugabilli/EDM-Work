'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus,
  ListOrdered,
  Bell,
  UserCircle,
  Users,
  Tags,
  BarChart3,
  History,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';

interface SidebarProps {
  portal: 'student' | 'admin';
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ portal, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const studentNavItems = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Complaints', href: '/student/complaints', icon: ListOrdered },
    { label: 'Submit Complaint', href: '/student/submit', icon: FilePlus },
    { label: 'Notifications', href: '/student/notifications', icon: Bell },
    { label: 'Profile', href: '/student/profile', icon: UserCircle },
  ];

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Complaints', href: '/admin/complaints', icon: ListOrdered },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit Log', href: '/admin/audit-log', icon: History },
    { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  const navItems = portal === 'student' ? studentNavItems : adminNavItems;
  const isAdmin = portal === 'admin';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isAdmin
            ? 'bg-[#07172c] border-r border-slate-800 text-slate-300'
            : 'bg-white border-r border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex flex-col h-full py-6 px-4">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden mb-4 pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-3">
            {isAdmin ? 'Administration Hub' : 'Student Services'}
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== `/${portal}/dashboard` && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? isAdmin
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-blue-50 text-blue-800 font-semibold border-l-4 border-blue-700'
                      : isAdmin
                      ? 'hover:bg-slate-800/80 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? isAdmin
                          ? 'text-white'
                          : 'text-blue-700'
                        : isAdmin
                        ? 'text-slate-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom university support pill */}
          <div
            className={`mt-auto p-3.5 rounded-xl border text-xs ${
              isAdmin
                ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              VIT Bhopal University
            </p>
            <p className="text-[11px] mt-0.5">
              Grievance Redressal & Student Welfare System
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
