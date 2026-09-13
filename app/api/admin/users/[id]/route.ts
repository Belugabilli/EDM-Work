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
    const { account_status, role } = body;

    const updates: Record<string, any> = {};
    if (account_status) {
      updates.account_status = account_status;
    }
    // Only SUPER_ADMIN can promote or demote roles
    if (role && user.role === 'SUPER_ADMIN') {
      updates.role = role;
    }

    await updateRow(SHEET_NAMES.USERS, 'user_id', id, updates);

    await recordAuditLog({
      actorId: user.id,
      action: 'UPDATE_USER',
      entityType: 'USER',
      entityId: id,
      details: `User status/role updated: ${JSON.stringify(updates)}`,
    });

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    console.error(`[PATCH /api/admin/users/${id} Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
