import KPI from '@/components/common/KPI'

export const TinyButton = ({ children, icon: Icon, variant = 'secondary', className = '', ...props }) => {
  const styles = {
    primary: 'bg-[#0f55f7] text-white hover:bg-primary-dark',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white',
    danger: 'bg-danger text-white hover:bg-danger-dark',
  }

  return (
    <button type="button" className={`inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`} {...props}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}

const KPI_ACCENTS = { primary: "blue", secondary: "teal", success: "green", warning: "orange", danger: "red", neutral: "navy" }

// Live-class metric card, rendered with the global KPI card. `compact` is
// accepted for compatibility; every card uses the same design.
// eslint-disable-next-line no-unused-vars
export const MetricCard = ({ icon, label, value, hint, tone = "primary", compact = false, loading = false }) => (
  <KPI label={label} value={value} description={hint} icon={icon} accent={KPI_ACCENTS[tone] || "blue"} loading={loading} />
)

export const Field = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-900/[0.035] dark:bg-slate-800/70 dark:ring-white/[0.05]">
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
    <div className="mt-1 flex items-start gap-2 text-sm font-semibold text-slate-900 dark:text-white">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0f55f7]" /> : null}
      <span className="min-w-0 break-words">{value || 'Not Available'}</span>
    </div>
  </div>
)

export const Section = ({ title, icon: Icon, children }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.04)] dark:border-slate-700/60 dark:bg-slate-900/60">
    <div className="flex items-center gap-2.5 border-b border-slate-200/70 bg-gradient-to-r from-blue-50/80 to-cyan-50/60 px-4 py-3 dark:border-slate-700/60 dark:from-slate-800 dark:to-slate-800/70">
      {Icon ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0f55f7] shadow-sm ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-slate-700">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
)
