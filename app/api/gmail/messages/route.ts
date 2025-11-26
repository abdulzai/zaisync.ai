// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type GmailListResponse = {
  messages?: { id: string }[];
};

type GmailMessage = {
  id: string;
  snippet?: string;
  payload?: {
    headers?: { name: string; value: string }[];
  };
};

// Map client keys -> Gmail search queries
// You can add more later: "desri", "apex", etc.
const CLIENT_QUERIES: Record<string, string> = {
  // Intersect Power example:
  // - any mail from @intersectpower.com
  // - OR subject that mentions "Intersect Power"
  intersectpower:
    '(from:@intersectpower.com OR subject:"Intersect Power" OR subject:Intersect)',
};

export async function GET(req: Request) {
  // 1) Check session / Gmail connection
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      {
        connected: false,
        bullets: [],
        debug: { where: "no_access_token" },
      },
      { status: 200 },
    );
  }

  // 2) Figure out which client we’re targeting (optional)
  const url = new URL(req.url);
  const clientKey = url.searchParams.get("client") ?? undefined;

  // Base query = last 7 days
  let gmailQuery = "newer_than:7d";

  if (clientKey && CLIENT_QUERIES[clientKey]) {
    gmailQuery = `${gmailQuery} ${CLIENT_QUERIES[clientKey]}`;
  }

  try {
    // 3) List recent messages (max 5) with our query
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=${encodeURIComponent(
        gmailQuery,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const listJson = (await listRes.json()) as GmailListResponse & {
      error?: any;
    };

    if (!listRes.ok || listJson.error) {
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: {
            where: "list_failed",
            status: listRes.status,
            error: listJson.error ?? null,
          },
        },
        { status: 200 },
      );
    }

    const messages = listJson.messages ?? [];

    if (messages.length === 0) {
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: { where: "no_messages", query: gmailQuery },
        },
        { status: 200 },
      );
    }

    // 4) Fetch each message detail and turn into simple bullets
    const bullets: string[] = [];

    for (const msg of messages) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const msgJson = (await msgRes.json()) as GmailMessage;

      const headers = msgJson.payload?.headers ?? [];
      const subject =
        headers.find((h) => h.name.toLowerCase() === "subject")?.value ??
        "(no subject)";
      const from =
        headers.find((h) => h.name.toLowerCase() === "from")?.value ??
        "(unknown sender)";

      bullets.push(`${subject} — ${from}`);
    }

    return NextResponse.json(
      {
        connected: true,
        bullets,
        debug: {
          where: "success",
          count: bullets.length,
          query: gmailQuery,
          client: clientKey ?? null,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("GMAIL MESSAGES ERROR", err);
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
        debug: { where: "exception", message: err?.message ?? String(err) },
      },
      { status: 200 },
    );
  }
}
