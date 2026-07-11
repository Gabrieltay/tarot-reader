"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { DrawnCard } from "@/types/tarot";

interface CardZoomOverlayProps {
  drawn: DrawnCard;
  onClose: () => void;
}

export default function CardZoomOverlay({ drawn, onClose }: CardZoomOverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-deep/90 backdrop-blur-sm p-4 sm:p-6 animate-backdrop-in"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-midnight-deep/80 text-warm-white/90 backdrop-blur-sm transition-colors hover:bg-midnight-deep hover:border-gold/70 cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M1 1l14 14M15 1L1 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        className="relative aspect-[2/3] h-[min(78vh,132vw)] w-auto max-w-[92vw] animate-card-zoom-in rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(5,2,16,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={drawn.card.image}
          alt={drawn.card.name}
          fill
          sizes="92vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pt-10 pb-4 flex flex-col items-center gap-1.5">
          <div className="font-display text-lg sm:text-xl text-warm-white text-center">
            {drawn.card.name}
          </div>
          {drawn.reversed && (
            <span className="inline-block rounded-full border border-rose/40 bg-rose/[0.1] px-3 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-rose/90 font-sans">
              Reversed &mdash; shown upright
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
