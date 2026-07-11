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
      <p className="font-display text-2xl text-ink mb-3">Choose your spread</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SPREAD_LIST.map((spread) => {
          const active = spread.id === value;
          return (
            <button
              key={spread.id}
              type="button"
              onClick={() => onChange(spread.id)}
              className={`text-left rounded-2xl border px-5 py-4 transition-all cursor-pointer ${
                active
                  ? "border-gold-deep/60 bg-gold/12 shadow-[0_2px_14px_-4px_rgba(166,124,61,0.35)]"
                  : "border-ink/10 bg-white/30 hover:border-gold-deep/30 hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    active ? "bg-gold-deep" : "bg-ink/20"
                  }`}
                />
                <div className="font-display text-lg text-ink">{spread.name}</div>
              </div>
              <div className="text-sm text-ink-soft mt-1.5 leading-snug">
                {DESCRIPTIONS[spread.id]}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-gold-deep/70 mt-2">
                {spread.positions.length} card{spread.positions.length > 1 ? "s" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
