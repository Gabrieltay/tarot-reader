"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import QuestionInput from "@/components/QuestionInput";
import SpreadSelector from "@/components/SpreadSelector";
import SpreadLayout from "@/components/SpreadLayout";
import Interpretation from "@/components/Interpretation";
import IvoryPanel from "@/components/IvoryPanel";
import { drawSpread } from "@/lib/draw";
import { SPREADS } from "@/lib/spreads";
import { selectRelevantReadings, toContextSummary } from "@/lib/context";
import { generateId, getHistory, saveReading } from "@/lib/history";
import {
  DrawnCard,
  InterpretRequestCard,
  SavedReading,
  SpreadId,
} from "@/types/tarot";

type Stage = "setup" | "reading";

function toRequestCards(cards: DrawnCard[]): InterpretRequestCard[] {
  return cards.map((c) => ({
    cardId: c.card.id,
    name: c.card.name,
    orientation: c.reversed ? "reversed" : "upright",
    position: c.position.label,
    meaning: c.reversed ? c.card.reversed_meaning : c.card.upright_meaning,
    suit: c.card.suit,
    arcana: c.card.arcana,
  }));
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("setup");
  const [question, setQuestion] = useState("");
  const [spreadId, setSpreadId] = useState<SpreadId>("single");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [interpretError, setInterpretError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchInterpretation = useCallback(
    async (q: string, spread: SpreadId, cards: DrawnCard[]) => {
      setInterpretLoading(true);
      setInterpretError(null);
      setInterpretation(null);
      setSaved(false);
      try {
        const history = getHistory();
        const contextReadings = selectRelevantReadings(history, {
          question: q,
          category: null,
          cardNames: cards.map((c) => c.card.name),
        }).map(toContextSummary);

        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            spread: SPREADS[spread].name,
            cards: toRequestCards(cards),
            contextReadings,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Something went wrong.");
        }
        const text: string = data.interpretation;
        setInterpretation(text);

        const savedReading: SavedReading = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          question: q,
          category: data.category ?? null,
          spreadId: spread,
          spreadName: SPREADS[spread].name,
          cards: cards.map((c) => ({
            cardId: c.card.id,
            name: c.card.name,
            orientation: c.reversed ? "reversed" : "upright",
            position: c.position.label,
            image: c.card.image,
            suit: c.card.suit,
            arcana: c.card.arcana,
          })),
          interpretation: text,
          journal: [],
        };
        saveReading(savedReading);
        setSaved(true);
      } catch (err) {
        setInterpretError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setInterpretLoading(false);
      }
    },
    []
  );

  const handleDraw = useCallback(() => {
    const spread = SPREADS[spreadId];
    const drawn = drawSpread(spread);
    setDrawnCards(drawn);
    setStage("reading");
    fetchInterpretation(question, spreadId, drawn);
  }, [question, spreadId, fetchInterpretation]);

  const handleDrawAgain = useCallback(() => {
    handleDraw();
  }, [handleDraw]);

  const handleNewQuestion = useCallback(() => {
    setStage("setup");
    setDrawnCards([]);
    setInterpretation(null);
    setInterpretError(null);
    setSaved(false);
  }, []);

  const canDraw = question.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-14 sm:py-20">
      <Link
        href="/history"
        className="fixed top-5 right-5 z-20 rounded-full border border-gold/30 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-soft/90 font-sans hover:bg-white/[0.08] transition-colors"
      >
        History
      </Link>

      <header className="text-center mb-12 sm:mb-16">
        <svg
          className="mx-auto mb-4 opacity-80"
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
        >
          <path
            d="M17 4a11 11 0 1 0 0 20 8.8 8.8 0 0 1 0-20Z"
            stroke="#D6B56A"
            strokeWidth="1"
          />
        </svg>
        <h1 className="font-display text-4xl sm:text-5xl text-gold-soft tracking-wide">
          Tarot Reader
        </h1>
        <p className="text-lavender-gray/70 mt-3 max-w-md mx-auto font-sans text-[15px] leading-relaxed">
          Ask a question, draw your cards, and receive a reading woven just for
          you — a companion for reflection, not a fortune teller.
        </p>
      </header>

      {stage === "setup" && (
        <div className="w-full max-w-xl animate-fade-in-up">
          <IvoryPanel>
            <div className="flex flex-col gap-9">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep/80 font-sans font-medium">
                  Begin Your Reading
                </p>
              </div>
              <QuestionInput value={question} onChange={setQuestion} />
              <div className="gold-divider-soft" />
              <SpreadSelector value={spreadId} onChange={setSpreadId} />
              <button
                type="button"
                disabled={!canDraw}
                onClick={handleDraw}
                className="w-full rounded-full bg-gradient-to-b from-gold-soft to-gold text-ink font-display text-xl tracking-wide py-3.5 transition-all disabled:opacity-35 disabled:cursor-not-allowed enabled:hover:shadow-[0_8px_24px_-6px_rgba(166,124,61,0.55)] enabled:hover:-translate-y-0.5 cursor-pointer"
              >
                Draw Your Cards
              </button>
            </div>
          </IvoryPanel>
        </div>
      )}

      {stage === "reading" && (
        <div className="w-full flex flex-col items-center gap-12 animate-fade-in-up">
          <div className="text-center max-w-xl flex flex-col items-center gap-3">
            <span className="inline-block rounded-full border border-gold/30 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-soft/90 font-sans">
              {SPREADS[spreadId].name}
            </span>
            <p className="font-display text-2xl text-warm-white/95 italic px-4">
              &ldquo;{question}&rdquo;
            </p>
          </div>

          <div className="w-full px-2">
            <SpreadLayout spreadId={spreadId} cards={drawnCards} />
          </div>

          <Interpretation
            loading={interpretLoading}
            error={interpretError}
            text={interpretation}
          />

          {saved && (
            <p className="text-[11px] text-lavender-gray/50 font-sans text-center max-w-md -mt-6">
              Saved to your journal — stored only on this device. You can remove it
              anytime from your{" "}
              <Link href="/history" className="underline underline-offset-2 hover:text-lavender-gray/80">
                History
              </Link>
              .
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              type="button"
              onClick={handleDrawAgain}
              className="rounded-full border border-gold/50 text-gold-soft px-7 py-2.5 font-display text-lg tracking-wide hover:bg-gold/10 hover:border-gold/70 transition-colors cursor-pointer"
            >
              Draw Again
            </button>
            <button
              type="button"
              onClick={handleNewQuestion}
              className="rounded-full border border-lavender-gray/25 text-lavender-gray/85 px-7 py-2.5 font-display text-lg tracking-wide hover:bg-white/5 hover:border-lavender-gray/40 transition-colors cursor-pointer"
            >
              New Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
