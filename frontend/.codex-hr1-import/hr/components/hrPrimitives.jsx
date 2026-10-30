import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { HR_ROLE_META } from '@features/hr/data/hrEmployees'

// ─── HRAvatar — deterministic initials avatar with gradient ────────────────
const AVATAR_GRADIENTS = [
  'from-[#0f55f7] to-[#06b6a8]',
  'from-[#8b5cf6] to-[#EC4899]',
  'from-[#F59E0B] to-[#EF4444]',
  'from-[#10b981] to-[#06b6a8]',
  'from-[#6366f1] to-[#0f55f7]',
  'from-[#EC4899] to-[#F59E0B]',
]

export function HRAvatar({ name = '?', size = 'md', className = '' }) {
  const initials = String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?'
  const hash = String(name).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const gradient = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
  const sizes = {
    xs: 'h-6 w-6 text-[9px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm ${sizes[size] || sizes.md} ${gradient} ${className}`}
    >
      {initials}
    </span>
  )
}

// ─── HRStatusBadge — maps domain statuses onto the shared StatusBadge palette ─
const STATUS_VARIANT_MAP = {
  active: 'active', present: 'success', approved: 'success', paid: 'success', verified: 'success',
  completed: 'success', ready: 'success', done: 'success', accepted: 'success', hired: 'success',
  settled: 'success', closed: 'success', resolved: 'success', sent: 'success', 'on-track': 'success',
  available: 'success', scheduled: 'success', applied: 'active', open: 'warning', 'in-progress': 'warning',
  pending: 'pending', draft: 'pending', 'at-risk': 'danger', rejected: 'danger', absent: 'danger',
  expired: 'danger', 'on-hold': 'warning', maintenance: 'warning', 'in-process': 'pending', busy: 'warning',
  'on-leave': 'warning', late: 'warning', expiring: 'warning', generated: 'pending',
  inactive: 'inactive', wfh: 'active', 'self-review': 'active',
  probation: 'pending', 'notice-period': 'warning', resigned: 'inactive',
}

export function HRStatusBadge({ status, label, pulse = false }) {
  return (
    <span
      aria-label={`Status: ${label || status}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        STATUS_VARIANT_MAP[status] === 'success' ? 'bg-[#06b6a8]/10 text-[#06b6a8]'
        : STATUS_VARIANT_MAP[status] === 'warning' ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
        : STATUS_VARIANT_MAP[status] === 'danger' ? 'bg-[#EF4444]/10 text-[#EF4444]'
        : STATUS_VARIANT_MAP[status] === 'active' ? 'bg-[#0f55f7]/10 text-[#0f55f7]'
        : STATUS_VARIANT_MAP[status] === 'inactive' ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
        : 'bg-[#F59E0B]/10 text-[#F59E0B]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          STATUS_VARIANT_MAP[status] === 'success' ? 'bg-[#06b6a8]'
          : STATUS_VARIANT_MAP[status] === 'warning' ? 'bg-[#F59E0B]'
          : STATUS_VARIANT_MAP[status] === 'danger' ? 'bg-[#EF4444]'
          : STATUS_VARIANT_MAP[status] === 'active' ? 'bg-[#0f55f7]'
          : STATUS_VARIANT_MAP[status] === 'inactive' ? 'bg-slate-400'
          : 'bg-[#F59E0B]'
        } ${pulse ? 'animate-pulse' : ''}`}
      />
      {label || status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  )
}

// ─── HRRoleBadge — colour-coded enterprise role badge ──────────────────────
// ENTERPRISE HRMS — every workforce member carries one of the organisation
// roles (Employee, Mentor, HR, Recruiter, Payroll, Manager, Admin, Trainer,
// Department Head), each with its own colour from HR_ROLE_META.
export function HRRoleBadge({ role, size = 'md', className = '' }) {
  const label = role || 'Employee'
  const meta = HR_ROLE_META[label] || { color: '#0f55f7' }
  const sizes = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-bold ${sizes} ${className}`}
      style={{ backgroundColor: `${meta.color}14`, color: meta.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {label}
    </span>
  )
}

// ─── HRProgressBar — slim gradient progress bar ────────────────────────────
export function HRProgressBar({ value = 0, color = '#0f55f7', height = 'h-1.5', showLabel = false, className = '' }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${height}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400">{clamped}%</p>}
    </div>
  )
}

// ─── HRDelta — percentage-change trend indicator ───────────────────────────
export function HRDelta({ value = 0, suffix = '%', invert = false }) {
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus
  const positive = value > 0
  const good = invert ? !positive : positive
  const cls = value === 0
    ? 'text-slate-400 bg-slate-100 dark:bg-slate-800'
    : good
      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
      : 'text-red-500 bg-red-50 dark:bg-red-500/10'
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${cls}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}{suffix}
    </span>
  )
}

// ─── HRSection — titled content card used across every HR page ─────────────
export function HRSection({ title, subtitle, icon: Icon, action, children, className = '', padding = 'p-4 sm:p-5', delay = 0, onClick }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      } : undefined}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`h-full overflow-hidden rounded-2xl border border-slate-300/75 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.07)] transition-all duration-200 hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40' : ''} ${className}`}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10 text-[#0f55f7] dark:bg-[#0f55f7]/15">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={padding}>{children}</div>
    </motion.section>
  )
}

// ─── HRChip — small labeled chip for filters/legends ───────────────────────
export function HRChip({ children, active = false, onClick, color = '#0f55f7', className = '' }) {
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${
        active
          ? 'border-transparent text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      } ${className}`}
      style={active ? { background: `linear-gradient(135deg, ${color}, ${color}bb)` } : undefined}
    >
      {children}
    </Comp>
  )
}
