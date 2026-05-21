import { Fragment, useMemo, useState } from 'react'
import { useStore } from '../store'
import {
  generateItinerary,
  getArticle,
  getDiscover,
  getPreferences,
  planSeedFromArticle,
  planSeedFromDiscover,
  planVariantCount,
} from '../data'
import type { PlanKind } from '../types'

const WHEN_CHIPS = ['本周内', '本周末', '下周末']
const WHO_CHIPS = ['自己一个人', '约会', '和朋友', '带家人']

function defaultWho(kind: PlanKind): string {
  if (kind === 'meal') return '约会'
  if (kind === 'event' || kind === 'outdoor' || kind === 'shopping') return '和朋友'
  if (kind === 'grocery' || kind === 'family') return '带家人'
  return '自己一个人'
}

/** The one adjacent decision that actually matters for this kind of outing. */
function actionHint(kind: PlanKind): string | null {
  if (kind === 'event') return '🎟️ 别忘了提前买票 —— 热门场次常常售罄'
  if (kind === 'meal') return '💡 热门时段建议先订位,到了不用排队'
  if (kind === 'grocery') return '💡 周末上午人最多,早点去更从容'
  if (kind === 'family') return '💡 热门亲子场馆周末人多,建议提前在网上订票'
  if (kind === 'shopping') return '💡 二手店多为独件、常收现金 —— 带个大袋子,合眼缘的别犹豫'
  return null
}

/**
 * The planning step — deliberately lightweight. It turns a fleeting intent
 * into a remembered commitment (a place, a when, who with, a reminder).
 * A full multi-stop itinerary is optional, expanded only on demand.
 */
export function CommitSheet() {
  const { state, dispatch } = useStore()
  const { planning } = state

  const seed = useMemo(() => {
    if (!planning) return null
    if (planning.kind === 'article') {
      const a = getArticle(planning.id)
      return a ? planSeedFromArticle(a) : null
    }
    const d = getDiscover(planning.id)
    return d ? planSeedFromDiscover(d) : null
  }, [planning])

  const prefTags = useMemo(
    () => getPreferences(state).map((p) => p.tag),
    [state],
  )

  const [when, setWhen] = useState('本周末')
  const [who, setWho] = useState(() => (seed ? defaultWho(seed.kind) : '和朋友'))
  const [remind, setRemind] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [variant, setVariant] = useState(0)
  const [saved, setSaved] = useState(false)

  const itinerary = useMemo(
    () => (seed && expanded ? generateItinerary(seed, variant, prefTags) : null),
    [seed, expanded, variant, prefTags],
  )

  if (!seed) return null
  const close = () => dispatch({ type: 'CLOSE_PLANNING' })
  const chosenWhen = seed.fixedWhen ?? when
  const hint = actionHint(seed.kind)

  const commit = () => {
    setSaved(true)
    dispatch({
      type: 'ADD_PLAN',
      plan: {
        id: `plan-${seed.id}-${Date.now()}`,
        basedOnId: seed.id,
        basedOnTitle: seed.title,
        kind: seed.kind,
        emoji: seed.anchorEmoji,
        image: seed.anchorImage,
        placeName: seed.anchorName,
        placeBlurb: seed.anchorBlurb,
        when: chosenWhen,
        withWhom: who,
        remind,
        itinerary: itinerary?.stops,
        itineraryVibe: itinerary?.vibe,
        createdAt: Date.now(),
      },
    })
    dispatch({ type: 'SIGNAL', signalType: 'commit', itemTitle: seed.anchorName })
    dispatch({ type: 'TOAST', message: '✅ 已加入「计划」 · 到点会提醒你' })
    dispatch({ type: 'CLOSE_PLANNING' })
    dispatch({ type: 'SET_TAB', tab: 'plans' })
  }

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />

        <div className="commit-head">
          <span className="loop-pill">加入计划</span>
          <div className="commit-place">
            <div
              className="commit-thumb"
              style={seed.anchorImage ? undefined : { background: 'linear-gradient(135deg,#3a4654,#5d6b7a)' }}
            >
              {seed.anchorImage ? (
                <img className="acard-photo" src={seed.anchorImage} alt="" />
              ) : (
                <span className="commit-emoji">{seed.anchorEmoji}</span>
              )}
            </div>
            <div className="commit-place-text">
              <h2>{seed.anchorName}</h2>
              <p>{seed.anchorBlurb}</p>
            </div>
          </div>
          <div className="commit-from">源自《{seed.title}》</div>
        </div>

        <div className="commit-body">
          <div className="commit-q">🗓️ 打算什么时候去?</div>
          {seed.fixedWhen ? (
            <div className="commit-fixed">{seed.fixedWhen}</div>
          ) : (
            <div className="chips">
              {WHEN_CHIPS.map((c) => (
                <button
                  key={c}
                  className={`chip ${when === c ? 'on' : ''}`}
                  onClick={() => setWhen(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="commit-q">👥 和谁一起?</div>
          <div className="chips">
            {WHO_CHIPS.map((c) => (
              <button
                key={c}
                className={`chip ${who === c ? 'on' : ''}`}
                onClick={() => setWho(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            className={`commit-toggle ${remind ? 'on' : ''}`}
            onClick={() => setRemind((r) => !r)}
          >
            <span>🔔 到点提醒我</span>
            <span className="commit-switch" />
          </button>

          {hint && <div className="commit-hint">{hint}</div>}

          {!expanded ? (
            <button className="commit-expand" onClick={() => setExpanded(true)}>
              ▸ 想排一整天?展开成一日行程(可选)
            </button>
          ) : (
            <div className="commit-itin">
              <div className="commit-itin-head">
                <span className="commit-itin-vibe">📋 {itinerary?.vibe}</span>
                {planVariantCount() > 1 && (
                  <button
                    className="commit-reroll"
                    onClick={() => setVariant((v) => v + 1)}
                  >
                    ↻ 换个玩法
                  </button>
                )}
              </div>
              <div className="timeline" key={variant}>
                {(() => {
                  let delay = 0
                  return (itinerary?.stops ?? []).map((s, i) => {
                    const conn = s.travel ? (
                      <div
                        className="tconnector"
                        style={{ animationDelay: `${delay++ * 0.1}s` }}
                      >
                        <span className="tconnector-rail">
                          <span className="tconnector-line" />
                        </span>
                        <span className="tconnector-chip">{s.travel}</span>
                      </div>
                    ) : null
                    const stop = (
                      <div
                        className={`tstop ${s.anchor ? 'anchor' : ''} ${
                          s.forYou ? 'foryou' : ''
                        }`}
                        style={{ animationDelay: `${delay++ * 0.1}s` }}
                      >
                        <div className="tstop-rail">
                          <span className="tstop-dot">{s.emoji}</span>
                        </div>
                        <div className="tstop-body">
                          <div className="tstop-time">{s.time}</div>
                          <div className="tstop-title">
                            {s.title}
                            {s.anchor && <span className="anchor-tag">来自内容</span>}
                            {s.forYou && (
                              <span className="foryou-tag">✨ 为你定制</span>
                            )}
                          </div>
                          <div className="tstop-desc">{s.desc}</div>
                          {s.tip && <div className="tstop-tip">{s.tip}</div>}
                        </div>
                      </div>
                    )
                    return (
                      <Fragment key={i}>
                        {conn}
                        {stop}
                      </Fragment>
                    )
                  })
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="sheet-actions">
          <button className="btn-ghost" onClick={close}>
            关闭
          </button>
          <button className="btn-primary" disabled={saved} onClick={commit}>
            {saved ? '已加入' : '✨ 加入计划'}
          </button>
        </div>
      </div>
    </div>
  )
}
