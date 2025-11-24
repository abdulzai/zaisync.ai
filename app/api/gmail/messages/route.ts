// app/api/gmail/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions"; // four ../ from app/api/gmail/messages

type GmailHeader = { name: string; value: string };
type GmailMessage = { id: string };
type GmailListResponse = { messages?: GmailMessage[] };

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

    // 2) Get recent messages from last 7 days (up to 10)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=newer_than:7d in:inbox",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      const text = await listRes.text().catch(() => "");
      console.error("GMAIL LIST ERROR", listRes.status, text);
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
          debug: "list_failed",
        },
        { status: 200 }
      );
    }

    const listJson = (await listRes.json()) as GmailListResponse;
    const ids = listJson.messages?.map((m) => m.id) ?? [];

    if (ids.length === 0) {
      // No recent messages at all
      return NextResponse.json(
        {
          connected: true,
          bullets: [],
        },
        { status: 200 }
      );
    }

    // 3) Fetch details for the first few messages and turn them into bullets
    const bullets: string[] = [];

    for (const id of ids.slice(0, 5)) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!msgRes.ok) continue;

      const msgJson: any = await msgRes.json();
      const headers: GmailHeader[] = msgJson.payload?.headers ?? [];

      const subject =
        headers.find((h) => h.name === "Subject")?.value ?? "(no subject)";
      const from = headers.find((h) => h.name === "From")?.value ?? "";

      bullets.push(
        from ? `Email from ${from}: ${subject}` : `Email: ${subject}`
      );
    }

    return NextResponse.json(
      {
        connected: true,
        bullets,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GMAIL MESSAGES ERROR", err);
    return NextResponse.json(
      {
        connected: false,
        bullets: [],
      },
      { status: 200 }
    );
  }
}
