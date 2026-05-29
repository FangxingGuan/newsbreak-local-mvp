// Global demo state: one reducer driving the article-driven core loop, now
// with a second, recommendation-driven card type.

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Plan, RadiusStyle, Signal, SignalType, Tab } from './types'

const SIGNAL_LABEL: Record<SignalType, string> = {
  read: '读了一篇文章',
  seen: '看了一张推荐卡',
  commit: '加入计划',
  map_open: '打开地图导航',
  calendar_add: '加入日历',
  save: '收藏地点',
  dismiss: '标记「不感兴趣」',
}

/**
 * Weekly Local Actions counts only *real-world* actions — opening directions
 * and adding to the calendar. Committing to a plan is intent, not yet an action.
 */
const WLA_TYPES: SignalType[] = ['map_open', 'calendar_add']

type PlanTarget = { kind: 'article' | 'discover'; id: string }

interface State {
  tab: Tab
  /** Cards dwelled on (~2s) — a weak "glanced at it" signal. */
  read: string[]
  seen: string[]
  /** Content actually opened (tapped through) — a real interaction. */
  opened: string[]
  saved: string[]
  /** Content the user explicitly marked "not interested" — negative signal. */
  dismissed: string[]
  signals: Signal[]
  plans: Plan[]
  openArticleId: string | null
  planning: PlanTarget | null
  viewPlanId: string | null
  toast: string | null
  /** How far the user is willing to travel — drives per-category feed filtering. */
  radiusStyle: RadiusStyle
}

const initialState: State = {
  tab: 'feed',
  read: [],
  seen: [],
  opened: [],
  saved: [],
  dismissed: [],
  signals: [],
  plans: [],
  openArticleId: null,
  planning: null,
  viewPlanId: null,
  toast: null,
  radiusStyle: 'peninsula',
}

type Action =
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'READ'; id: string; title: string }
  | { type: 'OPEN_ARTICLE'; id: string; title: string }
  | { type: 'CLOSE_ARTICLE' }
  | { type: 'SEEN'; id: string; title: string }
  | { type: 'TOGGLE_SAVE'; id: string; title: string }
  | { type: 'DISMISS'; id: string; title: string }
  | { type: 'UNDISMISS'; id: string }
  | { type: 'OPEN_PLANNING'; target: PlanTarget }
  | { type: 'CLOSE_PLANNING' }
  | { type: 'ADD_PLAN'; plan: Plan }
  | { type: 'VIEW_PLAN'; id: string | null }
  | { type: 'SIGNAL'; signalType: SignalType; itemTitle?: string; refId?: string }
  | { type: 'TOAST'; message: string | null }
  | { type: 'SET_RADIUS_STYLE'; style: RadiusStyle }

let signalSeq = 0
function makeSignal(type: SignalType, itemTitle?: string, refId?: string): Signal {
  return {
    id: `s${++signalSeq}`,
    type,
    label: SIGNAL_LABEL[type],
    itemTitle,
    refId,
    ts: Date.now(),
  }
}

/** Marks an article read and records the signal once. */
function markRead(state: State, id: string, title: string): State {
  if (state.read.includes(id)) return state
  return {
    ...state,
    read: [...state.read, id],
    signals: [makeSignal('read', title, id), ...state.signals],
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab }
    case 'READ':
      return markRead(state, action.id, action.title)
    case 'OPEN_ARTICLE':
      return {
        ...markRead(state, action.id, action.title),
        openArticleId: action.id,
        opened: state.opened.includes(action.id)
          ? state.opened
          : [...state.opened, action.id],
      }
    case 'CLOSE_ARTICLE':
      return { ...state, openArticleId: null }
    case 'SEEN': {
      if (state.seen.includes(action.id)) return state
      return {
        ...state,
        seen: [...state.seen, action.id],
        signals: [makeSignal('seen', action.title, action.id), ...state.signals],
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
          : [makeSignal('save', action.title, action.id), ...state.signals],
      }
    }
    case 'DISMISS': {
      if (state.dismissed.includes(action.id)) return state
      return {
        ...state,
        dismissed: [...state.dismissed, action.id],
        signals: [makeSignal('dismiss', action.title, action.id), ...state.signals],
      }
    }
    case 'UNDISMISS':
      return {
        ...state,
        dismissed: state.dismissed.filter((d) => d !== action.id),
        signals: state.signals.filter(
          (s) => !(s.type === 'dismiss' && s.refId === action.id),
        ),
      }
    case 'OPEN_PLANNING':
      return {
        ...state,
        planning: action.target,
        opened: state.opened.includes(action.target.id)
          ? state.opened
          : [...state.opened, action.target.id],
      }
    case 'CLOSE_PLANNING':
      return { ...state, planning: null }
    case 'ADD_PLAN':
      return { ...state, plans: [action.plan, ...state.plans] }
    case 'VIEW_PLAN':
      return { ...state, viewPlanId: action.id }
    case 'SIGNAL': {
      const { signalType, itemTitle, refId } = action
      // A real-world action counts once per plan: opening the map or adding
      // to the calendar for the same plan must not inflate WLA on re-tap.
      if (
        WLA_TYPES.includes(signalType) &&
        refId != null &&
        state.signals.some((s) => s.type === signalType && s.refId === refId)
      ) {
        return state
      }
      return {
        ...state,
        signals: [makeSignal(signalType, itemTitle, refId), ...state.signals],
      }
    }
    case 'TOAST':
      return { ...state, toast: action.message }
    case 'SET_RADIUS_STYLE':
      return { ...state, radiusStyle: action.style }
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
