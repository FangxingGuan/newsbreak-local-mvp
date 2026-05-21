import { useStore } from '../store'
import { getNews } from '../data'

/** Full-article reader for a news card. */
export function NewsArticleSheet() {
  const { state, dispatch } = useStore()
  const article = state.viewNewsId ? getNews(state.viewNewsId) : undefined
  if (!article) return null

  const close = () => dispatch({ type: 'CLOSE_NEWS' })

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />

        <div
          className="article-hero"
          style={article.image ? undefined : { background: article.cover }}
        >
          {article.image ? (
            <img className="detail-photo" src={article.image} alt="" />
          ) : (
            <span className="card-emoji big">{article.emoji}</span>
          )}
        </div>

        <div className="article-body-wrap">
          <div className="article-cat">📰 {article.category}</div>
          <h1 className="article-title">{article.headline}</h1>
          <div className="article-byline">
            <span className="article-source">{article.source}</span>
            <span>· {article.publishedAgo}</span>
            <span>· 💬 {article.comments}</span>
            <span>· 👍 {article.reactions}</span>
          </div>

          {article.body.map((p, i) => (
            <p className="article-p" key={i}>
              {p}
            </p>
          ))}

          {article.linkId ? (
            <button
              className="article-hook article-hook-btn"
              onClick={() => {
                dispatch({ type: 'CLOSE_NEWS' })
                dispatch({ type: 'OPEN_DETAIL', id: article.linkId! })
              }}
            >
              <strong>✨ 出行意图</strong> · {article.hook} →
            </button>
          ) : (
            <div className="article-hook">
              <strong>✨ 出行意图</strong> · {article.hook}
            </div>
          )}
        </div>

        <div className="sheet-actions">
          <button className="btn-primary" onClick={close}>
            完成阅读
          </button>
        </div>
      </div>
    </div>
  )
}
