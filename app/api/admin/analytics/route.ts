import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { Complaint, Category } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const complaints = await getRows<Complaint>(SHEET_NAMES.COMPLAINTS);
    const categories = await getRows<Category>(SHEET_NAMES.CATEGORIES);

    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.category_id, cat.category_name);
    });

    const total = complaints.length;

    // Status Breakdown
    const statusCounts: Record<string, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
      ESCALATED: 0,
    };

    // Priority Breakdown
    const priorityCounts: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    // Category Breakdown
    const categoryCounts: Record<string, number> = {};

    let totalResolutionTimeHours = 0;
    let resolvedCount = 0;

    complaints.forEach((c) => {
      // Status
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      } else {
        statusCounts[c.status] = 1;
      }

      // Priority
      if (priorityCounts[c.priority] !== undefined) {
        priorityCounts[c.priority]++;
      }

      // Category
      const catName = categoryMap.get(c.category_id) || c.category_id || 'Uncategorized';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

      // Resolution Time
      if (c.status === 'RESOLVED' && c.resolved_at && c.created_at) {
        const createdTime = new Date(c.created_at).getTime();
        const resolvedTime = new Date(c.resolved_at).getTime();
        if (!isNaN(createdTime) && !isNaN(resolvedTime) && resolvedTime >= createdTime) {
          const hours = (resolvedTime - createdTime) / (1000 * 60 * 60);
          totalResolutionTimeHours += hours;
          resolvedCount++;
        }
      }
    });

    const avgResolutionHours = resolvedCount > 0 ? (totalResolutionTimeHours / resolvedCount).toFixed(1) : 'N/A';
    const resolutionRate = total > 0 ? ((statusCounts['RESOLVED'] / total) * 100).toFixed(1) : '0';

    return NextResponse.json({
      total,
      statusCounts,
      priorityCounts,
      categoryCounts,
      resolutionRate,
      avgResolutionHours,
      resolvedCount,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/analytics Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}
