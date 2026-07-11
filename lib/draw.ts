import cardsData from "@/data/cards.json";
import { Card, DrawnCard, Spread } from "@/types/tarot";

const ALL_CARDS = cardsData as Card[];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawSpread(spread: Spread): DrawnCard[] {
  const shuffled = shuffle(ALL_CARDS);
  const picks = shuffled.slice(0, spread.positions.length);
  return picks.map((card, i) => ({
    card,
    reversed: Math.random() < 0.5,
    position: spread.positions[i],
  }));
}
