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
    const { category_name, department, active } = body;

    const updates: Record<string, any> = {};
    if (category_name !== undefined) updates.category_name = category_name.trim();
    if (department !== undefined) updates.department = department.trim();
    if (active !== undefined) updates.active = active ? 'TRUE' : 'FALSE';

    await updateRow(SHEET_NAMES.CATEGORIES, 'category_id', id, updates);

    await recordAuditLog({
      actorId: user.id,
      action: 'UPDATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: id,
      details: `Category ${id} updated: ${JSON.stringify(updates)}`,
    });

    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error: any) {
    console.error(`[PATCH /api/admin/categories/${id} Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}
