import { NextResponse } from "next/server";

// Temporary stub so Outlook doesn't break the build.
// We'll replace this later when we wire up real Outlook data.
export async function GET() {
  return NextResponse.json({ enabled: false, meetings: [] });
}
