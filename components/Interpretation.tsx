"use client";

interface InterpretationProps {
  loading: boolean;
  error: string | null;
  text: string | null;
}

export default function Interpretation({ loading, error, text }: InterpretationProps) {
  if (!loading && !error && !text) return null;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-purple-400/25 bg-white/5 px-6 py-6 animate-fade-in-up">
      <h2 className="font-display text-xl text-mystic-gold tracking-wide mb-4">
        Your Reading
      </h2>

      {loading && (
        <div className="flex items-center gap-3 text-purple-200/70">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-mystic-gold/70 border-t-transparent animate-spin" />
          <span>The cards are speaking&hellip;</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-red-300/90">{error}</p>
      )}

      {text && !loading && (
        <div className="space-y-4 text-purple-50/90 leading-relaxed whitespace-pre-line">
          {text}
        </div>
      )}
    </div>
  );
}
