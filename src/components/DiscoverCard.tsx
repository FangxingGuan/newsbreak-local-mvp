import { useEffect, useRef, type RefObject } from 'react'
import { useStore } from '../store'
import { IntentCTA } from './IntentCTA'
import type { DiscoverCard as DiscoverCardT } from '../types'

interface Props {
  card: DiscoverCardT
  scrollRoot: RefObject<HTMLElement>
}

const DWELL_MS = 2000

/** A recommendation card built from API content (a niche find / a hot event). */
export function DiscoverCard({ card, scrollRoot }: Props) {
  const { state, dispatch } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const seen = state.seen.includes(card.id)
  const link = card.ticketUrl ?? card.yelpUrl ?? card.googleUrl
  const linkLabel = card.ticketUrl
    ? '购票 ↗'
    : card.yelpUrl
      ? '在 Yelp 查看 ↗'
      : 'Google 地图 ↗'

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    let timer: number | undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.6) {
          timer = window.setTimeout(
            () => dispatch({ type: 'SEEN', id: card.id, title: card.title }),
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
  }, [card.id, card.title, seen, dispatch, scrollRoot])

  const plan = () =>
    dispatch({ type: 'OPEN_PLANNING', target: { kind: 'discover', id: card.id } })

  const meta1 =
    card.rating != null
      ? `★ ${card.rating.toFixed(1)} · ${card.reviews?.toLocaleString() ?? ''} 条评价`
      : card.date
        ? `📅 ${card.date}`
        : ''

  return (
    <article ref={ref} className={`dcard ${seen ? 'seen' : ''}`}>
      <div className={`card-badge ${card.kind}`}>{card.badge}</div>

      <div className="dcard-top" onClick={plan}>
        <div className="dcard-text">
          <h3 className="dcard-title">{card.title}</h3>
          <div className="dcard-rate">
            {meta1}
            {card.price && <span className="dcard-price"> · {card.price}</span>}
          </div>
          <div className="dcard-meta">
            {[card.category, card.distance && `📍 ${card.distance}`, card.neighborhood]
              .filter(Boolean)
              .join(' · ')}
          </div>
          <p className="dcard-blurb">{card.blurb}</p>
        </div>
        <div
          className="dcard-thumb"
          style={card.image ? undefined : { background: card.cover }}
        >
          {card.image ? (
            <img className="acard-photo" src={card.image} alt="" loading="lazy" />
          ) : (
            <span className="dcard-emoji">{card.emoji}</span>
          )}
        </div>
      </div>

      {card.quote && (
        <div className="dcard-quote">
          <span className="dcard-quote-stars">{'★'.repeat(card.quote.rating)}</span>
          “{card.quote.text}” — {card.quote.author} · {card.quote.source}
        </div>
      )}

      {link && (
        <div className="dcard-foot">
          <a
            className="poi-link"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkLabel}
          </a>
        </div>
      )}

      {seen && (
        <IntentCTA label="为你推荐出行意图" intent={card.intent} onClick={plan} />
      )}
    </article>
  )
}
