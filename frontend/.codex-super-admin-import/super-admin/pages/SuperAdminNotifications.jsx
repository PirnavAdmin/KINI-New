import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  AlertCircle, ArrowUpRight, BadgeCheck, Bell, Building2, CheckCheck, CheckCircle2,
  ClipboardCheck, Clock, Megaphone, Search, Settings2, ShieldAlert, X,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import { PremiumKpiCard } from '@shared/components/SharedComponents'
import EmptyState from '@shared/components/EmptyState'
import { Button } from '@shared/components/FormElements'
import {
  getPlatformNotifications,
  markAllPlatformNotificationsRead,
  markPlatformNotificationRead,
} from '@shared/services/platformNotificationService'
import { ROUTES } from '@shared/constants/routeConstants'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/notifications
// PATCH /api/v1/super-admin/notifications/:id/read
// PATCH /api/v1/super-admin/notifications/read-all
// =================================

const TYPE_META = {
  'org-registration': { icon: Building2, color: '#0f55f7', label: 'Organization' },
  'approval-request': { icon: ClipboardCheck, color: '#f59e0b', label: 'Approval' },
  'payment-failed': { icon: AlertCircle, color: '#ef4444', label: 'Payment' },
  'payment-received': { icon: CheckCircle2, color: '#10b981', label: 'Payment' },
  'subscription-expiring': { icon: Clock, color: '#f59e0b', label: 'Subscription' },
  'subscription-activated': { icon: BadgeCheck, color: '#10b981', label: 'Subscription' },
  'plan-updated': { icon: Settings2, color: '#8b5cf6', label: 'Plans' },
  'security-alert': { icon: ShieldAlert, color: '#ef4444', label: 'Security' },
  'announcement': { icon: Megaphone, color: '#64748b', label: 'System' },
}

const DEFAULT_TYPE = { icon: Bell, color: '#64748b', label: 'System' }

const TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'org-registration', label: 'Organization' },
  { value: 'approval-request', label: 'Approvals' },
  { value: 'payment-failed', label: 'Payment Failed' },
  { value: 'payment-received', label: 'Payment Received' },
  { value: 'subscription-expiring', label: 'Expiring' },
  { value: 'subscription-activated', label: 'Activated' },
  { value: 'plan-updated', label: 'Plan Updated' },
  { value: 'security-alert', label: 'Security' },
  { value: 'announcement', label: 'Announcement' },
]

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

const formatTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`
}

export default function SuperAdminNotifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(() => getPlatformNotifications())
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  const markRead = (id) => {
    if (markPlatformNotificationRead(id)) {
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
      toast.success('Notification marked as read')
    }
  }

  const markAllRead = () => {
    markAllPlatformNotificationsRead()
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    toast.success('All notifications marked as read')
  }

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const matchType = !typeFilter || item.type === typeFilter
      const matchStatus =
        !statusFilter || (statusFilter === 'unread' ? !item.read : item.read)
      const matchSearch =
        !search ||
        `${item.title} ${item.description} ${item.organization}`
          .toLowerCase()
          .includes(search.toLowerCase())
      return matchType && matchStatus && matchSearch
    })
  }, [notifications, typeFilter, statusFilter, search])

  const kpis = useMemo(() => ({
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    alerts: notifications.filter((item) => item.type === 'security-alert' || item.type === 'payment-failed').length,
  }), [notifications, unreadCount])

  const hasActiveFilters = Boolean(typeFilter || statusFilter || search)

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread platform notifications`}
        icon={Bell}
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-4"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" icon={CheckCheck} onClick={markAllRead} disabled={!unreadCount}>
              Mark All as Read
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total Notifications', value: kpis.total, icon: Bell, color: '#0f55f7' },
          { label: 'Unread', value: kpis.unread, icon: Clock, color: '#f59e0b' },
          { label: 'Read', value: kpis.read, icon: CheckCircle2, color: '#10b981' },
          { label: 'Alerts', value: kpis.alerts, icon: ShieldAlert, color: '#ef4444' },
        ].map(({ label, value, icon, color }, index) => (
          <PremiumKpiCard key={label} icon={icon} label={label} value={value} color={color} delay={index * 0.04} />
        ))}
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          aria-label="Filter by type"
        >
          {TYPE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Notification list */}
      <Card padding="p-0" className="overflow-hidden">
        {filtered.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence initial={false}>
              {filtered.map((item, index) => {
                const meta = TYPE_META[item.type] || DEFAULT_TYPE
                const Icon = meta.icon
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 sm:px-5 ${
                      item.read ? '' : 'bg-[#0f55f7]/[0.02]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.read ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                      style={item.read ? undefined : { backgroundColor: `${meta.color}14` }}
                    >
                      <Icon className="h-[18px] w-[18px]" style={{ color: item.read ? '#94A3B8' : meta.color }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {meta.label}
                        </span>
                        {!item.read && (
                          <span className="inline-flex items-center rounded-full bg-[#0f55f7]/10 px-2 py-0.5 text-[10px] font-bold text-[#0f55f7]">
                            New
                          </span>
                        )}
                      </div>
                      <p className={`mt-1 text-sm ${item.read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        {item.organization ? `${item.organization} · ` : ''}{formatTime(item.timestamp)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => markRead(item.id)}
                          className="rounded-lg p-2 text-[#0f55f7] transition-colors hover:bg-[#0f55f7]/10"
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(item.path || ROUTES.SUPER_ADMIN.NOTIFICATIONS)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800"
                        aria-label="View related item"
                        title="View related item"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={hasActiveFilters ? Search : Bell}
            title={hasActiveFilters ? 'No notifications match your filters' : 'No notifications'}
            description={hasActiveFilters ? 'Try adjusting the search or clearing the active filters.' : 'Platform notifications will appear here.'}
            action={
              hasActiveFilters ? (
                <Button variant="outline" icon={X} onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter('') }}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>
    </div>
  )
}
