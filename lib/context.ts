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

const CATEGORY_KEYWORDS: Record<Exclude<ReadingCategory, "general">, string[]> = {
  love: ["love", "relationship", "partner", "boyfriend", "girlfriend", "marriage", "spouse", "dating", "romance", "breakup", "husband", "wife", "crush"],
  career: ["career", "job", "work", "boss", "promotion", "interview", "business", "coworker", "workplace", "salary", "hire", "hired", "fired"],
  "life-path": ["purpose", "path", "direction", "destiny", "future", "journey", "calling"],
  family: ["family", "parent", "parents", "mother", "father", "sibling", "brother", "sister", "child", "children", "kids"],
  "personal-growth": ["growth", "confidence", "habit", "habits", "mindset", "change", "improve", "healing", "boundaries"],
  finances: ["money", "finance", "financial", "debt", "invest", "investment", "savings", "budget", "income", "afford"],
  health: ["health", "illness", "sick", "body", "wellness", "therapy", "mental", "anxiety", "sleep", "energy"],
};

/**
 * The real category comes back from the LLM only after this reading is
 * generated, so there's nothing authoritative to score past readings
 * against yet. This gives a rough same-session guess from keywords so the
 * "same category" relevance signal isn't permanently dead for every request.
 */
export function guessCategory(question: string): ReadingCategory | null {
  const tokens = tokenize(question);
  let best: ReadingCategory | null = null;
  let bestCount = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    Exclude<ReadingCategory, "general">,
    string[]
  ][]) {
    const count = tokens.filter((t) => keywords.includes(t)).length;
    if (count > bestCount) {
      bestCount = count;
      best = category;
    }
  }
  return best;
}

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

const SUMMARY_MAX_CHARS = 220;

export function truncate(text: string, max = SUMMARY_MAX_CHARS): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function toContextSummary(reading: SavedReading): ContextReadingSummary {
  return {
    id: reading.id,
    createdAt: reading.createdAt,
    question: reading.question,
    category: reading.category,
    spreadName: reading.spreadName,
    cardNames: reading.cards.map((c) => c.name),
    summary: truncate(reading.interpretation),
  };
}
