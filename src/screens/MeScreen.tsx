import { useStore } from '../store'
import {
  RADIUS_FOR,
  RADIUS_LABELS,
  getArticle,
  getDiscover,
  getPersona,
  getPreferences,
} from '../data'
import type { RadiusStyle, SignalType } from '../types'

const LEVEL_TEXT: Record<'low' | 'mid' | 'high', string> = {
  low: '初步',
  mid: '较明显',
  high: '明显',
}

const SIGNAL_EMOJI: Record<SignalType, string> = {
  read: '📖',
  seen: '🔍',
  commit: '📌',
  map_open: '🗺️',
  calendar_add: '🗓️',
  save: '♥',
  dismiss: '🚫',
}

const WLA_GOAL = 4

/** Render an interaction score with an explicit sign — +4, −4. */
const signed = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`)

function relTime(ts: number): string {
  const diff = Math.round((Date.now() - ts) / 1000)
  if (diff < 10) return '刚刚'
  if (diff < 60) return `${diff} 秒前`
  return `${Math.round(diff / 60)} 分钟前`
}

export function MeScreen() {
  const { state, dispatch, wla } = useStore()
  const { signals, read, seen, opened, saved } = state

  const count = (t: SignalType) => signals.filter((s) => s.type === t).length

  // Intents the engine read out — from content actually opened, newest first.
  const intents = [...opened]
    .reverse()
    .map((id) => {
      const a = getArticle(id)
      if (a) return { emoji: a.emoji, intent: a.intent, from: a.headline }
      const d = getDiscover(id)
      if (d) return { emoji: d.emoji, intent: d.intent, from: d.title }
      return null
    })
    .filter((x): x is { emoji: string; intent: string; from: string } => !!x)
    .slice(0, 6)

  // Preference profile — interaction rate; positive and negative.
  const allPrefs = getPreferences(state)
  const liked = allPrefs.filter((p) => p.rate > 0).slice(0, 7)
  const disliked = allPrefs
    .filter((p) => p.rate < 0)
    .sort((a, b) => a.rate - b.rate)
  const prefMax = liked[0]?.rate ?? 1
  const negMax = Math.max(...disliked.map((p) => Math.abs(p.rate)), 1)

  // Persona — who the user is (life stage / household), inferred from behaviour.
  const persona = getPersona(state)

  const loop = [
    { label: '本地内容流', done: read.length + seen.length > 0 },
    { label: '读出意图', done: allPrefs.length > 0 },
    { label: '加入计划', done: count('commit') > 0 },
    { label: '真实行动', done: count('map_open') + count('calendar_add') > 0 },
    { label: '偏好回流', done: signals.length > 0 },
  ]

  const ring = Math.min(wla / WLA_GOAL, 1) * 360

  return (
    <div className="screen">
      <header className="appbar simple">
        <h1>我的本地生活</h1>
        <p>你的每一次点开、收藏、规划与「不感兴趣」,都在塑造引擎对你的理解。</p>
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
            ['save', '收藏地点', saved.length],
            ['commit', '加入计划', count('commit')],
            ['map_open', '打开地图', count('map_open')],
            ['calendar_add', '加入日历', count('calendar_add')],
          ] as [string, string, number][]
        ).map(([k, label, n]) => (
          <div className="stat" key={k}>
            <span className="stat-num">{n}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
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
        <h2>🏠 我的生活半径</h2>
        <p className="block-sub">
          📍 Palo Alto · 不同品类的「值得动一下」距离差很多 ——
          选一个生活节奏,信息流按它过滤
        </p>
        <div className="radius-styles">
          {(['walk', 'peninsula', 'bay'] as RadiusStyle[]).map((s) => {
            const r = RADIUS_FOR[s]
            return (
              <button
                key={s}
                className={`radius-style ${state.radiusStyle === s ? 'on' : ''}`}
                onClick={() => dispatch({ type: 'SET_RADIUS_STYLE', style: s })}
              >
                <span className="radius-style-name">{RADIUS_LABELS[s]}</span>
                <span className="radius-style-detail">
                  ☕ 咖啡 ≤{r.daily} mi · 🍴 周末 ≤{r.weekend} mi · 🎫 展演 ≤
                  {r.destination} mi
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="block">
        <h2>你的本地生活偏好</h2>
        <p className="block-sub">
          互动分:点开 +1 / 收藏 +2 / 加入计划 +3 / 不感兴趣 −4 · 偏好强度 =
          互动分 ÷ 看过张数
        </p>
        {liked.length === 0 ? (
          <div className="muted-line">还没有正向偏好 · 去「发现」点开点内容</div>
        ) : (
          <div className="prefs">
            {liked.map((p) => (
              <div className="pref" key={p.tag}>
                <div className="pref-row">
                  <span className="pref-tag">{p.tag}</span>
                  <span className="pref-n">
                    互动分 {signed(p.num)} · 看过 {p.denom} 张
                  </span>
                </div>
                <div className="pref-bar">
                  <div
                    className="pref-fill"
                    style={{ width: `${(p.rate / prefMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {disliked.length > 0 && (
          <div className="prefs-neg">
            <span className="prefs-neg-label">➖ 似乎不感兴趣(负向偏好)</span>
            <div className="prefs">
              {disliked.map((p) => (
                <div className="pref neg" key={p.tag}>
                  <div className="pref-row">
                    <span className="pref-tag">{p.tag}</span>
                    <span className="pref-n neg">
                      互动分 {signed(p.num)} · 看过 {p.denom} 张
                    </span>
                  </div>
                  <div className="pref-bar">
                    <div
                      className="pref-fill neg"
                      style={{ width: `${(Math.abs(p.rate) / negMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="block">
        <h2>AI 推断的用户画像</h2>
        <p className="block-sub">
          从你的「和谁一起」选择与内容互动里推断 —— 仅为行为推断
        </p>
        {persona.length === 0 ? (
          <div className="muted-line">
            还不够了解你 · 多点开内容、加入几次计划就能看出来
          </div>
        ) : (
          <div className="persona">
            {persona.map((t) => (
              <div className="persona-row" key={t.label}>
                <span className="persona-emoji">{t.emoji}</span>
                <span className="persona-info">
                  <span className="persona-label">
                    {t.label}
                    <span className={`persona-level ${t.level}`}>
                      {LEVEL_TEXT[t.level]}
                    </span>
                  </span>
                  <span className="persona-hint">{t.hint}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="block">
        <h2>AI 从你的内容里读到的意图</h2>
        <p className="block-sub">来自你真正点开的内容 · 最新在前(仅停留不计入)</p>
        {intents.length === 0 ? (
          <div className="muted-line">还没点开过内容 · 去「发现」点开看看</div>
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
        <h2>偏好信号流</h2>
        <p className="block-sub">闭环的最后一步 · 正负反馈持续回流以优化推荐</p>
        {signals.length === 0 ? (
          <div className="muted-line">暂无信号 · 你的每个动作都会出现在这里</div>
        ) : (
          <div className="signal-list">
            {signals.slice(0, 14).map((s) => (
              <div
                className={`signal-row ${s.type === 'dismiss' ? 'neg' : ''}`}
                key={s.id}
              >
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
