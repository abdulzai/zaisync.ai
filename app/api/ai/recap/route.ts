import { authOptions } from "../../../../lib/authOptions";

export async function POST(req: Request) {
  const { bullets } = await req.json();
  const prompt = `Write a short, clear client recap based on these points:\n${bullets
    .map((b: string, i: number) => `${i + 1}. ${b}`)
    .join("\n")}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No recap generated.";
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
