import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

// GET /api/gmail/messages
export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  // Not connected to Gmail
  if (!accessToken) {
    return NextResponse.json(
      { connected: false, messages: [] },
      { status: 200 }
    );
  }

  try {
    // 1) List a few recent INBOX messages (you can tweak the query later)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX&q=newer_than:14d",
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
          messages: [],
          error: "Failed to list Gmail messages",
        },
        { status: 200 }
      );
    }

    const listJson = await listRes.json();
    const ids: string[] = (listJson.messages ?? []).map((m: any) => m.id);

    if (!ids.length) {
      return NextResponse.json(
        { connected: true, messages: [] },
        { status: 200 }
      );
    }

    // 2) Fetch details for each message (subject, from, date, snippet)
    const details: any[] = [];

    for (const id of ids) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!msgRes.ok) {
        continue;
      }

      const msgJson = await msgRes.json();
      const headers = msgJson.payload?.headers ?? [];

      const findHeader = (name: string) =>
        headers.find((h: any) => h.name === name)?.value ?? "";

      details.push({
        id,
        subject: findHeader("Subject"),
        from: findHeader("From"),
        date: findHeader("Date"),
        snippet: msgJson.snippet ?? "",
      });
    }

    return NextResponse.json(
      {
        connected: true,
        messages: details,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GMAIL MESSAGES ERROR", err);
    return NextResponse.json(
      {
        connected: false,
        messages: [],
        error: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
