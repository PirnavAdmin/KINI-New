import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import KPI from '@/components/common/KPI'

// KPICard renders the global KPI card (src/components/common/KPI.jsx), so
// every portal shows the same design. `changeLabel` becomes the description,
// `change` the trend chip. Layout flags (compact/dense/slim/accent) and
// `delay` are accepted for compatibility.
// eslint-disable-next-line no-unused-vars
export function KPICard({ icon, label, value, change, changeLabel, color = '#1268F3', delay = 0, prefix = '', suffix = '', onClick, compact = false, dense = false, slim = false, accent = false }) {
  const shown = prefix || suffix
    ? `${prefix}${typeof value === 'number' ? value.toLocaleString('en-IN') : value ?? '—'}${suffix}`
    : value
  return (
    <KPI
      label={label}
      value={shown}
      description={changeLabel}
      icon={icon}
      accent={color}
      trend={change !== undefined && change !== null ? `${Math.abs(change)}%` : undefined}
      trendType={change >= 0 ? 'positive' : 'negative'}
      onClick={onClick}
    />
  )
}

export function PremiumKpiCard(props) {
  return <KPICard {...props} accent />
}

export function DashboardSection({ title, subtitle, icon: Icon, children, className = '', badge, action, compact = false, onClick }) {
  const navigate = useNavigate()
  const clickHandler = onClick || (title === 'Attendance' ? () => navigate('/student/my-classes') : undefined)
  return (
    <motion.div
      data-ui="dashboard-section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={clickHandler}
      className={`bg-white/95 dark:bg-slate-900/75 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/80 ring-1 ring-slate-900/[0.025] dark:ring-white/[0.035] ${clickHandler ? 'cursor-pointer transition hover:-translate-y-0.5 hover:border-[#0f55f7]/30' : ''}
        ${compact ? 'rounded-xl p-3' : 'rounded-[14px] p-4 sm:p-5'} ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}
    >
      {(title || action) && (
        <div className={`flex items-start justify-between ${compact ? 'mb-2.5 gap-2.5' : 'mb-4 gap-4'}`}>
          <div className={`flex min-w-0 items-start ${compact ? 'gap-2.5' : 'gap-3'}`}>
            {Icon && (
              <div className={`${compact ? 'h-7 w-7 rounded-lg' : 'h-8 w-8 rounded-xl'} flex shrink-0 items-center justify-center bg-gradient-to-br from-[#1268F3]/10 to-[#06B6D4]/10`}>
                <Icon className="w-4 h-4 text-[#1268F3]" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
                {badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#0f55f7]/10 text-[#0f55f7] border border-[#0f55f7]/20">{badge}</span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  )
}

export function StatusBadge({ status }) {
  const config = {
    active: { label: 'Active', classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-[#06b6a8]/20' },
    inactive: { label: 'Inactive', classes: 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600' },
    suspended: { label: 'Suspended', classes: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' },
    pending: { label: 'Pending', classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
    scheduled: { label: 'Scheduled', classes: 'bg-[#0f55f7]/10 dark:bg-[#0f55f7]/15 text-[#0f55f7] dark:text-[#6aa0ff] border-[#0f55f7]/20 dark:border-[#0f55f7]/25' },
    completed: { label: 'Completed', classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-[#06b6a8]/20' },
    upcoming: { label: 'Upcoming', classes: 'bg-[#06b6a8]/10 dark:bg-[#06b6a8]/15 text-[#058f85] dark:text-[#5edbd1] border-[#06b6a8]/20 dark:border-[#06b6a8]/25' },
  }
  const c = config[status] || config.inactive
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${c.classes}`}>
      {c.label}
    </span>
  )
}

export function Skeleton({ className = 'h-4 w-full' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-lg ${className}`} />
  )
}


