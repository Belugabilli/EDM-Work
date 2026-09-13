import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { Notification } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allNotifications = await getRows<Notification>(SHEET_NAMES.NOTIFICATIONS);
    const userNotifications = allNotifications
      .filter((n) => n.user_id === user.id)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const unreadCount = userNotifications.filter(
      (n) => String(n.is_read).toUpperCase() === 'FALSE'
    ).length;

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('[GET /api/notifications Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
