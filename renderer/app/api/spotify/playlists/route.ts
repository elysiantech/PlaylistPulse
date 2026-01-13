import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_API = 'https://api.spotify.com/v1';

export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  const accessToken = cookies.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token is missing' }, { status: 401 });
  }

  try {
    const allPlaylists: any[] = [];
    let url: string | null = `${SPOTIFY_API}/me/playlists?limit=50`;

    // Paginate through all playlists
    while (url) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      allPlaylists.push(...data.items);
      url = data.next; // Next page URL or null if no more pages
    }

    return NextResponse.json({ items: allPlaylists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}
