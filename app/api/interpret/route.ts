import { NextRequest, NextResponse } from "next/server";
import { InterpretRequest } from "@/types/tarot";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

function buildPrompt({ question, spread, cards }: InterpretRequest): string {
  const cardLines = cards
    .map((c, i) => {
      return `${i + 1}. Position: ${c.position} — ${c.name} (${c.orientation})\n   Traditional meaning: ${c.meaning}`;
    })
    .join("\n");

  return `You are a warm, insightful tarot reader. A seeker has asked the following question and drawn a "${spread}" spread. Weave the cards into a single cohesive, flowing reading that speaks directly to their question — don't just list meanings one by one, connect them into a narrative. Keep it grounded, compassionate, and specific to the cards drawn and their positions. Aim for 3-5 short paragraphs. Do not use markdown headers.

Seeker's question: "${question}"

Cards drawn:
${cardLines}

Write the reading now.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  let body: InterpretRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.question || !Array.isArray(body.cards) || body.cards.length === 0) {
    return NextResponse.json(
      { error: "Request must include a question and at least one drawn card." },
      { status: 400 }
    );
  }

  console.log(
    `[question-submitted] ${new Date().toISOString()} spread="${body.spread}" question="${body.question}"`
  );

  const prompt = buildPrompt(body);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json(
        { error: "The interpretation service failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
      undefined;

    if (!text) {
      return NextResponse.json(
        { error: "The interpretation service returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ interpretation: text.trim() });
  } catch (err) {
    console.error("Failed to reach Gemini API:", err);
    return NextResponse.json(
      { error: "Could not reach the interpretation service." },
      { status: 502 }
    );
  }
}
