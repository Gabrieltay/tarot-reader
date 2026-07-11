"use client";

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionInput({ value, onChange }: QuestionInputProps) {
  return (
    <div className="w-full">
      <label
        htmlFor="question"
        className="block font-display text-lg tracking-wide text-mystic-gold mb-2"
      >
        What would you like guidance on?
      </label>
      <textarea
        id="question"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. What should I focus on in my career right now?"
        rows={3}
        className="w-full resize-none rounded-lg border border-purple-400/30 bg-white/5 px-4 py-3 text-foreground placeholder:text-purple-200/40 outline-none focus:border-mystic-gold/60 focus:ring-1 focus:ring-mystic-gold/40 transition-colors"
      />
    </div>
  );
}
