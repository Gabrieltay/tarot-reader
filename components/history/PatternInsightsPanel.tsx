"use client";

import { computePatternInsights, computePatternStats } from "@/lib/patterns";
import { SavedReading } from "@/types/tarot";

interface PatternInsightsPanelProps {
  history: SavedReading[];
}

export default function PatternInsightsPanel({ history }: PatternInsightsPanelProps) {
  const insights = computePatternInsights(history);
  const stats = computePatternStats(history);

  if (history.length < 3) return null;

  return (
    <div className="ivory-panel px-6 py-6 sm:px-8 sm:py-7">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep/80 font-sans font-medium mb-3">
        Patterns Worth Reflecting On
      </p>

      {insights.length > 0 ? (
        <ul className="space-y-2.5 mb-4">
          {insights.map((insight) => (
            <li key={insight.id} className="text-sm text-ink/85 font-sans leading-relaxed flex gap-2">
              <span className="text-gold-deep shrink-0">·</span>
              <span>{insight.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft font-sans mb-4">
          No strong patterns yet — keep journaling and they may emerge over time.
        </p>
      )}

      {stats.topCards.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stats.topCards.map((c) => (
            <span
              key={c.label}
              className="rounded-full border border-gold/25 bg-gold/[0.08] px-2.5 py-0.5 text-xs text-ink-soft font-sans"
            >
              {c.label} × {c.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
