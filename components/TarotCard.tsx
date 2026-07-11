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
    <div className="flex flex-col items-center gap-2 w-full">
      {showLabel && (
        <div className="text-center">
          <div className="font-display text-sm tracking-wide text-mystic-gold">
            {drawn.position.label}
          </div>
        </div>
      )}
      <div className="perspective w-full aspect-[2/3] max-w-[160px]">
        <div className={`flip-card w-full h-full ${flipped ? "is-flipped" : ""}`}>
          <div className="flip-face flip-face-front shadow-lg shadow-black/40">
            <Image
              src="/cards/card-back.svg"
              alt="Card back"
              fill
              sizes="160px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flip-face flip-face-back shadow-lg shadow-black/40">
            <div className="relative w-full h-full bg-[#1a1230]">
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
        <div className="text-center animate-fade-in-up">
          <div className="text-sm font-medium text-foreground">{drawn.card.name}</div>
          <div className="text-xs text-purple-300/60">
            {drawn.reversed ? "Reversed" : "Upright"}
          </div>
        </div>
      )}
    </div>
  );
}
