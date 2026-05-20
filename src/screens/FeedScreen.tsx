import { useRef } from 'react'
import { useStore } from '../store'
import { FEED, USER_LOCATION, VERTICALS } from '../data'
import { FeedCard } from '../components/FeedCard'

export function FeedScreen() {
  const { state, dispatch } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const items = FEED.filter((i) => i.vertical === state.vertical)

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
        本地附近 · 为你推荐 · 停留浏览即可触发出行规划
      </div>

      <div className="feed-list">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} scrollRoot={scrollRef} />
        ))}
        <div className="feed-end">— 已经到底啦 —</div>
      </div>
    </div>
  )
}
