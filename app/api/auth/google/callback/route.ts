import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { createSessionToken, resolveUserFromDatabase, COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const origin = process.env.NEXTAUTH_URL || request.nextUrl.origin || 'http://localhost:3000';

  if (error || !code) {
    console.error('[Google OAuth Error]:', error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error || 'Authentication canceled')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/login?error=OAuth%20credentials%20not%20configured`);
  }

  try {
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.id_token) {
      throw new Error('No id_token received from Google OAuth.');
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Unable to extract user email from Google ID token.');
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];

    // Optional domain restriction
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim();
    if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(`Access restricted to @${allowedDomain} university accounts`)}`
      );
    }

    // Resolve user & role from Google Sheets
    const sessionUser = await resolveUserFromDatabase(email, name);

    // Create session JWT
    const token = await createSessionToken(sessionUser);

    // Determine redirect destination based on role
    const redirectPath =
      sessionUser.role === 'ADMIN' || sessionUser.role === 'SUPER_ADMIN'
        ? '/admin/dashboard'
        : '/student/dashboard';

    const response = NextResponse.redirect(`${origin}${redirectPath}`);

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('[Google OAuth Callback Exception]:', err);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(err.message || 'Authentication failed')}`
    );
  }
}
