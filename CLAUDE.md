# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project status

**Interactive MVP demo** — a clickable, mobile-framed web demo of NewsBreak's
**local-content-driven decision engine**.

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
本地内容流(新闻 + 推荐) → 形成出行意图 → 加入计划(轻量承诺)
  → 真实行动 → 偏好画像回流
```

Planning is deliberately lightweight: tapping "加入计划" turns an intent into a
remembered commitment (a place, a when, who with, a reminder). A multi-stop
itinerary is optional, expanded only on demand.

North Star metric: **Weekly Local Actions (WLA)** — counts only real-world
actions (opening directions, adding to calendar). Committing to a plan is
intent, not yet an action, so it does not count.

Full PRD: `newsbreak_ai_local_mvp_prd.md`.

## Stack & commands

- Vite + React 18 + TypeScript.
- `npm install` — install dependencies
- `npm run dev` — dev server at http://localhost:5173
- `npm run build` — type-check (`tsc`) + production build to `dist/`
- `npm run preview` — serve the production build

## Code layout (`src/`)

- `types.ts` — domain types: `Article`, `ArticlePOI`, `Plan`, `Signal`
- `data.ts` — `ARTICLES` (news reports + API-enriched POIs), `DISCOVER`
  (recommendation cards), the category/preference-aware itinerary generator,
  and the local-life preference profile
- `store.tsx` — single reducer + context driving the loop; derives WLA
- `App.tsx` — phone frame, screen routing, overlay sheets, desktop legend
- `screens/` — `FeedScreen` (mixed feed), `PlansScreen`, `MeScreen`
- `components/` — `ArticleCard`, `DiscoverCard` (the two feed card types),
  `ArticleReader`, `CommitSheet` (lightweight planning + optional itinerary),
  `ViewPlanSheet`, `BottomNav`, `Toast`
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
  original-prose summary, and add it to `ARTICLES`. Set `addedAt` (a full ISO
  timestamp) on every pipeline-added article and discover card; give every
  entry in one update batch the same fresh timestamp, newer than any prior
  batch — the feed sorts by `addedAt` descending, so the latest batch lands at
  the very top.
- The scheduled pipeline (every 6h) auto-adds clear candidates straight to the
  demo (build + commit + push). Pause and ask only when something is genuinely
  uncertain: a candidate that overlaps thematically with an existing demo POI,
  ambiguous or non-locatable location, no API footprint without a strong
  editorial angle, or any judgement call where two reasonable people would
  disagree. The notification summary should say what was added and what (if
  anything) is being held back for confirmation.
- Distance matters by **category**, not flatly. Each entry's category class
  is derived from tags by `categoryClass()` in `data.ts`:
  - `daily` — coffee, breakfast (tight; ~4–15 mi)
  - `weekend` — dinner out, drinks, shopping, parks (~12–35 mi)
  - `destination` — events, museums, time-bound closings, festivals
    (~25–70 mi)
  Closing-soon and event content is `destination` automatically via the
  `'即将结业'` and event tags. When deciding whether to auto-add a card,
  check `RADIUS_FOR.peninsula[categoryClass(card)]` against its distance —
  a casual cafe 30 mi away will not be useful to a Palo Alto user.
- Card `blurb` is a one-line **hook**, not an info dump — lead with the
  sensory / time-bound / contrarian thing that creates desire ("只剩 6 天可以
  在原产地喝", "排第 12 位的开门前 20 分钟"), not a neutral summary. Keep it
  under ~30 characters of payload.
- Every scheduled pipeline run, after auto-adding cards, also **revise
  `THEMES`**: count cards by tag, and if ≥4 cards share a tag (or a tight
  synonym cluster) that no existing `tagMatch` covers, add a new theme.
  Don't churn — only add when the cluster is defensible. Expired themes
  (`validUntil` past, or below `minEntries`) auto-hide; only prune them from
  the array if it's been stale for ≥1 run.
- Themes (`THEMES` in `data.ts`) are RULE-based — `tagMatch` + optional
  `pinned` + optional `validUntil` + `minEntries`. Pipeline-added cards flow
  into themes automatically as long as their tags match. Conventions:
  - A closing-soon article must carry the tag `'即将结业'` so the closing
    lane picks it up.
  - Seasonal content uses the existing season tags (`'夏日活动'`,
    `'夏日祭'`, `'采摘'`, `'户外'`, etc.).
  - Museum / gallery content carries `'博物馆'` or `'美术馆'`, optionally
    `'展览'` (auto-routed into the 「一日博物馆」 lane).
  - Concert / sport / theater content carries one of `'演唱会'` `'音乐剧'`
    `'现场演出'` `'演出'` `'体育'` `'话剧'` `'音乐'` (auto-routed into
    「演出 · 球赛 · 现场」).
  - Add a new entry to `THEMES` only when a genuinely new story emerges that
    no tag set captures; prefer expanding `tagMatch` or `pinned` on an
    existing theme first.
