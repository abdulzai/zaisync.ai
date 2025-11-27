// app/api/ai/vendor-update/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bullets: string[] = body.bullets || [];

    if (!Array.isArray(bullets) || bullets.length === 0) {
      return NextResponse.json(
        { error: "No bullets provided" },
        { status: 400 }
      );
    }

    const bulletsText = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");

    const systemPrompt = `
You are Aurora EA, an executive assistant for a VP of OT & Security in the renewable energy industry.

Write a concise, professional email draft to a VENDOR (not a client) that:
- Summarizes the key points from the list below
- Focuses on status, asks, and next steps for the vendor
- Uses clear paragraphs and bullets where helpful
- Avoids internal-only details, venting, or blame
- Sounds like a calm, decisive leader

Sign off generically (e.g., "Best regards," and a placeholder name).
    `.trim();

    const userPrompt = `
Here are the latest items the VP has been dealing with:

${bulletsText}

Using ONLY the information that is actually relevant for a vendor, draft an email to a vendor contact that:
- Gives a quick context summary
- Highlights specific asks or information needed from the vendor
- Clarifies timelines or expectations if they are implied
- Stays under ~250–300 words

Return ONLY the email body, no extra explanation.
    `.trim();

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const text =
      completion.output[0].content[0].type === "output_text"
        ? completion.output[0].content[0].text
        : "";

    return NextResponse.json({ vendorUpdate: text });
  } catch (err) {
    console.error("Vendor update route error:", err);
    return NextResponse.json(
      { error: "Failed to generate vendor update" },
      { status: 500 }
    );
  }
}
