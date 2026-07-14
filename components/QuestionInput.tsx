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
        className="block font-display text-2xl text-ink mb-3"
      >
        What would you like guidance on?
      </label>
      <textarea
        id="question"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. What should I focus on in my career right now?"
        rows={3}
        maxLength={500}
        className="w-full resize-none rounded-xl border border-ink/12 bg-white/40 px-5 py-4 text-ink placeholder:text-ink-soft/60 outline-none focus:border-gold-deep/50 focus:ring-2 focus:ring-gold-deep/15 transition-colors font-sans text-[15px] leading-relaxed"
      />
    </div>
  );
}
