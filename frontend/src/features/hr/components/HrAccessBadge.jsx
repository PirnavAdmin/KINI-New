import { ShieldCheck } from 'lucide-react'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'

/**
 * HrAccessBadge — visual indicator of the logged-in HR user's access.
 * Shows the resolved HR role (HR Executive / HR Coordinator / HR Manager)
 * plus its access-level badge (Editor / Manager / Administrator). Rendered on
 * every HR page via HRPage.
 */
export default function HrAccessBadge() {
  const { roleLabel, accessLevel, roleColor, permissionSource, grantedCount } = useHrPermissions()

  return (
    <span
      title={`${roleLabel} · ${accessLevel} access`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold"
      style={{
        backgroundColor: `${roleColor}12`,
        borderColor: `${roleColor}30`,
        color: roleColor,
      }}
    >
      <ShieldCheck className="h-3 w-3" />
      {roleLabel}
      <span
        className="ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white"
        style={{ backgroundColor: roleColor }}
      >
        {accessLevel}
      </span>
      {/* ENTERPRISE RBAC — custom profiles show their granted permission count. */}
      {permissionSource === 'custom' && (
        <span className="ml-0.5 rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-extrabold dark:bg-slate-800/80">
          {grantedCount} permissions
        </span>
      )}
    </span>
  )
}
