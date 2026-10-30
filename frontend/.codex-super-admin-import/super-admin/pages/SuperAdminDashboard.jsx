import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Ban, Building2, DollarSign, TrendingUp,
  ArrowUpRight, Shield, CheckCircle2, CreditCard,
  FileClock, AlertCircle, Activity, GraduationCap,
  Users, Wallet, Clock, CalendarRange,
} from 'lucide-react'
import { ROUTES } from '@shared/constants/routeConstants'
import {
  ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { PremiumKpiCard, DashboardSection } from '@shared/components/SharedComponents'
import { SUPER_ADMIN_STATS } from '@shared/data/superAdminMockData'
import { ORGANIZATIONS } from '@shared/data/superAdminPageMockData'
import { SUBSCRIPTION_RECORDS } from '@shared/data/subscriptionMockData'
import { PLATFORM_ACTIVITY } from '@shared/data/platformMockData'
import {
  REVENUE_SUMMARY, MONTHLY_REVENUE, REVENUE_DAILY, REVENUE_WEEKLY, REVENUE_YEARLY,
  REVENUE_PERIOD_KPIS,
} from '@shared/data/revenueMockData'
import { formatCurrency } from '@shared/utils/formatters'
import { dashboardApi, getApiErrorMessage, organizationApi, subscriptionApi, revenueApi, superAdminActivityApi } from '@shared/services/apiServices'
import { normalizeActivity, resolveActivityDestination } from '@features/super-admin/utils/activityNavigation'
import { deriveSubscriptionStatus, isActiveSubscription } from '@shared/utils/subscriptionStatus'
import { useAuth } from '@shared/hooks/useAuth'
import { applyStatusOverrides } from '@shared/services/mockOrganizationService'
import toast from 'react-hot-toast'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Revenue helpers ────────────────────────────────────────────────────────
// Maps the aggregated revenue payload ({ year, months: [{ month: 1..12, revenue }] })
// onto a full Jan→Dec series for the requested year. Months the backend did not
// return are treated as ₹0 for that month.
const buildRevenueSeries = (payload, year) => {
  const months = Array.isArray(payload?.months) ? payload.months : []
  if (!months.length) return []
  const byMonth = new Map(months.map((item) => [Number(item.month), Number(item.revenue ?? item.amount ?? 0)]))
  return Array.from({ length: 12 }, (_, index) => ({
    period: SHORT_MONTHS[index],
    monthIndex: index,
    year: Number(year),
    revenue: byMonth.get(index + 1) ?? 0,
  }))
}

// Normalizes every granularity series onto the chart's { period, revenue }
// shape — the monthly mock dataset keys its timeline as `month`, the others
// already use `period`. Guarantees the X-axis always renders month/week labels.
const normalizeSeries = (rows) => (Array.isArray(rows) ? rows.map((point) => ({
  period: point.period ?? point.month,
  revenue: Number(point.revenue ?? 0),
})) : [])

// Compact Indian Rupee ticks for the Y-axis (K = thousand, L = lakh, Cr = crore).
const formatRevenueTick = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1)}Cr`
  if (num >= 100000) return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)}L`
  if (num >= 1000) return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`
  return `₹${num}`
}

const RevenueTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <p className="text-[11px] font-semibold text-slate-400">{point.period ?? point.month}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">Revenue: {formatCurrency(point.revenue)}</p>
    </div>
  )
}

const RevenueLoadingSkeleton = () => (
  <div className="w-full max-w-md space-y-3">
    <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
    <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
    <div className="h-24 animate-pulse rounded-lg bg-slate-50 dark:bg-slate-800/60" />
    <div className="flex justify-between">
      {SHORT_MONTHS.slice(0, 6).map((m) => <div key={m} className="h-2 w-6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />)}
    </div>
  </div>
)

// ─── Revenue granularity — mock series for the Daily | Weekly | Monthly | Yearly
// selector. All four describe the same growing revenue story (see revenueMockData.js).
const REVENUE_PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]
const REVENUE_SERIES = {
  daily: normalizeSeries(REVENUE_DAILY),
  weekly: normalizeSeries(REVENUE_WEEKLY),
  monthly: normalizeSeries(MONTHLY_REVENUE),
  yearly: normalizeSeries(REVENUE_YEARLY),
}
const REVENUE_PERIOD_LABELS = Object.fromEntries(REVENUE_PERIODS.map((period) => [period.value, period.label]))

// Subscription rows on the dashboard share the same status derivation and
// "active" definition as the Subscriptions page so every KPI agrees (active +
// expiring + trial all count as active, expiring is date-driven).
const normalizeDashboardSubscription = (item) => {
  const status = deriveSubscriptionStatus(item)
  return {
    ...item,
    status,
    isActive: isActiveSubscription(status),
    price: item.price,
    durationInMonths: item.durationInMonths,
    expiryDate: item.endDate ?? item.expiryDate ?? item.renewalDate,
    organizationName: item.organizationName ?? item.organization?.name,
    planName: item.planName ?? item.plan,
  }
}

const CONTAINER = `
  relative
  before:absolute before:inset-0
  before:bg-gradient-to-b before:from-[#0f55f7]/[0.02] before:to-transparent before:dark:from-[#0f55f7]/[0.04]
  before:pointer-events-none
`

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

const DASHBOARD_LOADED_AT = Date.now()

const formatRenewalDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatActivityTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}



// Compact metric chip used by the revenue summary.
const MetricChip = ({ icon: Icon, label, value, color, sub }) => (
  <motion.div
    key={label + value}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="min-w-0 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
  >
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${color}14`, color }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="min-w-0 truncate text-[11px] font-semibold leading-4 text-slate-500 dark:text-slate-400">{label}</p>
    </div>
    <p className="mt-2 break-words text-lg font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
    {sub && <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{sub}</p>}
  </motion.div>
)

// Dynamic revenue metrics — returns the 6 KPI chips for the active period.
const getRevenueMetrics = (period) => {
  const kpis = REVENUE_PERIOD_KPIS[period] || REVENUE_PERIOD_KPIS.monthly
  return [
    { key: 'total', label: kpis.periodLabel, value: formatCurrency(kpis.totalRevenue), icon: Wallet, color: '#0f55f7', sub: `${kpis.comparison.label}: ${formatCurrency(kpis.comparison.value)} (${kpis.comparison.delta > 0 ? '+' : ''}${kpis.comparison.delta}%)` },
    { key: 'subscription', label: 'Subscription Revenue', value: formatCurrency(kpis.subscriptionRevenue), icon: CalendarRange, color: '#2563eb' },
    { key: 'paid', label: 'Paid Amount', value: formatCurrency(kpis.paidAmount), icon: CheckCircle2, color: '#06b6a8' },
    { key: 'pending', label: 'Pending Amount', value: formatCurrency(kpis.pendingAmount), icon: Clock, color: '#f59e0b' },
    { key: 'outstanding', label: 'Outstanding Amount', value: formatCurrency(kpis.outstandingAmount), icon: AlertCircle, color: '#ef4444' },
    { key: 'expected', label: 'Expected Revenue', value: formatCurrency(kpis.expectedRevenue), icon: TrendingUp, color: '#10b981' },
  ]
}

// Upcoming subscription statuses — Critical (auto-renewal off or ≤ 7 days),
// Expiring Soon (within the 30-day window), Active otherwise.
const getUpcomingBadge = (item) => {
  if (item.critical) {
    return { label: 'Critical', classes: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' }
  }
  if (item.status === 'expiring') {
    return { label: 'Expiring Soon', classes: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' }
  }
  return { label: 'Active', classes: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-[#06b6a8]/20' }
}



export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isDemoSession = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))
  const [stats, setStats] = useState({ totalOrganizations: 0, activeOrganizations: 0, totalUsers: 0 })
  const [subscriptions, setSubscriptions] = useState([])
  const [activities, setActivities] = useState([])
  const [revenue, setRevenue] = useState({ status: 'loading', series: [], period: 'monthly' })
  const [revenuePeriod, setRevenuePeriod] = useState('monthly')

  useEffect(() => {
    // Sync state setup is wrapped in a function (matching the other Super Admin
    // pages) so the demo branch stays side-effect free.
    const applyDemoDashboard = () => {
      // KPIs are derived from the same datasets used by the Organizations and
      // Subscriptions modules so the numbers always agree across pages.
      setStats({
        ...SUPER_ADMIN_STATS,
        totalOrganizations: ORGANIZATIONS.length,
        activeOrganizations: applyStatusOverrides(ORGANIZATIONS).filter((item) => item.status === 'active').length,
        totalUsers: SUPER_ADMIN_STATS.activeUsers,
      })
      setSubscriptions(SUBSCRIPTION_RECORDS.map(normalizeDashboardSubscription))
    }
    if (isDemoSession) {
      applyDemoDashboard()
      return
    }
    Promise.all([dashboardApi.superAdminDashboard(), organizationApi.list(), subscriptionApi.list()])
      .then(([dashboard, , subscriptions]) => {
        setStats(dashboard || {})
        setSubscriptions((subscriptions || []).map(normalizeDashboardSubscription))
      })
      .catch((error) => {
        applyDemoDashboard()
        toast.error(getApiErrorMessage(error, 'Live dashboard unavailable. Showing demo data.'))
      })
  }, [isDemoSession])

  // ── Recent Platform Activity — lightweight feed carrying the entity IDs
  // (organizationId / subscriptionId / paymentId / userId) so every row can
  // deep-link to its exact detail page. Falls back to the static dataset when
  // the activity API is unavailable, mirroring the other dashboard panels. ──
  useEffect(() => {
    // Sync state setup is wrapped in a function (matching applyDemoDashboard
    // above) so the demo branch stays side-effect free.
    const applyDemoActivities = () => setActivities(PLATFORM_ACTIVITY.map(normalizeActivity))
    if (isDemoSession) {
      applyDemoActivities()
      return undefined
    }
    let cancelled = false
    superAdminActivityApi.list()
      .then((rows) => {
        if (cancelled) return
        const normalized = Array.isArray(rows) && rows.length > 0
          ? rows.map(normalizeActivity)
          : PLATFORM_ACTIVITY.map(normalizeActivity)
        setActivities(normalized)
      })
      .catch(() => {
        if (!cancelled) setActivities(PLATFORM_ACTIVITY.map(normalizeActivity))
      })
    return () => { cancelled = true }
  }, [isDemoSession])

  // ── Revenue Overview — Daily | Weekly | Monthly | Yearly series. Monthly
  // tries the live revenue API first and always falls back to the realistic
  // mock series when the API has no data, so the chart renders a meaningful
  // progressing trend instead of an empty grid. ──
  useEffect(() => {
    // Sync state setup is wrapped in functions (matching applyDemoDashboard
    // above) so the demo branch and retry loading state stay side-effect free.
    const applyMockRevenue = () => setRevenue({ status: 'success', series: REVENUE_SERIES[revenuePeriod], period: revenuePeriod })
    const beginRevenueLoading = () => setRevenue((prev) => ({ ...prev, status: 'loading' }))

    if (isDemoSession) {
      applyMockRevenue()
      return undefined
    }
    if (revenuePeriod !== 'monthly') {
      applyMockRevenue()
      return undefined
    }
    let cancelled = false
    const year = new Date().getFullYear()
    beginRevenueLoading()
    revenueApi.monthly(year)
      .then((payload) => {
        if (cancelled) return
        const series = buildRevenueSeries(payload, year)
        const hasData = series.length > 0 && series.some((point) => point.revenue > 0)
        setRevenue(hasData ? { status: 'success', series, period: revenuePeriod } : { status: 'success', series: REVENUE_SERIES[revenuePeriod], period: revenuePeriod })
      })
      .catch(() => {
        if (cancelled) return
        setRevenue({ status: 'success', series: REVENUE_SERIES[revenuePeriod], period: revenuePeriod })
      })
    return () => { cancelled = true }
  }, [isDemoSession, revenuePeriod])

  // Opens the exact detail page for an activity's related record. Navigation is
  // driven by the entity IDs carried on the activity (never by display name).
  const handleActivityClick = (event) => {
    const destination = resolveActivityDestination(event, {
      subscriptionByOrganization: (orgId) => {
        const match = SUBSCRIPTION_RECORDS.find(
          (item) => String(item.organizationId) === String(orgId),
        )
        return match?.id
      },
    })
    if (!destination) {
      toast.error('Unable to open this activity. Please try again.')
      return
    }
    try {
      navigate(destination.path, { state: destination.state })
    } catch {
      toast.error('Unable to open this activity. Please try again.')
    }
  }

  const handleOpenUpcomingSubscription = (item) => {
    const id = item.id ?? item.subscriptionId
    if (id) {
      navigate(
        ROUTES.SUPER_ADMIN.SUBSCRIPTION_DETAILS.replace(':subscriptionId', String(id)),
        { state: { subscription: item } },
      )
      return
    }
    navigate(`${ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}?status=expiring`)
  }

  // ── KPI derivation — demo sessions derive from the datasets directly so the
  // dashboard, Organizations and Subscriptions pages always agree; live
  // sessions prefer the dashboard API and fall back to the shared datasets. ──
  const totalOrganizations = stats.totalOrganizations || ORGANIZATIONS.length
  const activeOrganizations = stats.activeOrganizations ?? applyStatusOverrides(ORGANIZATIONS).filter((item) => item.status === 'active').length
  const totalSubscriptions = subscriptions.length || SUPER_ADMIN_STATS.totalSubscriptions
  const activeSubscriptions = subscriptions.filter((item) => item.isActive).length || SUPER_ADMIN_STATS.activeSubscriptions
  const upcomingSubscriptionCount = subscriptions.filter((item) => item.status === 'expiring').length || SUPER_ADMIN_STATS.upcomingSubscriptions
  const totalStudents = SUPER_ADMIN_STATS.totalStudents
  const totalTutors = SUPER_ADMIN_STATS.totalTutors
  const totalRevenue = REVENUE_SUMMARY.totalRevenue

  // Upcoming subscriptions — only records flagged as expiring (within 30 days),
  // ordered by days remaining. Critical = auto-renewal off or ≤ 7 days left.
  const upcomingSubscriptions = subscriptions
    .filter((item) => item.status === 'expiring')
    .map((item) => {
      const expiry = Date.parse(item.expiryDate ?? item.endDate ?? item.renewalDate)
      const daysRemaining = Number.isFinite(expiry) ? Math.ceil((expiry - DASHBOARD_LOADED_AT) / 86400000) : null
      return {
        ...item,
        daysRemaining,
        critical: item.autoRenew === false || (daysRemaining !== null && daysRemaining <= 7),
      }
    })
    .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))

  const kpiCards = [
    { icon: Building2, label: 'Total Organizations', value: totalOrganizations, color: '#0f55f7', path: ROUTES.SUPER_ADMIN.ORGANIZATIONS },
    { icon: CheckCircle2, label: 'Active Organizations', value: activeOrganizations, color: '#06b6a8', path: ROUTES.SUPER_ADMIN.ORGANIZATIONS },
    { icon: CreditCard, label: 'Total Subscriptions', value: totalSubscriptions, color: '#2563eb', path: ROUTES.SUPER_ADMIN.SUBSCRIPTIONS },
    { icon: Shield, label: 'Active Subscriptions', value: activeSubscriptions, color: '#10b981', path: ROUTES.SUPER_ADMIN.SUBSCRIPTIONS },
    { icon: FileClock, label: 'Upcoming Subscriptions', value: upcomingSubscriptionCount, color: '#f59e0b', path: `${ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}?status=expiring` },
    { icon: GraduationCap, label: 'Total Students', value: totalStudents, color: '#f97316', path: ROUTES.SUPER_ADMIN.STUDENTS },
    { icon: Users, label: 'Total Tutors', value: totalTutors, color: '#ec4899', path: ROUTES.SUPER_ADMIN.EMPLOYEES },
    { icon: DollarSign, label: 'Total Revenue', value: totalRevenue.toLocaleString('en-IN'), color: '#0ea5e9', path: ROUTES.SUPER_ADMIN.REVENUE },
  ]

  return (
    <div className={`super-admin-command-center w-full p-2 sm:p-3 lg:p-3 ${CONTAINER}`}>
      {/* ── Primary KPI Overview — the "how many" answers at a glance ── */}
      <motion.div
        variants={fadeUp}
        initial={false}
        animate="animate"
        transition={{ duration: 0.4 }}
        className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {kpiCards.map((card, index) => (
          <PremiumKpiCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            prefix={card.label === 'Total Revenue' ? '₹' : ''}
            color={card.color}
            delay={index * 0.03}
            onClick={() => navigate(card.path)}
          />
        ))}
      </motion.div>

      {/* ── Revenue Overview — chart + granularity selector + revenue summary ── */}
      <motion.div
        variants={fadeUp}
        initial={false}
        animate="animate"
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-4"
      >
        <DashboardSection
          title="Revenue Overview"
          subtitle={`Revenue trends — ${REVENUE_PERIOD_LABELS[revenuePeriod]} (${(REVENUE_PERIOD_KPIS[revenuePeriod] || REVENUE_PERIOD_KPIS.monthly).comparison.label})`}
          icon={TrendingUp}
          action={
            <div className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/60">
              {REVENUE_PERIODS.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => setRevenuePeriod(period.value)}
                  aria-pressed={revenuePeriod === period.value}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    revenuePeriod === period.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex h-56 items-center justify-center p-1">
            {revenue.status === 'loading' ? (
              <RevenueLoadingSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue.series} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orgGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f55f7" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0f55f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis width={52} domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={formatRevenueTick} />
                  <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#94A3B8', strokeDasharray: '3 3' }} />
                  <Area
                    dataKey="revenue"
                    stroke="#0f55f7"
                    strokeWidth={2}
                    fill="url(#orgGradient)"
                    dot={{ r: 2.5, fill: '#0f55f7', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#0f55f7', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue summary — the "how much" answers, consistent with the chart */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {getRevenueMetrics(revenuePeriod).map((metric) => (
              <MetricChip key={`${revenuePeriod}-${metric.key}`} icon={metric.icon} label={metric.label} value={metric.value} color={metric.color} sub={metric.sub} />
            ))}
          </div>
        </DashboardSection>
      </motion.div>

      {/* ── Upcoming Subscriptions — organizations approaching expiry ── */}
      <motion.div
        variants={fadeUp}
        initial={false}
        animate="animate"
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-4"
      >
        <DashboardSection
          title="Upcoming Subscriptions"
          subtitle="Organizations approaching renewal in the next 30 days"
          icon={FileClock}
          action={
            <button
              type="button"
              onClick={() => navigate(`${ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}?status=expiring`)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition-all hover:border-[#0f55f7]/30 hover:bg-[#0f55f7]/5 hover:text-[#0f55f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              View All
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          {upcomingSubscriptions.length ? (
            <div className="custom-scrollbar max-h-[320px] overflow-auto rounded-xl border border-slate-200/90 dark:border-slate-700/80">
              <table className="w-full min-w-[720px] text-left">
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm dark:bg-slate-800/95">
                  <tr>
                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Organization</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plan</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Expiry Date</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Days Remaining</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {upcomingSubscriptions.map((item) => {
                    const badge = getUpcomingBadge(item)
                    return (
                      <tr
                        key={item.id ?? item.subscriptionId}
                        onClick={() => handleOpenUpcomingSubscription(item)}
                        className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">
                              <Building2 className="h-4 w-4 text-[#0f55f7]" />
                            </div>
                            <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                              {item.organizationName ?? item.organization?.name ?? 'Organization'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                            {item.planName ?? item.plan ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {formatRenewalDate(item.expiryDate ?? item.endDate ?? item.renewalDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold tabular-nums ${item.daysRemaining !== null && item.daysRemaining <= 7 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                            {item.daysRemaining !== null ? `${item.daysRemaining} days` : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-300 dark:text-emerald-500/50" />
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">No subscriptions expiring soon</p>
              <p className="mt-1 text-xs text-slate-400">No renewals are due in the next 30 days.</p>
            </div>
          )}
        </DashboardSection>
      </motion.div>

      {/* ── Recent Platform Activity ── */}
      <motion.div
        variants={fadeUp}
        initial={false}
        animate="animate"
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-3"
      >
        <DashboardSection
          title="Recent Platform Activity"
          subtitle="Latest platform-wide events"
          icon={Activity}
        >
          {activities.length ? (
            <ol className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {activities.map((event) => {
                const isDanger = event.tone === 'danger'
                const isSuccess = event.tone === 'success'
                const isMuted = event.tone === 'muted'
                const ActivityIcon = isDanger ? Ban : isSuccess ? CheckCircle2 : isMuted ? FileClock : Building2
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => handleActivityClick(event)}
                      aria-label={`Open ${event.title} — ${event.organization}`}
                      title={`Open ${event.title} — ${event.organization}`}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-all duration-150 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 dark:hover:bg-slate-800/40"
                    >
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isDanger ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : isSuccess ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : isMuted ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-blue-50 text-[#0f55f7] dark:bg-blue-500/10'}`}>
                        <ActivityIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">{event.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">{event.organization}</span>
                      </span>
                      <time className="shrink-0 text-[11px] font-medium text-slate-400">{formatActivityTime(event.time)}</time>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[#0f55f7] group-hover:opacity-100 dark:text-slate-600 dark:group-hover:text-[#6aa0ff]" />
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">No recent activity</p>
              <p className="mt-1 text-xs text-slate-400">Platform events will appear here as they happen.</p>
            </div>
          )}
        </DashboardSection>
      </motion.div>
    </div>
  )
}
