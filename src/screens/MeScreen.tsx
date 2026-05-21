import { useStore } from '../store'
import { getArticle } from '../data'
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
  const { signals, read, saved, plans } = state

  const count = (t: SignalType) => signals.filter((s) => s.type === t).length

  // The intents NewsBreak read out of the articles you actually read.
  const intents = read
    .map((id) => getArticle(id))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .slice(0, 5)

  const loop = [
    { label: '本地文章流', done: read.length > 0 },
    { label: '读出意图', done: read.length > 0 },
    { label: '轻量规划', done: count('plan_generated') > 0 },
    { label: '真实行动', done: count('map_open') + count('calendar_add') > 0 },
    { label: '阅读偏好', done: signals.length > 0 },
  ]

  const ring = Math.min(wla / WLA_GOAL, 1) * 360

  return (
    <div className="screen">
      <header className="appbar simple">
        <h1>我的本地生活</h1>
        <p>你读的每一篇本地文章,都会被读成出行意图与偏好信号。</p>
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
            ['plan_generated', '生成计划', count('plan_generated')],
            ['map_open', '打开地图', count('map_open')],
            ['calendar_add', '加入日历', count('calendar_add')],
            ['save', '收藏地点', count('save')],
            ['__plans', '已存计划', plans.length],
          ] as [string, string, number][]
        ).map(([k, label, n]) => (
          <div className="stat" key={k}>
            <span className="stat-num">{n}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </section>

      <section className="block">
        <h2>AI 从你的阅读里读到的意图</h2>
        <p className="block-sub">不是凭空推荐 —— 全部来自你真正读过的文章</p>
        {intents.length === 0 ? (
          <div className="muted-line">还没读文章 · 去「发现」读一篇看看</div>
        ) : (
          <div className="intent-list">
            {intents.map((a) => (
              <div className="intent-row" key={a.id}>
                <span className="intent-emoji">{a.emoji}</span>
                <span className="intent-text">
                  <strong>{a.intent}</strong>
                  <span className="intent-from">源自《{a.headline}》</span>
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
