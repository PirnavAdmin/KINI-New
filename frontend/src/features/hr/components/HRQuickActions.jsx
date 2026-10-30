import { LockKeyhole } from 'lucide-react'
import Button from '@shared/components/Button'
import HrTooltip from '@features/hr/components/HrTooltip'

/**
 * HRQuickActions — horizontal smart-action button row (Add / Edit / Approve /
 * Assign / Export / Import / Download / Generate Report / Print / View History).
 * Built on the shared Button component; each action: { label, icon, onClick, variant, size }.
 *
 * PERMISSION-AWARE (ENTERPRISE RBAC) — pass `can={can}` plus a `permission`
 * tuple on each action: { permission: ['module','action'] }. Actions the user
 * cannot perform are HIDDEN entirely (never disabled) — exactly the spec's
 * "Do NOT disable buttons. Do NOT show unauthorized actions." Actions without
 * a `permission` field always render (e.g. pure view toggles).
 *
 * Legacy `disabled: true` actions (from the older disable-with-tooltip UX) are
 * still supported for callers that opt in — they render locked with a tooltip.
 */
export default function HRQuickActions({ actions = [], can, className = '' }) {
  const visibleActions = can
    ? actions.filter((action) => {
        if (!action.permission) return true
        const [module, actionKey] = action.permission
        return can(module, actionKey)
      })
    : actions

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {visibleActions.map((action) => {
        const { key, label, icon: Icon, onClick, variant = 'secondary', size = 'sm', disabled = false, tooltip } = action
        const button = (
          <Button
            key={key || label}
            variant={variant}
            size={size}
            icon={disabled ? LockKeyhole : Icon}
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled || undefined}
          >
            {label}
          </Button>
        )
        if (!disabled) return button
        return (
          <HrTooltip key={key || label} text={tooltip || "You don't have permission to perform this action."} side="bottom">
            {button}
          </HrTooltip>
        )
      })}
    </div>
  )
}
