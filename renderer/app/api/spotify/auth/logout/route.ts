import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(`${request.nextUrl.origin}/`);
  
  // Clear the `spotify_access_token` cookie
  res.cookies.set('spotify_access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0), // Expire immediately
  });
  return res;
}