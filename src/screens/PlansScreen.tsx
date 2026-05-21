import { useStore } from '../store'

export function PlansScreen() {
  const { state, dispatch } = useStore()
  const { plans } = state

  return (
    <div className="screen">
      <header className="appbar simple">
        <h1>我的计划</h1>
        <p>觉得想去就「加入计划」—— 这里存着你打算去做的本地小约定。</p>
      </header>

      {plans.length === 0 ? (
        <div className="empty">
          <span className="empty-emoji">🗂️</span>
          <h3>还没有计划</h3>
          <p>
            回到「发现」,读一篇本地文章或看张推荐卡 —— 觉得想去,
            「加入计划」就把它存成一个会提醒你的小约定。
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
          {plans.map((p) => (
            <button
              key={p.id}
              className="plancard"
              onClick={() => dispatch({ type: 'VIEW_PLAN', id: p.id })}
            >
              <span className="plancard-emoji">{p.emoji}</span>
              <span className="plancard-info">
                <span className="plancard-title">{p.placeName}</span>
                <span className="plancard-meta">
                  🗓️ {p.when} · 👥 {p.withWhom}
                  {p.remind ? ' · 🔔' : ''}
                  {p.itinerary ? ' · 📋 含一日行程' : ''}
                </span>
              </span>
              <span className="plancard-arrow">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
