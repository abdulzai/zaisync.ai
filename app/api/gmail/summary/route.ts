import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { connected: false, hasMail: false },
      { status: 200 }
    );
  }

  try {
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:inbox",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const listJson = await listRes.json();
    const first = listJson.messages?.[0];

    if (!first) {
      return NextResponse.json(
        { connected: true, hasMail: false },
        { status: 200 }
      );
    }

    const msgId = first.id;

    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const msgJson = await msgRes.json();
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
  } catch {
    return NextResponse.json(
      { connected: true, hasMail: false },
      { status: 200 }
    );
  }
}
