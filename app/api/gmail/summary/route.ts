// app/api/gmail/summary/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { connected: false, hasMail: false },
      { status: 200 }
    );
  }

  // Get list of recent messages in the INBOX
  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:inbox",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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

  // Fetch the first message's snippet
  const msgRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${first.id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const msgJson = await msgRes.json();

  return NextResponse.json(
    {
      connected: true,
      hasMail: true,
      snippet: msgJson.snippet ?? "",
    },
    { status: 200 }
  );
}
