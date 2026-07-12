"use client";

import { ReactNode, useState } from "react";
import { StructuredReading } from "@/types/tarot";

export interface CardMeta {
  cardId: string;
  position: string;
  reversed: boolean;
}

interface InterpretationProps {
  loading: boolean;
  error: string | null;
  reading: StructuredReading | null;
  cardMeta: CardMeta[];
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep/80 font-sans font-medium mb-2">
      {children}
    </p>
  );
}

function CardInterpretationRow({
  interpretation,
  meta,
}: {
  interpretation: StructuredReading["cardInterpretations"][number];
  meta: CardMeta | undefined;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-ink/10 bg-white/25 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left cursor-pointer"
      >
        <div>
          <span className="font-display text-lg text-ink">{interpretation.name}</span>
          {meta && (
            <span className="ml-2 text-xs text-ink-soft font-sans">
              {meta.position} · {meta.reversed ? "Reversed" : "Upright"}
            </span>
          )}
        </div>
        <span className="text-gold-deep text-sm font-sans">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 text-sm text-ink/85 font-sans leading-relaxed">
          <div>
            <span className="text-ink-soft font-medium">Traditional symbolism: </span>
            {interpretation.symbolism}
          </div>
          <div>
            <span className="text-ink-soft font-medium">In your question: </span>
            {interpretation.meaningInContext}
          </div>
          <div>
            <span className="text-ink-soft font-medium">Emotional perspective: </span>
            {interpretation.emotionalPerspective}
          </div>
          <div>
            <span className="text-ink-soft font-medium">Practical insight: </span>
            {interpretation.practicalInsight}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Interpretation({ loading, error, reading, cardMeta }: InterpretationProps) {
  if (!loading && !error && !reading) return null;

  return (
    <div className="w-full max-w-2xl mx-auto ivory-panel px-7 py-9 sm:px-12 sm:py-12 animate-fade-in-up">
      <div className="text-center mb-6">
        <svg className="mx-auto mb-3 opacity-70" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2v16M2 10h16" stroke="#A67C3D" strokeWidth="0.75" />
          <circle cx="10" cy="10" r="6" stroke="#A67C3D" strokeWidth="0.75" />
        </svg>
        <h2 className="font-display text-3xl text-ink">Your Reading</h2>
        <div className="gold-divider-soft max-w-[140px] mx-auto mt-4" />
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 text-ink-soft py-6">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold-deep animate-gentle-pulse" />
          <span className="font-display text-lg italic">
            The cards are speaking&hellip;
          </span>
        </div>
      )}

      {error && !loading && (
        <p className="text-rose text-center font-sans">{error}</p>
      )}

      {reading && !loading && (
        <div className="space-y-8">
          <div>
            <SectionHeading>Overall Energy</SectionHeading>
            <p className="manuscript-text text-ink/90 font-display text-lg leading-[1.85]">
              {reading.overallEnergy}
            </p>
          </div>

          <div>
            <SectionHeading>The Cards</SectionHeading>
            <div className="space-y-2.5">
              {reading.cardInterpretations.map((ci) => (
                <CardInterpretationRow
                  key={ci.cardId}
                  interpretation={ci}
                  meta={cardMeta.find((m) => m.cardId === ci.cardId)}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionHeading>How the Cards Connect</SectionHeading>
            <p className="text-ink/85 font-sans text-[15px] leading-relaxed">
              {reading.cardRelationships}
            </p>
          </div>

          {reading.connectionToPast && (
            <div className="rounded-xl border border-gold/25 bg-gold/[0.06] px-5 py-4">
              <SectionHeading>Connection to Previous Readings</SectionHeading>
              <p className="text-ink/85 font-sans text-[15px] leading-relaxed">
                {reading.connectionToPast}
              </p>
            </div>
          )}

          <div className="text-center py-2">
            <SectionHeading>Key Message</SectionHeading>
            <p className="font-display text-xl text-ink italic leading-relaxed">
              {reading.keyMessage}
            </p>
          </div>

          <div>
            <SectionHeading>Practical Guidance</SectionHeading>
            <p className="text-ink/85 font-sans text-[15px] leading-relaxed">
              {reading.practicalGuidance}
            </p>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/30 px-5 py-4 text-center">
            <SectionHeading>Reflect</SectionHeading>
            <p className="font-display text-lg text-ink italic leading-relaxed">
              {reading.reflectionQuestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
