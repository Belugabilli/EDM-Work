import { NextResponse } from 'next/server';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { Category } from '@/types';

export async function GET() {
  try {
    const categories = await getRows<Category>(SHEET_NAMES.CATEGORIES);
    const activeCategories = categories.filter(
      (c) => String(c.active).toUpperCase() === 'TRUE'
    );
    return NextResponse.json({ categories: activeCategories });
  } catch (error: any) {
    console.error('[GET /api/categories Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
