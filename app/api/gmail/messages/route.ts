// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// IMPORTANT: use relative path, NOT "@/lib/authOptions"
import { authOptions } from "../../../lib/authOptions";

export async function GET() {
  // 1) Check session / Gmail connection
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { connected: false, bullets: [] },
      { status: 200 }
    );
  }

  try {
    // 2) Get the last 5 INBOX messages (no fancy filters for now)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!listRes.ok) {
      const text = await listRes.text();
      console.error("GMAIL LIST ERROR", listRes.status, text);
      return NextResponse.json(
        { connected: true, bullets: [] },
        { status: 200 }
      );
    }

    const listJson = await listRes.json();
    const ids: string[] = (listJson.messages ?? []).map(
      (m: any) => m.id as string
    );

    if (!ids.length) {
      // No messages found at all
      return NextResponse.json(
        { connected: true, bullets: [] },
        { status: 200 }
      );
    }

    // 3) Fetch basic metadata for each message
    const messages = await Promise.all(
      ids.map(async (id) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          }
        );

        if (!msgRes.ok) {
          const txt = await msgRes.text();
          console.error("GMAIL MESSAGE ERROR", id, msgRes.status, txt);
          return null;
        }

        return msgRes.json();
      })
    );

    const bullets = messages
      .filter(Boolean)
      .map((msg: any) => {
        const headersArray = msg?.payload?.headers ?? [];
        const headers: Record<string, string> = {};
        for (const h of headersArray) {
          headers[h.name] = h.value;
        }

        const subject = headers["Subject"] ?? "(no subject)";
        const from = headers["From"] ?? "(unknown sender)";
        const date = headers["Date"] ?? "";

        return `${subject} — from ${from}${date ? ` on ${date}` : ""}`;
      });

    return NextResponse.json(
      { connected: true, bullets },
      { status: 200 }
    );
  } catch (err) {
    console.error("GMAIL MESSAGES ROUTE ERROR", err);
    return NextResponse.json(
      { connected: true, bullets: [] },
      { status: 200 }
    );
  }
}
