export function Icon({ children, filled = false }) {
  return (
    <span
      aria-hidden="true"
      className="material-symbols-outlined"
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {children}
    </span>
  )
}
