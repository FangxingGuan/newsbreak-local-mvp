import { useStore } from '../store'
import { getItem } from '../data'

export function DetailSheet() {
  const { state, dispatch } = useStore()
  const item = state.detailId ? getItem(state.detailId) : undefined
  if (!item) return null

  const saved = state.saved.includes(item.id)
  const close = () => dispatch({ type: 'CLOSE_DETAIL' })

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div
          className="detail-cover"
          style={item.image ? undefined : { background: item.cover }}
        >
          {item.image ? (
            <img className="detail-photo" src={item.image} alt="" />
          ) : (
            <span className="card-emoji big">{item.emoji}</span>
          )}
          <span className="card-kind">{item.kind}</span>
        </div>

        <div className="detail-body">
          <div className="card-title-row">
            <h2>{item.title}</h2>
            {item.rating != null && (
              <span className="card-rating">★ {item.rating.toFixed(1)}</span>
            )}
          </div>
          <div className="card-meta">
            {[item.category, item.neighborhood, item.distance, item.price]
              .filter(Boolean)
              .join(' · ')}
          </div>
          <p className="detail-blurb">{item.blurb}</p>
          <div className="card-tags">
            {item.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>

          <div className="detail-loop">
            <span className="loop-pill">第 2 步 · 意图触发</span>
            下一步:让 NewsBreak 围绕这里生成一份轻量行程。
          </div>
        </div>

        <div className="sheet-actions">
          <button
            className={`btn-ghost ${saved ? 'on' : ''}`}
            onClick={() =>
              dispatch({ type: 'TOGGLE_SAVE', id: item.id, title: item.title })
            }
          >
            {saved ? '♥ 已收藏' : '♡ 收藏'}
          </button>
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: 'OPEN_PLANNING', id: item.id })}
          >
            ✨ {item.intentLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
