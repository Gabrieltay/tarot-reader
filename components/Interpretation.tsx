"use client";

interface InterpretationProps {
  loading: boolean;
  error: string | null;
  text: string | null;
}

export default function Interpretation({ loading, error, text }: InterpretationProps) {
  if (!loading && !error && !text) return null;

  const paragraphs = text
    ? text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full max-w-2xl mx-auto ivory-panel px-7 py-9 sm:px-12 sm:py-12 animate-fade-in-up">
      <div className="text-center mb-6">
        <svg className="mx-auto mb-3 opacity-70" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2v16M2 10h16" stroke="#A67C3D" strokeWidth="0.75" />
          <circle cx="10" cy="10" r="6" stroke="#A67C3D" strokeWidth="0.75" />
        </svg>
        <h2 className="font-display text-3xl text-ink">Your Reading</h2>
        <div className="gold-divider-soft max-w-[140px] mx-auto mt-4" />
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 text-ink-soft py-6">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold-deep animate-gentle-pulse" />
          <span className="font-display text-lg italic">
            The cards are speaking&hellip;
          </span>
        </div>
      )}

      {error && !loading && (
        <p className="text-rose text-center font-sans">{error}</p>
      )}

      {paragraphs.length > 0 && !loading && (
        <div className="manuscript-text space-y-5 text-ink/90 font-display text-lg leading-[1.85]">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
