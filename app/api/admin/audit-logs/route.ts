import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { AuditLog } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const logs = await getRows<AuditLog>(SHEET_NAMES.AUDIT_LOG);
    const sorted = logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ logs: sorted });
  } catch (error: any) {
    console.error('[GET /api/admin/audit-logs Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
