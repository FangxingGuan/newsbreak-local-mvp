import { useState } from 'react'
import {
  assistantPicks,
  parseRefine,
  type AssistantOverrides,
  type AssistantWindow,
} from '../data'
import type { DiscoverCard } from '../types'
import { useStore } from '../store'

const WINDOWS: { id: AssistantWindow; emoji: string; label: string }[] = [
  { id: 'couple_dinner', emoji: '🍷', label: '约会就餐' },
  { id: 'family_outing', emoji: '👨‍👩‍👧', label: '带娃出行' },
  { id: 'weekend_events', emoji: '🎫', label: '周末活动' },
]

const DISTANCE_OPTS: { label: string; miles?: number }[] = [
  { label: '就近 ≤5mi', miles: 5 },
  { label: '半岛 ≤20mi', miles: 20 },
  { label: '都行', miles: undefined },
]

const BUDGET_OPTS: { label: string; v: AssistantOverrides['budget'] }[] = [
  { label: '💰 便宜', v: 'cheap' },
  { label: '💰💰 适中', v: 'mid' },
  { label: '✨ 特别一点', v: 'fancy' },
]

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

export function AssistantPanel() {
  const { dispatch } = useStore()
  const [windowId, setWindowId] = useState<AssistantWindow>('couple_dinner')
  const [overrides, setOverrides] = useState<AssistantOverrides>({})
  const [showRefine, setShowRefine] = useState(false)
  const [text, setText] = useState('')

  const picks = assistantPicks(windowId, overrides)
  const active =
    overrides.maxMiles != null || overrides.budget != null || !!overrides.text

  const plan = (id: string) =>
    dispatch({ type: 'OPEN_PLANNING', target: { kind: 'discover', id } })

  const applyText = () =>
    setOverrides((o) => ({ ...o, ...parseRefine(text) }))

  const clearRefine = () => {
    setOverrides({})
    setText('')
  }

  return (
    <section className="assistant">
      <div className="assistant-head">
        <span className="assistant-title">🤖 今天去哪儿</span>
        <span className="assistant-sub">Local Life Assistant · 每 6h 刷新</span>
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
        <button
          className={`assistant-refine-btn ${active ? 'on' : ''}`}
          onClick={() => setShowRefine((s) => !s)}
        >
          🔧 改一改
        </button>
      </div>

      {showRefine && (
        <div className="assistant-refine">
          <div className="refine-row">
            <span className="refine-label">📍 距离</span>
            {DISTANCE_OPTS.map((o) => (
              <button
                key={o.label}
                className={`refine-chip ${overrides.maxMiles === o.miles ? 'on' : ''}`}
                onClick={() => setOverrides((p) => ({ ...p, maxMiles: o.miles }))}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="refine-row">
            <span className="refine-label">💰 预算</span>
            {BUDGET_OPTS.map((o) => (
              <button
                key={o.label}
                className={`refine-chip ${overrides.budget === o.v ? 'on' : ''}`}
                onClick={() =>
                  setOverrides((p) => ({
                    ...p,
                    budget: p.budget === o.v ? undefined : o.v,
                  }))
                }
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="refine-row">
            <input
              className="refine-input"
              value={text}
              placeholder="想要点什么?如「便宜点」「就近」「素食」"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyText()}
            />
            <button className="refine-apply" onClick={applyText}>
              应用
            </button>
          </div>
          {active && (
            <button className="refine-clear" onClick={clearRefine}>
              ✕ 清除筛选
            </button>
          )}
        </div>
      )}

      {picks.length === 0 ? (
        <div className="assistant-empty">
          没有符合「{[
            overrides.budget && '预算',
            overrides.maxMiles != null && '距离',
            overrides.text && `「${overrides.text}」`,
          ]
            .filter(Boolean)
            .join(' + ')}」的候选 ·{' '}
          <button className="refine-clear inline" onClick={clearRefine}>
            放宽条件
          </button>
        </div>
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
