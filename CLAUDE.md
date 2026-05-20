# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project status

**Interactive MVP demo.** A clickable, mobile-framed web demo of the core loop,
running entirely on mock data (no backend, no API keys).

### Stack & commands

- Vite + React 18 + TypeScript.
- `npm install` — install dependencies
- `npm run dev` — dev server at http://localhost:5173
- `npm run snapshot` — fetch real local data into `src/feed.generated.json`
- `npm run build` — type-check (`tsc`) + production build to `dist/`
- `npm run preview` — serve the production build

### Real data (build-time snapshot)

The feed can run on **real API data** instead of sample data:

- `scripts/snapshot.mjs` calls Yelp Fusion (dining), Google Places (family),
  Ticketmaster (weekend) and Amadeus (weekend), normalizes everything into
  `FeedItem`, and writes `src/feed.generated.json`.
- API keys live in `.env` (gitignored — see `.env.example`). They are used
  **only** by the Node snapshot script, never bundled into the browser app.
- `data.ts` imports the snapshot; each vertical falls back to sample data when
  the snapshot has no items for it.
- The deployed site stays fully static — the snapshot is committed JSON, so
  there is no backend and no key exposure. Re-run `npm run snapshot` and commit
  to refresh.

### Code layout (`src/`)

- `types.ts` — domain types (FeedItem, Plan, Signal, …)
- `data.ts` — feed assembly (real snapshot + sample fallback) + plan generator
- `feed.generated.json` — real-data snapshot, written by `scripts/snapshot.mjs`
- `store.tsx` — single reducer + context driving the whole core loop; also
  derives the WLA North Star metric
- `App.tsx` — phone frame, screen routing, overlay sheets, desktop legend
- `screens/` — `FeedScreen`, `PlansScreen`, `MeScreen` (one per bottom-nav tab)
- `components/` — `FeedCard` (dwell tracking + intent trigger), `DetailSheet`,
  `PlanSheet` (planning + real-world actions), `ViewPlanSheet`, `BottomNav`,
  `Toast`
- `styles.css` — all styling; one file, sectioned by component

### How the core loop maps to code

1. **Feed** — `FeedScreen` + `FeedCard`
2. **Intent trigger** — `FeedCard` uses an IntersectionObserver; ~2s of dwell
   surfaces an intent CTA and records a `dwell` signal
3. **Lightweight planning** — `PlanSheet` calls `generatePlan()` in `data.ts`
4. **Real-world action** — "打开地图 / 加入日历" buttons in `PlanSheet`
5. **Preference signals** — every action dispatches a `SIGNAL`; `MeScreen`
   visualizes them and the WLA counter

## What we're building

**NewsBreak AI Local MVP** — transform NewsBreak from a local news feed into a
feed-driven *local decision engine*.

The core loop the product must support:

```
high-frequency feed → intent trigger → lightweight planning
  → real-world action → preference signals
```

Initial verticals:
- Date / Social Dining
- Weekend Activities
- Family Activities

Key user signals to capture and instrument from day one:
- Feed dwell time
- Save
- Map open
- Plan generation
- Repeat planning

**North Star metric:** Weekly Local Actions (WLA). Design and instrument
features so WLA is measurable.

Full PRD: `newsbreak_ai_local_mvp_prd.md`.

## Working agreements

- Keep changes aligned with the core loop above; flag scope that doesn't serve
  it.
- Instrument the key signals as features land — they are not an afterthought.
- This is a demo: everything stays mock/in-memory. State resets on reload —
  there is intentionally no persistence or backend yet.
