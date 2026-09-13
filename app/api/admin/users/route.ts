import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { User, AdminUser } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const users = await getRows<User>(SHEET_NAMES.USERS);
    const admins = await getRows<AdminUser>(SHEET_NAMES.ADMINS);

    return NextResponse.json({
      users,
      admins,
      total: users.length,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/users Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
