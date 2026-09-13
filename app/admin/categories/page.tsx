'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, CheckCircle2, Ban, AlertCircle } from 'lucide-react';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [categoryName, setCategoryName] = useState('');
  const [department, setDepartment] = useState('');

  const fetchCategories = () => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !department) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: categoryName, department }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');

      setCategoryName('');
      setDepartment('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean | string) => {
    const nextVal = String(currentActive).toUpperCase() !== 'TRUE';
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextVal }),
      });
      if (!res.ok) throw new Error('Failed to update category');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Complaint Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure grievance classifications and target department routing.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
          <Tags className="w-5 h-5" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Form on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4 h-fit">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add New Category</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Sports Equipment"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Physical Education"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2 bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-sm font-bold text-white">Active & Configured Categories</h2>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500">Loading categories...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Category Name</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-slate-300">
                  {categories.map((c) => {
                    const isActive = String(c.active).toUpperCase() === 'TRUE';
                    return (
                      <tr key={c.category_id} className="hover:bg-slate-750/50">
                        <td className="py-4 px-6 font-mono font-semibold text-blue-400">
                          {c.category_id}
                        </td>
                        <td className="py-4 px-6 font-medium text-white">{c.category_name}</td>
                        <td className="py-4 px-6 text-slate-400">{c.department}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleToggleActive(c.category_id, c.active)}
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
