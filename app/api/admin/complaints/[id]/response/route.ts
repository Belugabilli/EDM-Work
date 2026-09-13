import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, updateRow, SHEET_NAMES } from '@/lib/googleSheets';
import { createNotification, recordAuditLog } from '@/lib/audit';
import { Complaint } from '@/types';

export async function POST(
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
    const { response: adminResponse } = body;

    if (!adminResponse || adminResponse.trim().length === 0) {
      return NextResponse.json({ error: 'Response content cannot be empty' }, { status: 400 });
    }

    const allComplaints = await getRows<Complaint>(SHEET_NAMES.COMPLAINTS);
    const complaint = allComplaints.find(
      (c) => c.complaint_id.toUpperCase() === id.toUpperCase()
    );

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const timestamp = new Date().toISOString();

    // 1. Update Complaint in sheet
    await updateRow(SHEET_NAMES.COMPLAINTS, 'complaint_id', complaint.complaint_id, {
      admin_response: adminResponse.trim(),
      updated_at: timestamp,
    });

    // 2. Notify student
    await createNotification({
      userId: complaint.user_id,
      complaintId: complaint.complaint_id,
      title: 'New Official Admin Response',
      message: `An official response has been added to your complaint ${complaint.complaint_id}: "${adminResponse.trim().slice(0, 100)}..."`,
      type: 'ADMIN_RESPONSE',
    });

    // 3. Record Audit Log
    await recordAuditLog({
      actorId: user.id,
      action: 'ADMIN_RESPONSE',
      entityType: 'COMPLAINT',
      entityId: complaint.complaint_id,
      details: `Official response added by ${user.name} (${user.email})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Official response posted successfully',
    });
  } catch (error: any) {
    console.error(`[POST /api/admin/complaints/${id}/response Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to post admin response' },
      { status: 500 }
    );
  }
}
