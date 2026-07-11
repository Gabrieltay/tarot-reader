# Tarot Reader

Ask a question, draw a tarot spread, and get an AI-woven interpretation powered by Gemini Flash.

## Stack

- Next.js 16 (App Router), TypeScript
- Tailwind CSS v4 (CSS-first config in `app/globals.css`, no `tailwind.config.js`)
- Static card data — no database
- Gemini Flash API for reading interpretation

## Getting Started

Requires Node.js 20+.

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and set GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | API key for the Gemini Flash API, used server-side in `/app/api/interpret`. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). |
| `GEMINI_MODEL` | No | Overrides the Gemini model (defaults to `gemini-2.5-flash`). |

Without `GEMINI_API_KEY` set, the app still runs and cards can be drawn — only the interpretation step will show an error.

## Project Structure

- `data/cards.json` — all 78 Rider-Waite-Smith cards (id, name, arcana, suit, number, upright/reversed meanings, image path)
- `public/cards/` — Rider-Waite-Smith card images (public domain) plus a card-back SVG
- `lib/draw.ts` — random draw logic (unique cards, 50/50 reversed)
- `lib/spreads.ts` — spread definitions (Single Card, Past/Present/Future, Celtic Cross)
- `components/` — question input, spread selector, flip-card, spread layouts, interpretation panel
- `app/api/interpret/route.ts` — server route that calls the Gemini Flash API

## Card Images

Card images are the public-domain Rider-Waite-Smith deck (Pamela Colman Smith, 1909), sourced from the [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards) repository.
