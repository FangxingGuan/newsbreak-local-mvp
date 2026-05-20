import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useStore } from '../store'
import { getItem } from '../data'
import type { FeedItem } from '../types'

interface Props {
  item: FeedItem
  /** Scroll container used as the IntersectionObserver root for dwell tracking. */
  scrollRoot: RefObject<HTMLElement>
}

/** Time a card must stay mostly visible before it counts as a dwell. */
const DWELL_MS = 2000

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatDate(d: string): string {
  const dt = new Date(`${d}T00:00`)
  if (Number.isNaN(dt.getTime())) return d
  return `${dt.getMonth() + 1}/${dt.getDate()} ${WEEKDAYS[dt.getDay()]}`
}

/** Rough city-driving time estimate from the distance string. */
function driveTime(distance: string): string | null {
  const mi = parseFloat(distance)
  if (!Number.isFinite(mi)) return null
  return `🚗 ${Math.max(3, Math.round(mi * 3))} 分钟`
}

/** Star rating bar — gold fill clipped to the rating fraction. */
function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`${value} 星`}>
      <span className="stars-on" style={{ width: `${(value / 5) * 100}%` }}>
        ★★★★★
      </span>
      ★★★★★
    </span>
  )
}

/** Real-data-derived context badges (no fabricated metrics). */
function badges(item: FeedItem): string[] {
  const out: string[] = []
  if (item.tags?.includes('U-Pick Farm')) out.push('🍓 应季采摘')
  if (item.date) out.push(`📅 ${formatDate(item.date)}`)
  if ((item.reviews ?? 0) >= 800) out.push('🔥 本地热门')
  else if ((item.rating ?? 0) >= 4.6) out.push('⭐ 高分好评')
  if ((item.reviews ?? 0) >= 1500) out.push('💬 评价超多')
  if (!out.length) out.push('📍 就在你附近')
  return out.slice(0, 2)
}

export function FeedCard({ item, scrollRoot }: Props) {
  const { state, dispatch } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const dwelled = state.dwelled.includes(item.id)
  const saved = state.saved.includes(item.id)
  const drive = driveTime(item.distance)

  // Personalized recommendation reason, derived from the user's own session.
  const reason = useMemo(() => {
    const history = [...state.saved, ...state.dwelled].filter((id) => id !== item.id)
    const seen = new Set<string>()
    history.forEach((id) => getItem(id)?.tags.forEach((t) => seen.add(t)))
    const hit = item.tags.find((t) => seen.has(t))
    if (hit) return `你最近常看「${hit}」· 这条很搭`
    if (item.vertical === 'dining') return '本地高分约会之选 · 帮你顺手安排'
    if (item.vertical === 'weekend') return '这个周末就在你附近 · 要不要规划一下'
    return '遛娃友好 · 帮你排进家庭日'
  }, [state.saved, state.dwelled, item])

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

  const openDetail = () => dispatch({ type: 'OPEN_DETAIL', id: item.id })

  return (
    <article ref={ref} className={`card ${dwelled ? 'dwelled' : ''}`}>
      <div className="card-top" onClick={openDetail}>
        <div
          className="card-thumb"
          style={item.image ? undefined : { background: item.cover }}
        >
          {item.image ? (
            <img className="card-photo" src={item.image} alt="" loading="lazy" />
          ) : (
            <span className="card-thumb-emoji">{item.emoji}</span>
          )}
        </div>

        <div className="card-info">
          <div className="card-kindrow">
            <span className="card-kindtag">{item.kind}</span>
            {item.distance && <span className="card-dist">📍 {item.distance}</span>}
          </div>
          <h3 className="card-name">{item.title}</h3>

          {item.rating != null ? (
            <div className="card-rate">
              <Stars value={item.rating} />
              <span className="card-rate-num">{item.rating.toFixed(1)}</span>
              {item.reviews != null && (
                <span className="card-rate-cnt">
                  ({item.reviews.toLocaleString()})
                </span>
              )}
            </div>
          ) : item.date ? (
            <div className="card-rate">
              <span className="card-datechip">📅 {formatDate(item.date)}</span>
            </div>
          ) : null}

          <div className="card-sub">
            {[item.category, item.price].filter(Boolean).join(' · ')}
            {drive && <span className="card-drive"> · {drive}</span>}
          </div>
        </div>
      </div>

      <div className="card-badges">
        {badges(item).map((b) => (
          <span className="cbadge" key={b}>
            {b}
          </span>
        ))}
      </div>

      {dwelled && (
        <div className="card-reason">
          <strong>✨ 为你触发</strong> · {reason}
        </div>
      )}

      <div className="card-foot">
        <button
          className={`card-plan ${dwelled ? 'hot' : ''}`}
          onClick={() => dispatch({ type: 'OPEN_PLANNING', id: item.id })}
        >
          ✨ {item.intentLabel}
        </button>
        <button
          className={`card-save ${saved ? 'on' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_SAVE', id: item.id, title: item.title })}
          aria-label="收藏"
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
    </article>
  )
}
