import { useRef } from 'react'
import { ARTICLES, USER_LOCATION } from '../data'
import { ArticleCard } from '../components/ArticleCard'

export function FeedScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)

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
        本地新闻流 · 你读到哪篇,出行意图就从哪篇里来
      </div>

      <div className="feed-list">
        {ARTICLES.map((a) => (
          <ArticleCard key={a.id} article={a} scrollRoot={scrollRef} />
        ))}
        <div className="feed-end">— 已经到底啦 —</div>
      </div>
    </div>
  )
}
