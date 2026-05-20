import { useEffect } from 'react'
import { useStore } from '../store'

export function Toast() {
  const { state, dispatch } = useStore()
  const { toast } = state

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => dispatch({ type: 'TOAST', message: null }), 2600)
    return () => clearTimeout(t)
  }, [toast, dispatch])

  if (!toast) return null
  return (
    <div className="toast" role="status">
      {toast}
    </div>
  )
}
