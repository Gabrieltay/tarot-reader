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
| `GEMINI_MODEL` | No | Overrides the Gemini model (defaults to `gemini-3.5-flash`). |

Without `GEMINI_API_KEY` set, the app still runs and cards can be drawn — only the interpretation step will show an error.

## Project Structure

- `data/cards.json` — all 78 cards, structured on the traditional Rider-Waite-Smith system (id, name, arcana, suit, number, upright/reversed meanings, image path)
- `public/cards/` — the Soimoi deck artwork plus a custom card-back SVG
- `lib/draw.ts` — random draw logic (unique cards, 50/50 reversed)
- `lib/spreads.ts` — spread definitions (Single Card, Past/Present/Future, Celtic Cross)
- `components/` — question input, spread selector, flip-card, spread layouts, interpretation panel
- `app/api/interpret/route.ts` — server route that calls the Gemini Flash API

## Card Images & Attribution

Card artwork is the **Soimoi tarot deck**, sourced from the [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards) repository (`tarot/soimoi/720px`), © the repository's contributors, used under the [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) license (attribution required, non-commercial use only). If this project is ever deployed commercially, this deck must be swapped for art with compatible licensing (e.g. the same repo's public-domain Rider-Waite-Smith deck) — the CC BY-NC terms don't permit commercial use.

The card **meanings** in `data/cards.json` follow the standard, public-domain Rider-Waite-Smith interpretive tradition and are independent of the artwork's license.
