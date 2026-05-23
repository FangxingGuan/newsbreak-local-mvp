import { useEffect, useRef, type RefObject } from 'react'
import { useStore } from '../store'
import { relAdded } from '../data'
import { IntentCTA } from './IntentCTA'
import type { Article } from '../types'

interface Props {
  article: Article
  scrollRoot: RefObject<HTMLElement>
}

/** Time a card must stay mostly visible before it counts as read. */
const DWELL_MS = 2000

/** A local-news article in the feed — NewsBreak style. */
export function ArticleCard({ article, scrollRoot }: Props) {
  const { state, dispatch } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const read = state.read.includes(article.id)
  const dismissed = state.dismissed.includes(article.id)
  const primary = article.pois[0]

  // Dwelling on an article is the engine's core input.
  useEffect(() => {
    const el = ref.current
    if (!el || read || dismissed) return
    let timer: number | undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.6) {
          timer = window.setTimeout(
            () => dispatch({ type: 'READ', id: article.id, title: article.headline }),
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
  }, [article.id, article.headline, read, dismissed, dispatch, scrollRoot])

  if (dismissed) {
    return (
      <div className="card-hidden">
        <span>🚫 已标记「不感兴趣」· NewsBreak 会少推这类</span>
        <button onClick={() => dispatch({ type: 'UNDISMISS', id: article.id })}>
          撤销
        </button>
      </div>
    )
  }

  const open = () =>
    dispatch({ type: 'OPEN_ARTICLE', id: article.id, title: article.headline })

  return (
    <article ref={ref} className={`acard ${read ? 'read' : ''}`}>
      <div className="card-badge article">
        <span>📰 本地报道</span>
        <span className="card-badge-src">{article.source}</span>
        {article.addedAt && (
          <span className="card-updated">🕒 {relAdded(article.addedAt)} 更新</span>
        )}
        <button
          className="card-dismiss"
          aria-label="不感兴趣"
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'DISMISS', id: article.id, title: article.headline })
          }}
        >
          <span className="card-dismiss-x">✕</span> 不感兴趣
        </button>
      </div>

      <div className="acard-top" onClick={open}>
        <div className="acard-text">
          <h3 className="acard-headline">{article.headline}</h3>
          <div className="acard-meta">
            {article.topic} · {article.publishedAgo}
          </div>
        </div>
        <div
          className="acard-thumb"
          style={primary.image ? undefined : { background: article.cover }}
        >
          {primary.image ? (
            <img className="acard-photo" src={primary.image} alt="" loading="lazy" />
          ) : (
            <span className="acard-emoji">{article.emoji}</span>
          )}
        </div>
      </div>

      <div className="acard-stats">
        <span>💬 {article.comments}</span>
        <span>👍 {article.reactions}</span>
        <span className="acard-sp" />
        <span className="acard-poi">📍 提到 {article.pois.length} 个地点</span>
      </div>

      <IntentCTA
        label="NewsBreak 读到出行意图"
        intent={article.intent}
        onClick={open}
      />
    </article>
  )
}
