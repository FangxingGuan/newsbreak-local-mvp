import { useStore } from '../store'
import { VERTICALS } from '../data'

export function PlansScreen() {
  const { state, dispatch } = useStore()
  const { plans } = state

  return (
    <div className="screen">
      <header className="appbar simple">
        <h1>我的计划</h1>
        <p>由 Feed 触发、一键生成的本地行程都会留在这里。</p>
      </header>

      {plans.length === 0 ? (
        <div className="empty">
          <span className="empty-emoji">🗂️</span>
          <h3>还没有计划</h3>
          <p>
            回到「发现」,在感兴趣的卡片上停留一会儿,
            就能触发并生成你的第一份本地行程。
          </p>
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'feed' })}
          >
            去发现 →
          </button>
        </div>
      ) : (
        <div className="plan-list">
          {plans.map((p) => {
            const v = VERTICALS.find((x) => x.id === p.vertical)
            return (
              <button
                key={p.id}
                className="plancard"
                onClick={() => dispatch({ type: 'VIEW_PLAN', id: p.id })}
              >
                <span className="plancard-emoji">{v?.emoji}</span>
                <span className="plancard-info">
                  <span className="plancard-title">{p.title}</span>
                  <span className="plancard-meta">
                    {p.when} · {p.stops.length} 站 · 源自「{p.basedOnTitle}」
                  </span>
                </span>
                <span className="plancard-arrow">›</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
