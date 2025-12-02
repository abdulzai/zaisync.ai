// app/api/gmail/meetings/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type CalendarEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export async function GET() {
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

  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: in24h.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "10",
    });

    const resp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!resp.ok) {
      const errJson = await resp.json().catch(() => ({}));
      return NextResponse.json(
        {
          connected: true,
          meetings: [],
          debug: {
            where: "list_failed",
            status: resp.status,
            error: errJson,
          },
        },
        { status: 200 }
      );
    }

    const data = await resp.json();
    const items: CalendarEvent[] = data.items || [];

    const meetings = items.map((ev) => {
      const startIso = ev.start?.dateTime || ev.start?.date;
      const endIso = ev.end?.dateTime || ev.end?.date;
      return {
        id: ev.id,
        title: ev.summary || "(No title)",
        start: startIso,
        end: endIso,
      };
    });

    return NextResponse.json(
      {
        connected: true,
        meetings,
        count: meetings.length,
        debug: { where: "success" },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Calendar list error:", err);
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
