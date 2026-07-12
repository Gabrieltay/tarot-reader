"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import QuestionInput from "@/components/QuestionInput";
import CategorySelector from "@/components/CategorySelector";
import SpreadSelector from "@/components/SpreadSelector";
import ModeSelector from "@/components/ModeSelector";
import SpreadLayout from "@/components/SpreadLayout";
import Interpretation from "@/components/Interpretation";
import SaveReadingBar from "@/components/SaveReadingBar";
import FollowUpChat from "@/components/FollowUpChat";
import IvoryPanel from "@/components/IvoryPanel";
import { drawSpread } from "@/lib/draw";
import { SPREADS } from "@/lib/spreads";
import { selectRelevantReadings, toContextSummary } from "@/lib/context";
import {
  addConversationTurn,
  deleteReading,
  generateId,
  getHistory,
  saveReading,
  updateSettings,
  useHistory,
  useSettings,
} from "@/lib/history";
import {
  ConversationTurn,
  DrawnCard,
  InterpretRequestCard,
  ReadingCategory,
  ReadingMode,
  SavedReading,
  SpreadId,
  StructuredReading,
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
  const [category, setCategory] = useState<ReadingCategory | null>(null);
  const [spreadId, setSpreadId] = useState<SpreadId>("single");
  const [mode, setMode] = useState<ReadingMode>("quick");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState<StructuredReading | null>(null);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [interpretError, setInterpretError] = useState<string | null>(null);

  const contextualEnabled = useSettings().contextualEnabled;
  const historyCount = useHistory().length;

  const [savedReadingId, setSavedReadingId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const fetchInterpretation = useCallback(
    async (q: string, cat: ReadingCategory | null, spread: SpreadId, readingMode: ReadingMode, cards: DrawnCard[]) => {
      setInterpretLoading(true);
      setInterpretError(null);
      setReading(null);
      try {
        const history = getHistory();
        const contextReadings =
          readingMode === "contextual"
            ? selectRelevantReadings(history, {
                question: q,
                category: cat,
                cardNames: cards.map((c) => c.card.name),
              }).map(toContextSummary)
            : [];

        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            category: cat,
            spread: SPREADS[spread].name,
            cards: toRequestCards(cards),
            mode: readingMode,
            contextReadings,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Something went wrong.");
        }
        setReading(data.reading as StructuredReading);
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
    setSavedReadingId(null);
    setConversation([]);
    fetchInterpretation(question, category, spreadId, mode, drawn);
  }, [question, category, spreadId, mode, fetchInterpretation]);

  const handleDrawAgain = useCallback(() => {
    handleDraw();
  }, [handleDraw]);

  const handleNewQuestion = useCallback(() => {
    setStage("setup");
    setDrawnCards([]);
    setReading(null);
    setInterpretError(null);
    setSavedReadingId(null);
    setConversation([]);
  }, []);

  const handleToggleContextualEnabled = useCallback((enabled: boolean) => {
    updateSettings({ contextualEnabled: enabled });
    if (!enabled) setMode("quick");
  }, []);

  const handleSaveReading = useCallback(() => {
    if (!reading) return;
    const id = generateId();
    const saved: SavedReading = {
      id,
      createdAt: new Date().toISOString(),
      question,
      category,
      spreadId,
      spreadName: SPREADS[spreadId].name,
      mode,
      cards: drawnCards.map((c) => ({
        cardId: c.card.id,
        name: c.card.name,
        orientation: c.reversed ? "reversed" : "upright",
        position: c.position.label,
        image: c.card.image,
        suit: c.card.suit,
        arcana: c.card.arcana,
      })),
      reading,
      journal: [],
      conversation,
    };
    saveReading(saved);
    setSavedReadingId(id);
  }, [reading, question, category, spreadId, mode, drawnCards, conversation]);

  const handleUnsaveReading = useCallback(() => {
    if (!savedReadingId) return;
    deleteReading(savedReadingId);
    setSavedReadingId(null);
  }, [savedReadingId]);

  const handleSendFollowUp = useCallback(
    async (message: string) => {
      if (!reading) return;
      const userTurn: ConversationTurn = {
        id: generateId(),
        role: "user",
        text: message,
        createdAt: new Date().toISOString(),
      };
      setConversation((prev) => [...prev, userTurn]);
      if (savedReadingId) addConversationTurn(savedReadingId, { role: "user", text: message });
      setFollowUpLoading(true);
      try {
        const res = await fetch("/api/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            category,
            spread: SPREADS[spreadId].name,
            cards: toRequestCards(drawnCards),
            reading,
            conversation: conversation.map((t) => ({ role: t.role, text: t.text })),
            message,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Something went wrong.");
        const assistantTurn: ConversationTurn = {
          id: generateId(),
          role: "assistant",
          text: data.reply,
          createdAt: new Date().toISOString(),
        };
        setConversation((prev) => [...prev, assistantTurn]);
        if (savedReadingId) addConversationTurn(savedReadingId, { role: "assistant", text: data.reply });
      } catch (err) {
        const errorTurn: ConversationTurn = {
          id: generateId(),
          role: "assistant",
          text:
            err instanceof Error
              ? `I couldn't reach the reader: ${err.message}`
              : "I couldn't reach the reader. Please try again.",
          createdAt: new Date().toISOString(),
        };
        setConversation((prev) => [...prev, errorTurn]);
      } finally {
        setFollowUpLoading(false);
      }
    },
    [reading, question, category, spreadId, drawnCards, conversation, savedReadingId]
  );

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
              <CategorySelector value={category} onChange={setCategory} />
              <div className="gold-divider-soft" />
              <SpreadSelector value={spreadId} onChange={setSpreadId} />
              <div className="gold-divider-soft" />
              <ModeSelector
                value={mode}
                onChange={setMode}
                historyCount={historyCount}
                contextualEnabled={contextualEnabled}
                onToggleContextualEnabled={handleToggleContextualEnabled}
              />
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
              {SPREADS[spreadId].name} · {mode === "contextual" ? "Contextual" : "Quick"} Reading
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
            reading={reading}
            cardMeta={drawnCards.map((c) => ({
              cardId: c.card.id,
              position: c.position.label,
              reversed: c.reversed,
            }))}
          />

          {reading && !interpretLoading && (
            <SaveReadingBar
              saved={savedReadingId !== null}
              onSave={handleSaveReading}
              onUnsave={handleUnsaveReading}
            />
          )}

          {reading && !interpretLoading && (
            <FollowUpChat
              conversation={conversation}
              onSend={handleSendFollowUp}
              loading={followUpLoading}
            />
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
