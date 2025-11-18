import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not connected to Gmail" },
      { status: 401 }
    );
  }

  try {
    // 1) Get list of recent messages (adjust maxResults as you like)
    const listRes = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=is:inbox",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const listJson = await listRes.json();

    if (!listJson.messages?.length) {
      return NextResponse.json({ messages: [] });
    }

    // 2) Fetch details for each message
    const details = await Promise.all(
      listJson.messages.map(async (msg: any) => {
        const res = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        return res.json();
      })
    );

    // 3) Normalize the data for the UI
    const mapped = details.map((m: any) => {
      const headers = m.payload?.headers || [];
      const from = headers.find((h: any) => h.name === "From")?.value || "";
      const subject =
        headers.find((h: any) => h.name === "Subject")?.value || "";
      const snippet = m.snippet || "";

      return { from, subject, snippet };
    });

    return NextResponse.json({ messages: mapped });
  } catch (err) {
    console.error("GMAIL MESSAGES ERROR", err);
    return NextResponse.json(
      { error: "Failed to fetch Gmail messages" },
      { status: 500 }
    );
  }
}
