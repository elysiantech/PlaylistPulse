import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_API = 'https://api.spotify.com/v1';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const cookies = request.cookies;
  const accessToken = cookies.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token is missing' }, { status: 401 });
  }

  try {
    const allTracks: any[] = [];
    let url: string | null = `${SPOTIFY_API}/playlists/${id}/tracks?limit=100`;

    // Paginate through all tracks
    while (url) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch playlist tracks');
      }

      const data = await response.json();
      allTracks.push(...data.items);
      url = data.next; // Next page URL or null if no more pages
    }

    const tracks = allTracks
      .filter((item: any) => item.track) // Filter out null tracks
      .map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map((artist: any) => artist.name).join(', '),
        album: item.track.album.name,
        releaseDate: item.track.album.release_date,
        duration: item.track.duration_ms,
        spotifyUrl: item.track.external_urls.spotify,
        albumArt: item.track.album.images?.[0]?.url || null,
      }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist tracks' }, { status: 500 });
  }
}
