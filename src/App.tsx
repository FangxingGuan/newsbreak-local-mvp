import { useStore } from './store'
import { FeedScreen } from './screens/FeedScreen'
import { PlansScreen } from './screens/PlansScreen'
import { MeScreen } from './screens/MeScreen'
import { BottomNav } from './components/BottomNav'
import { ArticleReader } from './components/ArticleReader'
import { PlanSheet } from './components/PlanSheet'
import { ViewPlanSheet } from './components/ViewPlanSheet'
import { Toast } from './components/Toast'

function StatusBar() {
  return (
    <div className="statusbar">
      <span className="sb-time">9:41</span>
      <span className="sb-icons">
        <span>●●●</span>
        <span>📶</span>
        <span>🔋</span>
      </span>
    </div>
  )
}

const LOOP = [
  { emoji: '📰', label: '本地文章流' },
  { emoji: '✨', label: '读出出行意图' },
  { emoji: '🗺️', label: '轻量规划' },
  { emoji: '🚀', label: '真实行动' },
  { emoji: '💜', label: '阅读偏好信号' },
]

export function App() {
  const { state } = useStore()

  return (
    <div className="stage">
      <div className="phone">
        <div className="bezel">
          <div className="notch" />
          <div className="device-screen">
            <StatusBar />
            <div className="screen-body">
              {state.tab === 'feed' && <FeedScreen />}
              {state.tab === 'plans' && <PlansScreen />}
              {state.tab === 'me' && <MeScreen />}
            </div>
            <BottomNav />
            {state.openArticleId && <ArticleReader />}
            {state.planningArticleId && <PlanSheet />}
            {state.viewPlanId && <ViewPlanSheet />}
            <Toast />
          </div>
        </div>
      </div>

      <aside className="legend">
        <div className="legend-brand">
          <span className="legend-dot" /> NewsBreak Local
        </div>
        <h1>文章驱动的本地决策引擎</h1>
        <p>
          交互式 MVP 演示。不主动推荐 —— 出行意图全部从用户
          <strong>真实读过的本地新闻</strong>里「读」出来。
        </p>
        <div className="legend-loop">
          {LOOP.map((s, i) => (
            <div className="legend-step" key={s.label}>
              <span className="legend-emoji">{s.emoji}</span>
              <span className="legend-label">{s.label}</span>
              {i < LOOP.length - 1 && <span className="legend-arrow">↓</span>}
            </div>
          ))}
        </div>
        <ul className="legend-tips">
          <li>在 feed 里停留某篇文章约 2 秒 → 引擎读出出行意图</li>
          <li>点开文章 → 读全文,文末是抽取出的真实 POI</li>
          <li>POI 由 Yelp / Google Places 实时数据富化</li>
          <li>「规划进行程」把文章里的地点编成一条行程</li>
          <li>「我的」页可见阅读信号与北极星指标 WLA</li>
        </ul>
        <div className="legend-foot">POI 为真实 API 数据 · 文章为真实本地报道</div>
      </aside>
    </div>
  )
}
