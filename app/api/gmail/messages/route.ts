// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type GmailListResponse = {
  messages?: { id: string; threadId: string }[];
};

type GmailMessage = {
  payload?: {
    headers?: { name: string; value: string }[];
  };
};

function getHeader(
  headers: { name: string; value: string }[] | undefined,
  name: string
): string | undefined {
  if (!headers) return undefined;
  const found = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return found?.value;
}

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
      { status: 200 }
    );
  }

  try {
    // 2) List recent messages from PRIMARY inbox, last 24 hours
    // Gmail query docs: https://support.google.com/mail/answer/7190?hl=en
    const listUrl = new URL(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages"
    );
    listUrl.searchParams.set("maxResults", "10");
    listUrl.searchParams.set("q", "newer_than:1d in:inbox category:primary");

    const listRes = await fetch(listUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listRes.ok) {
      const errorBody = await listRes.json().catch(() => null);
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: {
            where: "list_failed",
            status: listRes.status,
            error: errorBody,
          },
        },
        { status: 200 }
      );
    }

    const listData = (await listRes.json()) as GmailListResponse;
    const messageIds = listData.messages?.map((m) => m.id) ?? [];
    const topIds = messageIds.slice(0, 5);

    // 3) Fetch details for each message & turn into bullets
    const bullets: string[] = [];

    for (const id of topIds) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!msgRes.ok) continue;

      const msgData = (await msgRes.json()) as GmailMessage;
      const headers = msgData.payload?.headers ?? [];

      const from = getHeader(headers, "From") ?? "Unknown sender";
      const subject = getHeader(headers, "Subject") ?? "(no subject)";

      bullets.push(`${from} — ${subject}`);
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
        debug: { where: "catch", error: err?.message ?? "unknown_error" },
      },
      { status: 200 }
    );
  }
}
