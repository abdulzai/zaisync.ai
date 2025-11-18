import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  try {
    // 1) Pull real messages
    const gmailRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/messages`,
      { cache: "no-store" }
    );

    const gmail = await gmailRes.json();
    const messages = gmail.messages || [];

    let emailSummary = "No recent client emails found.";

    if (messages.length > 0) {
      const formatted = messages
        .map(
          (m: any, i: number) =>
            `Email ${i + 1}:\nFrom: ${m.from}\nSubject: ${m.subject}\nSnippet: ${m.snippet}`
        )
        .join("\n\n");

      // 2) Summarize with AI
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an executive assistant. Summarize client-related updates clearly, focusing on actions, decisions, and follow-ups.",
          },
          {
            role: "user",
            content: `Here are the latest Gmail messages:\n\n${formatted}\n\nCreate a short client recap.`,
          },
        ],
      });

      emailSummary = completion.choices[0].message.content;
    }

    return NextResponse.json({ text: emailSummary });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "AI recap failed" },
      { status: 500 }
    );
  }
}
