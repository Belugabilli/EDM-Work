import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { createSessionToken, resolveUserFromDatabase, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Missing credential token' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'GOOGLE_CLIENT_ID is not configured' }, { status: 500 });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Unable to extract email from Google credential' }, { status: 400 });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];

    // Optional domain restriction
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim();
    if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
      return NextResponse.json(
        { error: `Access restricted to @${allowedDomain} university accounts` },
        { status: 403 }
      );
    }

    // Resolve user & role from Google Sheets
    const sessionUser = await resolveUserFromDatabase(email, name);

    // Create session JWT
    const token = await createSessionToken(sessionUser);

    const redirectPath =
      sessionUser.role === 'ADMIN' || sessionUser.role === 'SUPER_ADMIN'
        ? '/admin/dashboard'
        : '/student/dashboard';

    const response = NextResponse.json({
      success: true,
      redirect: redirectPath,
      user: sessionUser,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('[Google Credential Verify Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Google verification failed' },
      { status: 500 }
    );
  }
}
