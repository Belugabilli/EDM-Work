import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { updateRow, SHEET_NAMES } from '@/lib/googleSheets';
import { recordAuditLog } from '@/lib/audit';

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
    const { assigned_to } = body;

    const timestamp = new Date().toISOString();

    await updateRow(SHEET_NAMES.COMPLAINTS, 'complaint_id', id, {
      assigned_to: assigned_to || '',
      updated_at: timestamp,
    });

    await recordAuditLog({
      actorId: user.id,
      action: 'ASSIGN_COMPLAINT',
      entityType: 'COMPLAINT',
      entityId: id,
      details: `Complaint assigned to: ${assigned_to || 'Unassigned'}`,
    });

    return NextResponse.json({
      success: true,
      message: `Complaint assigned to ${assigned_to}`,
    });
  } catch (error: any) {
    console.error(`[PATCH /api/admin/complaints/${id}/assign Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign complaint' },
      { status: 500 }
    );
  }
}
