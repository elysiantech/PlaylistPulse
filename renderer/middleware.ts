import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Intercept requests to /spotify
  if (url.pathname === '/spotify') {
    const code = url.searchParams.get('code');
    if (code) {
      // Rewrite to /api/spotify/auth
     return NextResponse.rewrite(`${url.origin}/api/spotify/auth`);
    }
     else {
      // Redirect to the home page with an absolute URL
      return NextResponse.redirect(`${url.origin}/`);
    }
  }
  return NextResponse.next();
}