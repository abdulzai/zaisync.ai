// @ts-nocheck  ← disable TypeScript errors in this route

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  // Get session and access token from NextAuth
  const session: any = await getServerSession(authOptions);
  const accessToken: string | undefined = session?.access_token;

  // Not connected to Google
  if (!accessToken) {
    return NextResponse.json(
      { connected: false, hasMail: false },
      { status: 200 }
    );
  }

  try {
    // 1) Get the latest inbox message
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:inbox",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const listJson: any = await listRes.json();
    const first = listJson.messages?.[0];

    // Inbox empty
    if (!first) {
      return NextResponse.json(
        { connected: true, hasMail: false },
        { status: 200 }
      );
    }

    const msgId = first.id;

    // 2) Fetch that message’s metadata for From + Subject
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const msgJson: any = await msgRes.json();
    const headers = msgJson.payload?.headers ?? [];

    const from =
      headers.find((h: any) => h.name === "From")?.value ?? "(no sender)";
    const subject =
      headers.find((h: any) => h.name === "Subject")?.value ?? "(no subject)";
    const snippet: string = msgJson.snippet ?? "";

    return NextResponse.json({
      connected: true,
      hasMail: true,
      from,
      subject,
      snippet,
    });
  } catch (err) {
    console.error("Gmail summary error", err);
    return NextResponse.json(
      { connected: true, hasMail: false },
      { status: 200 }
    );
  }
}
