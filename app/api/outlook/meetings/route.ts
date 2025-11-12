// app/api/outlook/meetings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json({ connected: false, meetings: 0 }, { status: 200 });
  }

  // Next 24 hours window in ISO
  const start = new Date();
  const end = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const startISO = start.toISOString();
  const endISO = end.toISOString();

  const url = `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${encodeURIComponent(
    startISO
  )}&endDateTime=${encodeURIComponent(endISO)}&$select=subject,start,end&$top=100`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    // token may be missing/expired; UI can prompt to connect
    return NextResponse.json({ connected: true, meetings: 0 }, { status: 200 });
  }

  const data = await res.json();
  const count = Array.isArray(data?.value) ? data.value.length : 0;

  return NextResponse.json({ connected: true, meetings: count }, { status: 200 });
}
