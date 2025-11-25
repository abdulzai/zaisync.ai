// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions"; // <- use SAME path as summary route

export async function GET() {
  // 1) Check session / Gmail connection
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      {
        connected: false,
        bullets: [],
        debug: "no_access_token",
      },
      { status: 200 }
    );
  }

  try {
    // 2) Call Gmail list API in the most basic way possible
    //    No query, no labelIds – just "give me the last 5 messages"
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      const body = await listRes.text();
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: "list_failed",
          debugStatus: listRes.status,
          debugBody: body,
        },
        { status: 200 }
      );
    }

    const listJson: any = await listRes.json();
    const ids: string[] = (listJson.messages || []).map((m: any) => m.id);

    if (!ids.length) {
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: "no_messages",
        },
        { status: 200 }
      );
    }

    // 3) Fetch basic metadata for each message and turn into bullets
    const messages = await Promise.all(
      ids.map(async (id) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!msgRes.ok) {
          return null;
        }

        const msgJson: any = await msgRes.json();
        const headers = msgJson.payload?.headers || [];

        const subject =
          headers.find((h: any) => h.name === "Subject")?.value ||
          "(no subject)";
        const from =
          headers.find((h: any) => h.name === "From")?.value || "(unknown)";

        return { subject, from };
      })
    );

    const bullets = messages
      .filter(Boolean)
      .map(
        (m) =>
          `Email from ${m!.from} about "${m!.subject}".`
      );

    return NextResponse.json(
      {
        connected: true,
        bullets,
        debug: "ok",
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
        debug: "exception",
        debugMessage: err?.message ?? String(err),
      },
      { status: 200 }
    );
  }
}
