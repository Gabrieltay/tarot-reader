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
  cardId: string;
  name: string;
  orientation: "upright" | "reversed";
  position: string;
  meaning: string;
  suit: Suit | null;
  arcana: Arcana;
}

export type ReadingCategory =
  | "general"
  | "love"
  | "career"
  | "life-path"
  | "family"
  | "personal-growth"
  | "finances"
  | "health";

/** A distilled slice of a past reading, sent to the API as context — never the full history. */
export interface ContextReadingSummary {
  id: string;
  createdAt: string;
  question: string;
  category: ReadingCategory | null;
  spreadName: string;
  cardNames: string[];
  summary: string;
}

export interface InterpretRequest {
  question: string;
  category: ReadingCategory | null;
  spread: string;
  cards: InterpretRequestCard[];
  contextReadings: ContextReadingSummary[];
}

export interface InterpretResponse {
  interpretation: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  createdAt: string;
}

export interface SavedReadingCard {
  cardId: string;
  name: string;
  orientation: "upright" | "reversed";
  position: string;
  image: string;
  suit: Suit | null;
  arcana: Arcana;
}

export interface SavedReading {
  id: string;
  createdAt: string;
  question: string;
  category: ReadingCategory | null;
  spreadId: SpreadId;
  spreadName: string;
  cards: SavedReadingCard[];
  interpretation: string;
  journal: JournalEntry[];
}
