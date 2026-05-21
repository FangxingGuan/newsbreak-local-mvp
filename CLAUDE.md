# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project status

**Interactive MVP demo** — a clickable, mobile-framed web demo of NewsBreak's
**article-driven local decision engine**.

## What we're building

Transform NewsBreak from a local news feed into a feed-driven *local decision
engine*. The feed mixes **two card types**:

1. **Article cards** — real local-news reports; intent is read OUT of the
   articles the user actually reads (the primary, defensible mechanic).
2. **Discover cards** — recommendations the engine surfaces from API content
   worth attention: under-the-radar Yelp finds (high rating / few reviews) and
   trending Ticketmaster events.

Both feed into the same loop, and both contribute to the user's local-life
**preference profile** (aggregated tags shown on the Me screen).

Core loop:

```
本地文章流 → 阅读文章 → 从文章抽取 POI 与意图 → 围绕文章 POI 轻量规划
  → 真实行动 → 阅读偏好信号
```

North Star metric: **Weekly Local Actions (WLA)** — counts plan generation, map
opens and calendar adds.

Full PRD: `newsbreak_ai_local_mvp_prd.md`.

## Stack & commands

- Vite + React 18 + TypeScript.
- `npm install` — install dependencies
- `npm run dev` — dev server at http://localhost:5173
- `npm run build` — type-check (`tsc`) + production build to `dist/`
- `npm run preview` — serve the production build

## Code layout (`src/`)

- `types.ts` — domain types: `Article`, `ArticlePOI`, `Plan`, `Signal`
- `data.ts` — the `ARTICLES` array (real local-news reports with embedded,
  API-enriched POIs) + the plan generator
- `store.tsx` — single reducer + context driving the loop; derives WLA
- `App.tsx` — phone frame, screen routing, overlay sheets, desktop legend
- `screens/` — `FeedScreen` (article feed), `PlansScreen`, `MeScreen`
- `components/` — `ArticleCard` (feed card, dwell-tracked), `ArticleReader`
  (full article + extracted POIs + plan CTA), `PlanSheet`, `ViewPlanSheet`,
  `BottomNav`, `Toast`
- `styles.css` — all styling; one file, sectioned by component

## Data model & honesty

- Each `Article` is a **real local-news report**. Article bodies are original
  Chinese summaries of the reporting — not copied text.
- Each article's `pois` were extracted from the article, then enriched with
  **live Yelp Fusion / Google Places data** (ratings, review counts, photos,
  prices) captured at build time. POIs that are brand-new, delivery-only, or
  not yet open carry a `status` of `opening`/`closed` and may lack ratings —
  this is kept honest rather than faked.
- The feed is a single unified article stream — no topic tabs.

## Working agreements

- Keep changes aligned with the core loop; intent must trace back to an
  article the user read — never a proactive recommendation.
- This is a demo: state is in-memory and resets on reload.
- When adding an article: fetch it, extract POIs, enrich via the APIs, write an
  original-prose summary, and add it to `ARTICLES`.
