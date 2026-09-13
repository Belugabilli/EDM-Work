import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: 'Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.',
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const redirectUri = `${origin}/api/auth/google/callback`;

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'select_account',
  });

  return NextResponse.json({ url: authUrl });
}
