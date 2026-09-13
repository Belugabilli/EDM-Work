import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, updateRow, appendRow, SHEET_NAMES } from '@/lib/googleSheets';
import { User, AdminUser } from '@/types';
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
    // ADMIN or SUPER_ADMIN can promote or demote roles
    if (role && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      updates.role = role;

      // Synchronize with Admins sheet
      try {
        const users = await getRows<User>(SHEET_NAMES.USERS);
        const targetUser = users.find((u) => u.user_id === id);
        if (targetUser) {
          const admins = await getRows<AdminUser>(SHEET_NAMES.ADMINS);
          const existingAdmin = admins.find(
            (a) => a.email?.toLowerCase().trim() === targetUser.email?.toLowerCase().trim()
          );

          if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            if (existingAdmin) {
              await updateRow(SHEET_NAMES.ADMINS, 'email', targetUser.email, {
                role,
                active: 'TRUE',
              });
            } else {
              await appendRow(SHEET_NAMES.ADMINS, {
                admin_id: `ADM-${Date.now().toString(36).toUpperCase()}`,
                user_id: id,
                name: targetUser.name || '',
                email: targetUser.email || '',
                department: targetUser.department || 'Administration',
                role,
                active: 'TRUE',
              });
            }
          } else if (role === 'STUDENT') {
            if (existingAdmin) {
              await updateRow(SHEET_NAMES.ADMINS, 'email', targetUser.email, {
                active: 'FALSE',
              });
            }
          }
        }
      } catch (adminSyncErr) {
        console.warn('Could not sync to Admins sheet:', adminSyncErr);
      }
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
