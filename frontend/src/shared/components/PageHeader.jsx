import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const ROLE_LABELS = {
  organization: 'Organization',
  employee: 'Employee',
  mentor: 'Mentor',
  student: 'Student',
  'super-admin': 'Super Admin',
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  breadcrumb,
  showBreadcrumb = true,
  titleClassName = '',
  subtitleClassName = '',
  badgeClassName = '',
  actionsClassName = '',
  containerClassName = '',
  compact = false,
}) {
  const { pathname } = useLocation()
  const routeSegment = pathname.split('/').filter(Boolean)[0]
  const crumbs = breadcrumb || [ROLE_LABELS[routeSegment] || 'Workspace', title]
  const isStudentPage = routeSegment === 'student'

  return (
    <motion.div
      data-ui={isStudentPage ? 'student-page-header' : undefined}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${compact ? 'mb-3' : 'mb-5'} ${isStudentPage ? 'px-0 py-0' : ''} ${containerClassName}`.trim()}
    >
      <header className={compact ? 'space-y-0.5' : 'space-y-1'}>
        {showBreadcrumb ? (
          <nav aria-label="Breadcrumb" className={`flex min-w-0 items-center gap-2 font-medium text-slate-500 dark:text-slate-400 ${compact ? 'text-xs leading-4' : 'text-sm leading-5'}`}>
            {crumbs.map((crumb, index) => (
              <div key={`${crumb}-${index}`} className="flex min-w-0 items-center gap-2">
                {index > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" /> : null}
                <span className={index === crumbs.length - 1 ? 'truncate text-slate-600 dark:text-slate-300' : 'truncate'}>{crumb}</span>
              </div>
            ))}
          </nav>
        ) : null}

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className={`min-w-0 font-bold tracking-[-0.03em] text-slate-900 dark:text-white ${compact ? 'text-2xl leading-8 sm:text-[28px]' : 'text-[30px] leading-9 sm:text-[38px] sm:leading-10'} ${titleClassName}`}>
                {title}
              </h1>
              {badge && <div className={badgeClassName}>{badge}</div>}
            </div>
            {subtitle && (
              <p className={`max-w-3xl text-slate-500 dark:text-slate-400 ${compact ? 'mt-0.5 text-sm leading-5' : 'mt-1 text-[15px] leading-6 sm:text-base'} ${subtitleClassName}`}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className={`flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5 ${actionsClassName}`.trim()}>
              {actions}
            </div>
          )}
        </div>
      </header>
    </motion.div>
  )
}
