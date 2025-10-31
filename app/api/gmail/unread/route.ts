import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, raw: false });
  if (!token || !token.accessToken) {
    return NextResponse.json({ connected: false, unread: 0 }, { status: 200 });
  }

  try {
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({
      access_token: token.accessToken as string,
      // If you added refresh_token in NextAuth callbacks, you can pass it here too
      // refresh_token: token.refreshToken as string,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2 });

    // Query unread in INBOX
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "in:inbox is:unread",
      maxResults: 1, // we only need the count
    });

    const unread = (res.data.resultSizeEstimate ?? 0);
    return NextResponse.json({ connected: true, unread });
  } catch (e: any) {
    // When token lacks scope or expired you’ll land here
    return NextResponse.json({ connected: false, unread: 0, error: e?.message }, { status: 200 });
  }
}
