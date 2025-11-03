// app/api/gmail/unread/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  // Not signed in with Google or no token -> show disconnected with 0 unread
  if (!accessToken) {
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  // Ask Gmail for the UNREAD label
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels/UNREAD",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  // If token is missing/expired/insufficient scopes, we still answer connected=true
  if (!res.ok) {
    return NextResponse.json({ connected: true, unread: 0 }, { status: 200 });
  }

  const label = await res.json();
  const unread = Number(label?.messagesUnread ?? 0);
  return NextResponse.json({ connected: true, unread }, { status: 200 });
}
