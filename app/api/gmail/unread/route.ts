// app/api/gmail/unread/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Not signed in with Google
  const accessToken = (session as any)?.access_token as string | undefined;
  if (!accessToken) {
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  // Ask Gmail for the UNREAD label (contains messagesUnread)
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels/UNREAD",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    // token may be missing/expired/insufficient scopes; UI will show "Connect Gmail"
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  const label = await res.json();
  const unread = Number(label?.messagesUnread ?? 0);

  return NextResponse.json({ connected: true, unread }, { status: 200 });
}
