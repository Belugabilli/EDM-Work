import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { Complaint } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const allComplaints = await getRows<Complaint>(SHEET_NAMES.COMPLAINTS);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assigned_to');

    let filtered = allComplaints;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.complaint_id.toLowerCase().includes(search) ||
          c.student_id?.toLowerCase().includes(search) ||
          c.subject.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.location.toLowerCase().includes(search)
      );
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter((c) => c.status === status);
    }

    if (category && category !== 'ALL') {
      filtered = filtered.filter((c) => c.category_id === category);
    }

    if (priority && priority !== 'ALL') {
      filtered = filtered.filter((c) => c.priority === priority);
    }

    if (assignedTo && assignedTo !== 'ALL') {
      filtered = filtered.filter((c) => c.assigned_to === assignedTo);
    }

    // Sort newest first
    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ complaints: filtered, total: filtered.length });
  } catch (error: any) {
    console.error('[GET /api/admin/complaints Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin complaints' },
      { status: 500 }
    );
  }
}
