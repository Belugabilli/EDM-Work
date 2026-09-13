import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, updateRow, SHEET_NAMES } from '@/lib/googleSheets';
import { logStatusHistory, createNotification, recordAuditLog } from '@/lib/audit';
import { Complaint, ComplaintStatus } from '@/types';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status: newStatus, comment } = body;

    const validStatuses: ComplaintStatus[] = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
      'ESCALATED',
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: `Invalid status "${newStatus}"` }, { status: 400 });
    }

    const allComplaints = await getRows<Complaint>(SHEET_NAMES.COMPLAINTS);
    const complaint = allComplaints.find(
      (c) => c.complaint_id.toUpperCase() === id.toUpperCase()
    );

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const oldStatus = complaint.status;
    const timestamp = new Date().toISOString();

    const updates: Record<string, any> = {
      status: newStatus,
      updated_at: timestamp,
    };

    if (newStatus === 'RESOLVED') {
      updates.resolved_at = timestamp;
    } else if (newStatus === 'REJECTED') {
      updates.closed_at = timestamp;
    }

    // 1. Update Complaints sheet
    await updateRow(SHEET_NAMES.COMPLAINTS, 'complaint_id', complaint.complaint_id, updates);

    // 2. Append to Complaint_Status_History
    await logStatusHistory({
      complaintId: complaint.complaint_id,
      oldStatus,
      newStatus,
      changedBy: `${user.name} (${user.role})`,
      comment: comment || `Status updated to ${newStatus}`,
    });

    // 3. Create Notification for the student
    await createNotification({
      userId: complaint.user_id,
      complaintId: complaint.complaint_id,
      title: `Complaint Status Updated: ${newStatus}`,
      message: `Your complaint ${complaint.complaint_id} ("${complaint.subject}") has been updated from ${oldStatus} to ${newStatus}.`,
      type: 'STATUS_CHANGE',
    });

    // 4. Record Audit Log
    await recordAuditLog({
      actorId: user.id,
      action: 'UPDATE_STATUS',
      entityType: 'COMPLAINT',
      entityId: complaint.complaint_id,
      details: `Status changed from ${oldStatus} to ${newStatus}. Reason: ${comment || 'N/A'}`,
    });

    return NextResponse.json({
      success: true,
      message: `Complaint status updated to ${newStatus}`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error(`[PATCH /api/admin/complaints/${id}/status Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update complaint status' },
      { status: 500 }
    );
  }
}
