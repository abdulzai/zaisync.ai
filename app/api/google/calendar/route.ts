import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.access_token) {
      return NextResponse.json({ connected: false, events: [] });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.access_token
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const now = new Date();
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: in24h.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    });

    const events = (response.data.items || []).map((ev) => ({
      id: ev.id,
      summary: ev.summary || "No title",
      start: ev.start?.dateTime || ev.start?.date,
      end: ev.end?.dateTime || ev.end?.date,
      location: ev.location || "",
    }));

    return NextResponse.json({
      connected: true,
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Calendar error:", err);
    return NextResponse.json({ connected: false, events: [], error: true });
  }
}
