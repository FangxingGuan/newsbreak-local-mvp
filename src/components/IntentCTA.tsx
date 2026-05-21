interface Props {
  label: string
  intent: string
  onClick: () => void
}

/**
 * The intent call-to-action — one shared, tappable element used identically
 * on article cards and discover cards. It surfaces after a dwell: the engine
 * has read an intent, and the whole block is the call to act on it.
 */
export function IntentCTA({ label, intent, onClick }: Props) {
  return (
    <button className="intent-cta" onClick={onClick}>
      <span className="intent-cta-label">✨ {label}</span>
      <span className="intent-cta-text">{intent} →</span>
    </button>
  )
}
