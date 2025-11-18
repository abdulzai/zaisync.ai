import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bullets = Array.isArray(body.bullets) ? body.bullets : [];

    if (!bullets.length) {
      return NextResponse.json(
        { error: "No bullet points were provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set on the server." },
        { status: 500 }
      );
    }

    const prompt = `Write a short, clear client recap based on these points:\n${bullets
      .map((b: string, i: number) => `${i + 1}. ${b}`)
      .join("\n")}`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message || "OpenAI API returned an error response.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const text =
      data.choices?.[0]?.message?.content?.trim() || "No recap generated.";

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown server error in /api/ai/recap." },
      { status: 500 }
    );
  }
}
