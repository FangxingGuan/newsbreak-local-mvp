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
  /** True when this stop is the feed item the plan was generated from. */
  anchor?: boolean
}

/** A lightweight plan generated from a feed item. */
export interface Plan {
  id: string
  vertical: Vertical
  title: string
  when: string
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
