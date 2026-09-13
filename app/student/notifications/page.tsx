'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, ArrowRight, Clock, AlertCircle, Inbox } from 'lucide-react';
import { Notification } from '@/types';

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: 'TRUE' } : n))
      );
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status updates and administrative responses for your complaints.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <Inbox className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-700">No notifications yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              You will receive notifications here whenever an admin updates your complaint.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const isUnread = String(n.is_read).toUpperCase() === 'FALSE';
              return (
                <div
                  key={n.notification_id}
                  className={`p-5 transition-colors flex items-start justify-between gap-4 ${
                    isUnread ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                      <h4 className="text-sm font-semibold text-slate-900">
                        {n.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {n.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.complaint_id && (
                        <Link
                          href={`/student/complaints/${n.complaint_id}`}
                          onClick={() => isUnread && markAsRead(n.notification_id)}
                          className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>Complaint {n.complaint_id}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {isUnread && (
                    <button
                      onClick={() => markAsRead(n.notification_id)}
                      className="text-xs text-slate-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-slate-100 shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
