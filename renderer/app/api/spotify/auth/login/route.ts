import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const scopes = [
    'playlist-read-private',
    'playlist-read-collaborative',
  ].join(' ');

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: scopes,
  }).toString()}`;

  return NextResponse.redirect(spotifyAuthUrl);
}