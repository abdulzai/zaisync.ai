import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';

  // app.zaisync.ai -> /dashboard
  if (host === 'app.zaisync.ai' && url.pathname === '/') {
    url.pathname = '/dashboard';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/'] };
