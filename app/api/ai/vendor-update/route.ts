// app/api/ai/vendor-update/route.ts

import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bullets = (body?.bullets as string[]) || [];

    if (!bullets.length) {
      return NextResponse.json(
        { error: "No bullets provided" },
        { status: 400 }
      );
    }

    // Turn the bullets into a single prompt string
    const bulletList = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");

    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      system:
        "You are an operations and vendor-management leader. " +
        "Given recent email updates (as bullets), write a concise, professional vendor update email. " +
        "The tone should be clear, calm, and executive-friendly. " +
        "Include numbered points or short paragraphs, and end with a clear call to action or next steps.",
      prompt:
        "Here are the recent updates as bullets:\n\n" +
        bulletList +
        "\n\nDraft a vendor update email I can send to a key third-party partner.",
    });

    return NextResponse.json({ vendorUpdate: text });
  } catch (err) {
    console.error("Vendor-update route error:", err);
    return NextResponse.json(
      { error: "Failed to generate vendor update" },
      { status: 500 }
    );
  }
}
