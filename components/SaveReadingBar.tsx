"use client";

interface SaveReadingBarProps {
  saved: boolean;
  onSave: () => void;
  onUnsave: () => void;
}

export default function SaveReadingBar({ saved, onSave, onUnsave }: SaveReadingBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-2">
      {saved ? (
        <div className="flex items-center gap-3 text-sm font-sans">
          <span className="text-gold-soft">Saved to your journal</span>
          <button
            type="button"
            onClick={onUnsave}
            className="text-lavender-gray/70 underline underline-offset-2 hover:text-rose transition-colors cursor-pointer"
          >
            Remove from history
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSave}
          className="rounded-full border border-gold/40 text-gold-soft px-5 py-1.5 text-sm font-sans hover:bg-gold/10 hover:border-gold/60 transition-colors cursor-pointer"
        >
          Save this reading to your journal
        </button>
      )}
      <p className="text-[11px] text-lavender-gray/50 font-sans text-center max-w-md leading-relaxed">
        Saved readings stay only on this browser/device and are never uploaded. You can remove
        any reading, or your entire history, at any time.
      </p>
    </div>
  );
}
