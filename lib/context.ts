import { ContextReadingSummary, ReadingCategory, SavedReading } from "@/types/tarot";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "i", "me", "my", "myself", "we", "our", "you", "your", "he", "she", "it",
  "they", "them", "this", "that", "these", "those", "to", "of", "in", "on",
  "for", "with", "about", "should", "would", "could", "will", "can", "do",
  "does", "did", "and", "or", "but", "if", "so", "at", "by", "from", "as",
  "what", "when", "where", "how", "why", "up", "out", "not", "no", "yes",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

const RELEVANCE_THRESHOLD = 1.5;
const RECENCY_HALF_LIFE_DAYS = 21;

interface CurrentReadingContext {
  question: string;
  category: ReadingCategory | null;
  cardNames: string[];
}

function scoreReading(reading: SavedReading, current: CurrentReadingContext): number {
  let score = 0;

  const daysAgo =
    (Date.now() - new Date(reading.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.pow(0.5, Math.max(daysAgo, 0) / RECENCY_HALF_LIFE_DAYS) * 1.2;

  if (current.category && reading.category && current.category === reading.category) {
    score += 1.5;
  }

  const currentTokens = new Set(tokenize(current.question));
  const pastTokens = new Set(tokenize(reading.question));
  let sharedTokens = 0;
  for (const token of currentTokens) {
    if (pastTokens.has(token)) sharedTokens += 1;
  }
  score += sharedTokens * 0.9;

  const pastCardNames = new Set(reading.cards.map((c) => c.name));
  let sharedCards = 0;
  for (const name of current.cardNames) {
    if (pastCardNames.has(name)) sharedCards += 1;
  }
  score += sharedCards * 1.8;

  return score;
}

/**
 * Picks the previous readings genuinely relevant to the current one — recent,
 * same category, overlapping question wording, or a recurring card — rather
 * than dumping the whole history into the prompt.
 */
export function selectRelevantReadings(
  history: SavedReading[],
  current: CurrentReadingContext,
  limit = 5
): SavedReading[] {
  return history
    .map((reading) => ({ reading, score: scoreReading(reading, current) }))
    .filter(({ score }) => score >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ reading }) => reading);
}

export function toContextSummary(reading: SavedReading): ContextReadingSummary {
  return {
    id: reading.id,
    createdAt: reading.createdAt,
    question: reading.question,
    category: reading.category,
    spreadName: reading.spreadName,
    cardNames: reading.cards.map((c) => c.name),
    keyMessage: reading.reading.keyMessage,
  };
}
