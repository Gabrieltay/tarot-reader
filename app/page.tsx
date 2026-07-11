"use client";

import { useCallback, useState } from "react";
import QuestionInput from "@/components/QuestionInput";
import SpreadSelector from "@/components/SpreadSelector";
import SpreadLayout from "@/components/SpreadLayout";
import Interpretation from "@/components/Interpretation";
import { drawSpread } from "@/lib/draw";
import { SPREADS } from "@/lib/spreads";
import { DrawnCard, SpreadId } from "@/types/tarot";

type Stage = "setup" | "reading";

export default function Home() {
  const [stage, setStage] = useState<Stage>("setup");
  const [question, setQuestion] = useState("");
  const [spreadId, setSpreadId] = useState<SpreadId>("single");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [interpretError, setInterpretError] = useState<string | null>(null);

  const fetchInterpretation = useCallback(
    async (q: string, spread: SpreadId, cards: DrawnCard[]) => {
      setInterpretLoading(true);
      setInterpretError(null);
      setInterpretation(null);
      try {
        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            spread: SPREADS[spread].name,
            cards: cards.map((c) => ({
              name: c.card.name,
              orientation: c.reversed ? "reversed" : "upright",
              position: c.position.label,
              meaning: c.reversed ? c.card.reversed_meaning : c.card.upright_meaning,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Something went wrong.");
        }
        setInterpretation(data.interpretation);
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
  }, []);

  const canDraw = question.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <header className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-mystic-gold">
          Tarot Reader
        </h1>
        <p className="text-purple-200/60 mt-2 max-w-md mx-auto">
          Ask a question, draw your cards, and receive a reading woven just for
          you.
        </p>
      </header>

      {stage === "setup" && (
        <div className="w-full max-w-xl flex flex-col gap-8">
          <QuestionInput value={question} onChange={setQuestion} />
          <SpreadSelector value={spreadId} onChange={setSpreadId} />
          <button
            type="button"
            disabled={!canDraw}
            onClick={handleDraw}
            className="w-full rounded-lg bg-mystic-gold text-[#241645] font-display tracking-wide text-lg py-3 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer"
          >
            Draw Your Cards
          </button>
        </div>
      )}

      {stage === "reading" && (
        <div className="w-full flex flex-col items-center gap-10">
          <div className="text-center max-w-xl">
            <p className="text-purple-200/50 text-sm uppercase tracking-widest">
              {SPREADS[spreadId].name}
            </p>
            <p className="text-lg text-foreground mt-1 italic">
              &ldquo;{question}&rdquo;
            </p>
          </div>

          <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-fit mx-auto px-2">
              <SpreadLayout spreadId={spreadId} cards={drawnCards} />
            </div>
          </div>

          <Interpretation
            loading={interpretLoading}
            error={interpretError}
            text={interpretation}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDrawAgain}
              className="rounded-lg border border-mystic-gold/60 text-mystic-gold px-6 py-2.5 font-display tracking-wide hover:bg-mystic-gold/10 transition-colors cursor-pointer"
            >
              Draw Again
            </button>
            <button
              type="button"
              onClick={handleNewQuestion}
              className="rounded-lg border border-purple-300/30 text-purple-200/80 px-6 py-2.5 font-display tracking-wide hover:bg-white/5 transition-colors cursor-pointer"
            >
              New Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
