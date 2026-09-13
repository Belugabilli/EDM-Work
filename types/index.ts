export type Role = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'ESCALATED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NotificationType = 'STATUS_CHANGE' | 'ADMIN_RESPONSE' | 'SYSTEM';

export interface User {
  user_id: string;
  student_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  branch?: string;
  year: string; // Current Year of Study
  room_no?: string; // Strictly optional: Room No. (if any)
  role: Role;
  account_status: AccountStatus;
  created_at: string;
  last_login: string;
}

export interface Complaint {
  complaint_id: string;
  user_id: string;
  student_id: string;
  category_id: string;
  subject: string;
  description: string;
  location: string;
  room_no?: string; // Strictly optional: Room No. (if any)
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_to?: string; // admin_id or admin email
  attachment_url?: string; // Private Google Drive File ID or reference
  attachment_name?: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
}

export interface ComplaintStatusHistory {
  history_id: string;
  complaint_id: string;
  old_status: ComplaintStatus;
  new_status: ComplaintStatus;
  changed_by: string; // user email / name
  comment: string;
  timestamp: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  department: string;
  active: boolean | string;
}

export interface AdminUser {
  admin_id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  active: boolean | string;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  complaint_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean | string;
  created_at: string;
}

export interface AuditLog {
  log_id: string;
  actor_id: string; // user email or ID
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}

export interface SystemSetting {
  key: string;
  value: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  student_id?: string;
  department?: string;
  branch?: string;
  year?: string;
  room_no?: string;
}
