import { useState } from 'react'
import { assistantPicks, type AssistantWindow } from '../data'
import type { DiscoverCard } from '../types'
import { useStore } from '../store'

const tagHit = (c: DiscoverCard, ...ns: string[]) =>
  c.tags?.some((t) => ns.some((n) => t.includes(n))) ?? false

/** Surface the cold-start reason (最近 / 最新 / 最热 / 近) honestly. */
function why(c: DiscoverCard): string {
  if (tagHit(c, '即将结业')) return '⏳ 快关门了 · 趁还在去一次'
  if (c.date) return '📅 本周末就有 · 订票即可去'
  if (tagHit(c, '新店')) return '🆕 最近刚开 · 还没排起队'
  if ((c.reviews ?? 0) >= 800) return '🔥 本地最热门之一'
  const m = c.distance?.match(/([\d.]+)/)
  if (m && parseFloat(m[1]) <= 6) return '📍 离你近 · 口碑稳'
  return '半岛周边 · 值得一去'
}

const WINDOWS: { id: AssistantWindow; emoji: string; label: string }[] = [
  { id: 'couple_dinner',  emoji: '🍷', label: '约会就餐' },
  { id: 'family_outing',  emoji: '👨‍👩‍👧', label: '带娃出行' },
  { id: 'weekend_events', emoji: '🎫', label: '周末活动' },
]

/**
 * The Local Life Assistant — a top-of-feed widget that swaps the question
 * "what's in the feed?" for "what should I actually do?". Three time windows
 * (date dinner / family outing / weekend events) each carry 2-3 anchor picks
 * pre-built from Yelp + Ticketmaster. Tapping a pick goes straight into the
 * existing 加入计划 flow.
 */
export function AssistantPanel() {
  const { dispatch } = useStore()
  const [windowId, setWindowId] = useState<AssistantWindow>('couple_dinner')
  const picks = assistantPicks(windowId)

  const plan = (id: string) =>
    dispatch({ type: 'OPEN_PLANNING', target: { kind: 'discover', id } })

  return (
    <section className="assistant">
      <div className="assistant-head">
        <span className="assistant-title">🤖 今天去哪儿</span>
        <span className="assistant-sub">Local Life Assistant · 每 6 小时刷新</span>
      </div>

      <div className="assistant-chips">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            className={`assistant-chip ${windowId === w.id ? 'on' : ''}`}
            onClick={() => setWindowId(w.id)}
          >
            <span className="assistant-chip-emoji">{w.emoji}</span>
            {w.label}
          </button>
        ))}
      </div>

      {picks.length === 0 ? (
        <div className="muted-line">这个时间窗暂无候选 · 稍后再看看</div>
      ) : (
        <div className="assistant-picks">
          {picks.map((p) => (
            <article key={p.id} className="assistant-pick">
              <div className="assistant-pick-top">
                <div
                  className="assistant-pick-thumb"
                  style={p.image ? undefined : { background: p.cover }}
                >
                  {p.image ? (
                    <img src={p.image} alt="" loading="lazy" />
                  ) : (
                    <span className="assistant-pick-emoji">{p.emoji}</span>
                  )}
                </div>
                <div className="assistant-pick-text">
                  <h4>{p.title}</h4>
                  <div className="assistant-pick-meta">
                    {p.rating != null ? (
                      <>
                        ★ {p.rating.toFixed(1)} · {p.reviews?.toLocaleString() ?? ''} 评
                      </>
                    ) : p.date ? (
                      <>📅 {p.date}</>
                    ) : null}
                    {p.price && <span> · {p.price}</span>}
                  </div>
                  <div className="assistant-pick-meta">
                    {[p.category, p.distance && `📍 ${p.distance}`, p.neighborhood]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  <div className="assistant-pick-why">{why(p)}</div>
                </div>
              </div>
              <button className="assistant-pick-cta" onClick={() => plan(p.id)}>
                ✨ 加入计划
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
