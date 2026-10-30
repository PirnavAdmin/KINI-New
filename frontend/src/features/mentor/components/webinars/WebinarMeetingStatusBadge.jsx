const STYLES = {
  Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  Live: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Completed: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export default function WebinarMeetingStatusBadge({ status }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STYLES[status] || STYLES.Scheduled}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>
}
