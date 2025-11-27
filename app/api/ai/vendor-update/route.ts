import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bullets } = await req.json();

    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      return NextResponse.json(
        { error: "No bullets provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const prompt =
      `You are an operations and vendor-management leader.\n` +
      `Given recent email updates (as bullets), write a concise, professional vendor update email.\n` +
      `Tone: confident, clear, no fluff. 3–6 short paragraphs max.\n\n` +
      `Email bullets:\n` +
      bullets.map((b: string, i: number) => `${i + 1}. ${b}`).join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You write vendor-facing status emails." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI vendor-update error:", errorText);
      return NextResponse.json(
        { error: "OpenAI API error", details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    const vendorUpdate =
      data.choices?.[0]?.message?.content ||
      "No vendor update was generated. Try again with more detail in the bullets.";

    return NextResponse.json({ vendorUpdate });
  } catch (err: any) {
    console.error("Vendor update route error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
