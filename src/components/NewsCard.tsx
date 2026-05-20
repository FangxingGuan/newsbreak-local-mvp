import { useEffect, useRef, type RefObject } from 'react'
import { useStore } from '../store'
import type { NewsItem } from '../types'

interface Props {
  item: NewsItem
  scrollRoot: RefObject<HTMLElement>
}

/** Time a card must stay mostly visible before it counts as a dwell. */
const DWELL_MS = 2000

/** NewsBreak-style local-news card woven into the feed. */
export function NewsCard({ item, scrollRoot }: Props) {
  const { state, dispatch } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const dwelled = state.dwelled.includes(item.id)

  // Reading a news card is feed engagement — same dwell signal as a card.
  useEffect(() => {
    const el = ref.current
    if (!el || dwelled) return
    let timer: number | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) {
          timer = window.setTimeout(
            () => dispatch({ type: 'DWELL', id: item.id, title: item.headline }),
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
  }, [item.id, item.headline, dwelled, dispatch, scrollRoot])

  const open = () => {
    if (!dwelled) dispatch({ type: 'DWELL', id: item.id, title: item.headline })
    dispatch({ type: 'TOAST', message: '📰 已记录你的阅读 · 偏好已更新' })
  }

  return (
    <article ref={ref} className={`news ${dwelled ? 'dwelled' : ''}`} onClick={open}>
      <div className="news-cat">📰 {item.category}</div>

      <div className="news-main">
        <div className="news-text">
          <h3 className="news-headline">{item.headline}</h3>
          <p className="news-summary">{item.summary}</p>
        </div>
        <div
          className="news-thumb"
          style={item.image ? undefined : { background: item.cover }}
        >
          {item.image ? (
            <img className="card-photo" src={item.image} alt="" loading="lazy" />
          ) : (
            <span className="news-emoji">{item.emoji}</span>
          )}
        </div>
      </div>

      <div className="news-meta">
        <span className="news-source">{item.source}</span>
        <span>· {item.publishedAgo}</span>
        <span className="news-meta-sp" />
        <span>💬 {item.comments}</span>
        <span>👍 {item.reactions}</span>
      </div>

      {dwelled &&
        (item.linkId ? (
          <button
            className="news-hook news-hook-btn"
            onClick={(e) => {
              e.stopPropagation()
              dispatch({ type: 'OPEN_DETAIL', id: item.linkId! })
            }}
          >
            <strong>✨ 出行意图</strong> · {item.hook} →
          </button>
        ) : (
          <div className="news-hook">
            <strong>✨ 出行意图</strong> · {item.hook}
          </div>
        ))}
    </article>
  )
}
