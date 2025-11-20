// app/api/gmail/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { connected: false, bullets: [] },
      { status: 200 },
    );
  }

  try {
    // 1) Get latest 5 inbox messages
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=in:inbox",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!listRes.ok) {
      console.error("GMAIL MESSAGES LIST ERROR", await listRes.text());
      return NextResponse.json(
        { connected: true, bullets: [] },
        { status: 200 },
      );
    }

    const listJson = await listRes.json();
    const messages = listJson.messages ?? [];

    const bullets: string[] = [];

    // 2) For each message, fetch lightweight metadata
    for (const msg of messages) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!msgRes.ok) continue;

      const msgJson = await msgRes.json();
      const headers = msgJson.payload?.headers || [];

      const getHeader = (name: string) =>
        headers.find((h: any) => h.name === name)?.value || "";

      const from = getHeader("From");
      const subject = getHeader("Subject");
      const date = getHeader("Date");

      bullets.push(
        `From: ${from} | Subject: ${subject} | Date: ${date}`,
      );
    }

    return NextResponse.json(
      { connected: true, bullets },
      { status: 200 },
    );
  } catch (err) {
    console.error("GMAIL MESSAGES ERROR", err);
    return NextResponse.json(
      {
        connected: true,
        bullets: [],
        error: "Failed to load Gmail messages",
      },
      { status: 200 },
    );
  }
}
