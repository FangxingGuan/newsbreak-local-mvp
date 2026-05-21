import { useRef } from 'react'
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

export function FeedScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const entries = buildFeed(ARTICLES, DISCOVER)

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
