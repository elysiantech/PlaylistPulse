import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    const noCodeRedirect = process.env.NODE_ENV === 'production'
      ? `${request.nextUrl.origin}/`
      : 'http://127.0.0.1:3000/';
    return NextResponse.redirect(noCodeRedirect);
  }

  try {
    // Exchange the code for an access token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret:process.env.SPOTIFY_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await response.json();

    // Set the access token as an HTTP-only cookie
    // Always redirect to 127.0.0.1 to match Spotify's redirect URI
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? `${request.nextUrl.origin}/`
      : 'http://127.0.0.1:3000/';
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenData.expires_in,
    });

    return res;
  } catch (error) {
    console.error('Error exchanging token:', error);
    const errorRedirectUrl = process.env.NODE_ENV === 'production'
      ? `${request.nextUrl.origin}/`
      : 'http://127.0.0.1:3000/';
    return NextResponse.redirect(errorRedirectUrl);
  }
}