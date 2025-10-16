import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';

  // If user visits app.zaisync.ai root, rewrite "/" to "/app"
  if ((host === 'app.zaisync.ai' || host.endsWith('.app.zaisync.ai')) && url.pathname === '/') {
    url.pathname = '/app';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
