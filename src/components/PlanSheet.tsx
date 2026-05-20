import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { generatePlan, getItem } from '../data'
import type { Plan } from '../types'

const STEPS = ['读取你的浏览与收藏偏好…', '匹配附近相关地点…', '编排一条轻量行程…']

export function PlanSheet() {
  const { state, dispatch } = useStore()
  const item = state.planningId ? getItem(state.planningId) : undefined

  const [phase, setPhase] = useState<'loading' | 'ready'>('loading')
  const [stepIdx, setStepIdx] = useState(0)
  const [saved, setSaved] = useState(false)
  const [didMap, setDidMap] = useState(false)
  const [didCal, setDidCal] = useState(false)
  const planRef = useRef<Plan | null>(null)
  if (item && !planRef.current) planRef.current = generatePlan(item)

  // True if the user has already planned in this vertical before → repeat planning.
  const isRepeat = useRef(
    item ? state.plans.some((p) => p.vertical === item.vertical) : false,
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

  if (!item || !planRef.current) return null
  const plan = planRef.current
  const close = () => dispatch({ type: 'CLOSE_PLANNING' })

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet plan" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />

        {phase === 'loading' ? (
          <div className="plan-loading">
            <div className="plan-spinner" />
            <h3>✨ 正在为你规划</h3>
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
              <div className="plan-when">🗓️ {plan.when} · 共 {plan.stops.length} 站</div>
              {isRepeat.current && (
                <div className="plan-repeat">↻ 你常规划这一类 · 已按偏好微调</div>
              )}
            </div>

            <div className="timeline">
              {plan.stops.map((s, i) => (
                <div className={`tstop ${s.anchor ? 'anchor' : ''}`} key={i}>
                  <div className="tstop-rail">
                    <span className="tstop-dot">{s.emoji}</span>
                    {i < plan.stops.length - 1 && <span className="tstop-line" />}
                  </div>
                  <div className="tstop-body">
                    <div className="tstop-time">{s.time}</div>
                    <div className="tstop-title">
                      {s.title}
                      {s.anchor && <span className="anchor-tag">来自 Feed</span>}
                    </div>
                    <div className="tstop-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
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
              <button className="btn-ghost" onClick={close}>
                关闭
              </button>
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
