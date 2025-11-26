// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  // 1) Check session / Gmail connection
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as
    | string
    | undefined;

  if (!accessToken) {
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
    // 2) List recent messages (last 7 days, max 5)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=newer_than:7d",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      const errJson = await listRes.json().catch(() => null);
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: {
            where: "list_failed",
            status: listRes.status,
            error: errJson ?? null,
          },
        },
        { status: 200 }
      );
    }

    const listJson: any = await listRes.json();
    const messages: { id: string }[] = listJson.messages ?? [];

    if (!messages.length) {
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: { where: "no_messages", count: 0 },
        },
        { status: 200 }
      );
    }

    const firstFive = messages.slice(0, 5);

    // 3) Fetch each message’s Subject + From and turn into bullets
    const details = await Promise.all(
      firstFive.map(async (m) => {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!res.ok) return null;
        return res.json();
      })
    );

    const bullets = details
      .filter(Boolean)
      .map((msg: any) => {
        const headers = msg.payload?.headers ?? [];
        const subject =
          headers.find((h: any) => h.name === "Subject")?.value ??
          "(no subject)";
        const from =
          headers.find((h: any) => h.name === "From")?.value ??
          "(unknown sender)";
        return `${subject} — ${from}`;
      });

    return NextResponse.json(
      {
        connected: true,
        bullets,
        debug: {
          where: "success",
          count: bullets.length,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GMAIL MESSAGES ERROR", err);
    return NextResponse.json(
      {
        connected: false,
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
