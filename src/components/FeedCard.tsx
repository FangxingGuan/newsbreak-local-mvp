import { useEffect, useRef, type RefObject } from 'react'
import { useStore } from '../store'
import type { FeedItem } from '../types'

interface Props {
  item: FeedItem
  /** Scroll container used as the IntersectionObserver root for dwell tracking. */
  scrollRoot: RefObject<HTMLElement>
}

/** Time a card must stay mostly visible before it counts as a dwell. */
const DWELL_MS = 2000

export function FeedCard({ item, scrollRoot }: Props) {
  const { state, dispatch } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const dwelled = state.dwelled.includes(item.id)
  const saved = state.saved.includes(item.id)

  // Feed dwell time → intent trigger.
  useEffect(() => {
    const el = ref.current
    if (!el || dwelled) return
    let timer: number | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) {
          timer = window.setTimeout(
            () => dispatch({ type: 'DWELL', id: item.id, title: item.title }),
            DWELL_MS,
          )
        } else {
          window.clearTimeout(timer)
        }
      },
      { root: scrollRoot.current, threshold: [0, 0.6, 1] },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [item.id, item.title, dwelled, dispatch, scrollRoot])

  return (
    <article ref={ref} className={`card ${dwelled ? 'dwelled' : ''}`}>
      <div
        className="card-cover"
        style={item.image ? undefined : { background: item.cover }}
        onClick={() => dispatch({ type: 'OPEN_DETAIL', id: item.id })}
      >
        {item.image ? (
          <img className="card-photo" src={item.image} alt="" loading="lazy" />
        ) : (
          <span className="card-emoji">{item.emoji}</span>
        )}
        <span className="card-kind">{item.kind}</span>
        <button
          className={`card-save ${saved ? 'on' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'TOGGLE_SAVE', id: item.id, title: item.title })
          }}
          aria-label="收藏"
        >
          {saved ? '♥' : '♡'}
        </button>
        {item.distance && <span className="card-distance">📍 {item.distance}</span>}
      </div>

      <div
        className="card-body"
        onClick={() => dispatch({ type: 'OPEN_DETAIL', id: item.id })}
      >
        <div className="card-title-row">
          <h3>{item.title}</h3>
          {item.rating != null && (
            <span className="card-rating">★ {item.rating.toFixed(1)}</span>
          )}
        </div>
        <div className="card-meta">
          {[item.category, item.neighborhood, item.price].filter(Boolean).join(' · ')}
        </div>
        <p className="card-blurb">{item.blurb}</p>
        <div className="card-tags">
          {item.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {dwelled && (
        <div className="intent">
          <div className="intent-text">
            <strong>✨ 你在这条停留了一会儿</strong>
            <span>想去的话,帮你顺手安排一下?</span>
          </div>
          <button
            className="intent-btn"
            onClick={() => dispatch({ type: 'OPEN_PLANNING', id: item.id })}
          >
            {item.intentLabel} →
          </button>
        </div>
      )}
    </article>
  )
}
