import { useStore } from '../store'

export function PlansScreen() {
  const { state, dispatch } = useStore()
  const { plans } = state

  return (
    <div className="screen">
      <header className="appbar simple">
        <h1>我的计划</h1>
        <p>从你读过的文章里生成的本地行程都会留在这里。</p>
      </header>

      {plans.length === 0 ? (
        <div className="empty">
          <span className="empty-emoji">🗂️</span>
          <h3>还没有计划</h3>
          <p>
            回到「发现」,读一篇本地文章 —— NewsBreak 会从文章里
            读出地点和意图,帮你生成第一份行程。
          </p>
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'feed' })}
          >
            去读文章 →
          </button>
        </div>
      ) : (
        <div className="plan-list">
          {plans.map((p) => {
            const anchor = p.stops.find((s) => s.anchor)
            return (
              <button
                key={p.id}
                className="plancard"
                onClick={() => dispatch({ type: 'VIEW_PLAN', id: p.id })}
              >
                <span className="plancard-emoji">{anchor?.emoji ?? '🗺️'}</span>
                <span className="plancard-info">
                  <span className="plancard-title">{p.title}</span>
                  <span className="plancard-meta">
                    {p.when} · {p.stops.length} 站 · 源自《{p.basedOnTitle}》
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
