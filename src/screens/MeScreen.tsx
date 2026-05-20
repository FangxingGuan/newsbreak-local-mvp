import { useMemo } from 'react'
import { useStore } from '../store'
import { getItem } from '../data'
import type { SignalType } from '../types'

const SIGNAL_EMOJI: Record<SignalType, string> = {
  dwell: '👀',
  save: '♥',
  plan_generated: '✨',
  map_open: '🗺️',
  calendar_add: '🗓️',
  repeat_plan: '↻',
}

const WLA_GOAL = 8

function relTime(ts: number): string {
  const diff = Math.round((Date.now() - ts) / 1000)
  if (diff < 10) return '刚刚'
  if (diff < 60) return `${diff} 秒前`
  return `${Math.round(diff / 60)} 分钟前`
}

export function MeScreen() {
  const { state, wla } = useStore()
  const { signals, saved, dwelled, plans } = state

  const count = (t: SignalType) => signals.filter((s) => s.type === t).length

  // Inferred tastes: aggregate tags across browsed / saved / planned items.
  const tastes = useMemo(() => {
    const ids = new Set<string>([...saved, ...dwelled, ...plans.map((p) => p.basedOnId)])
    const freq = new Map<string, number>()
    ids.forEach((id) => {
      getItem(id)?.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1))
    })
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [saved, dwelled, plans])

  const loop = [
    { label: '高频 Feed', done: signals.length > 0 },
    { label: '意图触发', done: dwelled.length > 0 },
    { label: '轻量规划', done: count('plan_generated') > 0 },
    { label: '真实行动', done: count('map_open') + count('calendar_add') > 0 },
    { label: '偏好信号', done: signals.length > 0 },
  ]

  const ring = Math.min(wla / WLA_GOAL, 1) * 360

  return (
    <div className="screen">
      <header className="appbar simple">
        <h1>我的本地生活</h1>
        <p>每一次浏览、收藏与规划,都会回流为偏好信号。</p>
      </header>

      <section className="wla">
        <div
          className="wla-ring"
          style={{
            background: `conic-gradient(var(--brand) ${ring}deg, var(--line) ${ring}deg)`,
          }}
        >
          <div className="wla-inner">
            <span className="wla-num">{wla}</span>
            <span className="wla-cap">WLA</span>
          </div>
        </div>
        <div className="wla-side">
          <div className="wla-title">本周本地行动</div>
          <div className="wla-sub">Weekly Local Actions · 北极星指标</div>
          <div className="wla-bar-cap">
            目标 {WLA_GOAL} · 还差 {Math.max(WLA_GOAL - wla, 0)} 次
          </div>
        </div>
      </section>

      <section className="stats">
        {(
          [
            ['dwell', '停留'],
            ['save', '收藏'],
            ['plan_generated', '生成计划'],
            ['map_open', '打开地图'],
            ['calendar_add', '加入日历'],
            ['repeat_plan', '再次规划'],
          ] as [SignalType, string][]
        ).map(([t, label]) => (
          <div className="stat" key={t}>
            <span className="stat-num">{count(t)}</span>
            <span className="stat-label">
              {SIGNAL_EMOJI[t]} {label}
            </span>
          </div>
        ))}
      </section>

      <section className="block">
        <h2>AI 读懂的你</h2>
        <p className="block-sub">根据你的浏览、收藏与计划实时推断</p>
        {tastes.length === 0 ? (
          <div className="muted-line">还没有足够信号 · 去 Feed 逛逛看</div>
        ) : (
          <div className="card-tags">
            {tastes.map(([tag, n]) => (
              <span className="taste" key={tag}>
                {tag}
                <span className="taste-n">{n}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="block">
        <h2>核心闭环进度</h2>
        <div className="loopbar">
          {loop.map((s, i) => (
            <div className={`loopstep ${s.done ? 'done' : ''}`} key={s.label}>
              <span className="loopstep-dot">{s.done ? '✓' : i + 1}</span>
              <span className="loopstep-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <h2>偏好信号流</h2>
        <p className="block-sub">闭环的最后一步 · 持续回流以优化推荐</p>
        {signals.length === 0 ? (
          <div className="muted-line">暂无信号 · 你的每个动作都会出现在这里</div>
        ) : (
          <div className="signal-list">
            {signals.slice(0, 14).map((s) => (
              <div className="signal-row" key={s.id}>
                <span className="signal-emoji">{SIGNAL_EMOJI[s.type]}</span>
                <span className="signal-text">
                  <strong>{s.label}</strong>
                  {s.itemTitle && <span className="signal-item"> · {s.itemTitle}</span>}
                </span>
                <span className="signal-time">{relTime(s.ts)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="feed-end">— NewsBreak Local · MVP 演示 —</div>
    </div>
  )
}
