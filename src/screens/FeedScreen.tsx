import { useLayoutEffect, useRef, useState } from 'react'
import {
  ARTICLES,
  DISCOVER,
  RADIUS_LABELS,
  THEMES,
  USER_LOCATION,
  isDiscover,
  isThemeLive,
  themeEntries,
  withinRadius,
} from '../data'
import { ArticleCard } from '../components/ArticleCard'
import { DiscoverCard } from '../components/DiscoverCard'
import { useStore } from '../store'
import type { FeedEntry } from '../types'

/** Weave articles and discover cards evenly, whatever their relative counts. */
function buildFeed(articles: FeedEntry[], discover: FeedEntry[]): FeedEntry[] {
  const out: FeedEntry[] = []
  let ai = 0
  let di = 0
  const total = articles.length + discover.length
  for (let i = 0; i < total; i++) {
    const takeArticle =
      ai < articles.length &&
      (di >= discover.length ||
        (ai + 1) / articles.length <= (di + 1) / discover.length)
    out.push(takeArticle ? articles[ai++] : discover[di++])
  }
  return out
}

/**
 * Tabs are conditionally rendered in App, so the feed remounts each time the
 * user returns to it. Keep its scroll position so committing a plan (which
 * jumps to the Plans tab) doesn't drop the user back at the very top.
 */
let savedScroll = 0

/**
 * Final feed order: every freshly-added entry (anything carrying an `addedAt`,
 * across both types) sorts by timestamp descending and lands above the
 * original content. Below the fresh band, the original article/discover weave
 * is preserved. Sorting both types together — not weaving them — keeps the
 * latest update batch at the very top regardless of relative type counts.
 */
function orderedFeed(): FeedEntry[] {
  const freshArticles = ARTICLES.filter((a) => a.addedAt)
  const staleArticles = ARTICLES.filter((a) => !a.addedAt)
  const freshDiscover = DISCOVER.filter((d) => d.addedAt)
  const staleDiscover = DISCOVER.filter((d) => !d.addedAt)
  const fresh = [...freshArticles, ...freshDiscover].sort((a, b) =>
    (b.addedAt ?? '').localeCompare(a.addedAt ?? ''),
  )
  return [...fresh, ...buildFeed(staleArticles, staleDiscover)]
}

export function FeedScreen() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [themeId, setThemeId] = useState<string | null>(null)
  const { state } = useStore()
  const style = state.radiusStyle

  // Only the currently-live themes are shown — seasonal ones expire, thin
  // ones (< minEntries) hide. Cards flow into themes by tag, no manual list.
  const liveThemes = THEMES.filter((t) => isThemeLive(t))
  const theme = themeId
    ? liveThemes.find((t) => t.id === themeId) ?? null
    : null

  const allUnfiltered = orderedFeed()
  // Each entry has an implicit category class (daily/weekend/destination)
  // derived from its tags. The user's radius style sets max miles per class.
  const all = allUnfiltered.filter((e) => withinRadius(e, style))
  const hiddenByRadius = allUnfiltered.length - all.length

  const entries = theme
    ? // Inside a theme, keep the natural feed order (newest first) over the
      // theme's entry set; pinned + tag-matched entries are dynamically
      // resolved by themeEntries(), then filtered by the radius too.
      (() => {
        const idSet = new Set(themeEntries(theme).map((e) => e.id))
        return all.filter((e) => idSet.has(e.id))
      })()
    : all

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = savedScroll
    return () => {
      if (el) savedScroll = el.scrollTop
    }
  }, [])

  return (
    <div className="screen feed" ref={scrollRef}>
      <header className="appbar">
        <div className="appbar-top">
          <div className="logo">
            <span className="logo-mark">N</span> NewsBreak
            <span className="logo-sub">Local</span>
          </div>
          <span className="appbar-loc">📍 {USER_LOCATION}</span>
        </div>
      </header>

      {liveThemes.length > 0 && (
        <div className="theme-strip">
          {liveThemes.map((t) => {
            const count = themeEntries(t).filter((e) => withinRadius(e, style)).length
            return (
              <button
                key={t.id}
                className={`theme-card ${themeId === t.id ? 'on' : ''}`}
                style={{ background: t.cover }}
                onClick={() => setThemeId(themeId === t.id ? null : t.id)}
              >
                <span className="theme-emoji">{t.emoji}</span>
                <span className="theme-title">{t.title}</span>
                <span className="theme-sub">
                  {t.subtitle} · {count} 篇
                </span>
              </button>
            )
          })}
        </div>
      )}

      {theme ? (
        <div className="theme-filter-bar">
          <span>
            🔍 主题筛选:{theme.emoji} {theme.title}
          </span>
          <button onClick={() => setThemeId(null)}>✕ 看全部</button>
        </div>
      ) : (
        <div className="feed-hint">
          <span className="hint-dot live" />
          本地新闻 + 为你发现的小众好去处 · 上方主题廊道一眼看清本周策展
        </div>
      )}

      <div className="feed-list">
        {entries.map((e) =>
          isDiscover(e) ? (
            <DiscoverCard key={e.id} card={e} scrollRoot={scrollRef} />
          ) : (
            <ArticleCard key={e.id} article={e} scrollRoot={scrollRef} />
          ),
        )}
        {hiddenByRadius > 0 && (
          <div className="feed-radius-note">
            🏠 还有 {hiddenByRadius} 张在你「{RADIUS_LABELS[style]}」的半径之外 ——
            到「我」页换成「跨湾也行」可以看到全部
          </div>
        )}
        <div className="feed-end">— 已经到底啦 —</div>
      </div>
    </div>
  )
}
