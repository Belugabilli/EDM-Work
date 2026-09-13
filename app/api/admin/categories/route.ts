import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { appendRow, getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { recordAuditLog, generateUniqueId } from '@/lib/audit';
import { Category } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const categories = await getRows<Category>(SHEET_NAMES.CATEGORIES);
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('[GET /api/admin/categories Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { category_name, department } = body;

    if (!category_name || !department) {
      return NextResponse.json(
        { error: 'Category name and department are required' },
        { status: 400 }
      );
    }

    const categoryId = `CAT${Math.floor(100 + Math.random() * 900)}`;

    const newCategory = {
      category_id: categoryId,
      category_name: category_name.trim(),
      department: department.trim(),
      active: 'TRUE',
    };

    await appendRow(SHEET_NAMES.CATEGORIES, newCategory);

    await recordAuditLog({
      actorId: user.id,
      action: 'CREATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: categoryId,
      details: `Category ${category_name} (${department}) created`,
    });

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: 'Category created successfully',
    });
  } catch (error: any) {
    console.error('[POST /api/admin/categories Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
