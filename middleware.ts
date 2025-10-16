import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';

  // When visiting app.zaisync.ai at "/", serve the app dashboard at /app
  if (host === 'app.zaisync.ai' && url.pathname === '/') {
    url.pathname = '/app';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Limit to only the root path so we don't touch other routes
export const config = {
  matcher: ['/'],
};
