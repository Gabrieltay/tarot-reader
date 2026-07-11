import { Spread, SpreadId } from "@/types/tarot";

export const SPREADS: Record<SpreadId, Spread> = {
  single: {
    id: "single",
    name: "Single Card",
    positions: [
      { label: "Your Card", description: "A focused answer to your question." },
    ],
  },
  "three-card": {
    id: "three-card",
    name: "Past / Present / Future",
    positions: [
      { label: "Past", description: "Influences leading up to now." },
      { label: "Present", description: "The current state of things." },
      { label: "Future", description: "Where this is heading." },
    ],
  },
  "celtic-cross": {
    id: "celtic-cross",
    name: "Celtic Cross",
    positions: [
      { label: "Present", description: "The heart of the matter." },
      { label: "Challenge", description: "What crosses you." },
      { label: "Foundation", description: "The root of the situation." },
      { label: "Past", description: "Recent events fading away." },
      { label: "Crown", description: "Your conscious goal or best outcome." },
      { label: "Future", description: "What's approaching next." },
      { label: "Attitude", description: "How you see yourself in this." },
      { label: "External Influences", description: "Others and outside forces." },
      { label: "Hopes & Fears", description: "What you hope for or fear." },
      { label: "Outcome", description: "The likely resolution." },
    ],
  },
};

export const SPREAD_LIST = Object.values(SPREADS);
