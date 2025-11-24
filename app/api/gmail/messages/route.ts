// app/api/gmail/messages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type GmailListResponse = {
  messages?: { id: string }[];
};

export async function GET() {
  try {
    // 1) Check session / Gmail connection
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.access_token as string | undefined;

    if (!accessToken) {
      return NextResponse.json(
        { connected: false, bullets: [], reason: "no-access-token" },
        { status: 200 }
      );
    }

    // 2) Get the last 5 INBOX messages (read OR unread)
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
      const body = await listRes.text();
      console.error("Gmail list error", listRes.status, body);

      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          reason: "list-failed",
          status: listRes.status,
        },
        { status: 200 }
      );
    }

    const listJson = (await listRes.json()) as GmailListResponse;

    if (!listJson.messages || listJson.messages.length === 0) {
      // Connected to Gmail but nothing in INBOX (for our query)
      return NextResponse.json(
        { connected: true, bullets: [], reason: "no-messages" },
        { status: 200 }
      );
    }

    const ids = listJson.messages.map((m) => m.id).slice(0, 5);
    const bullets: string[] = [];

    // 3) Fetch metadata for each message and turn it into bullet text
    for (const id of ids) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      );

      if (!msgRes.ok) continue;

      const msgJson: any = await msgRes.json();
      const headers: { name: string; value: string }[] =
        msgJson?.payload?.headers ?? [];

      const subject =
        headers.find((h) => h.name === "Subject")?.value ?? "No subject";
      const from = headers.find((h) => h.name === "From")?.value ?? "";
      const snippet = msgJson.snippet ?? "";

      const bullet = `${subject} — ${
        from ? from + " — " : ""
      }${snippet}`.slice(0, 280);

      bullets.push(bullet);
    }

    return NextResponse.json({ connected: true, bullets }, { status: 200 });
  } catch (err) {
    console.error("Gmail messages route error", err);
    return NextResponse.json(
      { connected: false, bullets: [], reason: "exception" },
      { status: 200 }
    );
  }
}
