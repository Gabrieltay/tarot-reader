export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";

export interface Card {
  id: string;
  name: string;
  arcana: Arcana;
  suit: Suit | null;
  number: number;
  upright_meaning: string;
  reversed_meaning: string;
  image: string;
}

export type SpreadId = "single" | "three-card" | "celtic-cross";

export interface SpreadPosition {
  label: string;
  description: string;
}

export interface Spread {
  id: SpreadId;
  name: string;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: Card;
  reversed: boolean;
  position: SpreadPosition;
}

export interface InterpretRequestCard {
  name: string;
  orientation: "upright" | "reversed";
  position: string;
  meaning: string;
}

export interface InterpretRequest {
  question: string;
  spread: string;
  cards: InterpretRequestCard[];
}
