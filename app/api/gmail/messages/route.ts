// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions"; // 3x .. from /api/gmail/messages -> /app/lib

type GmailMessageHeader = { name: string; value: string };

function getHeader(headers: GmailMessageHeader[], name: string): string {
  return headers.find((h) => h.name === name)?.value ?? "";
}

export async function GET() {
  try {
    // 1) Check session / Gmail connection
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.access_token as string | undefined;

    if (!accessToken) {
      // Not connected to Google at all
      return NextResponse.json(
        {
          connected: false,
          bullets: [],
        },
        { status: 200 }
      );
    }

    // 2) List recent messages (last 7 days, max 5 messages, inbox only)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages" +
        "?maxResults=5&q=newer_than:7d&labelIds=INBOX",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      const text = await listRes.text().catch(() => "");
      console.error("[GMAIL_MESSAGES_LIST_ERROR]", listRes.status, text);

      // We’re connected but couldn’t list messages – return empty bullets
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
        },
        { status: listRes.status }
      );
    }

    const listJson = (await listRes.json()) as {
      messages?: { id: string }[];
    };

    const ids = listJson.messages ?? [];

    if (ids.length === 0) {
      // No recent inbox messages
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
        },
        { status: 200 }
      );
    }

    // 3) Fetch details for each message
    const detailResponses = await Promise.all(
      ids.map((m) =>
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
      )
    );

    const detailJsons = await Promise.all(
      detailResponses.map((r) => r.json())
    );

    // 4) Turn messages into simple bullet strings
    const bullets = detailJsons.map((msg: any) => {
      const headers: GmailMessageHeader[] = msg.payload?.headers ?? [];
      const subject = getHeader(headers, "Subject") || "(no subject)";
      const from = getHeader(headers, "From") || "unknown sender";
      const date = getHeader(headers, "Date") || "unknown date";

      return `Email: "${subject}" from ${from} on ${date}`;
    });

    return NextResponse.json(
      {
        connected: true,
        bullets,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[GMAIL_MESSAGES_UNEXPECTED_ERROR]", err);
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
      },
      { status: 500 }
    );
  }
}
