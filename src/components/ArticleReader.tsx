import { useStore } from '../store'
import { getArticle } from '../data'
import type { ArticlePOI } from '../types'

const STATUS: Record<ArticlePOI['status'], { label: string; cls: string }> = {
  open: { label: '营业中', cls: 'open' },
  opening: { label: '即将开业', cls: 'opening' },
  closed: { label: '已歇业', cls: 'closed' },
}

/** A POI extracted from the article, enriched with live API data. */
function PoiCard({ poi }: { poi: ArticlePOI }) {
  const { state, dispatch } = useStore()
  const saved = state.saved.includes(poi.id)
  const st = STATUS[poi.status]

  return (
    <div className="poi">
      <div className="poi-main">
        <div
          className="poi-thumb"
          style={poi.image ? undefined : { background: poi.cover }}
        >
          {poi.image ? (
            <img className="acard-photo" src={poi.image} alt="" loading="lazy" />
          ) : (
            <span className="poi-emoji">{poi.emoji}</span>
          )}
        </div>
        <div className="poi-info">
          <div className="poi-namerow">
            <h4>{poi.name}</h4>
            <span className={`poi-status ${st.cls}`}>{st.label}</span>
          </div>
          {poi.rating != null ? (
            <div className="poi-rate">
              ★ {poi.rating.toFixed(1)} · {poi.reviews?.toLocaleString()} 条评价
              {poi.via && <span className="poi-via"> · {poi.via}</span>}
            </div>
          ) : (
            <div className="poi-rate muted">{poi.note ?? '暂无评价'}</div>
          )}
          <div className="poi-meta">
            {[poi.category, poi.price, poi.distance && `📍 ${poi.distance}`, poi.neighborhood]
              .filter(Boolean)
              .join(' · ')}
          </div>
          <p className="poi-blurb">{poi.blurb}</p>
        </div>
      </div>

      {poi.quotes && poi.quotes.length > 0 && (
        <div className="poi-reviews">
          {poi.quotes.map((r, i) => (
            <div className="poi-review" key={i}>
              <span className="poi-review-stars">{'★'.repeat(r.rating)}</span>
              <span className="poi-review-text">“{r.text}”</span>
              <span className="poi-review-by">
                — {r.author} · {r.source}
              </span>
            </div>
          ))}
        </div>
      )}

      {(poi.yelpUrl || poi.googleUrl) && (
        <div className="poi-links">
          {poi.yelpUrl && (
            <a
              className="poi-link"
              href={poi.yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              在 Yelp 查看 ↗
            </a>
          )}
          {poi.googleUrl && (
            <a
              className="poi-link"
              href={poi.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 地图 ↗
            </a>
          )}
        </div>
      )}

      <button
        className={`poi-save ${saved ? 'on' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_SAVE', id: poi.id, title: poi.name })}
        aria-label="收藏"
      >
        {saved ? '♥' : '♡'}
      </button>
    </div>
  )
}

/** Full-article reader: body + extracted intent + enriched POIs + plan CTA. */
export function ArticleReader() {
  const { state, dispatch } = useStore()
  const article = state.openArticleId ? getArticle(state.openArticleId) : undefined
  if (!article) return null

  const close = () => dispatch({ type: 'CLOSE_ARTICLE' })

  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />

        <div className="article-hero" style={{ background: article.cover }}>
          <span className="card-emoji big">{article.emoji}</span>
        </div>

        <div className="article-body-wrap">
          <div className="article-cat">📰 {article.topic}</div>
          <h1 className="article-title">{article.headline}</h1>
          <div className="article-dek">{article.dek}</div>
          <div className="article-byline">
            <span className="article-source">{article.source}</span>
            <span>· {article.publishedAgo}</span>
            <span>· 💬 {article.comments}</span>
            <span>· 👍 {article.reactions}</span>
          </div>

          <a
            className="article-origin"
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 阅读 {article.source} 原文报道 ↗
          </a>

          {article.body.map((p, i) => (
            <p className="article-p" key={i}>
              {p}
            </p>
          ))}

          <div className="intent-box">
            <div className="intent-box-label">
              ✨ NewsBreak 从这篇文章读到的出行意图
            </div>
            <div className="intent-box-text">{article.intent}</div>
          </div>

          <div className="poi-head">
            📍 文章里的地点 · 已用 Yelp / Google 实时查好评分与评论
          </div>
          {article.pois.map((p) => (
            <PoiCard key={p.id} poi={p} />
          ))}
        </div>

        <div className="sheet-actions">
          <button className="btn-ghost" onClick={close}>
            完成阅读
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              dispatch({ type: 'CLOSE_ARTICLE' })
              dispatch({ type: 'OPEN_PLANNING', articleId: article.id })
            }}
          >
            ✨ 规划进行程
          </button>
        </div>
      </div>
    </div>
  )
}
