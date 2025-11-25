// app/api/gmail/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

export async function GET() {
  // 1) Get session
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      bullets: [],
      debug: {
        where: "no_access_token",
        hasSession: !!session,
      },
    });
  }

  try {
    // 2) Call Gmail API for recent messages (last 7 days)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=newer_than:7d",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      const error = await listRes.json().catch(() => null);
      return NextResponse.json({
        connected: true,
        bullets: [],
        debug: {
          where: "list_failed",
          status: listRes.status,
          error,
        },
      });
    }

    const listJson = await listRes.json();
    const messages = listJson.messages ?? [];

    if (!messages.length) {
      return NextResponse.json({
        connected: true,
        bullets: [],
        debug: { where: "no_messages" },
      });
    }

    // For now, just return simple bullets per message ID
    const bullets = messages.map(
      (m: any, idx: number) => `Email ${idx + 1}: thread ${m.threadId}`
    );

    return NextResponse.json({
      connected: true,
      bullets,
      debug: { where: "ok", count: messages.length },
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: true,
      bullets: [],
      debug: { where: "exception", message: err?.message },
    });
  }
}
