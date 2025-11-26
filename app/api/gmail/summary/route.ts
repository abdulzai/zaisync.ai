// app/api/gmail/summary/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.access_token as string | undefined;

  return NextResponse.json(
    {
      connected: !!session,
      hasMail: !!accessToken
    },
    { status: 200 }
  );
}
