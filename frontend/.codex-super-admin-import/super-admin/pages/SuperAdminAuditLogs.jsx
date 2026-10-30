import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  AlertCircle, CheckCircle2, Clock, Download, Eye, FileClock, Search, ShieldCheck, X,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import StatusBadge from '@shared/components/StatusBadge'
import EmptyState from '@shared/components/EmptyState'
import { Button } from '@shared/components/FormElements'
import { PLATFORM_AUDIT_LOGS } from '@shared/data/platformMockData'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/audit-logs
// Audit logs are intentionally read-only — there is no delete/clear path
// in the UI (tamper-proof by design).
// =================================

const MODULE_FILTERS = [
  { value: '', label: 'All Modules' },
  { value: 'Organization', label: 'Organization' },
  { value: 'Subscription', label: 'Subscription' },
  { value: 'Plan', label: 'Plan' },
  { value: 'User', label: 'User' },
  { value: 'Billing', label: 'Billing' },
  { value: 'Security', label: 'Security' },
  { value: 'Report', label: 'Report' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Course', label: 'Course' },
  { value: 'Attendance', label: 'Attendance' },
]

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

const DAY_AGO_MS = Date.now() - 24 * 60 * 60 * 1000

const DATE_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
]

const formatTimestamp = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

const withinWindow = (timestamp, windowKey) => {
  if (windowKey === 'all' || !timestamp) return true
  const age = Date.now() - new Date(timestamp).getTime()
  if (Number.isNaN(age)) return true
  const hours = { '24h': 24, '7d': 168, '30d': 720 }[windowKey]
  return age <= hours * 60 * 60 * 1000
}

export default function SuperAdminAuditLogs() {
  const [logs] = useState(() => PLATFORM_AUDIT_LOGS.map((item) => ({ ...item })))
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const userOptions = useMemo(() => {
    const users = [...new Set(logs.map((entry) => entry.user).filter(Boolean))]
    return [{ value: '', label: 'All Users' }, ...users.map((user) => ({ value: user, label: user }))]
  }, [logs])

  const actionOptions = useMemo(() => {
    const actions = [...new Set(logs.map((entry) => entry.action).filter(Boolean))]
    return [{ value: '', label: 'All Actions' }, ...actions.map((action) => ({ value: action, label: action }))]
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter((entry) => {
      const matchSearch =
        !search ||
        `${entry.user} ${entry.action} ${entry.module} ${entry.target} ${entry.details}`
          .toLowerCase()
          .includes(search.toLowerCase())
      const matchAction = !actionFilter || entry.action === actionFilter
      const matchModule = !moduleFilter || entry.module === moduleFilter
      const matchStatus = !statusFilter || entry.status === statusFilter
      const matchUser = !userFilter || entry.user === userFilter
      const matchDate = withinWindow(entry.timestamp, dateFilter)
      return matchSearch && matchAction && matchModule && matchStatus && matchUser && matchDate
    })
  }, [logs, search, actionFilter, moduleFilter, statusFilter, userFilter, dateFilter])

  const kpis = useMemo(() => ({
    total: logs.length,
    success: logs.filter((entry) => entry.status === 'success').length,
    failed: logs.filter((entry) => entry.status === 'failed').length,
    last24h: logs.filter((entry) => {
      const time = new Date(entry.timestamp).getTime()
      return Number.isFinite(time) && time >= DAY_AGO_MS
    }).length,
  }), [logs])

  const handleExport = () => {
    toast.success(`Exporting ${filtered.length} audit log entries as CSV...`)
  }

  const hasActiveFilters = Boolean(search || actionFilter || moduleFilter || statusFilter || userFilter || dateFilter !== 'all')

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      <PageHeader
        title="Audit Logs"
        subtitle="Read-only security trail of platform actions"
        icon={FileClock}
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-4"
        actions={
          <Button variant="outline" icon={Download} onClick={handleExport}>Export CSV</Button>
        }
      />

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total Events', value: kpis.total, icon: FileClock, color: '#0f55f7' },
          { label: 'Successful', value: kpis.success, icon: CheckCircle2, color: '#10b981' },
          { label: 'Failed', value: kpis.failed, icon: AlertCircle, color: '#ef4444' },
          { label: 'Last 24 Hours', value: kpis.last24h, icon: Clock, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }, index) => (
          <Card key={label} delay={index * 0.04} padding="p-3" className="h-[88px]">
            <div className="flex h-full items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
                <Icon className="h-[17px] w-[17px]" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-5 text-slate-900 dark:text-white">{value}</p>
                <p className="mt-1 truncate text-[11px] font-medium text-slate-400">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:flex-row lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, action, module or target..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          aria-label="Filter by action"
        >
          {actionOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          aria-label="Filter by module"
        >
          {MODULE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          aria-label="Filter by user"
        >
          {userOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          aria-label="Filter by date"
        >
          {DATE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200/50 bg-slate-50/50 text-left dark:border-slate-700/50 dark:bg-slate-800/30">
                  {['Timestamp', 'User', 'Action', 'Module', 'Target', 'Status', 'IP / Location', ''].map((header) => (
                    <th key={header} className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50 last:border-0 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
                    onClick={() => setSelected(entry)}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(entry.timestamp)}</td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.user}</p>
                      <p className="text-[11px] text-slate-400">{entry.role}</p>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{entry.action}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {entry.module}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300">{entry.target}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={entry.status} label={entry.status === 'success' ? 'Success' : 'Failed'} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">{entry.ip}</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelected(entry) }}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800"
                        aria-label="View log details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={hasActiveFilters ? Search : FileClock}
            title={hasActiveFilters ? 'No log entries match your filters' : 'No audit entries'}
            description={hasActiveFilters ? 'Try adjusting the search or clearing the active filters.' : 'Audit events will be recorded here.'}
            action={
              hasActiveFilters ? (
                <Button variant="outline" icon={X} onClick={() => { setSearch(''); setActionFilter(''); setModuleFilter(''); setStatusFilter(''); setUserFilter(''); setDateFilter('all') }}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>

      {/* Details modal — read-only */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-950/45 backdrop-blur-[3px]"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="audit-detail-title"
              className="fixed inset-0 z-[1001] m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_28px_80px_-20px_rgba(15,23,42,.5)] outline-none dark:border-slate-700 dark:bg-slate-900 sm:w-[30rem]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f55f7]/10">
                    <ShieldCheck className="h-[18px] w-[18px] text-[#0f55f7]" />
                  </div>
                  <div>
                    <h2 id="audit-detail-title" className="text-base font-bold text-slate-900 dark:text-white">Audit Event Details</h2>
                    <p className="text-xs text-slate-400">{selected.id.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selected.action}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selected.module} · {selected.target}</p>
                </div>
                <dl className="mt-4 space-y-0">
                  {[
                    { label: 'Timestamp', value: formatTimestamp(selected.timestamp) },
                    { label: 'User', value: `${selected.user} (${selected.role})` },
                    { label: 'Status', value: selected.status === 'success' ? 'Success' : 'Failed' },
                    { label: 'IP / Location', value: selected.ip },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0 dark:border-slate-800">
                      <dt className="font-medium text-slate-400">{label}</dt>
                      <dd className="text-right font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
                    </div>
                  ))}
                </dl>
                {selected.details && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/40">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Details</p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.details}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
