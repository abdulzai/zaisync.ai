// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

export async function GET() {
  // 1) Check session / Gmail connection
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    // Not connected to Google at all
    return NextResponse.json(
      {
        connected: false,
        bullets: [],
        error: "NO_ACCESS_TOKEN",
      },
      { status: 200 }
    );
  }

  try {
    // 2) List the last 5 INBOX messages
    const listUrl =
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX";

    const listRes = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const listText = await listRes.text();

    if (!listRes.ok) {
      // <<< IMPORTANT: surface Gmail error so we can see it in the browser
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          error: `LIST ${listRes.status}: ${listText}`,
        },
        { status: 200 }
      );
    }

    const listJson = JSON.parse(listText);
    const ids: string[] = (listJson.messages ?? []).map(
      (m: any) => m.id as string
    );

    if (!ids.length) {
      // No messages returned by Gmail
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          error: "LIST_OK_BUT_NO_MESSAGES",
        },
        { status: 200 }
      );
    }

    // 3) Fetch metadata for each message
    const bullets: string[] = [];

    for (const id of ids) {
      const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`;

      const msgRes = await fetch(msgUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });

      const msgText = await msgRes.text();

      if (!msgRes.ok) {
        // Add a debug bullet so we see if a specific message call is failing
        bullets.push(`(error fetching message ${id}: ${msgRes.status})`);
        continue;
      }

      const msg = JSON.parse(msgText);
      const headersArray = msg?.payload?.headers ?? [];
      const headers: Record<string, string> = {};
      for (const h of headersArray) {
        headers[h.name] = h.value;
      }

      const subject = headers["Subject"] ?? "(no subject)";
      const from = headers["From"] ?? "(unknown sender)";
      const date = headers["Date"] ?? "";

      bullets.push(`${subject} — from ${from}${date ? ` on ${date}` : ""}`);
    }

    return NextResponse.json(
      {
        connected: true,
        bullets,
        error: null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    // Catch any unexpected runtime error
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
        error: `ROUTE_EXCEPTION: ${String(err)}`,
      },
      { status: 200 }
    );
  }
}
