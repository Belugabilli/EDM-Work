import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { Complaint, User, ComplaintStatusHistory, AuditLog } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
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

    // Fetch student info
    const allUsers = await getRows<User>(SHEET_NAMES.USERS);
    const student = allUsers.find((u) => u.user_id === complaint.user_id) || null;

    // Fetch status history
    const allHistory = await getRows<ComplaintStatusHistory>(
      SHEET_NAMES.COMPLAINT_STATUS_HISTORY
    );
    const history = allHistory
      .filter((h) => h.complaint_id.toUpperCase() === id.toUpperCase())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Fetch audit log entries for this complaint
    const allAudit = await getRows<AuditLog>(SHEET_NAMES.AUDIT_LOG);
    const auditLogs = allAudit
      .filter((l) => l.entity_id.toUpperCase() === id.toUpperCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      complaint,
      student,
      history,
      auditLogs,
    });
  } catch (error: any) {
    console.error(`[GET /api/admin/complaints/${id} Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch complaint details' },
      { status: 500 }
    );
  }
}
