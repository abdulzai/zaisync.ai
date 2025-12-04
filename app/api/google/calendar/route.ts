// app/api/google/calendar/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  // 1) Get session + Google access token
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      {
        connected: false,
        meetings: [],
        debug: { where: "no_access_token" },
      },
      { status: 200 }
    );
  }

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // +24h

  try {
    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events" +
      `?singleEvents=true&orderBy=startTime` +
      `&timeMin=${encodeURIComponent(timeMin)}` +
      `&timeMax=${encodeURIComponent(timeMax)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      let errJson: any = null;
      try {
        errJson = await res.json();
      } catch {
        // ignore
      }

      return NextResponse.json(
        {
          connected: true,
          meetings: [],
          debug: {
            where: "calendar_fetch_failed",
            status: res.status,
            error: errJson,
          },
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const meetings = items.map((ev: any) => ({
      id: ev.id,
      summary: ev.summary,
      start: ev.start?.dateTime || ev.start?.date,
      end: ev.end?.dateTime || ev.end?.date,
      location: ev.location,
    }));

    return NextResponse.json(
      {
        connected: true,
        meetings,
        debug: { where: "success", count: meetings.length },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: true,
        meetings: [],
        debug: { where: "exception", message: String(err) },
      },
      { status: 200 }
    );
  }
}
