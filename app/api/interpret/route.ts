import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_LIST } from "@/lib/categories";
import { InterpretRequest, ReadingCategory } from "@/types/tarot";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const RESPONSIBLE_LANGUAGE_GUIDANCE = `Tarot offers symbolic guidance for self-reflection, not factual predictions or certainties. Never state that something will definitely happen. Favor phrasing such as "the cards may suggest...", "one possible interpretation is...", "symbolically, this could represent...", "you may wish to reflect on...". Encourage self-awareness and thoughtful decision-making rather than dependence on the reading.`;

const CATEGORY_LINE_PATTERN = /^CATEGORY:\s*([a-z-]+)\s*\n?/i;

function buildPrompt({ question, spread, cards, contextReadings }: InterpretRequest): string {
  const cardLines = cards
    .map((c, i) => {
      return `${i + 1}. Position: ${c.position} — ${c.name} (${c.orientation})\n   Traditional meaning: ${c.meaning}`;
    })
    .join("\n");

  const contextSection =
    contextReadings.length > 0
      ? `\nFor reference, here are a few of the seeker's past readings that may or may not be relevant:\n\n${contextReadings
          .map(
            (r, i) =>
              `${i + 1}. ${new Date(r.createdAt).toLocaleDateString()} — Question: "${r.question}", Cards: ${r.cardNames.join(", ")}\n   Gist: ${r.summary}`
          )
          .join(
            "\n"
          )}\n\nOnly let a past reading inform this one if it is genuinely relevant (a recurring card, a closely related question, a continuing theme). Weave that connection naturally into the prose as part of the narrative — never call it out as a separate note, and don't mention it at all if nothing is truly relevant.\n`
      : "";

  return `You are a warm, insightful tarot reader. A seeker has asked the following question and drawn a "${spread}" spread. Weave the cards into a single cohesive, flowing reading that speaks directly to their question — don't just list meanings one by one, connect them into a narrative. Keep it grounded, compassionate, and specific to the cards drawn and their positions. Close with one grounded, practical thought and a gentle reflective question, woven naturally into the prose rather than labeled. Aim for 3-5 short paragraphs. Do not use markdown headers.

${RESPONSIBLE_LANGUAGE_GUIDANCE}
${contextSection}
Seeker's question: "${question}"

Cards drawn:
${cardLines}

First, on a line by itself, output which area of life this question best fits, formatted exactly as "CATEGORY: <value>" where <value> is one of: ${CATEGORY_LIST.join(", ")}. Choose "general" if none fits clearly. Then, on the following lines, write the reading.`;
}

function extractCategory(text: string): { category: ReadingCategory | null; interpretation: string } {
  const match = text.match(CATEGORY_LINE_PATTERN);
  if (!match) {
    return { category: null, interpretation: text.trim() };
  }
  const candidate = match[1].toLowerCase();
  const category = (CATEGORY_LIST as string[]).includes(candidate)
    ? (candidate as ReadingCategory)
    : null;
  return { category, interpretation: text.slice(match[0].length).trim() };
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
  const contextReadings = Array.isArray(body.contextReadings) ? body.contextReadings : [];
  const normalizedBody: InterpretRequest = { ...body, contextReadings };

  console.log(
    `[question-submitted] ${new Date().toISOString()} context=${contextReadings.length} spread="${body.spread}" question="${body.question}"`
  );

  const prompt = buildPrompt(normalizedBody);

  console.log(
    `[llm-context] ${new Date().toISOString()} ${
      contextReadings.length > 0
        ? JSON.stringify(
            contextReadings.map((r) => ({
              id: r.id,
              createdAt: r.createdAt,
              category: r.category,
              question: r.question,
              cardNames: r.cardNames,
            }))
          )
        : "no past readings included"
    }`
  );

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

    const { category, interpretation } = extractCategory(text.trim());

    return NextResponse.json({ interpretation, category });
  } catch (err) {
    console.error("Failed to reach Gemini API:", err);
    return NextResponse.json(
      { error: "Could not reach the interpretation service." },
      { status: 502 }
    );
  }
}
