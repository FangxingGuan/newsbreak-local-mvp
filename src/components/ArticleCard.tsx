import { useEffect, useRef, type RefObject } from 'react'
import { useStore } from '../store'
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
  const primary = article.pois[0]

  // Dwelling on an article is the engine's core input.
  useEffect(() => {
    const el = ref.current
    if (!el || read) return
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
  }, [article.id, article.headline, read, dispatch, scrollRoot])

  const open = () =>
    dispatch({ type: 'OPEN_ARTICLE', id: article.id, title: article.headline })

  return (
    <article ref={ref} className={`acard ${read ? 'read' : ''}`}>
      <div className="acard-top" onClick={open}>
        <div className="acard-text">
          <div className="acard-topic">📰 {article.topic}</div>
          <h3 className="acard-headline">{article.headline}</h3>
          <div className="acard-meta">
            {article.source} · {article.publishedAgo}
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

      {read && (
        <IntentCTA
          label="NewsBreak 读到出行意图"
          intent={article.intent}
          onClick={open}
        />
      )}
    </article>
  )
}
