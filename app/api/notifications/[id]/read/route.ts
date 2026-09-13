import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { updateRow, SHEET_NAMES } from '@/lib/googleSheets';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await updateRow(SHEET_NAMES.NOTIFICATIONS, 'notification_id', id, {
      is_read: 'TRUE',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[PATCH /api/notifications/${id}/read Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
