// Global demo state: one reducer driving the article-driven core loop, now
// with a second, recommendation-driven card type.

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Plan, Signal, SignalType, Tab } from './types'

const SIGNAL_LABEL: Record<SignalType, string> = {
  read: '看过本地内容',
  plan_generated: '生成行程',
  map_open: '打开地图导航',
  calendar_add: '加入日历',
  save: '收藏地点',
}

/** Signal types that count toward the North Star metric (Weekly Local Actions). */
const WLA_TYPES: SignalType[] = ['plan_generated', 'map_open', 'calendar_add']

type PlanTarget = { kind: 'article' | 'discover'; id: string }

interface State {
  tab: Tab
  read: string[]
  seen: string[]
  saved: string[]
  signals: Signal[]
  plans: Plan[]
  openArticleId: string | null
  planning: PlanTarget | null
  viewPlanId: string | null
  toast: string | null
}

const initialState: State = {
  tab: 'feed',
  read: [],
  seen: [],
  saved: [],
  signals: [],
  plans: [],
  openArticleId: null,
  planning: null,
  viewPlanId: null,
  toast: null,
}

type Action =
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'READ'; id: string; title: string }
  | { type: 'OPEN_ARTICLE'; id: string; title: string }
  | { type: 'CLOSE_ARTICLE' }
  | { type: 'SEEN'; id: string; title: string }
  | { type: 'TOGGLE_SAVE'; id: string; title: string }
  | { type: 'OPEN_PLANNING'; target: PlanTarget }
  | { type: 'CLOSE_PLANNING' }
  | { type: 'ADD_PLAN'; plan: Plan }
  | { type: 'VIEW_PLAN'; id: string | null }
  | { type: 'SIGNAL'; signalType: SignalType; itemTitle?: string }
  | { type: 'TOAST'; message: string | null }

let signalSeq = 0
function makeSignal(type: SignalType, itemTitle?: string): Signal {
  return {
    id: `s${++signalSeq}`,
    type,
    label: SIGNAL_LABEL[type],
    itemTitle,
    ts: Date.now(),
  }
}

/** Marks an article read and records the signal once. */
function markRead(state: State, id: string, title: string): State {
  if (state.read.includes(id)) return state
  return {
    ...state,
    read: [...state.read, id],
    signals: [makeSignal('read', title), ...state.signals],
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab }
    case 'READ':
      return markRead(state, action.id, action.title)
    case 'OPEN_ARTICLE':
      return { ...markRead(state, action.id, action.title), openArticleId: action.id }
    case 'CLOSE_ARTICLE':
      return { ...state, openArticleId: null }
    case 'SEEN': {
      if (state.seen.includes(action.id)) return state
      return {
        ...state,
        seen: [...state.seen, action.id],
        signals: [makeSignal('read', action.title), ...state.signals],
      }
    }
    case 'TOGGLE_SAVE': {
      const has = state.saved.includes(action.id)
      return {
        ...state,
        saved: has
          ? state.saved.filter((s) => s !== action.id)
          : [...state.saved, action.id],
        signals: has
          ? state.signals
          : [makeSignal('save', action.title), ...state.signals],
      }
    }
    case 'OPEN_PLANNING':
      return { ...state, planning: action.target }
    case 'CLOSE_PLANNING':
      return { ...state, planning: null }
    case 'ADD_PLAN':
      return { ...state, plans: [action.plan, ...state.plans] }
    case 'VIEW_PLAN':
      return { ...state, viewPlanId: action.id }
    case 'SIGNAL':
      return {
        ...state,
        signals: [makeSignal(action.signalType, action.itemTitle), ...state.signals],
      }
    case 'TOAST':
      return { ...state, toast: action.message }
    default:
      return state
  }
}

interface StoreValue {
  state: State
  dispatch: React.Dispatch<Action>
  wla: number
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const wla = useMemo(
    () => state.signals.filter((s) => WLA_TYPES.includes(s.type)).length,
    [state.signals],
  )
  return (
    <StoreContext.Provider value={{ state, dispatch, wla }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
