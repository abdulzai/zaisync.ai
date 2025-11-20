import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET /api/gmail/messages
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.access_token as string | undefined;

    if (!accessToken) {
      return NextResponse.json(
        { connected: false, bullets: [], error: "No access token" },
        { status: 200 }
      );
    }

    // 1) Get a few recent inbox messages (last 7 days)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=is:inbox newer_than:7d",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listRes.ok) {
      const text = await listRes.text();
      console.error("GMAIL LIST ERROR:", text);
      return NextResponse.json(
        { connected: true, bullets: [], error: "Failed to list messages" },
        { status: 200 }
      );
    }

    const listJson: any = await listRes.json();
    const messages: { id: string }[] = listJson.messages ?? [];

    if (!messages.length) {
      return NextResponse.json(
        { connected: true, bullets: [] },
        { status: 200 }
      );
    }

    // 2) Fetch details for each message
    const details = await Promise.all(
      messages.map(async (m) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!msgRes.ok) return null;

        const msgJson: any = await msgRes.json();
        const headers: any[] = msgJson.payload?.headers ?? [];
        const subject =
          headers.find((h) => h.name === "Subject")?.value ?? "(no subject)";
        const from =
          headers.find((h) => h.name === "From")?.value ?? "Unknown sender";
        const snippet: string = msgJson.snippet ?? "";

        return { subject, from, snippet };
      })
    );

    const cleaned = details.filter(Boolean) as {
      subject: string;
      from: string;
      snippet: string;
    }[];

    // 3) Turn them into recap bullets
    const bullets = cleaned.map((m, i) => {
      const shortSnippet =
        m.snippet.length > 160 ? m.snippet.slice(0, 157) + "..." : m.snippet;

      return `${i + 1}. Email from ${m.from} — "${m.subject}". Summary/snippet: ${shortSnippet}`;
    });

    return NextResponse.json(
      {
        connected: true,
        bullets,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GMAIL MESSAGES ROUTE ERROR:", err?.message || err);
    return NextResponse.json(
      { connected: false, bullets: [], error: "Server error" },
      { status: 200 }
    );
  }
}
