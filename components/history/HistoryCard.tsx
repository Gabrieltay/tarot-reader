"use client";

import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/categories";
import { SavedReading } from "@/types/tarot";

interface HistoryCardProps {
  reading: SavedReading;
  onDelete: (id: string) => void;
}

export default function HistoryCard({ reading, onDelete }: HistoryCardProps) {
  const date = new Date(reading.createdAt);

  return (
    <div className="ivory-panel px-6 py-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-gold-deep/70 font-sans">
          <span>
            {date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </span>
          <span className="text-ink-soft/40">·</span>
          <span>{reading.spreadName}</span>
          {reading.category && (
            <>
              <span className="text-ink-soft/40">·</span>
              <span>{CATEGORY_LABELS[reading.category]}</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(reading.id)}
          className="text-xs text-ink-soft/60 hover:text-rose transition-colors font-sans shrink-0 cursor-pointer"
        >
          Delete
        </button>
      </div>

      <Link href={`/history/${reading.id}`} className="block group">
        <p className="font-display text-xl text-ink italic group-hover:text-gold-deep transition-colors">
          &ldquo;{reading.question}&rdquo;
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {reading.cards.map((c, i) => (
            <span
              key={`${c.cardId}-${i}`}
              className="rounded-full border border-ink/10 bg-white/40 px-2.5 py-0.5 text-xs text-ink-soft font-sans"
            >
              {c.name}
              {c.orientation === "reversed" ? " (R)" : ""}
            </span>
          ))}
        </div>
        <p className="text-sm text-ink-soft font-sans mt-2.5 leading-relaxed">
          {reading.reading.summary}
        </p>
        {reading.journal.length > 0 && (
          <p className="text-xs text-gold-deep/80 font-sans mt-2">
            {reading.journal.length} journal note{reading.journal.length > 1 ? "s" : ""}
          </p>
        )}
      </Link>
    </div>
  );
}
