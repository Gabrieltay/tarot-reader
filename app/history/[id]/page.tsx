"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import Interpretation from "@/components/Interpretation";
import JournalNotes from "@/components/JournalNotes";
import { CATEGORY_LABELS } from "@/lib/categories";
import { addJournalEntry, deleteJournalEntry, deleteReading, useReading } from "@/lib/history";

export default function ReadingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const reading = useReading(id);

  if (!reading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 gap-5 text-center">
        <p className="font-display text-2xl text-lavender-gray/70 italic">
          This reading no longer exists on this device.
        </p>
        <Link
          href="/history"
          className="rounded-full border border-gold/40 text-gold-soft px-6 py-2 font-display text-lg hover:bg-gold/10 transition-colors"
        >
          Back to Journal
        </Link>
      </div>
    );
  }

  const handleAddJournal = (text: string) => {
    addJournalEntry(reading.id, text);
  };

  const handleDeleteJournal = (entryId: string) => {
    deleteJournalEntry(reading.id, entryId);
  };

  const handleDeleteReading = () => {
    deleteReading(reading.id);
    router.push("/history");
  };

  const date = new Date(reading.createdAt);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-14 sm:py-20">
      <div className="w-full max-w-2xl flex flex-col gap-10 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <Link
            href="/history"
            className="rounded-full border border-gold/30 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-soft/90 font-sans hover:bg-white/[0.08] transition-colors"
          >
            &larr; Journal
          </Link>
          <button
            type="button"
            onClick={handleDeleteReading}
            className="text-xs text-lavender-gray/60 hover:text-rose transition-colors font-sans cursor-pointer"
          >
            Delete this reading
          </button>
        </div>

        <div className="text-center flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold-soft/80 font-sans">
            <span>{date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="text-lavender-gray/40">·</span>
            <span>{reading.spreadName}</span>
            {reading.category && (
              <>
                <span className="text-lavender-gray/40">·</span>
                <span>{CATEGORY_LABELS[reading.category]}</span>
              </>
            )}
          </div>
          <p className="font-display text-2xl text-warm-white/95 italic px-4">
            &ldquo;{reading.question}&rdquo;
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {reading.cards.map((c, i) => (
            <div key={`${c.cardId}-${i}`} className="flex flex-col items-center gap-1.5 w-16 sm:w-20">
              <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden shadow-[0_8px_18px_-8px_rgba(5,2,16,0.6)]">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="80px"
                  className={`object-cover ${c.orientation === "reversed" ? "rotate-180" : ""}`}
                />
              </div>
              <span className="text-[10px] text-lavender-gray/70 font-sans text-center leading-tight">
                {c.position}
              </span>
            </div>
          ))}
        </div>

        <Interpretation
          loading={false}
          error={null}
          reading={reading.reading}
          cardMeta={reading.cards.map((c) => ({
            cardId: c.cardId,
            position: c.position,
            reversed: c.orientation === "reversed",
          }))}
        />

        <JournalNotes
          journal={reading.journal}
          onAdd={handleAddJournal}
          onDelete={handleDeleteJournal}
        />
      </div>
    </div>
  );
}
