// Global demo state: one reducer driving the whole core loop.
// feed → intent trigger → planning → real-world action → preference signals

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Plan, Signal, SignalType, Tab, Vertical } from './types'

const SIGNAL_LABEL: Record<SignalType, string> = {
  dwell: '停留浏览',
  save: '收藏',
  plan_generated: '生成计划',
  map_open: '打开地图导航',
  calendar_add: '加入日历',
  repeat_plan: '再次规划',
}

/** Signal types that count toward the North Star metric (Weekly Local Actions). */
const WLA_TYPES: SignalType[] = ['plan_generated', 'map_open', 'calendar_add', 'repeat_plan']

interface State {
  tab: Tab
  vertical: Vertical
  saved: string[]
  dwelled: string[]
  signals: Signal[]
  plans: Plan[]
  detailId: string | null
  planningId: string | null
  viewPlanId: string | null
  viewNewsId: string | null
  toast: string | null
}

const initialState: State = {
  tab: 'feed',
  vertical: 'dining',
  saved: [],
  dwelled: [],
  signals: [],
  plans: [],
  detailId: null,
  planningId: null,
  viewPlanId: null,
  viewNewsId: null,
  toast: null,
}

type Action =
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_VERTICAL'; vertical: Vertical }
  | { type: 'DWELL'; id: string; title: string }
  | { type: 'TOGGLE_SAVE'; id: string; title: string }
  | { type: 'OPEN_DETAIL'; id: string }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'OPEN_PLANNING'; id: string }
  | { type: 'CLOSE_PLANNING' }
  | { type: 'ADD_PLAN'; plan: Plan }
  | { type: 'VIEW_PLAN'; id: string | null }
  | { type: 'OPEN_NEWS'; id: string }
  | { type: 'CLOSE_NEWS' }
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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab }
    case 'SET_VERTICAL':
      return { ...state, vertical: action.vertical }
    case 'DWELL': {
      if (state.dwelled.includes(action.id)) return state
      return {
        ...state,
        dwelled: [...state.dwelled, action.id],
        signals: [makeSignal('dwell', action.title), ...state.signals],
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
    case 'OPEN_DETAIL':
      return { ...state, detailId: action.id }
    case 'CLOSE_DETAIL':
      return { ...state, detailId: null }
    case 'OPEN_PLANNING':
      return { ...state, planningId: action.id, detailId: null }
    case 'CLOSE_PLANNING':
      return { ...state, planningId: null }
    case 'ADD_PLAN':
      return { ...state, plans: [action.plan, ...state.plans] }
    case 'VIEW_PLAN':
      return { ...state, viewPlanId: action.id }
    case 'OPEN_NEWS':
      return { ...state, viewNewsId: action.id }
    case 'CLOSE_NEWS':
      return { ...state, viewNewsId: null }
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
