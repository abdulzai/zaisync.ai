// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  // 1) Check session / Gmail connection
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      {
        connected: false,
        bullets: [],
        debug: { where: "no_access_token" }
      },
      { status: 200 }
    );
  }

  try {
    // 2) List recent messages (last 5 in inbox)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=in:inbox",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!listRes.ok) {
      const errorJson = await listRes.json().catch(() => undefined);
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: {
            where: "list_failed",
            status: listRes.status,
            error: errorJson
          }
        },
        { status: 200 }
      );
    }

    const listJson = await listRes.json();
    const messages = listJson.messages ?? [];

    const bullets: string[] = [];

    // 3) For each message, pull simple summary (Subject + From)
    for (const msg of messages) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=subject&metadataHeaders=from`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!msgRes.ok) continue;

      const msgJson = await msgRes.json();
      const headers: any[] = msgJson.payload?.headers ?? [];

      const subjectHeader = headers.find((h) => h.name === "Subject");
      const fromHeader = headers.find((h) => h.name === "From");

      const subject = subjectHeader?.value ?? "(no subject)";
      const from = fromHeader?.value ?? "(unknown sender)";

      bullets.push(`${subject} — ${from}`);
    }

    return NextResponse.json(
      {
        connected: true,
        bullets,
        debug: { where: "success", count: bullets.length }
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
        debug: { where: "exception", message: err?.message ?? String(err) }
      },
      { status: 200 }
    );
  }
}
