// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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
        debug: { where: "no_access_token" },
      },
      { status: 200 }
    );
  }

  try {
    // 2) List recent messages (last 2 days, inbox)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=newer_than:2d label:inbox",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const listText = await listRes.text();

    if (!listRes.ok) {
      let parsed: any;
      try {
        parsed = JSON.parse(listText);
      } catch {
        parsed = listText;
      }

      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: {
            where: "list_failed",
            status: listRes.status,
            error: parsed,
          },
        },
        { status: 200 }
      );
    }

    const listJson = JSON.parse(listText) as { messages?: { id: string }[] };

    const ids = listJson.messages?.map((m) => m.id) ?? [];
    if (ids.length === 0) {
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: { where: "list_ok_but_empty", status: listRes.status },
        },
        { status: 200 }
      );
    }

    // 3) Fetch basic metadata for each message
    const bullets: string[] = [];

    for (const id of ids) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const msgText = await msgRes.text();
      if (!msgRes.ok) {
        // Skip any single bad message
        continue;
      }

      const msg = JSON.parse(msgText) as any;
      const headers: { name: string; value: string }[] =
        msg.payload?.headers ?? [];

      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      const from = headers.find((h) => h.name === "From")?.value || "";

      bullets.push(`${subject}${from ? ` — ${from}` : ""}`);
    }

    return NextResponse.json(
      {
        connected: true,
        bullets,
        debug: { where: "success", count: bullets.length },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
        debug: {
          where: "exception",
          message: err?.message ?? String(err),
        },
      },
      { status: 200 }
    );
  }
}
