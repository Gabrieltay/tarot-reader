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

export type ReadingMode = "quick" | "contextual";

/** A distilled slice of a past reading, sent to the API as context — never the full history. */
export interface ContextReadingSummary {
  id: string;
  createdAt: string;
  question: string;
  category: ReadingCategory | null;
  spreadName: string;
  cardNames: string[];
  keyMessage: string;
}

export interface InterpretRequest {
  question: string;
  category: ReadingCategory | null;
  spread: string;
  cards: InterpretRequestCard[];
  mode: ReadingMode;
  contextReadings: ContextReadingSummary[];
}

export interface CardInterpretation {
  cardId: string;
  name: string;
  symbolism: string;
  meaningInContext: string;
  emotionalPerspective: string;
  practicalInsight: string;
}

export interface StructuredReading {
  overallEnergy: string;
  cardInterpretations: CardInterpretation[];
  cardRelationships: string;
  connectionToPast: string | null;
  keyMessage: string;
  practicalGuidance: string;
  reflectionQuestion: string;
  summary: string;
}

export interface InterpretResponse {
  reading: StructuredReading;
}

export interface JournalEntry {
  id: string;
  text: string;
  createdAt: string;
}

export interface ConversationTurn {
  id: string;
  role: "user" | "assistant";
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
  mode: ReadingMode;
  cards: SavedReadingCard[];
  reading: StructuredReading;
  journal: JournalEntry[];
  conversation: ConversationTurn[];
}

export interface AppSettings {
  contextualEnabled: boolean;
}

export interface FollowUpRequest {
  question: string;
  category: ReadingCategory | null;
  spread: string;
  cards: InterpretRequestCard[];
  reading: StructuredReading;
  conversation: { role: "user" | "assistant"; text: string }[];
  message: string;
}

export interface FollowUpResponse {
  reply: string;
}
