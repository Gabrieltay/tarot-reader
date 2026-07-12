"use client";

import { CATEGORY_LABELS, CATEGORY_LIST } from "@/lib/categories";
import { SPREAD_LIST } from "@/lib/spreads";
import { ReadingCategory, SpreadId } from "@/types/tarot";

export type SortOrder = "newest" | "oldest";

interface HistoryFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: ReadingCategory | "all";
  onCategoryChange: (v: ReadingCategory | "all") => void;
  spreadId: SpreadId | "all";
  onSpreadChange: (v: SpreadId | "all") => void;
  sort: SortOrder;
  onSortChange: (v: SortOrder) => void;
}

export default function HistoryFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  spreadId,
  onSpreadChange,
  sort,
  onSortChange,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by question or card name&hellip;"
        className="w-full rounded-xl border border-ink/12 bg-white/40 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 outline-none focus:border-gold-deep/50 focus:ring-2 focus:ring-gold-deep/15 transition-colors font-sans"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as ReadingCategory | "all")}
          className="rounded-lg border border-ink/12 bg-white/40 px-3 py-2 text-sm text-ink font-sans outline-none focus:border-gold-deep/50 cursor-pointer"
        >
          <option value="all">All categories</option>
          {CATEGORY_LIST.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={spreadId}
          onChange={(e) => onSpreadChange(e.target.value as SpreadId | "all")}
          className="rounded-lg border border-ink/12 bg-white/40 px-3 py-2 text-sm text-ink font-sans outline-none focus:border-gold-deep/50 cursor-pointer"
        >
          <option value="all">All spreads</option>
          {SPREAD_LIST.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="rounded-lg border border-ink/12 bg-white/40 px-3 py-2 text-sm text-ink font-sans outline-none focus:border-gold-deep/50 cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
    </div>
  );
}
