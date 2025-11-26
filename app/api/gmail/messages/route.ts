// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// FILTER SETTINGS — adjust anytime
const HOURS_LOOKBACK = 24; // last 24 hours

// Explicit string[] types to keep TypeScript happy
const BLOCK_SENDERS: string[] = [
  "express.com",
  "hulmail.com",
  "newsletters",
  "promo",
  "marketing",
  "noreply",
];

// Example client keywords (you can add more)
const CLIENT_KEYWORDS: string[] = [
  "intersectpower.com",
  // "desri",
  // "radian",
];

export async function GET() {
  // 1) Validate Gmail session + token
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

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
    // 2) Build Gmail query
    const since = new Date(Date.now() - HOURS_LOOKBACK * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    let query = `newer_than:${HOURS_LOOKBACK}h`;

    // Optional: add client keyword filters
    if (CLIENT_KEYWORDS.length > 0) {
      query += ` (${CLIENT_KEYWORDS.join(" OR ")})`;
    }

    // 3) Fetch Gmail messages
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
        query
      )}&maxResults=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const listJson = await listRes.json();

    if (!listJson.messages) {
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: { where: "empty", raw: listJson },
        },
        { status: 200 }
      );
    }

    // 4) Fetch each message details + extract subject
    const bullets: string[] = [];

    for (const msg of listJson.messages.slice(0, 5)) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const msgJson = await msgRes.json();
      const headers = msgJson.payload?.headers || [];

      const subject = headers.find((h: any) => h.name === "Subject")?.value;
      const from = headers.find((h: any) => h.name === "From")?.value || "";

      if (!subject) continue;

      // 🎯 FILTER: Skip promo senders
      if (BLOCK_SENDERS.some((item) => from.toLowerCase().includes(item))) {
        continue;
      }

      bullets.push(`${subject} — ${from}`);
    }

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
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
        debug: { where: "list_failed", error: err.message },
      },
      { status: 200 }
    );
  }
}
