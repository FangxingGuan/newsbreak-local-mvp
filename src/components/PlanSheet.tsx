import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { generatePlan, getItem, planVariantCount } from '../data'
import type { PlanStop } from '../types'

const STEPS = ['读取你的浏览与收藏偏好…', '匹配附近相关地点…', '编排一条轻量行程…']

/** Rough total span of an itinerary, first stop to last. */
function spanHours(stops: PlanStop[]): string {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const diff = toMin(stops[stops.length - 1].time) - toMin(stops[0].time)
  const h = Math.round(diff / 30) / 2
  return h > 0 ? `约 ${h} 小时` : ''
}

export function PlanSheet() {
  const { state, dispatch } = useStore()
  const item = state.planningId ? getItem(state.planningId) : undefined

  const [phase, setPhase] = useState<'loading' | 'ready'>('loading')
  const [stepIdx, setStepIdx] = useState(0)
  const [variant, setVariant] = useState(0)
  const [saved, setSaved] = useState(false)
  const [didMap, setDidMap] = useState(false)
  const [didCal, setDidCal] = useState(false)

  // True if the user has already planned in this vertical → repeat planning.
  const isRepeat = useRef(
    item ? state.plans.some((p) => p.vertical === item.vertical) : false,
  )

  const plan = useMemo(
    () => (item ? generatePlan(item, variant) : null),
    [item, variant],
  )

  useEffect(() => {
    const ticker = window.setInterval(
      () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)),
      460,
    )
    const done = window.setTimeout(() => {
      window.clearInterval(ticker)
      setPhase('ready')
      if (item) {
        dispatch({ type: 'SIGNAL', signalType: 'plan_generated', itemTitle: item.title })
        if (isRepeat.current) {
          dispatch({ type: 'SIGNAL', signalType: 'repeat_plan', itemTitle: item.title })
        }
      }
    }, 1500)
    return () => {
      window.clearInterval(ticker)
      window.clearTimeout(done)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!item || !plan) return null
  const close = () => dispatch({ type: 'CLOSE_PLANNING' })
  const canReroll = planVariantCount(item) > 1

  const reroll = () => {
    setVariant((v) => v + 1)
    setDidMap(false)
    setDidCal(false)
    dispatch({ type: 'TOAST', message: '✨ 换了一种玩法,你看看?' })
  }

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet plan" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />

        {phase === 'loading' ? (
          <div className="plan-loading">
            <div className="plan-spinner" />
            <h3>✨ 正在为「{item.title}」规划</h3>
            <ul>
              {STEPS.map((s, i) => (
                <li key={s} className={i <= stepIdx ? 'done' : ''}>
                  {i < stepIdx ? '✓' : i === stepIdx ? '◌' : '·'} {s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className="plan-head">
              <span className="loop-pill">第 3 步 · 轻量规划</span>
              <h2>{plan.title}</h2>
              <div className="plan-meta">
                <span className="plan-vibe">{plan.vibe}</span>
                <span className="plan-facts">
                  🗓️ {plan.when} · {spanHours(plan.stops)} · {plan.stops.length} 站
                </span>
              </div>
              {isRepeat.current && (
                <div className="plan-repeat">↻ 你常规划这一类 · 已按偏好微调</div>
              )}
            </div>

            <div className="timeline" key={variant}>
              {(() => {
                let delay = 0
                return plan.stops.map((s, i) => {
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
                      className={`tstop ${s.anchor ? 'anchor' : ''}`}
                      style={{ animationDelay: `${delay++ * 0.1}s` }}
                    >
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

            <div className="plan-realworld">
              <div className="rw-label">真实本地行动</div>
              <div className="rw-btns">
                <button
                  className={`rw-btn ${didMap ? 'done' : ''}`}
                  onClick={() => {
                    setDidMap(true)
                    dispatch({ type: 'SIGNAL', signalType: 'map_open', itemTitle: plan.title })
                    dispatch({
                      type: 'TOAST',
                      message: `🗺️ 已在地图打开 · ${plan.stops.length} 个地点`,
                    })
                  }}
                >
                  {didMap ? '✓ 已打开地图' : '🗺️ 打开地图'}
                </button>
                <button
                  className={`rw-btn ${didCal ? 'done' : ''}`}
                  onClick={() => {
                    setDidCal(true)
                    dispatch({ type: 'SIGNAL', signalType: 'calendar_add', itemTitle: plan.title })
                    dispatch({ type: 'TOAST', message: `🗓️ 已加入日历 · ${plan.when}` })
                  }}
                >
                  {didCal ? '✓ 已加入日历' : '🗓️ 加入日历'}
                </button>
              </div>
            </div>

            <div className="sheet-actions">
              {canReroll && (
                <button className="btn-ghost" onClick={reroll}>
                  ↻ 换个玩法
                </button>
              )}
              <button
                className="btn-primary"
                disabled={saved}
                onClick={() => {
                  setSaved(true)
                  dispatch({ type: 'ADD_PLAN', plan })
                  dispatch({ type: 'TOAST', message: '✅ 计划已保存到「计划」' })
                  dispatch({ type: 'CLOSE_PLANNING' })
                  dispatch({ type: 'SET_TAB', tab: 'plans' })
                }}
              >
                {saved ? '已保存' : '保存这份计划'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
