import { useLayoutEffect, useRef } from 'react'
import { ARTICLES, DISCOVER, USER_LOCATION, isDiscover } from '../data'
import { ArticleCard } from '../components/ArticleCard'
import { DiscoverCard } from '../components/DiscoverCard'
import type { FeedEntry } from '../types'

/** Weave articles and discover cards evenly, whatever their relative counts. */
function buildFeed(articles: FeedEntry[], discover: FeedEntry[]): FeedEntry[] {
  const out: FeedEntry[] = []
  let ai = 0
  let di = 0
  const total = articles.length + discover.length
  for (let i = 0; i < total; i++) {
    const takeArticle =
      ai < articles.length &&
      (di >= discover.length ||
        (ai + 1) / articles.length <= (di + 1) / discover.length)
    out.push(takeArticle ? articles[ai++] : discover[di++])
  }
  return out
}

/**
 * Tabs are conditionally rendered in App, so the feed remounts each time the
 * user returns to it. Keep its scroll position so committing a plan (which
 * jumps to the Plans tab) doesn't drop the user back at the very top.
 */
let savedScroll = 0

/**
 * Final feed order: every freshly-added entry (anything carrying an `addedAt`,
 * across both types) sorts by timestamp descending and lands above the
 * original content. Below the fresh band, the original article/discover weave
 * is preserved. Sorting both types together — not weaving them — keeps the
 * latest update batch at the very top regardless of relative type counts.
 */
function orderedFeed(): FeedEntry[] {
  const freshArticles = ARTICLES.filter((a) => a.addedAt)
  const staleArticles = ARTICLES.filter((a) => !a.addedAt)
  const freshDiscover = DISCOVER.filter((d) => d.addedAt)
  const staleDiscover = DISCOVER.filter((d) => !d.addedAt)
  const fresh = [...freshArticles, ...freshDiscover].sort((a, b) =>
    (b.addedAt ?? '').localeCompare(a.addedAt ?? ''),
  )
  return [...fresh, ...buildFeed(staleArticles, staleDiscover)]
}

export function FeedScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const entries = orderedFeed()

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = savedScroll
    return () => {
      if (el) savedScroll = el.scrollTop
    }
  }, [])

  return (
    <div className="screen feed" ref={scrollRef}>
      <header className="appbar">
        <div className="appbar-top">
          <div className="logo">
            <span className="logo-mark">N</span> NewsBreak
            <span className="logo-sub">Local</span>
          </div>
          <span className="appbar-loc">📍 {USER_LOCATION}</span>
        </div>
      </header>

      <div className="feed-hint">
        <span className="hint-dot live" />
        本地新闻 + 为你发现的小众好去处 · 两类内容都能读出出行意图
      </div>

      <div className="feed-list">
        {entries.map((e) =>
          isDiscover(e) ? (
            <DiscoverCard key={e.id} card={e} scrollRoot={scrollRef} />
          ) : (
            <ArticleCard key={e.id} article={e} scrollRoot={scrollRef} />
          ),
        )}
        <div className="feed-end">— 已经到底啦 —</div>
      </div>
    </div>
  )
}
