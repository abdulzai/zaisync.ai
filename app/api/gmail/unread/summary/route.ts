import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token;

  if (!accessToken) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  try {
    // 1) Get latest email ID
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=is:inbox",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const listJson = await listRes.json();
    const msg = listJson.messages?.[0];
    if (!msg) {
      return NextResponse.json({
        connected: true,
        hasMail: false,
      });
    }

    // 2) Fetch full email
    const emailRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const emailJson = await emailRes.json();

    // Extract fields from headers
    const headers = emailJson.payload.headers;
    const get = (name: string) =>
      headers.find((h: any) => h.name === name)?.value || "";

    const from = get("From");
    const subject = get("Subject");
    const snippet = emailJson.snippet || "";

    return NextResponse.json({
      connected: true,
      hasMail: true,
      from,
      subject,
      snippet,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
