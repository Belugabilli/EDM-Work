import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, updateRow, SHEET_NAMES } from '@/lib/googleSheets';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await getRows<User>(SHEET_NAMES.USERS);
    const profile = users.find((u) => u.user_id === user.id);

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('[GET /api/profile Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phone, student_id, department, branch, year, room_no } = body;

    const updates: Record<string, any> = {};
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (student_id !== undefined && String(student_id).trim()) {
      updates.student_id = String(student_id).trim().toUpperCase();
    }
    if (department !== undefined) updates.department = String(department).trim();
    if (branch !== undefined) updates.branch = String(branch).trim();
    if (year !== undefined) updates.year = String(year).trim();
    if (room_no !== undefined) updates.room_no = String(room_no).trim();

    await updateRow(SHEET_NAMES.USERS, 'user_id', user.id, updates);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      updated: updates,
    });
  } catch (error: any) {
    console.error('[PATCH /api/profile Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
