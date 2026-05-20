import { useRef } from 'react'
import { useStore } from '../store'
import { FEED, USER_LOCATION, USING_REAL_DATA, VERTICALS } from '../data'
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
        <span className={`hint-dot ${USING_REAL_DATA ? 'live' : 'sample'}`} />
        {USING_REAL_DATA
          ? 'Yelp · Google Places · Ticketmaster · Amadeus 实时本地数据'
          : '示例数据 · 运行 npm run snapshot 可接入真实 API'}
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
