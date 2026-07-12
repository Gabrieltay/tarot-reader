import { NextRequest, NextResponse } from "next/server";
import { FollowUpRequest } from "@/types/tarot";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const RESPONSIBLE_LANGUAGE_GUIDANCE = `Tarot offers symbolic guidance for self-reflection, not factual predictions or certainties. Never state that something will definitely happen. Favor phrasing such as "the cards may suggest...", "one possible interpretation is...", "symbolically, this could represent...", "you may wish to reflect on...". Encourage self-awareness rather than dependence on the reading.`;

function buildPrompt({ question, category, spread, cards, reading, conversation, message }: FollowUpRequest): string {
  const cardLines = cards
    .map((c, i) => `${i + 1}. Position: ${c.position} — ${c.name} (${c.orientation})`)
    .join("\n");

  const cardDetails = reading.cardInterpretations
    .map((c) => `- ${c.name}: ${c.meaningInContext}`)
    .join("\n");

  const conversationLines = conversation
    .map((turn) => `${turn.role === "user" ? "Seeker" : "Reader"}: ${turn.text}`)
    .join("\n");

  return `You are a warm, insightful tarot reader continuing a conversation with a seeker about a reading you already gave them. Speak naturally and conversationally, as a continuation of the same reading — not a new one.

${RESPONSIBLE_LANGUAGE_GUIDANCE}

Original question: "${question}"${category ? ` (category: ${category})` : ""}
Spread: ${spread}

Cards drawn:
${cardLines}

Your original reading:
Overall energy: ${reading.overallEnergy}
Card meanings:
${cardDetails}
Card relationships: ${reading.cardRelationships}
Key message: ${reading.keyMessage}
Practical guidance: ${reading.practicalGuidance}

${conversationLines ? `Conversation so far:\n${conversationLines}\n` : ""}
Seeker's new message: "${message}"

Reply directly to the seeker in 1-3 short paragraphs, staying grounded in the cards already drawn. Do not use markdown headers.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  let body: FollowUpRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.message || !body?.reading || !Array.isArray(body.cards) || body.cards.length === 0) {
    return NextResponse.json(
      { error: "Request must include the original reading and a follow-up message." },
      { status: 400 }
    );
  }

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
            temperature: 0.85,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json(
        { error: "The reader is unavailable right now. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
      undefined;

    if (!text) {
      return NextResponse.json(
        { error: "The reader returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: text.trim() });
  } catch (err) {
    console.error("Failed to reach Gemini API:", err);
    return NextResponse.json(
      { error: "Could not reach the interpretation service." },
      { status: 502 }
    );
  }
}
