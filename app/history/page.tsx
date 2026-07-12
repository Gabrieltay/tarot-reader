"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import HistoryCard from "@/components/history/HistoryCard";
import HistoryFilters, { SortOrder } from "@/components/history/HistoryFilters";
import PatternInsightsPanel from "@/components/history/PatternInsightsPanel";
import IvoryPanel from "@/components/IvoryPanel";
import {
  clearHistory,
  deleteReading,
  updateSettings,
  useHistory,
  useSettings,
} from "@/lib/history";
import { ReadingCategory, SpreadId } from "@/types/tarot";

export default function HistoryPage() {
  const history = useHistory();
  const contextualEnabled = useSettings().contextualEnabled;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReadingCategory | "all">("all");
  const [spreadId, setSpreadId] = useState<SpreadId | "all">("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleDelete = (id: string) => {
    deleteReading(id);
  };

  const handleClearAll = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    clearHistory();
    setConfirmingClear(false);
  };

  const handleToggleContextual = (enabled: boolean) => {
    updateSettings({ contextualEnabled: enabled });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = history.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (spreadId !== "all" && r.spreadId !== spreadId) return false;
      if (q) {
        const matchesQuestion = r.question.toLowerCase().includes(q);
        const matchesCard = r.cards.some((c) => c.name.toLowerCase().includes(q));
        if (!matchesQuestion && !matchesCard) return false;
      }
      return true;
    });
    items = [...items].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "newest" ? -diff : diff;
    });
    return items;
  }, [history, search, category, spreadId, sort]);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-14 sm:py-20">
      <div className="w-full max-w-2xl flex flex-col gap-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-gold-soft tracking-wide">
            Your Journal
          </h1>
          <Link
            href="/"
            className="rounded-full border border-gold/30 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-soft/90 font-sans hover:bg-white/[0.08] transition-colors"
          >
            New Reading
          </Link>
        </div>

        <IvoryPanel>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft font-sans leading-relaxed">
              Your reading history lives only in this browser, on this device. It is
              never uploaded anywhere, and you decide what stays and what goes.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contextualEnabled}
                  onChange={(e) => handleToggleContextual(e.target.checked)}
                  className="h-4 w-4 accent-gold-deep cursor-pointer"
                />
                <span className="text-sm text-ink font-sans">
                  Allow contextual readings to reference relevant past readings
                </span>
              </label>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  onBlur={() => setConfirmingClear(false)}
                  className={`text-xs font-sans px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    confirmingClear
                      ? "border-rose text-rose bg-rose/10"
                      : "border-ink/15 text-ink-soft hover:border-rose/50 hover:text-rose"
                  }`}
                >
                  {confirmingClear ? "Click again to confirm" : "Clear all history"}
                </button>
              )}
            </div>
          </div>
        </IvoryPanel>

        <PatternInsightsPanel history={history} />

        {history.length > 0 && (
          <IvoryPanel>
            <HistoryFilters
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              spreadId={spreadId}
              onSpreadChange={setSpreadId}
              sort={sort}
              onSortChange={setSort}
            />
          </IvoryPanel>
        )}

        {history.length === 0 && (
          <div className="text-center py-12">
            <p className="font-display text-xl text-lavender-gray/70 italic">
              No readings saved yet. Draw a reading and choose to save it to begin
              your journal.
            </p>
          </div>
        )}

        {history.length > 0 && filtered.length === 0 && (
          <p className="text-center text-ink-soft font-sans py-8">
            No readings match your filters.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {filtered.map((reading) => (
            <HistoryCard key={reading.id} reading={reading} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
