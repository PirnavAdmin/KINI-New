const CHIP_STYLES = {
  present: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  late: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  absent: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  pending: 'bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300',
}

export default function AttendanceChip({ status = 'pending' }) {
  const label = String(status || 'pending')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${CHIP_STYLES[status] || CHIP_STYLES.pending}`}>
      {label}
    </span>
  )
}
