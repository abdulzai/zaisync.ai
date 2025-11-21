import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type GmailMessageListResponse = {
  messages?: { id: string }[];
};

type GmailMessage = {
  id: string;
  snippet: string;
  payload?: {
    headers?: { name: string; value: string }[];
  };
};

export async function GET() {
  // 1) Get access token from NextAuth session
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { connected: false, bullets: [] },
      { status: 200 }
    );
  }

  try {
    // 2) List recent messages (last 7 days, no unread / inbox restriction)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=newer_than:7d",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!listRes.ok) {
      console.error("Gmail list error:", await listRes.text());
      return NextResponse.json(
        { connected: true, bullets: [] },
        { status: 200 }
      );
    }

    const listJson = (await listRes.json()) as GmailMessageListResponse;

    if (!listJson.messages || listJson.messages.length === 0) {
      // No messages that match the query
      return NextResponse.json(
        { connected: true, bullets: [] },
        { status: 200 }
      );
    }

    const firstFive = listJson.messages.slice(0, 5);

    // 3) Fetch metadata for each message (Subject + From)
    const details = await Promise.all(
      firstFive.map(async (m) => {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          console.error("Gmail message error:", m.id, await res.text());
          return null;
        }

        return (await res.json()) as GmailMessage;
      })
    );

    // 4) Turn messages into simple bullets
    const bullets = details
      .filter((m): m is GmailMessage => !!m)
      .map((m) => {
        const headers = m.payload?.headers ?? [];
        const subject =
          headers.find((h) => h.name === "Subject")?.value || "(no subject)";
        const from = headers.find((h) => h.name === "From")?.value || "";

        return from ? `${subject} — ${from}` : subject;
      });

    return NextResponse.json({ connected: true, bullets }, { status: 200 });
  } catch (err) {
    console.error("Gmail messages route error:", err);
    return NextResponse.json(
      { connected: true, bullets: [] },
      { status: 200 }
    );
  }
}
