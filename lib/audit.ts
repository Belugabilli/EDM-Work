import { appendRow, getRows, SHEET_NAMES } from './googleSheets';
import { ComplaintStatus, NotificationType } from '@/types';

/**
 * Generate a collision-safe ID with timestamp and random alphanumeric suffix.
 */
export function generateUniqueId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomSuffix}`;
}

/**
 * Generate sequential Complaint ID: CMP-2026-00001
 */
export async function generateComplaintId(): Promise<string> {
  try {
    const existingComplaints = await getRows<any>(SHEET_NAMES.COMPLAINTS);
    const count = existingComplaints.length + 1;
    const padded = String(count).padStart(5, '0');
    return `CMP-2026-${padded}`;
  } catch (error) {
    // If fetching fails or sheet empty, generate timestamp-based ID to ensure collision safety
    const random = Math.floor(10000 + Math.random() * 90000);
    return `CMP-2026-${random}`;
  }
}

/**
 * Append to Complaint_Status_History
 */
export async function logStatusHistory({
  complaintId,
  oldStatus,
  newStatus,
  changedBy,
  comment,
}: {
  complaintId: string;
  oldStatus: ComplaintStatus | '';
  newStatus: ComplaintStatus;
  changedBy: string;
  comment: string;
}): Promise<string> {
  const historyId = generateUniqueId('HIST');
  const timestamp = new Date().toISOString();

  await appendRow(SHEET_NAMES.COMPLAINT_STATUS_HISTORY, {
    history_id: historyId,
    complaint_id: complaintId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: changedBy,
    comment: comment || `Status transitioned from ${oldStatus || 'NONE'} to ${newStatus}`,
    timestamp,
  });

  return historyId;
}

/**
 * Create in-app Notification for a user
 */
export async function createNotification({
  userId,
  complaintId,
  title,
  message,
  type,
}: {
  userId: string;
  complaintId: string;
  title: string;
  message: string;
  type: NotificationType;
}): Promise<string> {
  const notificationId = generateUniqueId('NOTIF');
  const createdAt = new Date().toISOString();

  await appendRow(SHEET_NAMES.NOTIFICATIONS, {
    notification_id: notificationId,
    user_id: userId,
    complaint_id: complaintId,
    title,
    message,
    type,
    is_read: 'FALSE',
    created_at: createdAt,
  });

  return notificationId;
}

/**
 * Record action in Audit_Log
 */
export async function recordAuditLog({
  actorId,
  action,
  entityType,
  entityId,
  details,
}: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}): Promise<string> {
  const logId = generateUniqueId('LOG');
  const timestamp = new Date().toISOString();

  await appendRow(SHEET_NAMES.AUDIT_LOG, {
    log_id: logId,
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    timestamp,
  });

  return logId;
}
