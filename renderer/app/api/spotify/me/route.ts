import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_API = 'https://api.spotify.com/v1';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  try {
    const response = await fetch(`${SPOTIFY_API}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) return NextResponse.json({ isAuthenticated: false }, { status: response.status });
    const userData = await response.json();
    return NextResponse.json({ isAuthenticated: true, user: userData });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ isAuthenticated: false, error: 'Failed to fetch user profile' }, { status: 500 });
  }
}