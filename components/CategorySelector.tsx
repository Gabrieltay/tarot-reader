"use client";

import { CATEGORY_LABELS, CATEGORY_LIST } from "@/lib/categories";
import { ReadingCategory } from "@/types/tarot";

interface CategorySelectorProps {
  value: ReadingCategory | null;
  onChange: (value: ReadingCategory | null) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="w-full">
      <p className="font-display text-2xl text-ink mb-1">
        What area of life is this about?{" "}
        <span className="text-sm text-ink-soft font-sans font-normal">(optional)</span>
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border px-4 py-1.5 text-sm font-sans transition-colors cursor-pointer ${
            value === null
              ? "border-gold-deep/60 bg-gold/12 text-ink"
              : "border-ink/10 bg-white/30 text-ink-soft hover:border-gold-deep/30"
          }`}
        >
          Skip
        </button>
        {CATEGORY_LIST.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full border px-4 py-1.5 text-sm font-sans transition-colors cursor-pointer ${
              value === category
                ? "border-gold-deep/60 bg-gold/12 text-ink"
                : "border-ink/10 bg-white/30 text-ink-soft hover:border-gold-deep/30"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </div>
  );
}
