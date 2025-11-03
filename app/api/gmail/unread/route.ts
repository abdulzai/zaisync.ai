// app/api/gmail/unread/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Ensure Node runtime (gmail API call uses node fetch/HTTP)
export const runtime = "nodejs";

export async function GET() {
  // Get the NextAuth session (must include access_token from Google)
  const session = await getServerSession(authOptions as any);

  const accessToken = (session as any)?.access_token as string | undefined;
  if (!accessToken) {
    // Not connected to Google yet
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  // Call Gmail to read the UNREAD label (this contains messagesUnread)
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels/UNREAD",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    // Token may be expired / missing scope — let the UI prompt “Connect Gmail”
    return NextResponse.json(
      { connected: false, unread: 0 },
      { status: res.status }
    );
  }

  const label = await res.json();
  const unread = Number(label?.messagesUnread ?? 0);

  return NextResponse.json({ connected: true, unread }, { status: 200 });
}
