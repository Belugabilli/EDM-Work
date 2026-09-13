import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEET_ID || '18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo';

const REQUIRED_SHEETS = [
  'Users',
  'Complaints',
  'Complaint_Status_History',
  'Categories',
  'Admins',
  'Notifications',
  'Audit_Log',
  'Settings',
];

const SHEET_HEADERS: Record<string, string[]> = {
  Users: [
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
  Complaints: [
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
  Complaint_Status_History: [
    'history_id',
    'complaint_id',
    'old_status',
    'new_status',
    'changed_by',
    'comment',
    'timestamp',
  ],
  Categories: ['category_id', 'category_name', 'department', 'active'],
  Admins: ['admin_id', 'user_id', 'name', 'email', 'department', 'role', 'active'],
  Notifications: [
    'notification_id',
    'user_id',
    'complaint_id',
    'title',
    'message',
    'type',
    'is_read',
    'created_at',
  ],
  Audit_Log: [
    'log_id',
    'actor_id',
    'action',
    'entity_type',
    'entity_id',
    'details',
    'timestamp',
  ],
  Settings: ['key', 'value'],
};

const SEED_CATEGORIES = [
  ['CAT001', 'Academics', 'Academic', 'TRUE'],
  ['CAT002', 'Hostel', 'Hostel', 'TRUE'],
  ['CAT003', 'Mess', 'Administration', 'TRUE'],
  ['CAT004', 'Transport', 'Transport', 'TRUE'],
  ['CAT005', 'Infrastructure', 'Administration', 'TRUE'],
  ['CAT006', 'IT Services', 'IT', 'TRUE'],
  ['CAT007', 'Administration', 'Administration', 'TRUE'],
  ['CAT008', 'Other', 'General', 'TRUE'],
];

const SEED_SETTINGS = [
  ['institution_name', 'VIT Bhopal University'],
  ['complaint_prefix', 'CMP-2026-'],
  ['max_attachment_size', '10485760'],
  ['support_email', 'complaints@vitbhopal.ac.in'],
  ['system_status', 'OPERATIONAL'],
];

async function main() {
  console.log('\n=============================================');
  console.log('Campus Complaint System - Sheet Setup');
  console.log('=============================================');

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.error('\n❌ ERROR: Google Cloud Service Account credentials missing.');
    console.error('Please configure GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local or your environment.');
    console.error('See GOOGLE-SETUP.md for step-by-step instructions.\n');
    process.exit(1);
  }

  let cleanKey = String(privateKey);
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    try {
      cleanKey = JSON.parse(cleanKey);
    } catch {}
  }
  cleanKey = cleanKey.replace(/\\n/g, '\n');

  const auth = new JWT({
    email: clientEmail,
    key: cleanKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Connect & inspect spreadsheet metadata
  let spreadsheetMeta;
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    spreadsheetMeta = res.data;
    console.log('✓ Connected to spreadsheet: ' + (spreadsheetMeta.properties?.title || SPREADSHEET_ID));
  } catch (err: any) {
    console.error('\n❌ ERROR: Could not connect to Google Spreadsheet.');
    console.error(`Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.error(`Service Account Email: ${clientEmail}`);
    console.error(`Details: ${err.message}`);
    console.error('\nNOTE: Make sure you have clicked "Share" on your Google Sheet and given "Editor" permission to:');
    console.error(`👉 ${clientEmail}\n`);
    process.exit(1);
  }

  const existingSheets = spreadsheetMeta.sheets || [];
  const sheetTitleToId = new Map<string, number>();
  existingSheets.forEach((s) => {
    if (s.properties?.title && typeof s.properties.sheetId === 'number') {
      sheetTitleToId.set(s.properties.title, s.properties.sheetId);
    }
  });

  // 2. Create missing sheets
  const addSheetRequests: any[] = [];
  for (const sheetName of REQUIRED_SHEETS) {
    if (!sheetTitleToId.has(sheetName)) {
      addSheetRequests.push({
        addSheet: {
          properties: {
            title: sheetName,
            gridProperties: {
              rowCount: 1000,
              columnCount: 20,
              frozenRowCount: 1,
            },
          },
        },
      });
    }
  }

  if (addSheetRequests.length > 0) {
    const batchAddRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: addSheetRequests },
    });

    batchAddRes.data.replies?.forEach((reply: any) => {
      const props = reply.addSheet?.properties;
      if (props?.title && typeof props.sheetId === 'number') {
        sheetTitleToId.set(props.title, props.sheetId);
      }
    });
  }

  // 3. Inspect headers and populate missing headers/seeds
  for (const sheetName of REQUIRED_SHEETS) {
    const targetHeaders = SHEET_HEADERS[sheetName];
    const sheetValuesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });

    const firstRow = sheetValuesRes.data.values?.[0] || [];
    const hasHeaders =
      firstRow.length === targetHeaders.length &&
      firstRow[0] === targetHeaders[0] &&
      firstRow[firstRow.length - 1] === targetHeaders[targetHeaders.length - 1];

    if (!hasHeaders) {
      // Add or update headers
      const lastColLetter = String.fromCharCode(65 + targetHeaders.length - 1);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:${lastColLetter}1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [targetHeaders],
        },
      });
      console.log(`✓ Synchronized header row for "${sheetName}" (${targetHeaders.length} columns)`);
    }

    // Seed Categories if completely empty
    if (sheetName === 'Categories') {
      const allRows = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Categories!A2:D',
      });
      if (!allRows.data.values || allRows.data.values.length === 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Categories!A2:D',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: SEED_CATEGORIES },
        });
      }
    }

    // Seed Settings if empty
    if (sheetName === 'Settings') {
      const allRows = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Settings!A2:B',
      });
      if (!allRows.data.values || allRows.data.values.length === 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Settings!A2:B',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: SEED_SETTINGS },
        });
      }
    }

    console.log(`✓ ${sheetName} sheet ready`);
  }

  // 4. Apply professional formatting: Header background, bold text, frozen rows, column widths, dropdowns
  const stylingRequests: any[] = [];

  for (const sheetName of REQUIRED_SHEETS) {
    const sheetId = sheetTitleToId.get(sheetName);
    if (sheetId === undefined) continue;

    const headers = SHEET_HEADERS[sheetName];

    // Freeze header row
    stylingRequests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        fields: 'gridProperties.frozenRowCount',
      },
    });

    // Format Header Row (Navy Blue background #1B365D, bold white text)
    stylingRequests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: headers.length,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 27 / 255, green: 54 / 255, blue: 93 / 255 }, // Navy #1B365D
            horizontalAlignment: 'LEFT',
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              fontSize: 10,
              bold: true,
            },
            padding: { top: 6, bottom: 6, left: 8, right: 8 },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,padding)',
      },
    });

    // Auto-fit sensible column dimensions
    stylingRequests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: headers.length,
        },
        properties: {
          pixelSize: 160,
        },
        fields: 'pixelSize',
      },
    });

    // Specific wider columns
    headers.forEach((h, colIdx) => {
      if (['description', 'admin_response', 'details'].includes(h)) {
        stylingRequests.push({
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: colIdx, endIndex: colIdx + 1 },
            properties: { pixelSize: 280 },
            fields: 'pixelSize',
          },
        });
      } else if (['subject', 'title', 'attachment_url'].includes(h)) {
        stylingRequests.push({
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: colIdx, endIndex: colIdx + 1 },
            properties: { pixelSize: 220 },
            fields: 'pixelSize',
          },
        });
      }
    });

    // Apply basic filter
    stylingRequests.push({
      setBasicFilter: {
        filter: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: headers.length,
          },
        },
      },
    });
  }

  // 5. Apply Data Validation Dropdowns
  // Complaints Sheet: Priority & Status
  const complaintsSheetId = sheetTitleToId.get('Complaints');
  if (complaintsSheetId !== undefined) {
    const headers = SHEET_HEADERS['Complaints'];
    const priorityIdx = headers.indexOf('priority');
    const statusIdx = headers.indexOf('status');

    if (priorityIdx !== -1) {
      stylingRequests.push({
        setDataValidation: {
          range: {
            sheetId: complaintsSheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: priorityIdx,
            endColumnIndex: priorityIdx + 1,
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'LOW' },
                { userEnteredValue: 'MEDIUM' },
                { userEnteredValue: 'HIGH' },
                { userEnteredValue: 'URGENT' },
              ],
            },
            showCustomUi: true,
            strict: true,
          },
        },
      });
    }

    if (statusIdx !== -1) {
      stylingRequests.push({
        setDataValidation: {
          range: {
            sheetId: complaintsSheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: statusIdx,
            endColumnIndex: statusIdx + 1,
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'SUBMITTED' },
                { userEnteredValue: 'UNDER_REVIEW' },
                { userEnteredValue: 'IN_PROGRESS' },
                { userEnteredValue: 'RESOLVED' },
                { userEnteredValue: 'REJECTED' },
                { userEnteredValue: 'ESCALATED' },
              ],
            },
            showCustomUi: true,
            strict: true,
          },
        },
      });
    }
  }

  // Users Sheet: Role & Account Status
  const usersSheetId = sheetTitleToId.get('Users');
  if (usersSheetId !== undefined) {
    const headers = SHEET_HEADERS['Users'];
    const roleIdx = headers.indexOf('role');
    const statusIdx = headers.indexOf('account_status');

    if (roleIdx !== -1) {
      stylingRequests.push({
        setDataValidation: {
          range: {
            sheetId: usersSheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: roleIdx,
            endColumnIndex: roleIdx + 1,
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'STUDENT' },
                { userEnteredValue: 'ADMIN' },
                { userEnteredValue: 'SUPER_ADMIN' },
              ],
            },
            showCustomUi: true,
            strict: true,
          },
        },
      });
    }

    if (statusIdx !== -1) {
      stylingRequests.push({
        setDataValidation: {
          range: {
            sheetId: usersSheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: statusIdx,
            endColumnIndex: statusIdx + 1,
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'ACTIVE' },
                { userEnteredValue: 'INACTIVE' },
                { userEnteredValue: 'BLOCKED' },
              ],
            },
            showCustomUi: true,
            strict: true,
          },
        },
      });
    }
  }

  // Execute all formatting and validations
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: stylingRequests },
    });
    console.log('✓ Formatting applied');
    console.log('✓ Filters applied');
    console.log('✓ Dropdowns configured');
    console.log('Setup completed successfully.\n');
  } catch (err: any) {
    console.warn('⚠️ Note during batch formatting:', err.message);
    console.log('✓ Sheet tabs and headers verified.\n');
  }
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
