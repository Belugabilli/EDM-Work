import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, updateRow, appendRow, SHEET_NAMES } from '@/lib/googleSheets';
import { recordAuditLog } from '@/lib/audit';
import { SystemSetting } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const settingsRows = await getRows<SystemSetting>(SHEET_NAMES.SETTINGS);
    const settings: Record<string, string> = {};
    settingsRows.forEach((s) => {
      if (s.key) settings[s.key] = s.value;
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('[GET /api/admin/settings Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Only SUPER_ADMIN can modify system settings' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    const settingsRows = await getRows<SystemSetting>(SHEET_NAMES.SETTINGS);
    const exists = settingsRows.some((s) => s.key === key);

    if (exists) {
      await updateRow(SHEET_NAMES.SETTINGS, 'key', key, { value: String(value) });
    } else {
      await appendRow(SHEET_NAMES.SETTINGS, { key, value: String(value) });
    }

    await recordAuditLog({
      actorId: user.id,
      action: 'UPDATE_SETTING',
      entityType: 'SETTING',
      entityId: key,
      details: `Setting "${key}" updated to "${value}"`,
    });

    return NextResponse.json({ success: true, message: `Setting "${key}" updated` });
  } catch (error: any) {
    console.error('[PATCH /api/admin/settings Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
