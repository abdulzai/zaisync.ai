import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  // Use the same session logic as /api/gmail/unread
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  // Not logged in with Google
  if (!accessToken) {
    return NextResponse.json(
      { connected: false, hasMail: false },
      { status: 200 }
    );
  }

  try {
    // 1) List newest message in inbox
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:inbox",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      const err = await listRes.text();
      console.error("Gmail list error", err);
      return NextResponse.json(
        { connected: true, hasMail: false },
        { status: 200 }
      );
    }

    const listJson: any = await listRes.json();
    const first = listJson.messages?.[0];
    if (!first) {
      // Inbox empty
      return NextResponse.json(
        { connected: true, hasMail: false },
        { status: 200 }
      );
    }

    const msgId = first.id as string;

    // 2) Get that message’s details
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!msgRes.ok) {
      const err = await msgRes.text();
      console.error("Gmail message error", err);
      return NextResponse.json(
        { connected: true, hasMail: false },
        { status: 200 }
      );
    }

    const msgJson: any = await msgRes.json();
    const headers = msgJson.payload?.headers ?? [];
    const from =
      headers.find((h: any) => h.name === "From")?.value ?? "(no sender)";
    const subject =
      headers.find((h: any) => h.name === "Subject")?.value ?? "(no subject)";
    const snippet = msgJson.snippet ?? "";

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
