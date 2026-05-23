import { useStore } from './store'
import { FeedScreen } from './screens/FeedScreen'
import { PlansScreen } from './screens/PlansScreen'
import { MeScreen } from './screens/MeScreen'
import { BottomNav } from './components/BottomNav'
import { ArticleReader } from './components/ArticleReader'
import { CommitSheet } from './components/CommitSheet'
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
  { emoji: '📰', label: '本地内容流(新闻 + 推荐)' },
  { emoji: '✨', label: '形成出行意图' },
  { emoji: '📌', label: '加入计划(轻量承诺)' },
  { emoji: '🚀', label: '真实行动' },
  { emoji: '💜', label: '偏好画像回流' },
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
            {state.planning && <CommitSheet />}
            {state.viewPlanId && <ViewPlanSheet />}
            <Toast />
          </div>
        </div>
      </div>

      <aside className="legend">
        <div className="legend-brand">
          <span className="legend-dot" /> NewsBreak Local
        </div>
        <h1>本地内容驱动的决策引擎</h1>
        <p>
          交互式 MVP 演示。把 NewsBreak 的本地内容流变成出行意图,再变成一个
          会被记住、真的去成的<strong>本地行动</strong>。出行意图有两个来源:
        </p>
        <div className="legend-cards">
          <div className="legend-card">
            <span className="lc-dot a" />
            <div className="lc-text">
              <strong>文章卡 · 读出意图</strong>
              <span>从用户真实读过的本地新闻报道里「读」出出行意图</span>
            </div>
          </div>
          <div className="legend-card">
            <span className="lc-dot d" />
            <div className="lc-text">
              <strong>发现卡 · 带动意图</strong>
              <span>
                从 Yelp / Google / Ticketmaster 挖出小众新店、亲子去处、
                周末玩乐与热门活动
              </span>
            </div>
          </div>
        </div>
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
          <li>停留任意一张卡片 → 引擎形成一条出行意图</li>
          <li>文章卡可读全文与原文链接;发现卡含真实评分与评论</li>
          <li>POI 由 Yelp / Google Places 实时数据富化</li>
          <li>定时抓取的本地新内容,会自动排到信息流最前面,每张卡上方都标了更新时间</li>
          <li>信息流顶部有编辑主题廊道(关店告别 / 入夏 / BTS 食堂 …),点击筛选当下策展</li>
          <li>「加入计划」把想去的存成会提醒你的小约定,可选展开成一日行程</li>
          <li>卡片可标记「不感兴趣」—— 正负反馈都回流引擎</li>
          <li>「我的」页:偏好画像 + 用户画像(带娃 / 约会 / 单身…)+ WLA</li>
        </ul>
        <div className="legend-foot">
          真实本地报道 · 真实 API 数据 · WLA 为北极星指标
        </div>
      </aside>
    </div>
  )
}
