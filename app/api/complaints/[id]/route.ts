import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { Complaint, ComplaintStatusHistory } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const allComplaints = await getRows<Complaint>(SHEET_NAMES.COMPLAINTS);
    const complaint = allComplaints.find(
      (c) => c.complaint_id.toUpperCase() === id.toUpperCase()
    );

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Security check: Student can only view their own complaint
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && complaint.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to view this complaint' },
        { status: 403 }
      );
    }

    // Fetch status history for this complaint
    const allHistory = await getRows<ComplaintStatusHistory>(
      SHEET_NAMES.COMPLAINT_STATUS_HISTORY
    );
    const complaintHistory = allHistory
      .filter((h) => h.complaint_id.toUpperCase() === id.toUpperCase())
      .sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    return NextResponse.json({ complaint, history: complaintHistory });
  } catch (error: any) {
    console.error(`[GET /api/complaints/${id} Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch complaint details' },
      { status: 500 }
    );
  }
}
