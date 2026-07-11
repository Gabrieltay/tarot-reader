"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DrawnCard } from "@/types/tarot";

interface TarotCardProps {
  drawn: DrawnCard;
  delayMs?: number;
  showLabel?: boolean;
}

export default function TarotCard({ drawn, delayMs = 0, showLabel = true }: TarotCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {showLabel && (
        <div className="text-center px-0.5">
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.03em] sm:tracking-[0.18em] text-gold-soft/80 font-sans font-medium break-words">
            {drawn.position.label}
          </div>
        </div>
      )}
      <div className="perspective w-full aspect-[2/3] max-w-[160px]">
        <div className={`flip-card w-full h-full ${flipped ? "is-flipped" : ""}`}>
          <div className="flip-face flip-face-front shadow-[0_18px_36px_-14px_rgba(5,2,16,0.7)]">
            <Image
              src="/cards/card-back.svg"
              alt="Card back"
              fill
              sizes="160px"
              className="object-cover"
              priority
            />
          </div>
          <div
            className={`flip-face flip-face-back shadow-[0_18px_36px_-14px_rgba(5,2,16,0.7)] ${
              flipped ? "glow-gold" : ""
            }`}
          >
            <div className="relative w-full h-full bg-midnight-deep">
              <Image
                src={drawn.card.image}
                alt={drawn.card.name}
                fill
                sizes="160px"
                className={`object-cover ${drawn.reversed ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </div>
      </div>
      {flipped && (
        <div className="text-center animate-fade-in-up flex flex-col items-center gap-1.5">
          <div className="font-display text-lg leading-snug text-warm-white min-h-[2.75em] flex items-center justify-center">
            {drawn.card.name}
          </div>
          <span
            className={`inline-block rounded-full border px-3 py-0.5 text-[10px] uppercase tracking-[0.14em] font-sans ${
              drawn.reversed
                ? "border-rose/40 text-rose/90 bg-rose/[0.06]"
                : "border-gold/40 text-gold-soft bg-gold/[0.08]"
            }`}
          >
            {drawn.reversed ? "Reversed" : "Upright"}
          </span>
        </div>
      )}
    </div>
  );
}
