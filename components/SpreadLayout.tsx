"use client";

import { DrawnCard, SpreadId } from "@/types/tarot";
import TarotCard from "./TarotCard";

interface SpreadLayoutProps {
  spreadId: SpreadId;
  cards: DrawnCard[];
}

const STAGGER_MS = 220;

function SingleLayout({ cards }: { cards: DrawnCard[] }) {
  return (
    <div className="flex justify-center">
      <div className="w-44 sm:w-56">
        <TarotCard drawn={cards[0]} delayMs={0} />
      </div>
    </div>
  );
}

function ThreeCardLayout({ cards }: { cards: DrawnCard[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
      {cards.map((c, i) => (
        <div key={c.card.id} className="w-32 sm:w-40">
          <TarotCard drawn={c} delayMs={i * STAGGER_MS} />
        </div>
      ))}
    </div>
  );
}

function CelticCrossLayout({ cards }: { cards: DrawnCard[] }) {
  // Positions: 0 Present, 1 Challenge, 2 Foundation, 3 Past, 4 Crown,
  // 5 Future, 6 Attitude, 7 External, 8 Hopes&Fears, 9 Outcome
  const [present, challenge, foundation, past, crown, future, attitude, external, hopesFears, outcome] =
    cards;

  return (
    <div className="flex flex-col xl:flex-row gap-12 items-center xl:items-start justify-center">
      <div
        className="grid grid-cols-3 gap-5 sm:gap-7 w-fit"
        style={{
          gridTemplateAreas: `
            ". crown ."
            "past present future"
            ". challenge ."
            ". foundation ."
          `,
        }}
      >
        <div className="w-24 sm:w-32" style={{ gridArea: "crown" }}>
          <TarotCard drawn={crown} delayMs={4 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32" style={{ gridArea: "past" }}>
          <TarotCard drawn={past} delayMs={3 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32" style={{ gridArea: "present" }}>
          <TarotCard drawn={present} delayMs={0 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32" style={{ gridArea: "future" }}>
          <TarotCard drawn={future} delayMs={5 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32" style={{ gridArea: "challenge" }}>
          <TarotCard drawn={challenge} delayMs={1 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32" style={{ gridArea: "foundation" }}>
          <TarotCard drawn={foundation} delayMs={2 * STAGGER_MS} />
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-1 gap-5 sm:gap-7 w-fit">
        <div className="w-24 sm:w-32">
          <TarotCard drawn={outcome} delayMs={9 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32">
          <TarotCard drawn={hopesFears} delayMs={8 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32">
          <TarotCard drawn={external} delayMs={7 * STAGGER_MS} />
        </div>
        <div className="w-24 sm:w-32">
          <TarotCard drawn={attitude} delayMs={6 * STAGGER_MS} />
        </div>
      </div>
    </div>
  );
}

export default function SpreadLayout({ spreadId, cards }: SpreadLayoutProps) {
  if (cards.length === 0) return null;

  switch (spreadId) {
    case "single":
      return <SingleLayout cards={cards} />;
    case "three-card":
      return <ThreeCardLayout cards={cards} />;
    case "celtic-cross":
      return <CelticCrossLayout cards={cards} />;
    default:
      return null;
  }
}
