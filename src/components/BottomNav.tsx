import { useStore } from '../store'
import type { Tab } from '../types'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'feed', label: '发现', emoji: '🧭' },
  { id: 'plans', label: '计划', emoji: '🗂️' },
  { id: 'me', label: '我的', emoji: '👤' },
]

export function BottomNav() {
  const { state, dispatch } = useStore()
  return (
    <nav className="bottomnav">
      {TABS.map((t) => {
        const active = state.tab === t.id
        const badge = t.id === 'plans' && state.plans.length > 0
        return (
          <button
            key={t.id}
            className={`navitem ${active ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}
          >
            <span className="navemoji">
              {t.emoji}
              {badge && <span className="navbadge">{state.plans.length}</span>}
            </span>
            <span className="navlabel">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
