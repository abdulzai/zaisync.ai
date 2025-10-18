import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing OAuth code' }, { status: 400 });
  }

  // Normally you'd exchange code for tokens here with Microsoft Graph
  return NextResponse.json({ success: true, provider: 'microsoft', code });
}
