"use client";

import { ReadingMode } from "@/types/tarot";

interface ModeSelectorProps {
  value: ReadingMode;
  onChange: (value: ReadingMode) => void;
  historyCount: number;
  contextualEnabled: boolean;
  onToggleContextualEnabled: (enabled: boolean) => void;
}

export default function ModeSelector({
  value,
  onChange,
  historyCount,
  contextualEnabled,
  onToggleContextualEnabled,
}: ModeSelectorProps) {
  return (
    <div className="w-full">
      <p className="font-display text-2xl text-ink mb-3">Reading mode</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("quick")}
          className={`text-left rounded-2xl border px-5 py-4 transition-all cursor-pointer ${
            value === "quick"
              ? "border-gold-deep/60 bg-gold/12 shadow-[0_2px_14px_-4px_rgba(166,124,61,0.35)]"
              : "border-ink/10 bg-white/30 hover:border-gold-deep/30 hover:bg-white/50"
          }`}
        >
          <div className="font-display text-lg text-ink">Quick Reading</div>
          <div className="text-sm text-ink-soft mt-1.5 leading-snug">
            A standalone reading with no reference to past readings. Ideal for a private, one-off draw.
          </div>
        </button>
        <button
          type="button"
          disabled={!contextualEnabled}
          onClick={() => onChange("contextual")}
          className={`text-left rounded-2xl border px-5 py-4 transition-all ${
            !contextualEnabled
              ? "border-ink/10 bg-white/10 opacity-50 cursor-not-allowed"
              : value === "contextual"
              ? "border-gold-deep/60 bg-gold/12 shadow-[0_2px_14px_-4px_rgba(166,124,61,0.35)] cursor-pointer"
              : "border-ink/10 bg-white/30 hover:border-gold-deep/30 hover:bg-white/50 cursor-pointer"
          }`}
        >
          <div className="font-display text-lg text-ink">Contextual Reading</div>
          <div className="text-sm text-ink-soft mt-1.5 leading-snug">
            {historyCount > 0
              ? "Draws on your most relevant past readings — similar questions, recurring cards, and themes — only when it genuinely adds continuity."
              : "Will enrich future readings with relevant history once you've saved a few. Nothing to draw on yet."}
          </div>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-ink/8 bg-white/20 px-4 py-2.5">
        <span className="text-xs text-ink-soft font-sans leading-snug pr-3">
          Contextual readings use only reading history stored locally on this device — nothing is ever uploaded.
        </span>
        <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
          <span className="text-[11px] uppercase tracking-wide text-ink-soft font-sans">
            {contextualEnabled ? "On" : "Off"}
          </span>
          <input
            type="checkbox"
            checked={contextualEnabled}
            onChange={(e) => {
              onToggleContextualEnabled(e.target.checked);
              if (!e.target.checked) onChange("quick");
            }}
            className="h-4 w-4 accent-gold-deep cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
