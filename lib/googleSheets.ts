import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export const SHEET_NAMES = {
  USERS: 'Users',
  COMPLAINTS: 'Complaints',
  COMPLAINT_STATUS_HISTORY: 'Complaint_Status_History',
  CATEGORIES: 'Categories',
  ADMINS: 'Admins',
  NOTIFICATIONS: 'Notifications',
  AUDIT_LOG: 'Audit_Log',
  SETTINGS: 'Settings',
} as const;

export const SHEET_COLUMNS = {
  [SHEET_NAMES.USERS]: [
    'user_id',
    'student_id',
    'name',
    'email',
    'phone',
    'department',
    'branch',
    'year',
    'room_no',
    'role',
    'account_status',
    'created_at',
    'last_login',
  ],
  [SHEET_NAMES.COMPLAINTS]: [
    'complaint_id',
    'user_id',
    'student_id',
    'category_id',
    'subject',
    'description',
    'location',
    'room_no',
    'priority',
    'status',
    'assigned_to',
    'attachment_url',
    'admin_response',
    'created_at',
    'updated_at',
    'resolved_at',
    'closed_at',
  ],
  [SHEET_NAMES.COMPLAINT_STATUS_HISTORY]: [
    'history_id',
    'complaint_id',
    'old_status',
    'new_status',
    'changed_by',
    'comment',
    'timestamp',
  ],
  [SHEET_NAMES.CATEGORIES]: ['category_id', 'category_name', 'department', 'active'],
  [SHEET_NAMES.ADMINS]: ['admin_id', 'user_id', 'name', 'email', 'department', 'role', 'active'],
  [SHEET_NAMES.NOTIFICATIONS]: [
    'notification_id',
    'user_id',
    'complaint_id',
    'title',
    'message',
    'type',
    'is_read',
    'created_at',
  ],
  [SHEET_NAMES.AUDIT_LOG]: [
    'log_id',
    'actor_id',
    'action',
    'entity_type',
    'entity_id',
    'details',
    'timestamp',
  ],
  [SHEET_NAMES.SETTINGS]: ['key', 'value'],
};

// Singleton sheets client
let sheetsClientInstance: ReturnType<typeof google.sheets> | null = null;

export function getSpreadsheetId(): string {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error(
      'Missing GOOGLE_SHEET_ID environment variable. Please configure it in .env or Vercel.'
    );
  }
  return sheetId;
}

export function getGoogleAuthClient(): JWT {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Google Sheets integration error: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY is not configured. Please check your environment variables.'
    );
  }

  let cleanKey = String(privateKey);
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    try {
      cleanKey = JSON.parse(cleanKey);
    } catch {
      // Keep original
    }
  }
  cleanKey = cleanKey.replace(/\\n/g, '\n');

  return new JWT({
    email: clientEmail,
    key: cleanKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

export function getSheetsClient() {
  if (!sheetsClientInstance) {
    const auth = getGoogleAuthClient();
    sheetsClientInstance = google.sheets({ version: 'v4', auth });
  }
  return sheetsClientInstance;
}

/**
 * Fetch all rows from a sheet, converted to an array of objects keyed by header names.
 */
export async function getRows<T = Record<string, string>>(sheetName: string): Promise<T[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z`,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return [];
    }

    const headers = rows[0].map((h) => String(h).trim());
    const dataRows = rows.slice(1);

    return dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        const val = row[index];
        obj[header] = val !== undefined && val !== null ? String(val) : '';
      });
      return obj as unknown as T;
    });
  } catch (error: any) {
    console.error(`[GoogleSheets getRows Error on ${sheetName}]:`, error?.message || error);
    throw new Error(
      `Failed to fetch data from Google Sheet "${sheetName}": ${error?.message || 'Permission denied or sheet inaccessible'}`
    );
  }
}

/**
 * Append a single row or multiple rows to a sheet according to predefined column order.
 */
export async function appendRow(
  sheetName: string,
  data: Record<string, any>
): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const columns = SHEET_COLUMNS[sheetName as keyof typeof SHEET_COLUMNS];
  if (!columns) {
    throw new Error(`Unknown sheet column schema for sheet: ${sheetName}`);
  }

  const rowValues = columns.map((col) => {
    const val = data[col];
    if (val === undefined || val === null) return '';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return String(val);
  });

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'OVERWRITE',
      requestBody: {
        values: [rowValues],
      },
    });
  } catch (error: any) {
    console.error(`[GoogleSheets appendRow Error on ${sheetName}]:`, error?.message || error);
    throw new Error(
      `Failed to write to Google Sheet "${sheetName}": ${error?.message || 'Write operation rejected'}`
    );
  }
}

/**
 * Update a specific row in a sheet matching a primary key or column condition.
 * @param sheetName Name of the sheet
 * @param keyColumn Column to match, e.g. "complaint_id" or "user_id"
 * @param keyValue Value to search for
 * @param updates Key-value updates to apply
 */
export async function updateRow(
  sheetName: string,
  keyColumn: string,
  keyValue: string,
  updates: Record<string, any>
): Promise<boolean> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false;

    const headers = rows[0].map((h) => String(h).trim());
    const keyColIndex = headers.indexOf(keyColumn);

    if (keyColIndex === -1) {
      throw new Error(`Key column "${keyColumn}" not found in sheet "${sheetName}"`);
    }

    // Find row index (1-indexed for Google Sheets API)
    let targetRowIndex = -1;
    let existingRow: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][keyColIndex]).trim() === String(keyValue).trim()) {
        targetRowIndex = i + 1; // Google Sheets row numbers are 1-based
        existingRow = rows[i];
        break;
      }
    }

    if (targetRowIndex === -1) {
      return false;
    }

    // Merge updates into existing row
    const updatedRow = [...existingRow];
    // Pad to full header length if shorter
    while (updatedRow.length < headers.length) {
      updatedRow.push('');
    }

    Object.entries(updates).forEach(([colName, newVal]) => {
      const idx = headers.indexOf(colName);
      if (idx !== -1) {
        if (newVal === undefined || newVal === null) {
          updatedRow[idx] = '';
        } else if (typeof newVal === 'boolean') {
          updatedRow[idx] = newVal ? 'TRUE' : 'FALSE';
        } else {
          updatedRow[idx] = String(newVal);
        }
      }
    });

    const lastColLetter = String.fromCharCode(65 + headers.length - 1);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${targetRowIndex}:${lastColLetter}${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    return true;
  } catch (error: any) {
    console.error(`[GoogleSheets updateRow Error on ${sheetName}]:`, error?.message || error);
    throw new Error(
      `Failed to update row in Google Sheet "${sheetName}": ${error?.message || 'Update failed'}`
    );
  }
}

/**
 * Find a single row matching a condition.
 */
export async function findRow<T = Record<string, string>>(
  sheetName: string,
  predicate: (row: Record<string, string>) => boolean
): Promise<T | null> {
  const rows = await getRows<Record<string, string>>(sheetName);
  const found = rows.find(predicate);
  return (found as unknown as T) || null;
}

/**
 * Find multiple rows matching a condition.
 */
export async function findRows<T = Record<string, string>>(
  sheetName: string,
  predicate: (row: Record<string, string>) => boolean
): Promise<T[]> {
  const rows = await getRows<Record<string, string>>(sheetName);
  return rows.filter(predicate) as unknown as T[];
}
