import { Fragment, useState } from 'react'
import { useStore } from '../store'

/** Opens a saved plan — the commitment, its optional itinerary, real actions. */
export function ViewPlanSheet() {
  const { state, dispatch } = useStore()
  const plan = state.plans.find((p) => p.id === state.viewPlanId)
  const [didMap, setDidMap] = useState(false)
  const [didCal, setDidCal] = useState(false)
  if (!plan) return null

  const close = () => dispatch({ type: 'VIEW_PLAN', id: null })

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />

        <div className="commit-head">
          <span className="loop-pill">我的计划</span>
          <div className="commit-place">
            <div
              className="commit-thumb"
              style={plan.image ? undefined : { background: 'linear-gradient(135deg,#3a4654,#5d6b7a)' }}
            >
              {plan.image ? (
                <img className="acard-photo" src={plan.image} alt="" />
              ) : (
                <span className="commit-emoji">{plan.emoji}</span>
              )}
            </div>
            <div className="commit-place-text">
              <h2>{plan.placeName}</h2>
              <p>{plan.placeBlurb}</p>
            </div>
          </div>
          <div className="commit-summary">
            <span>🗓️ {plan.when}</span>
            <span>👥 {plan.withWhom}</span>
            <span>{plan.remind ? '🔔 提醒已开' : '🔕 无提醒'}</span>
          </div>
          <div className="commit-from">源自《{plan.basedOnTitle}》</div>
        </div>

        <div className="commit-body">
          {plan.itinerary && plan.itinerary.length > 0 ? (
            <>
              <div className="commit-q">📋 一日行程 · {plan.itineraryVibe}</div>
              <div className="timeline">
                {plan.itinerary.map((s, i) => (
                  <Fragment key={i}>
                    {s.travel && (
                      <div className="tconnector">
                        <span className="tconnector-rail">
                          <span className="tconnector-line" />
                        </span>
                        <span className="tconnector-chip">{s.travel}</span>
                      </div>
                    )}
                    <div
                      className={`tstop ${s.anchor ? 'anchor' : ''} ${
                        s.forYou ? 'foryou' : ''
                      }`}
                    >
                      <div className="tstop-rail">
                        <span className="tstop-dot">{s.emoji}</span>
                      </div>
                      <div className="tstop-body">
                        <div className="tstop-time">{s.time}</div>
                        <div className="tstop-title">
                          {s.title}
                          {s.anchor && <span className="anchor-tag">来自内容</span>}
                          {s.forYou && <span className="foryou-tag">✨ 为你定制</span>}
                        </div>
                        <div className="tstop-desc">{s.desc}</div>
                        {s.tip && <div className="tstop-tip">{s.tip}</div>}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </>
          ) : (
            <div className="commit-hint">
              这是一个轻量计划 —— 到点提醒你别忘了。需要详细行程时,重新加入即可展开。
            </div>
          )}

          <div className="plan-realworld">
            <div className="rw-label">真实本地行动</div>
            <div className="rw-btns">
              <button
                className={`rw-btn ${didMap ? 'done' : ''}`}
                onClick={() => {
                  setDidMap(true)
                  dispatch({ type: 'SIGNAL', signalType: 'map_open', itemTitle: plan.placeName })
                  dispatch({ type: 'TOAST', message: `🗺️ 已在地图打开 · ${plan.placeName}` })
                }}
              >
                {didMap ? '✓ 已打开地图' : '🗺️ 打开地图'}
              </button>
              <button
                className={`rw-btn ${didCal ? 'done' : ''}`}
                onClick={() => {
                  setDidCal(true)
                  dispatch({ type: 'SIGNAL', signalType: 'calendar_add', itemTitle: plan.placeName })
                  dispatch({ type: 'TOAST', message: `🗓️ 已加入日历 · ${plan.when}` })
                }}
              >
                {didCal ? '✓ 已加入日历' : '🗓️ 加入日历'}
              </button>
            </div>
          </div>
        </div>

        <div className="sheet-actions">
          <button className="btn-primary" onClick={close}>
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
