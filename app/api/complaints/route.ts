import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { appendRow, getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { generateComplaintId, logStatusHistory, recordAuditLog } from '@/lib/audit';
import { Complaint, ComplaintPriority } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allComplaints = await getRows<Complaint>(SHEET_NAMES.COMPLAINTS);
    // Student can only read their own complaints
    const studentComplaints = allComplaints.filter((c) => c.user_id === user.id);

    // Parse query params for filtering/searching
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let filtered = studentComplaints;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.complaint_id.toLowerCase().includes(search) ||
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

    // Sort newest first
    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ complaints: filtered });
  } catch (error: any) {
    console.error('[GET /api/complaints Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      category_id,
      subject,
      description,
      location,
      room_no, // Room No. (if any) - OPTIONAL
      priority = 'MEDIUM',
      attachment_url = '',
    } = body;

    // Strict validation
    if (!category_id) {
      return NextResponse.json({ error: 'Complaint category is required' }, { status: 400 });
    }
    if (!subject || subject.trim().length < 5) {
      return NextResponse.json(
        { error: 'Subject must be at least 5 characters long' },
        { status: 400 }
      );
    }
    if (!description || description.trim().length < 15) {
      return NextResponse.json(
        { error: 'Description must be at least 15 characters long' },
        { status: 400 }
      );
    }
    if (!location || !String(location).trim()) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    const validPriorities: ComplaintPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const assignedPriority: ComplaintPriority = validPriorities.includes(priority)
      ? priority
      : 'MEDIUM';

    // Generate collision-safe Complaint ID: CMP-2026-XXXXX
    const complaintId = await generateComplaintId();
    const timestamp = new Date().toISOString();

    const newComplaint: Record<string, string> = {
      complaint_id: complaintId,
      user_id: user.id,
      student_id: user.student_id || '',
      category_id,
      subject: subject.trim(),
      description: description.trim(),
      location: location.trim(),
      room_no: room_no ? room_no.trim() : '', // strictly optional
      priority: assignedPriority,
      status: 'SUBMITTED',
      assigned_to: '',
      attachment_url: attachment_url || '',
      admin_response: '',
      created_at: timestamp,
      updated_at: timestamp,
      resolved_at: '',
      closed_at: '',
    };

    // 1. Append to Complaints sheet
    await appendRow(SHEET_NAMES.COMPLAINTS, newComplaint);

    // 2. Append to Complaint_Status_History
    await logStatusHistory({
      complaintId,
      oldStatus: '',
      newStatus: 'SUBMITTED',
      changedBy: user.name || user.email,
      comment: 'Complaint submitted by student',
    });

    // 3. Record in Audit_Log
    await recordAuditLog({
      actorId: user.id,
      action: 'CREATE_COMPLAINT',
      entityType: 'COMPLAINT',
      entityId: complaintId,
      details: `Complaint ${complaintId} created under category ${category_id}`,
    });

    return NextResponse.json(
      {
        success: true,
        complaint_id: complaintId,
        message: 'Complaint submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/complaints Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit complaint to Google Sheets' },
      { status: 500 }
    );
  }
}
