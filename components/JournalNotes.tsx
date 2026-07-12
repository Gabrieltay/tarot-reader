"use client";

import { useState } from "react";
import { JournalEntry } from "@/types/tarot";

interface JournalNotesProps {
  journal: JournalEntry[];
  onAdd: (text: string) => void;
  onDelete: (entryId: string) => void;
}

const PROMPTS = [
  "Did this reading resonate?",
  "What happened after this reading?",
  "What emotions came up?",
  "Has your perspective changed?",
];

export default function JournalNotes({ journal, onAdd, onDelete }: JournalNotesProps) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto ivory-panel px-6 py-7 sm:px-9 sm:py-9">
      <div className="text-center mb-5">
        <h3 className="font-display text-2xl text-ink">Your Journal Notes</h3>
        <p className="text-ink-soft text-sm font-sans mt-1">
          {PROMPTS.join(" · ")}
        </p>
      </div>

      {journal.length > 0 && (
        <div className="space-y-3 mb-5">
          {journal.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-ink/10 bg-white/30 px-4 py-3 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-sm text-ink/85 font-sans leading-relaxed">{entry.text}</p>
                <p className="text-[11px] text-ink-soft/60 font-sans mt-1.5">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                className="text-xs text-ink-soft/60 hover:text-rose transition-colors font-sans shrink-0 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a personal reflection&hellip;"
          rows={3}
          className="w-full resize-none rounded-xl border border-ink/12 bg-white/40 px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 outline-none focus:border-gold-deep/50 focus:ring-2 focus:ring-gold-deep/15 transition-colors font-sans"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim()}
          className="self-end rounded-full bg-gradient-to-b from-gold-soft to-gold text-ink font-sans text-sm font-medium px-5 py-2 transition-all disabled:opacity-35 disabled:cursor-not-allowed enabled:hover:shadow-[0_4px_14px_-4px_rgba(166,124,61,0.55)] cursor-pointer"
        >
          Add Note
        </button>
      </div>
    </div>
  );
}
