// app/api/gmail/unread/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions"; // 4x ../

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token;

  if (!accessToken) {
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels/UNREAD",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ connected: true, unread: 0 }, { status: 200 });
  }

  const label = await res.json();
  const unread = Number(label?.messagesUnread ?? 0);
  return NextResponse.json({ connected: true, unread }, { status: 200 });
}
