// Domain types for the article-driven NewsBreak Local MVP demo.
// The feed is local news articles; intent is read OUT of articles the user
// actually reads — nothing is proactively recommended.

export type Tab = 'feed' | 'plans' | 'me'

export type PoiStatus = 'open' | 'opening' | 'closed'

/** A place mentioned in an article, best-effort enriched via the local APIs. */
export interface ArticlePOI {
  id: string
  name: string
  category: string
  emoji: string
  status: PoiStatus
  /** What the article itself says about this place. */
  blurb: string
  neighborhood: string
  /** Distance from Palo Alto; '' when not place-bound (e.g. delivery only). */
  distance: string
  rating?: number
  reviews?: number
  price?: string
  /** Real photo URL from the enrichment API, when available. */
  image?: string
  /** Gradient cover used when there is no photo. */
  cover: string
  /** Which API the live data came from, e.g. "Yelp". */
  via?: string
  /** Status note, e.g. "本月开业 · 暂无评价". */
  note?: string
  /** Selected review excerpts (Yelp / Google), shown with attribution. */
  quotes?: PoiReview[]
  /** Outbound links to the place's Yelp / Google Maps page. */
  yelpUrl?: string
  googleUrl?: string
}

/** A short review excerpt from Yelp or Google, shown with attribution. */
export interface PoiReview {
  source: 'Yelp' | 'Google'
  author: string
  rating: number
  text: string
}

/** A local-news article — the unit of the feed. */
export interface Article {
  id: string
  source: string
  /** Link to the original published report. */
  sourceUrl: string
  publishedAgo: string
  topic: string
  headline: string
  dek: string
  emoji: string
  cover: string
  body: string[]
  comments: number
  reactions: number
  /** The outing intent NewsBreak's engine reads out of this article. */
  intent: string
  /** Topical tags — feed the user's local-life preference profile. */
  tags: string[]
  /** Places mentioned in the article; pois[0] is the primary one. */
  pois: ArticlePOI[]
}

/**
 * A recommendation card built from API content worth surfacing — a trending
 * Ticketmaster event, or a top-rated place from a Yelp ranking. Unlike an
 * article, this is the engine proactively proposing something.
 */
export interface DiscoverCard {
  type: 'discover'
  id: string
  kind: 'event' | 'find'
  /** Newsworthy hook, e.g. "🔥 本周热门活动" or "⭐ Yelp 高分榜 · 本地第 2". */
  badge: string
  title: string
  category: string
  emoji: string
  cover: string
  image?: string
  neighborhood: string
  distance: string
  rating?: number
  reviews?: number
  price?: string
  date?: string
  blurb: string
  /** The outing intent this recommendation is meant to spark. */
  intent: string
  tags: string[]
  quote?: PoiReview
  yelpUrl?: string
  googleUrl?: string
  ticketUrl?: string
}

/** Anything that can appear in the feed. */
export type FeedEntry = Article | DiscoverCard

/** Minimal input needed to generate a plan — from an article or a card. */
export interface PlanSeed {
  id: string
  title: string
  kind: PlanKind
  /** The anchor's neighborhood, used to ground supporting stops. */
  area: string
  anchorName: string
  anchorEmoji: string
  anchorBlurb: string
  anchorImage?: string
  /** For time-bound items (events), the date the plan is locked to. */
  fixedWhen?: string
}

/** The kind of outing a plan is — drives its pacing, stops and tips. */
export type PlanKind = 'meal' | 'cafe' | 'outdoor' | 'bookstore' | 'grocery' | 'event'

/** One stop inside a generated plan. */
export interface PlanStop {
  time: string
  emoji: string
  title: string
  desc: string
  /** How you get to this stop from the previous one, e.g. "🚶 6 分钟". */
  travel?: string
  /** A caring, concrete tip for this stop. */
  tip?: string
  /** Real photo, set on the anchor stop. */
  image?: string
  /** True when this stop is the POI the plan was built around. */
  anchor?: boolean
  /** True when this stop was added to match the user's preference profile. */
  forYou?: boolean
}

/**
 * A plan is a lightweight *commitment* — turning a fleeting intent into a
 * remembered thing the user means to do: a place, a when, who with, a reminder.
 * The multi-stop itinerary is optional, expanded only on demand.
 */
export interface Plan {
  id: string
  basedOnId: string
  basedOnTitle: string
  kind: PlanKind
  emoji: string
  image?: string
  placeName: string
  placeBlurb: string
  /** When the user committed to going, e.g. "本周末". */
  when: string
  /** Who they plan to go with, e.g. "约会". */
  withWhom: string
  remind: boolean
  /** Optional multi-stop itinerary — only present if the user expanded one. */
  itinerary?: PlanStop[]
  itineraryVibe?: string
  createdAt: number
}

/**
 * Behaviour signals. `read` is the core input — what you read drives the
 * engine; the rest count toward Weekly Local Actions.
 */
export type SignalType = 'read' | 'commit' | 'map_open' | 'calendar_add' | 'save'

export interface Signal {
  id: string
  type: SignalType
  label: string
  itemTitle?: string
  ts: number
}
