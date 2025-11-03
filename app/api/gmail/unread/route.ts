import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export async function GET() {
  // Get the session (includes the Google access token if user signed in with Google)
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token;

  // If not signed in, return a simple JSON telling the UI to show "Connect Gmail"
  if (!accessToken) {
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  // Call Gmail API for the UNREAD label
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels/UNREAD",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // If token is expired/invalid/missing scope, surface connected:false
  if (!res.ok) {
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  const label = await res.json();
  const unread = Number(label?.messagesUnread ?? 0);

  return NextResponse.json({ connected: true, unread }, { status: 200 });
}
