import { useRef } from 'react'
import { useStore } from '../store'
import { FEED, NEWS, USER_LOCATION, USING_REAL_DATA, VERTICALS, isNews } from '../data'
import { FeedCard } from '../components/FeedCard'
import { NewsCard } from '../components/NewsCard'
import type { FeedEntry } from '../types'

/** Weave news articles into the decision cards — one news item per 2 cards. */
function buildFeed(cards: FeedEntry[], news: FeedEntry[]): FeedEntry[] {
  const out: FeedEntry[] = []
  let n = 0
  cards.forEach((card, i) => {
    out.push(card)
    if ((i + 1) % 2 === 0 && n < news.length) out.push(news[n++])
  })
  while (n < news.length) out.push(news[n++])
  return out
}

export function FeedScreen() {
  const { state, dispatch } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const cards = FEED.filter((i) => i.vertical === state.vertical)
  const news = NEWS.filter((n) => n.vertical === state.vertical)
  const entries = buildFeed(cards, news)

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
        <div className="verticals">
          {VERTICALS.map((v) => (
            <button
              key={v.id}
              className={`vchip ${state.vertical === v.id ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'SET_VERTICAL', vertical: v.id })}
            >
              <span>{v.emoji}</span>
              {v.label}
            </button>
          ))}
        </div>
      </header>

      <div className="feed-hint">
        <span className={`hint-dot ${USING_REAL_DATA ? 'live' : 'sample'}`} />
        {USING_REAL_DATA
          ? '本地资讯 + 实时商户数据 · 停留即触发出行规划'
          : '示例数据 · 运行 npm run snapshot 可接入真实 API'}
      </div>

      <div className="feed-list">
        {entries.map((entry) =>
          isNews(entry) ? (
            <NewsCard key={entry.id} item={entry} scrollRoot={scrollRef} />
          ) : (
            <FeedCard key={entry.id} item={entry} scrollRoot={scrollRef} />
          ),
        )}
        <div className="feed-end">— 已经到底啦 —</div>
      </div>
    </div>
  )
}
