import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { AuthSessionUser, Role, User, AdminUser } from '@/types';
import { getRows, appendRow, updateRow, SHEET_NAMES } from './googleSheets';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'vit_bhopal_super_secure_auth_secret_key_2026_dev_prod'
);

export const COOKIE_NAME = 'vit_auth_token';

/**
 * Creates a signed JWT session token.
 */
export async function createSessionToken(user: AuthSessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT session token and returns decoded payload.
 */
export async function verifySessionToken(token: string): Promise<AuthSessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AuthSessionUser;
  } catch {
    return null;
  }
}

/**
 * Extracts authenticated session user from request cookies.
 */
export async function getSessionUser(request: NextRequest): Promise<AuthSessionUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Server-side identity & role resolution from Google Sheets database:
 * 1. Check Admins sheet for active admin/super_admin privilege.
 * 2. Check Users sheet for existing user profile.
 * 3. If new student, auto-registers into Users sheet.
 */
export async function resolveUserFromDatabase(
  email: string,
  name: string
): Promise<AuthSessionUser> {
  const cleanEmail = email.toLowerCase().trim();
  const timestamp = new Date().toISOString();

  // 1. Check Admins sheet server-side
  let adminRecord: AdminUser | null = null;
  try {
    const admins = await getRows<AdminUser>(SHEET_NAMES.ADMINS);
    adminRecord = admins.find(
      (a) =>
        a.email?.toLowerCase().trim() === cleanEmail &&
        String(a.active).toUpperCase() === 'TRUE'
    ) || null;
  } catch (err) {
    console.warn('[resolveUser] Could not read Admins sheet:', err);
  }

  // 2. Check Users sheet
  let existingUser: User | null = null;
  try {
    const users = await getRows<User>(SHEET_NAMES.USERS);
    existingUser = users.find((u) => u.email?.toLowerCase().trim() === cleanEmail) || null;
  } catch (err) {
    console.warn('[resolveUser] Could not read Users sheet:', err);
  }

  // Determine Role
  let role: Role = 'STUDENT';
  if (adminRecord) {
    role = adminRecord.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
  } else if (existingUser && (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN')) {
    role = existingUser.role;
  }

  if (existingUser) {
    // Check if account is blocked
    if (existingUser.account_status === 'BLOCKED') {
      throw new Error('Your university account has been suspended. Please contact the administrator.');
    }

    // Update last_login
    try {
      await updateRow(SHEET_NAMES.USERS, 'user_id', existingUser.user_id, {
        last_login: timestamp,
        role, // sync role if admin status changed
      });
    } catch (e) {
      console.warn('Failed to update last_login timestamp:', e);
    }

    // Auto-sync to Admins sheet
    try {
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        if (!adminRecord) {
          await appendRow(SHEET_NAMES.ADMINS, {
            admin_id: `ADM-${Date.now().toString(36).toUpperCase()}`,
            user_id: existingUser.user_id,
            name: existingUser.name || name,
            email: cleanEmail,
            department: existingUser.department || 'Administration',
            role,
            active: 'TRUE',
          });
        } else if (adminRecord.role !== role || String(adminRecord.active).toUpperCase() !== 'TRUE') {
          await updateRow(SHEET_NAMES.ADMINS, 'email', cleanEmail, {
            role,
            active: 'TRUE',
          });
        }
      } else if (role === 'STUDENT' && adminRecord && String(adminRecord.active).toUpperCase() === 'TRUE') {
        await updateRow(SHEET_NAMES.ADMINS, 'email', cleanEmail, {
          active: 'FALSE',
        });
      }
    } catch (adminSyncErr) {
      console.warn('Failed to auto-sync Admins sheet on login:', adminSyncErr);
    }

    return {
      id: existingUser.user_id,
      email: cleanEmail,
      name: existingUser.name || name,
      role,
      student_id: existingUser.student_id,
      department: existingUser.department,
      branch: existingUser.branch || '',
      year: existingUser.year,
      room_no: existingUser.room_no,
    };
  }

  // 3. New user registration (student by default, or admin if pre-authorized in Admins tab)
  const userId = `USR-${Date.now().toString(36).toUpperCase()}`;

  // Extract VIT Bhopal student registration number (e.g. hanish.25bce10632@vitbhopal.ac.in -> 25BCE10632)
  let studentId = '';
  const emailPrefix = cleanEmail.split('@')[0];
  const regMatch = emailPrefix.match(/([0-9]{2}[a-zA-Z]{3}[0-9]{4,5})/i);

  if (regMatch) {
    studentId = regMatch[1].toUpperCase();
  } else if (role === 'STUDENT') {
    studentId = `STU-${emailPrefix.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}`;
  }

  // Format clean display name if not provided by Google
  let displayName = name;
  if (!displayName || displayName === emailPrefix) {
    const namePart = emailPrefix.split('.')[0];
    displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  const newUser: Record<string, string> = {
    user_id: userId,
    student_id: studentId,
    name: displayName,
    email: cleanEmail,
    phone: '',
    department: '',
    branch: '',
    year: studentId.startsWith('25') ? '1st Year' : studentId.startsWith('24') ? '2nd Year' : studentId.startsWith('23') ? '3rd Year' : studentId.startsWith('22') ? '4th Year' : '',
    room_no: '',
    role,
    account_status: 'ACTIVE',
    created_at: timestamp,
    last_login: timestamp,
  };

  try {
    await appendRow(SHEET_NAMES.USERS, newUser);
  } catch (err) {
    console.error('[resolveUser] Failed to insert new user into Users sheet:', err);
    throw new Error('Database write failed during student registration. Please try again.');
  }

  return {
    id: userId,
    email: cleanEmail,
    name: newUser.name,
    role,
    student_id: studentId,
    department: newUser.department,
    branch: newUser.branch,
    year: newUser.year,
    room_no: '',
  };
}
