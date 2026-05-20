// Domain types for the NewsBreak Local MVP demo.
// The whole demo runs on mock data — see data.ts.

export type Vertical = 'dining' | 'weekend' | 'family'

export type Tab = 'feed' | 'plans' | 'me'

/** A single card in the high-frequency local feed. */
export interface FeedItem {
  id: string
  vertical: Vertical
  kind: '地点' | '活动' | '本地资讯'
  title: string
  category: string
  emoji: string
  /** CSS gradient used as the cover when there is no real photo. */
  cover: string
  /** Real photo URL from the source API, when available. */
  image?: string
  neighborhood: string
  distance: string
  /** Star rating; omitted for sources that don't provide one (e.g. events). */
  rating?: number
  /** Number of reviews behind the rating, when available. */
  reviews?: number
  /** Event date (YYYY-MM-DD) for time-bound items like concerts. */
  date?: string
  price: string
  blurb: string
  tags: string[]
  /** Label for the intent-trigger call to action. */
  intentLabel: string
}

/** One stop inside a generated plan. */
export interface PlanStop {
  time: string
  emoji: string
  title: string
  desc: string
  /** How you get to this stop from the previous one, e.g. "🚶 6 分钟". */
  travel?: string
  /** Real photo, set on the anchor stop (the feed item the plan is built on). */
  image?: string
  /** True when this stop is the feed item the plan was generated from. */
  anchor?: boolean
}

/** A lightweight plan generated from a feed item. */
export interface Plan {
  id: string
  vertical: Vertical
  title: string
  when: string
  /** Short mood label for this itinerary variant, e.g. "🌇 浪漫慢节奏". */
  vibe: string
  basedOnId: string
  basedOnTitle: string
  stops: PlanStop[]
  createdAt: number
}

/**
 * Preference / behaviour signals — the last step of the core loop.
 * `dwell` feeds the intent trigger; the rest count toward Weekly Local Actions.
 */
export type SignalType =
  | 'dwell'
  | 'save'
  | 'plan_generated'
  | 'map_open'
  | 'calendar_add'
  | 'repeat_plan'

export interface Signal {
  id: string
  type: SignalType
  label: string
  itemTitle?: string
  ts: number
}

/** A local-news article — NewsBreak-style feed texture mixed among the cards. */
export interface NewsItem {
  type: 'news'
  id: string
  vertical: Vertical
  category: string
  headline: string
  source: string
  publishedAgo: string
  emoji: string
  cover: string
  image?: string
  summary: string
  comments: number
  reactions: number
  /** Intent hook surfaced after dwell — ties news reading to the decision loop. */
  hook: string
  /** FeedItem id this article points at — makes the dwell hook tappable. */
  linkId?: string
}

/** Anything that can appear in the feed: a decision card or a news article. */
export type FeedEntry = FeedItem | NewsItem
