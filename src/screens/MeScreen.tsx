import { useStore } from '../store'
import { getArticle, getDiscover, getPreferences } from '../data'
import type { SignalType } from '../types'

const SIGNAL_EMOJI: Record<SignalType, string> = {
  read: '📖',
  plan_generated: '✨',
  map_open: '🗺️',
  calendar_add: '🗓️',
  save: '♥',
}

const WLA_GOAL = 6

function relTime(ts: number): string {
  const diff = Math.round((Date.now() - ts) / 1000)
  if (diff < 10) return '刚刚'
  if (diff < 60) return `${diff} 秒前`
  return `${Math.round(diff / 60)} 分钟前`
}

export function MeScreen() {
  const { state, wla } = useStore()
  const { signals, read, seen, saved, plans } = state

  const count = (t: SignalType) => signals.filter((s) => s.type === t).length

  // Intents NewsBreak read out of the content you engaged with.
  const intents = [
    ...read.map((id) => {
      const a = getArticle(id)
      return a && { emoji: a.emoji, intent: a.intent, from: a.headline }
    }),
    ...seen.map((id) => {
      const d = getDiscover(id)
      return d && { emoji: d.emoji, intent: d.intent, from: d.title }
    }),
  ]
    .filter((x): x is { emoji: string; intent: string; from: string } => !!x)
    .slice(0, 6)

  // Local-life preference profile, built from read + seen tags.
  const prefs = getPreferences(read, seen).slice(0, 8)
  const prefMax = prefs[0]?.n ?? 1

  const loop = [
    { label: '本地内容流', done: read.length + seen.length > 0 },
    { label: '读出意图', done: read.length + seen.length > 0 },
    { label: '轻量规划', done: count('plan_generated') > 0 },
    { label: '真实行动', done: count('map_open') + count('calendar_add') > 0 },
    { label: '偏好信号', done: signals.length > 0 },
  ]

  const ring = Math.min(wla / WLA_GOAL, 1) * 360

  return (
    <div className="screen">
      <header className="appbar simple">
        <h1>我的本地生活</h1>
        <p>你读的新闻、看的推荐,都会被读成出行意图与本地生活偏好。</p>
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
            ['read', '读过文章', read.length],
            ['seen', '看过推荐', seen.length],
            ['plan_generated', '生成计划', count('plan_generated')],
            ['map_open', '打开地图', count('map_open')],
            ['save', '收藏地点', count('save')],
            ['plans', '已存计划', plans.length],
          ] as [string, string, number][]
        ).map(([k, label, n]) => (
          <div className="stat" key={k}>
            <span className="stat-num">{n}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </section>

      <section className="block">
        <h2>你的本地生活偏好</h2>
        <p className="block-sub">由你读过、看过的本地内容实时聚合</p>
        {prefs.length === 0 ? (
          <div className="muted-line">还没有偏好信号 · 去「发现」读点内容</div>
        ) : (
          <div className="prefs">
            {prefs.map((p) => (
              <div className="pref" key={p.tag}>
                <div className="pref-row">
                  <span className="pref-tag">{p.tag}</span>
                  <span className="pref-n">×{p.n}</span>
                </div>
                <div className="pref-bar">
                  <div
                    className="pref-fill"
                    style={{ width: `${(p.n / prefMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="block">
        <h2>AI 从你的内容里读到的意图</h2>
        <p className="block-sub">不是凭空推荐 —— 全部来自你真正读过/看过的内容</p>
        {intents.length === 0 ? (
          <div className="muted-line">还没有内容 · 去「发现」逛逛</div>
        ) : (
          <div className="intent-list">
            {intents.map((it, i) => (
              <div className="intent-row" key={i}>
                <span className="intent-emoji">{it.emoji}</span>
                <span className="intent-text">
                  <strong>{it.intent}</strong>
                  <span className="intent-from">源自《{it.from}》</span>
                </span>
              </div>
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
