import { motion } from 'framer-motion'
import { LockKeyhole } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import HrAccessBadge from '@features/hr/components/HrAccessBadge'
import PageSearch from '@features/hr/components/PageSearch'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import { HR_MODULE_MAP } from '@features/hr/constants/hrMeta'

/**
 * HRPage — premium page shell shared by every Kini HRMS screen.
 * Renders the animated container, a PageHeader (with the module's gradient
 * icon chip + optional "Last updated" pill), the optional global search bar
 * and the page content.
 *
 * UI cleanup — the duplicate breadcrumb label above the page title is removed
 * for every HR page (one main heading only). Each page can opt into a global
 * search bar by passing `search={{ value, onChange, placeholder }}`.
 */
export default function HRPage({
  moduleId,
  title,
  icon: Icon,
  actions,
  lastUpdated,
  search,
  children,
  className = '',
}) {
  const meta = HR_MODULE_MAP[moduleId]
  const accent = meta?.color || '#0f55f7'
  // KINI HRMS RBAC — every HR page surfaces the user's access level and hides
  // the whole module when the HR level has no view permission for it.
  // ENTERPRISE RBAC — custom profiles additionally require the module's View
  // action before any content renders (menu visibility stays per-canModule).
  const { isHrUser, canAccessModule } = useHrPermissions()
  const moduleRestricted = isHrUser && !canAccessModule(moduleId)

  const badge = (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}
    >
      {Icon && <Icon className="h-4 w-4" />}
    </span>
  )

  // RBAC — render an access-restricted state instead of the module content.
  if (moduleRestricted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto w-full min-w-0 max-w-[1440px] bg-[var(--app-background)] pb-3 ${className}`}
      >
        <PageHeader
          compact
          showBreadcrumb={false}
          title={title}
          badge={badge}
          badgeClassName="ml-1.5"
        />
        <div className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-slate-300/75 bg-white px-5 py-5 text-center shadow-[0_3px_14px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <h2 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white">Module access restricted</h2>
          <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500 dark:text-slate-400">
            Your HR role does not include view access to {meta?.label || title}. Ask an HR Manager to grant access
            if you believe this is a mistake.
          </p>
          <HrAccessBadge />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto w-full min-w-0 max-w-[1440px] bg-[var(--app-background)] pb-3 ${className}`}
    >
      <PageHeader
        compact
        showBreadcrumb={false}
        title={title}
        actions={actions}
        badge={badge}
        badgeClassName="ml-1.5"
        actionsClassName="gap-2"
      />
      {(lastUpdated || search) && (
        <div className="-mt-2.5 mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {lastUpdated && (
              <p className="text-[11px] font-medium text-slate-400">Last updated {lastUpdated}</p>
            )}
          </div>
          {search && (
            <PageSearch
              value={search.value}
              onChange={search.onChange}
              placeholder={search.placeholder}
            />
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}
