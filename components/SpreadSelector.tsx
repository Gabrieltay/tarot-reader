"use client";

import { SPREAD_LIST } from "@/lib/spreads";
import { SpreadId } from "@/types/tarot";

interface SpreadSelectorProps {
  value: SpreadId;
  onChange: (value: SpreadId) => void;
}

const DESCRIPTIONS: Record<SpreadId, string> = {
  single: "One card for a quick, focused answer.",
  "three-card": "Past, present, and future in three cards.",
  "celtic-cross": "A deep, 10-card exploration of your question.",
};

export default function SpreadSelector({ value, onChange }: SpreadSelectorProps) {
  return (
    <div className="w-full">
      <p className="block font-display text-lg tracking-wide text-mystic-gold mb-2">
        Choose your spread
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SPREAD_LIST.map((spread) => {
          const active = spread.id === value;
          return (
            <button
              key={spread.id}
              type="button"
              onClick={() => onChange(spread.id)}
              className={`text-left rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
                active
                  ? "border-mystic-gold/70 bg-mystic-gold/10"
                  : "border-purple-400/25 bg-white/5 hover:border-purple-300/50"
              }`}
            >
              <div className="font-display text-base text-foreground">
                {spread.name}
              </div>
              <div className="text-sm text-purple-200/60 mt-1">
                {DESCRIPTIONS[spread.id]}
              </div>
              <div className="text-xs text-purple-300/50 mt-1">
                {spread.positions.length} card{spread.positions.length > 1 ? "s" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
