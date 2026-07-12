import { CATEGORY_LABELS } from "@/lib/categories";
import { ReadingCategory, SavedReading } from "@/types/tarot";

export interface FrequencyItem {
  label: string;
  count: number;
}

export interface PatternStats {
  totalReadings: number;
  topCards: FrequencyItem[];
  topSuits: FrequencyItem[];
  topCategories: FrequencyItem[];
  majorArcanaShare: number;
  readingsLast30Days: number;
}

export interface PatternInsight {
  id: string;
  text: string;
}

const MIN_READINGS_FOR_PATTERNS = 3;

function tally<T extends string>(items: T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of items) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
}

function topN(map: Map<string, number>, n: number): FrequencyItem[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

export function computePatternStats(history: SavedReading[]): PatternStats {
  const allCards = history.flatMap((r) => r.cards);
  const cardNames = allCards.map((c) => c.name);
  const suits = allCards.map((c) => (c.suit ? c.suit : "major arcana"));
  const categories = history
    .map((r) => r.category)
    .filter((c): c is ReadingCategory => Boolean(c));

  const majorCount = allCards.filter((c) => c.arcana === "major").length;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const readingsLast30Days = history.filter(
    (r) => new Date(r.createdAt).getTime() >= thirtyDaysAgo
  ).length;

  return {
    totalReadings: history.length,
    topCards: topN(tally(cardNames), 5),
    topSuits: topN(tally(suits), 4),
    topCategories: topN(
      tally(categories.map((c) => CATEGORY_LABELS[c])),
      4
    ),
    majorArcanaShare: allCards.length > 0 ? majorCount / allCards.length : 0,
    readingsLast30Days,
  };
}

export function computePatternInsights(history: SavedReading[]): PatternInsight[] {
  if (history.length < MIN_READINGS_FOR_PATTERNS) return [];

  const stats = computePatternStats(history);
  const insights: PatternInsight[] = [];

  const recurringCard = stats.topCards.find((c) => c.count >= 2);
  if (recurringCard) {
    insights.push({
      id: "recurring-card",
      text: `${recurringCard.label} has appeared ${recurringCard.count} times in your recent readings. This may suggest its themes have been particularly relevant to you lately.`,
    });
  }

  const topCategory = stats.topCategories[0];
  if (topCategory && topCategory.count >= 2) {
    insights.push({
      id: "top-category",
      text: `Many of your recent questions have centered on ${topCategory.label.toLowerCase()}. This could be an area you're actively reflecting on.`,
    });
  }

  const topSuit = stats.topSuits.find((s) => s.count >= 3 && s.label !== "major arcana");
  if (topSuit) {
    insights.push({
      id: "top-suit",
      text: `Cards from the suit of ${topSuit.label} have shown up often. Symbolically, this suit tends to reflect a particular kind of energy worth noticing in your life right now.`,
    });
  }

  if (stats.majorArcanaShare >= 0.4) {
    insights.push({
      id: "major-arcana",
      text: `A notable share of your draws have been Major Arcana cards. This may point to broader life themes rather than day-to-day details.`,
    });
  }

  if (stats.readingsLast30Days >= 4) {
    insights.push({
      id: "frequency",
      text: `You've returned for a reading ${stats.readingsLast30Days} times in the past month. Consider whether tarot is supporting your reflection, rather than becoming something you lean on for every decision.`,
    });
  }

  return insights;
}
