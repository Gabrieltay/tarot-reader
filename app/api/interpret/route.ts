import { NextRequest, NextResponse } from "next/server";
import { InterpretRequest, StructuredReading } from "@/types/tarot";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const RESPONSIBLE_LANGUAGE_GUIDANCE = `Tarot offers symbolic guidance for self-reflection, not factual predictions or certainties. Never state that something will definitely happen. Favor phrasing such as "the cards may suggest...", "one possible interpretation is...", "symbolically, this could represent...", "you may wish to reflect on...". Encourage self-awareness and thoughtful decision-making rather than dependence on the reading.`;

const READING_SCHEMA = {
  type: "OBJECT",
  properties: {
    overallEnergy: {
      type: "STRING",
      description: "A short introduction describing the overall energy and tone of the spread.",
    },
    cardInterpretations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          cardId: { type: "STRING" },
          name: { type: "STRING" },
          symbolism: { type: "STRING", description: "Traditional symbolism of the card." },
          meaningInContext: { type: "STRING", description: "What this card means for the seeker's specific question." },
          emotionalPerspective: { type: "STRING", description: "The emotional or psychological angle of this card." },
          practicalInsight: { type: "STRING", description: "A grounded, practical insight tied to this card." },
        },
        required: ["cardId", "name", "symbolism", "meaningInContext", "emotionalPerspective", "practicalInsight"],
      },
    },
    cardRelationships: {
      type: "STRING",
      description: "How the cards interact as a whole story: supporting energies, contrasts, progression, balance of Major/Minor Arcana, dominant suits or symbols.",
    },
    connectionToPast: {
      type: "STRING",
      nullable: true,
      description: "Only when genuinely meaningful: recurring cards, similar questions, continuing themes, or growth compared to the provided previous readings. Null if no meaningful connection exists.",
    },
    keyMessage: {
      type: "STRING",
      description: "A concise, reflective summary of the central message of the reading.",
    },
    practicalGuidance: {
      type: "STRING",
      description: "One realistic, actionable suggestion the seeker could consider.",
    },
    reflectionQuestion: {
      type: "STRING",
      description: "A single thoughtful question that encourages personal reflection.",
    },
    summary: {
      type: "STRING",
      description: "A one-to-two sentence summary of this reading, suitable for a history list preview.",
    },
  },
  required: [
    "overallEnergy",
    "cardInterpretations",
    "cardRelationships",
    "keyMessage",
    "practicalGuidance",
    "reflectionQuestion",
    "summary",
  ],
};

function buildPrompt({ question, category, spread, cards, contextReadings }: InterpretRequest): string {
  const cardLines = cards
    .map((c, i) => {
      return `${i + 1}. Position: ${c.position} — ${c.name} (${c.orientation}), ${c.arcana} arcana${c.suit ? `, suit of ${c.suit}` : ""}\n   Traditional meaning: ${c.meaning}`;
    })
    .join("\n");

  const contextSection =
    contextReadings.length > 0
      ? `\nHere are the seeker's previous readings judged most relevant to this one — use them only if they genuinely enrich this reading (recurring cards, similar questions, recurring themes, or visible personal growth). Do not force a connection if one isn't meaningful; in that case set connectionToPast to null.\n\n${contextReadings
          .map(
            (r, i) =>
              `${i + 1}. ${new Date(r.createdAt).toLocaleDateString()} — Question: "${r.question}"${r.category ? ` (${r.category})` : ""}, Spread: ${r.spreadName}, Cards: ${r.cardNames.join(", ")}\n   Key message then: ${r.keyMessage}`
          )
          .join("\n")}\n`
      : `\nThis is a standalone reading. Do not reference any previous readings; set connectionToPast to null.\n`;

  return `You are a warm, insightful tarot reader and reflective-journaling companion. A seeker has asked the following question and drawn a "${spread}" spread${category ? ` in the category of ${category}` : ""}.

${RESPONSIBLE_LANGUAGE_GUIDANCE}

Weave the cards into a reading that feels like a complete story, not a list of isolated meanings: discuss supporting energies, contrasts, progression through the spread, and the balance between Major and Minor Arcana or dominant suits where relevant. Ground everything in the seeker's actual question.
${contextSection}
Seeker's question: "${question}"

Cards drawn:
${cardLines}

Respond with the structured reading now.`;
}

function normalizeReading(raw: unknown): StructuredReading | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.overallEnergy !== "string" ||
    !Array.isArray(r.cardInterpretations) ||
    typeof r.cardRelationships !== "string" ||
    typeof r.keyMessage !== "string" ||
    typeof r.practicalGuidance !== "string" ||
    typeof r.reflectionQuestion !== "string" ||
    typeof r.summary !== "string"
  ) {
    return null;
  }
  return {
    overallEnergy: r.overallEnergy,
    cardInterpretations: r.cardInterpretations as StructuredReading["cardInterpretations"],
    cardRelationships: r.cardRelationships,
    connectionToPast: typeof r.connectionToPast === "string" ? r.connectionToPast : null,
    keyMessage: r.keyMessage,
    practicalGuidance: r.practicalGuidance,
    reflectionQuestion: r.reflectionQuestion,
    summary: r.summary,
  };
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
    `[question-submitted] ${new Date().toISOString()} context=${contextReadings.length} category="${body.category ?? ""}" spread="${body.spread}" question="${body.question}"`
  );

  const prompt = buildPrompt(normalizedBody);

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
            responseMimeType: "application/json",
            responseSchema: READING_SCHEMA,
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Failed to parse Gemini JSON response:", text);
      return NextResponse.json(
        { error: "The interpretation service returned an unexpected response." },
        { status: 502 }
      );
    }

    const reading = normalizeReading(parsed);
    if (!reading) {
      console.error("Gemini response missing required reading fields:", parsed);
      return NextResponse.json(
        { error: "The interpretation service returned an incomplete reading." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reading });
  } catch (err) {
    console.error("Failed to reach Gemini API:", err);
    return NextResponse.json(
      { error: "Could not reach the interpretation service." },
      { status: 502 }
    );
  }
}
