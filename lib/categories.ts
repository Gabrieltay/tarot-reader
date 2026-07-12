import { ReadingCategory } from "@/types/tarot";

export const CATEGORY_LIST: ReadingCategory[] = [
  "general",
  "love",
  "career",
  "life-path",
  "family",
  "personal-growth",
  "finances",
  "health",
];

export const CATEGORY_LABELS: Record<ReadingCategory, string> = {
  general: "General",
  love: "Love & Relationships",
  career: "Career & Work",
  "life-path": "Life Path",
  family: "Family",
  "personal-growth": "Personal Growth",
  finances: "Finances",
  health: "Health & Wellbeing",
};
