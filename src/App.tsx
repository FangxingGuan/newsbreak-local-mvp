import { useStore } from './store'
import { FeedScreen } from './screens/FeedScreen'
import { PlansScreen } from './screens/PlansScreen'
import { MeScreen } from './screens/MeScreen'
import { BottomNav } from './components/BottomNav'
import { DetailSheet } from './components/DetailSheet'
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
  { emoji: '📰', label: '高频 Feed' },
  { emoji: '✨', label: '意图触发' },
  { emoji: '🗺️', label: '轻量规划' },
  { emoji: '🚀', label: '真实行动' },
  { emoji: '💜', label: '偏好信号' },
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
            {state.detailId && <DetailSheet />}
            {state.planningId && <PlanSheet />}
            {state.viewPlanId && <ViewPlanSheet />}
            <Toast />
          </div>
        </div>
      </div>

      <aside className="legend">
        <div className="legend-brand">
          <span className="legend-dot" /> NewsBreak Local
        </div>
        <h1>本地生活决策引擎</h1>
        <p>
          这是一个交互式 MVP 演示。把 NewsBreak 从「本地新闻流」升级为
          「由 Feed 驱动的本地决策引擎」。
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
          <li>在 Feed 里停留某张卡片约 2 秒 → 触发出行意图</li>
          <li>点开卡片 → 一键生成轻量行程</li>
          <li>「打开地图 / 加入日历」即为真实本地行动</li>
          <li>「我的」页可见行为信号与北极星指标 WLA</li>
        </ul>
        <div className="legend-foot">演示数据均为模拟 · 无需联网</div>
      </aside>
    </div>
  )
}
