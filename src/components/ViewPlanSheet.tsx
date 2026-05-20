import { Fragment } from 'react'
import { useStore } from '../store'

/** Read-only re-open of a saved plan from the Plans tab. */
export function ViewPlanSheet() {
  const { state, dispatch } = useStore()
  const plan = state.plans.find((p) => p.id === state.viewPlanId)
  if (!plan) return null

  const close = () => dispatch({ type: 'VIEW_PLAN', id: null })

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet plan" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="plan-head">
          <span className="loop-pill">已保存的计划</span>
          <h2>{plan.title}</h2>
          <div className="plan-meta">
            <span className="plan-vibe">{plan.vibe}</span>
            <span className="plan-facts">
              🗓️ {plan.when} · {plan.stops.length} 站
            </span>
          </div>
        </div>

        <div className="timeline">
          {plan.stops.map((s, i) => (
            <Fragment key={i}>
              {s.travel && (
                <div className="tconnector">
                  <span className="tconnector-rail">
                    <span className="tconnector-line" />
                  </span>
                  <span className="tconnector-chip">{s.travel}</span>
                </div>
              )}
              <div className={`tstop ${s.anchor ? 'anchor' : ''}`}>
                <div className="tstop-rail">
                  <span className="tstop-dot">{s.emoji}</span>
                </div>
                <div className="tstop-body">
                  <div className="tstop-time">{s.time}</div>
                  <div className="tstop-title">
                    {s.title}
                    {s.anchor && <span className="anchor-tag">来自 Feed</span>}
                  </div>
                  <div className="tstop-desc">{s.desc}</div>
                  {s.anchor && s.image && (
                    <img className="tstop-photo" src={s.image} alt="" />
                  )}
                </div>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="sheet-actions">
          <button
            className="btn-ghost"
            onClick={() => {
              dispatch({ type: 'SIGNAL', signalType: 'map_open', itemTitle: plan.title })
              dispatch({
                type: 'TOAST',
                message: `🗺️ 已在地图打开 · ${plan.stops.length} 个地点`,
              })
            }}
          >
            🗺️ 打开地图
          </button>
          <button className="btn-primary" onClick={close}>
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
