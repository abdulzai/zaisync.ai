// app/api/google/calendar/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder calendar endpoint – no real Google Calendar calls yet.
  // This keeps builds clean until we wire up full calendar integration.
  const demoEvents = [
    {
      id: "demo-1",
      title: "Sample meeting",
      start: "2025-12-02T09:00:00Z",
      end: "2025-12-02T09:30:00Z",
      location: "Video call",
    },
  ];

  return NextResponse.json({
    connected: false,
    demo: true,
    events: demoEvents,
  });
}
