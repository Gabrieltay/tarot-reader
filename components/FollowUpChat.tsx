"use client";

import { useState } from "react";
import { ConversationTurn } from "@/types/tarot";

interface FollowUpChatProps {
  conversation: ConversationTurn[];
  onSend: (message: string) => Promise<void> | void;
  loading: boolean;
}

const SUGGESTIONS = [
  "Can you explain this card further?",
  "What should I focus on next?",
  "How does this relate to my previous reading?",
  "Has anything changed since my last reading?",
];

export default function FollowUpChat({ conversation, onSend, loading }: FollowUpChatProps) {
  const [draft, setDraft] = useState("");

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setDraft("");
    onSend(trimmed);
  };

  return (
    <div className="w-full max-w-2xl mx-auto ivory-panel px-6 py-7 sm:px-9 sm:py-9 animate-fade-in-up">
      <div className="text-center mb-5">
        <h3 className="font-display text-2xl text-ink">Continue the Conversation</h3>
        <p className="text-ink-soft text-sm font-sans mt-1">
          Ask a follow-up — the reader remembers this reading.
        </p>
      </div>

      {conversation.length > 0 && (
        <div className="space-y-3 mb-5 max-h-96 overflow-y-auto pr-1">
          {conversation.map((turn) => (
            <div
              key={turn.id}
              className={`rounded-xl px-4 py-3 text-sm font-sans leading-relaxed ${
                turn.role === "user"
                  ? "bg-gold/10 text-ink ml-8"
                  : "bg-white/40 text-ink/90 mr-8"
              }`}
            >
              {turn.text}
            </div>
          ))}
        </div>
      )}

      {conversation.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-5 justify-center">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded-full border border-ink/10 bg-white/30 px-3.5 py-1.5 text-xs font-sans text-ink-soft hover:border-gold-deep/30 hover:bg-white/50 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-ink-soft text-sm font-sans mb-4 justify-center">
          <span className="inline-block h-2 w-2 rounded-full bg-gold-deep animate-gentle-pulse" />
          The reader is reflecting&hellip;
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a follow-up question&hellip;"
          className="flex-1 rounded-full border border-ink/12 bg-white/40 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 outline-none focus:border-gold-deep/50 focus:ring-2 focus:ring-gold-deep/15 transition-colors font-sans"
        />
        <button
          type="submit"
          disabled={!draft.trim() || loading}
          className="rounded-full bg-gradient-to-b from-gold-soft to-gold text-ink font-sans text-sm font-medium px-5 py-2.5 transition-all disabled:opacity-35 disabled:cursor-not-allowed enabled:hover:shadow-[0_4px_14px_-4px_rgba(166,124,61,0.55)] cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
