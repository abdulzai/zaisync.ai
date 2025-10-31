// app/api/gmail/unread/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    // Not connected yet
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels/UNREAD",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      // Avoid edge caching surprises
      cache: "no-store",
    }
  );

  if (!res.ok) {
    // Token missing/expired/insufficient scopes
    return NextResponse.json({ connected: true, unread: 0 }, { status: 200 });
  }

  const label = await res.json();
  const unread = Number(label?.messagesUnread ?? 0);
  return NextResponse.json({ connected: true, unread }, { status: 200 });
}
