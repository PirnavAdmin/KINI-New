import { useId } from 'react'

/**
 * HrTooltip — lightweight accessible tooltip for the Kini HRMS.
 * Pure CSS (no portal, no state) — shows on hover / focus-within.
 * Used for permission hints like "You don't have permission to perform
 * this action." and contextual help on disabled controls.
 */
const POSITIONS = {
  top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
  right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
}

export default function HrTooltip({ text, children, side = 'top', className = '', delay = 120 }) {
  const id = useId()
  if (!text) return children
  return (
    <span className={`group/tooltip relative inline-flex ${className}`} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-[80] whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 dark:bg-slate-700 ${POSITIONS[side] || POSITIONS.top}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {text}
      </span>
    </span>
  )
}
