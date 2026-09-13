'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  HardDrive,
  Shield,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch settings');
        }
        return res.json();
      })
      .then((data) => {
        setSettings(data.settings || {});
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save setting');

      setMessage({ type: 'success', text: `Setting "${key}" updated successfully in Google Sheets.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Configuration & Integration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global institution parameters stored directly in the Google Sheets Settings tab.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
          <SettingsIcon className="w-5 h-5" />
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-200'
              : 'bg-red-950/60 border border-red-700 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-slate-800/80 p-6 sm:p-8 rounded-2xl border border-slate-700 space-y-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>University Parameters</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading settings...</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Institution Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-750">
              <div className="w-full sm:w-1/3">
                <span className="font-semibold text-white block">institution_name</span>
                <span className="text-slate-400 text-[11px]">Primary university display label</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-2/3">
                <input
                  type="text"
                  value={settings['institution_name'] || ''}
                  onChange={(e) => handleChange('institution_name', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSave('institution_name')}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Complaint Prefix */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-750">
              <div className="w-full sm:w-1/3">
                <span className="font-semibold text-white block">complaint_prefix</span>
                <span className="text-slate-400 text-[11px]">Prefix for tracking ID generation</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-2/3">
                <input
                  type="text"
                  value={settings['complaint_prefix'] || ''}
                  onChange={(e) => handleChange('complaint_prefix', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSave('complaint_prefix')}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Max Attachment Size */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-750">
              <div className="w-full sm:w-1/3">
                <span className="font-semibold text-white block">max_attachment_size</span>
                <span className="text-slate-400 text-[11px]">Maximum file upload in bytes (10MB)</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-2/3">
                <input
                  type="text"
                  value={settings['max_attachment_size'] || ''}
                  onChange={(e) => handleChange('max_attachment_size', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSave('max_attachment_size')}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Support Email */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-750">
              <div className="w-full sm:w-1/3">
                <span className="font-semibold text-white block">support_email</span>
                <span className="text-slate-400 text-[11px]">Campus helpline and IT contact</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-2/3">
                <input
                  type="email"
                  value={settings['support_email'] || ''}
                  onChange={(e) => handleChange('support_email', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSave('support_email')}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0"
                >
                  Save
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-750">
              <div className="w-full sm:w-1/3">
                <span className="font-semibold text-white block">system_status</span>
                <span className="text-slate-400 text-[11px]">Current operational status</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-2/3">
                <select
                  value={settings['system_status'] || 'OPERATIONAL'}
                  onChange={(e) => handleChange('system_status', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="DEGRADED">DEGRADED</option>
                </select>
                <button
                  onClick={() => handleSave('system_status')}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integration Info Box */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Google Cloud & Spreadsheet Link</span>
        </h3>

        <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-750">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Connected Spreadsheet ID:</span>
            <span className="font-mono text-blue-400">18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Storage Architecture:</span>
            <span className="text-emerald-400 font-medium">Google Sheets API (Primary & Only Store)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Attachment Security:</span>
            <span className="text-amber-400 font-medium">Google Drive (Strictly Private Access)</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <span className="text-slate-400">Setup Command:</span>
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-200">npm run setup-sheet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
