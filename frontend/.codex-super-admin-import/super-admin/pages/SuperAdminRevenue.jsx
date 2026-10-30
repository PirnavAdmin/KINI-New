import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowDownRight, ArrowLeft, ArrowUpRight, BarChart3, Building2,
  CalendarRange, CheckCircle2, CreditCard, DollarSign, Eye, Layers,
  Receipt, RefreshCcw, TrendingUp, UserPlus, Wallet,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import PageHeader from '@shared/components/PageHeader'
import { Button } from '@shared/components/FormElements'
import { PremiumKpiCard, DashboardSection } from '@shared/components/SharedComponents'
import { ROUTES } from '@shared/constants/routeConstants'
import {
  REVENUE_SUMMARY, MONTHLY_REVENUE, REVENUE_DAILY, REVENUE_WEEKLY, REVENUE_YEARLY, PLAN_REVENUE,
  REVENUE_TRANSACTIONS, TOP_REVENUE_ORGANIZATIONS,
  REVENUE_BREAKDOWN, REVENUE_ANALYTICS,
} from '@shared/data/revenueMockData'
import { SUBSCRIPTION_RECORDS } from '@shared/data/subscriptionMockData'
import { formatCurrency } from '@shared/utils/formatters'

// ─── Filters ────────────────────────────────────────────────────────────────
// Date range → number of trailing months shown in the chart + transactions.
// 30d collapses to the trailing two calendar months because the mock series is
// monthly; 3m/6m/12m show the corresponding trailing slice; This Year shows the
// full calendar year (the series is a single Jan → Dec year).
const DATE_RANGES = [
  { value: '30d', label: 'Last 30 Days', months: 2 },
  { value: '3m', label: 'Last 3 Months', months: 3 },
  { value: '6m', label: 'Last 6 Months', months: 6 },
  { value: '12m', label: 'Last 12 Months', months: 12 },
  { value: 'this-year', label: 'This Year', months: 12 },
]
const DEFAULT_DATE_RANGE = '12m'

// ─── Revenue period selector — Daily | Weekly | Monthly | Yearly. Mirrors the
// dashboard's Revenue Overview granularity control; Monthly is the default
// because the page's chart and date-range filter are monthly-based. ───
const REVENUE_PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]
const DEFAULT_REVENUE_PERIOD = 'monthly'

// Period → series. All four describe the same growing revenue story (see
// revenueMockData.js) and are the single source of truth for the period KPI
// cards, the Revenue Performance chart and the Revenue Breakdown.
const REVENUE_SERIES = {
  daily: REVENUE_DAILY,
  weekly: REVENUE_WEEKLY,
  monthly: MONTHLY_REVENUE,
  yearly: REVENUE_YEARLY,
}

// Period → KPI card labels + comparison suffix. Labels are period-specific
// (never a reused label with a swapped number) and every value is derived from
// the period series and the shared revenue breakdown shares.
const PERIOD_KPI = {
  daily: {
    revenue: "Today's Revenue",
    subscription: "Today's Subscription Revenue",
    new: "Today's New Subscription Revenue",
    refunds: "Today's Refunds",
    comparison: 'vs yesterday',
  },
  weekly: {
    revenue: "This Week's Revenue",
    subscription: 'Weekly Subscription Revenue',
    new: 'Weekly New Subscription Revenue',
    refunds: 'Weekly Refunds',
    comparison: 'vs last week',
  },
  monthly: {
    revenue: "This Month's Revenue",
    subscription: 'Monthly Subscription Revenue',
    new: 'Monthly New Subscription Revenue',
    refunds: 'Monthly Refunds',
    comparison: 'vs last month',
  },
  yearly: {
    revenue: "This Year's Revenue",
    subscription: 'Yearly Subscription Revenue',
    new: 'Yearly New Subscription Revenue',
    refunds: 'Yearly Refunds',
    comparison: 'vs last year',
  },
}

const TRANSACTION_STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded']
const STATUS_PILL = {
  Paid: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  Failed: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  Refunded: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/25',
}

const PLAN_COLORS = {
  'Enterprise Plus': '#6D28D9',
  Enterprise: '#2563EB',
  Professional: '#8B5CF6',
  Starter: '#10B981',
  Free: '#94A3B8',
}
const planColor = (plan) => PLAN_COLORS[plan] || '#64748b'

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

// Number-only en-IN grouping for PremiumKpiCard, which adds its own prefix.
const formatINRValue = (value) => Number(value || 0).toLocaleString('en-IN')

const formatDate = (value) => {
  const date = new Date(`${String(value)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Trailing-window helpers (pure, mirror analyticsData.js conventions).
const trailingMonths = (range) => DATE_RANGES.find((option) => option.value === range)?.months ?? 12

const sliceMonthlyRevenue = (range) => MONTHLY_REVENUE.slice(-trailingMonths(range))

// A transaction is in range when its calendar month falls inside the trailing
// window that ends with the current month.
const transactionInRange = (transaction, range) => {
  const months = trailingMonths(range)
  const date = new Date(`${String(transaction.paymentDate)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return true
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
  return date >= cutoff
}

// Custom tooltip for the Revenue Performance chart (mirrors the dashboard's).
const RevenueChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <p className="text-[11px] font-semibold text-slate-400">{point.period}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">Revenue: {formatCurrency(point.revenue)}</p>
    </div>
  )
}

// Custom tooltip for the plan distribution donut.
const PlanDonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const point = payload[0]
  if (!point) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <p className="text-[11px] font-semibold text-slate-400">{point.name}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
        {formatINR(point.value)} · {point.payload?.percent}%
      </p>
    </div>
  )
}

const PeriodBadge = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-[#0f55f7]/20 bg-[#0f55f7]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0f55f7]">
    <CalendarRange className="h-3 w-3" />
    {label}
  </span>
)

const EmptySection = ({ icon: Icon, title, description }) => (
  <div className="grid place-items-center py-10 text-center">
    <div>
      <Icon className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />
      <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  </div>
)

// Compact metric used by the Revenue Analytics strip.
const AnalyticsMetric = ({ icon: Icon, label, value, color }) => (
  <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${color}14`, color }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="min-w-0 text-[11px] font-semibold leading-4 text-slate-500 dark:text-slate-400">{label}</p>
    </div>
    <p className="mt-2 break-words text-lg font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
  </div>
)

export default function SuperAdminRevenue() {
  const navigate = useNavigate()
  const [revenuePeriod, setRevenuePeriod] = useState(DEFAULT_REVENUE_PERIOD)
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE)
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const rangeLabel = DATE_RANGES.find((option) => option.value === dateRange)?.label ?? 'Last 12 Months'
  const periodLabel = REVENUE_PERIODS.find((period) => period.value === revenuePeriod)?.label ?? 'Monthly'

  // ── Filtered derivations (pure, derived in the component — swap the mock
  // import for the real revenue API later without touching the rendering).
  // The period series is the single source of truth for the KPI cards, the
  // Revenue Performance chart and the Revenue Breakdown. Monthly slices the
  // trailing months by the date range (existing behavior); Daily/Weekly/Yearly
  // render their full series. ──
  const periodSeries = useMemo(() => {
    const rows = revenuePeriod === 'monthly' ? sliceMonthlyRevenue(dateRange) : REVENUE_SERIES[revenuePeriod]
    return (Array.isArray(rows) ? rows : []).map((point) => ({
      period: point.period ?? point.month,
      revenue: Number(point.revenue ?? 0),
    }))
  }, [revenuePeriod, dateRange])
  const periodRevenue = useMemo(() => periodSeries.reduce((sum, point) => sum + point.revenue, 0), [periodSeries])

  const planRows = useMemo(
    () => (planFilter ? PLAN_REVENUE.filter((row) => row.plan === planFilter) : PLAN_REVENUE),
    [planFilter],
  )
  const totalPlanRevenue = useMemo(() => planRows.reduce((sum, row) => sum + row.revenue, 0), [planRows])
  const totalPlanSubscriptions = useMemo(() => planRows.reduce((sum, row) => sum + row.subscriptions, 0), [planRows])

  const transactions = useMemo(
    () => REVENUE_TRANSACTIONS.filter((transaction) =>
      transactionInRange(transaction, dateRange) &&
      (!planFilter || transaction.plan === planFilter) &&
      (!statusFilter || transaction.status === statusFilter),
    ),
    [dateRange, planFilter, statusFilter],
  )
  const paidTotal = useMemo(
    () => transactions.filter((transaction) => transaction.status === 'Paid').reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  )
  const invoicedTotal = useMemo(
    () => transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  )
  const collectionRate = invoicedTotal > 0 ? Math.round((paidTotal / invoicedTotal) * 1000) / 10 : 0

  // ── Revenue Breakdown — the selected period's revenue split by category. ──
  const breakdownRows = useMemo(
    () => REVENUE_BREAKDOWN.map((row) => ({
      ...row,
      amount: Math.round(periodRevenue * row.share),
      percent: Math.round(row.share * 100),
    })),
    [periodRevenue],
  )
  const breakdownByKey = useMemo(
    () => Object.fromEntries(breakdownRows.map((row) => [row.key, row])),
    [breakdownRows],
  )

  // ── One revenue KPI data structure — period → { totalRevenue, subscriptionRevenue,
  // newRevenue, refunds, revenueGrowth, comparisonLabel }. Every value is derived
  // from the same period series + breakdown shares that drive the Revenue
  // Performance chart and the Revenue Breakdown, so the cards always agree with
  // the chart and are stable (switching periods never randomizes values). ──
  const revenueKpiData = useMemo(() => {
    const share = (key) => breakdownByKey[key]?.share ?? 0
    const build = (series, labels) => {
      const points = Array.isArray(series) ? series : []
      // Current period's revenue = the latest point of the series (today / this
      // week / Dec / this year), so the KPI matches the chart's last bar.
      const totalRevenue = points[points.length - 1]?.revenue ?? 0
      // Period-over-period growth — the latest point vs the previous one.
      const previousRevenue = points[points.length - 2]?.revenue ?? 0
      const revenueGrowth = previousRevenue ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
      return {
        labels,
        totalRevenue,
        subscriptionRevenue: Math.round(totalRevenue * share('subscription')),
        newRevenue: Math.round(totalRevenue * share('newSubscription')),
        refunds: Math.round(totalRevenue * share('refunded')),
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        comparisonLabel: labels.comparison,
      }
    }
    return {
      daily: build(REVENUE_SERIES.daily, PERIOD_KPI.daily),
      weekly: build(REVENUE_SERIES.weekly, PERIOD_KPI.weekly),
      monthly: build(periodSeries, PERIOD_KPI.monthly),
      yearly: build(REVENUE_SERIES.yearly, PERIOD_KPI.yearly),
    }
  }, [breakdownByKey, periodSeries])

  // KPI cards read their data from the selected period — one card component
  // reused for all four periods (never four hardcoded sets of KPI JSX).
  const periodKpis = useMemo(() => {
    const data = revenueKpiData[revenuePeriod]
    return [
      {
        key: 'total',
        icon: DollarSign,
        label: data.labels.revenue,
        value: formatINRValue(data.totalRevenue),
        color: '#0f55f7',
        change: data.revenueGrowth,
        changeLabel: data.comparisonLabel,
      },
      {
        key: 'subscription',
        icon: CreditCard,
        label: data.labels.subscription,
        value: formatINRValue(data.subscriptionRevenue),
        color: '#2563eb',
      },
      {
        key: 'new',
        icon: UserPlus,
        label: data.labels.new,
        value: formatINRValue(data.newRevenue),
        color: '#8b5cf6',
      },
      {
        key: 'refunds',
        icon: ArrowDownRight,
        label: data.labels.refunds,
        value: formatINRValue(data.refunds),
        color: '#ef4444',
      },
    ]
  }, [revenueKpiData, revenuePeriod])

  // ── Revenue Analytics — secondary health metrics (period-consistent). All
  // revenue-derived values read from the same revenueKpiData structure used by
  // the KPI cards. ──
  const analyticsMetrics = useMemo(
    () => {
      const data = revenueKpiData[revenuePeriod]
      return [
        { key: 'growth', label: 'Revenue Growth', value: `${data.revenueGrowth}%`, icon: TrendingUp, color: '#10b981' },
        { key: 'newRevenue', label: 'New Revenue', value: formatINR(data.newRevenue), icon: UserPlus, color: '#2563eb' },
        { key: 'renewalRevenue', label: 'Renewal Revenue', value: formatINR(Math.round(data.totalRevenue * (breakdownByKey.renewal?.share ?? 0))), icon: RefreshCcw, color: '#8b5cf6' },
        { key: 'churnedRevenue', label: 'Churned Revenue', value: formatINR(Math.round(data.totalRevenue * (REVENUE_ANALYTICS.churnedRevenue / REVENUE_SUMMARY.totalRevenue))), icon: ArrowDownRight, color: '#ef4444' },
        { key: 'avgPerOrg', label: 'Avg Revenue / Organization', value: formatINR(Math.round(data.totalRevenue / SUBSCRIPTION_RECORDS.length)), icon: Building2, color: '#f59e0b' },
        { key: 'revPerSub', label: 'Revenue / Subscription', value: formatINR(totalPlanSubscriptions ? Math.round(totalPlanRevenue / totalPlanSubscriptions) : 0), icon: Layers, color: '#0f55f7' },
        { key: 'collectionRate', label: 'Collection Rate', value: `${collectionRate}%`, icon: CheckCircle2, color: '#06b6a8' },
      ]
    },
    [revenueKpiData, revenuePeriod, breakdownByKey, collectionRate, totalPlanRevenue, totalPlanSubscriptions],
  )

  // ── Plan distribution (donut) — derived from the same filtered plan rows. ──
  const distributionData = useMemo(
    () => planRows
      .filter((row) => row.revenue > 0)
      .map((row) => ({
        name: row.plan,
        value: row.revenue,
        color: planColor(row.plan),
        percent: totalPlanRevenue > 0 ? Math.round((row.revenue / totalPlanRevenue) * 100) : 0,
      })),
    [planRows, totalPlanRevenue],
  )

  const topOrganizations = useMemo(
    () => (planFilter ? TOP_REVENUE_ORGANIZATIONS.filter((org) => org.plan === planFilter) : TOP_REVENUE_ORGANIZATIONS),
    [planFilter],
  )

  const hasActiveFilters = Boolean(planFilter || statusFilter) || dateRange !== DEFAULT_DATE_RANGE
  const resetFilters = () => {
    setDateRange(DEFAULT_DATE_RANGE)
    setPlanFilter('')
    setStatusFilter('')
    toast.success('Revenue filters cleared')
  }

  const openOrganization = (org) => {
    navigate(
      ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', String(org.organizationId)),
      { state: { organization: { id: org.organizationId, name: org.name } } },
    )
  }

  const openTransaction = (transaction) => {
    navigate(
      ROUTES.SUPER_ADMIN.REVENUE_TRANSACTION_DETAILS.replace(':transactionId', String(transaction.id)),
      { state: { transaction } },
    )
  }

  const backToDashboard = () => navigate(ROUTES.SUPER_ADMIN.DASHBOARD)

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={dateRange}
        onChange={(event) => setDateRange(event.target.value)}
        aria-label="Revenue date range"
        disabled={revenuePeriod !== 'monthly'}
        title={revenuePeriod === 'monthly' ? 'Revenue date range' : 'The date range applies to the Monthly period'}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
      >
        {DATE_RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
      </select>
      <select
        value={planFilter}
        onChange={(event) => setPlanFilter(event.target.value)}
        aria-label="Revenue plan filter"
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
      >
        <option value="">All Plans</option>
        {PLAN_REVENUE.map((row) => <option key={row.plan} value={row.plan}>{row.plan}</option>)}
      </select>
      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        aria-label="Revenue payment status filter"
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
      >
        <option value="">All Statuses</option>
        {TRANSACTION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Reset filters
        </button>
      )}
    </div>
  )

  const backButton = (
    <button
      type="button"
      onClick={backToDashboard}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#0f55f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </button>
  )

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* ── Header — breadcrumb + title + Back to Dashboard ── */}
      <PageHeader
        title="Revenue Overview"
        subtitle="Detailed platform revenue and financial performance."
        breadcrumb={['Dashboard', 'Revenue Overview']}
        badge={<PeriodBadge label={`${periodLabel} Revenue`} />}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-4"
        actions={backButton}
      />

      {/* ── Filter bar — revenue period granularity + existing filters ── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Period selector — Daily | Weekly | Monthly | Yearly. Same segmented
            control style as the dashboard's Revenue Overview. */}
        <div role="group" aria-label="Revenue period" className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/60">
          {REVENUE_PERIODS.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => setRevenuePeriod(period.value)}
              aria-pressed={revenuePeriod === period.value}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 ${
                revenuePeriod === period.value
                  ? 'bg-[#0f55f7] text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        {filterBar}
        {hasActiveFilters && (
          <span className="text-xs text-slate-400">
            Showing {transactions.length} transaction{transactions.length === 1 ? '' : 's'} · {formatINR(paidTotal)} collected
          </span>
        )}
      </div>

      {/* ── Revenue KPI cards — period-specific headline metrics. The same
          series + breakdown shares drive the cards, the Revenue Performance
          chart and the Revenue Breakdown, so every period stays consistent. ── */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {periodKpis.map((card, index) => (
          <PremiumKpiCard
            key={`${revenuePeriod}-${card.key}`}
            icon={card.icon}
            label={card.label}
            value={card.value}
            prefix="₹"
            color={card.color}
            change={card.change}
            changeLabel={card.changeLabel}
            delay={index * 0.04}
          />
        ))}
      </div>

      {/* ── Revenue performance chart ── */}
      <DashboardSection
        title="Revenue Performance"
        subtitle={revenuePeriod === 'monthly' ? `Monthly revenue — ${rangeLabel}` : `${periodLabel} revenue`}
        icon={TrendingUp}
        className="mb-4"
        badge={<PeriodBadge label={`₹${periodRevenue.toLocaleString('en-IN')} total`} />}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={periodSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f55f7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0f55f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis width={56} domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${Number(value / 1000).toFixed(0)}K`} />
              <Tooltip content={<RevenueChartTooltip />} cursor={{ stroke: '#94A3B8', strokeDasharray: '3 3' }} />
              <Area
                dataKey="revenue"
                stroke="#0f55f7"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#0f55f7', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardSection>

      {/* ── Revenue analytics — secondary health metrics ── */}
      <DashboardSection
        title="Revenue Analytics"
        subtitle="Financial health metrics for the selected period"
        icon={BarChart3}
        className="mb-4"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {analyticsMetrics.map((metric) => (
            <AnalyticsMetric key={metric.key} icon={metric.icon} label={metric.label} value={metric.value} color={metric.color} />
          ))}
        </div>
      </DashboardSection>

      {/* ── Revenue by plan + Top organizations ── */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardSection
          title="Revenue by Plan"
          subtitle="Subscriptions, revenue and contribution"
          icon={CreditCard}
        >
          {planRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50">
                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plan</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Subscriptions</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Revenue</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {planRows.map((row) => {
                    const share = totalPlanRevenue > 0 ? Math.round((row.revenue / totalPlanRevenue) * 100) : 0
                    return (
                      <tr key={row.plan} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: planColor(row.plan) }} />
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{row.plan}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-sm tabular-nums text-slate-500 dark:text-slate-400">{row.subscriptions}</td>
                        <td className="px-3 py-3 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatINR(row.revenue)}</td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">{share}%</span>
                            <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:block">
                              <span className="block h-full rounded-full" style={{ width: `${share}%`, backgroundColor: planColor(row.plan) }} />
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {totalPlanRevenue > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-100 dark:border-slate-700/50">
                      <td className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Total</td>
                      <td className="px-3 py-3 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{totalPlanSubscriptions}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatINR(totalPlanRevenue)}</td>
                      <td className="px-3 py-3 text-right text-xs font-semibold text-slate-400">100%</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          ) : (
            <EmptySection icon={CreditCard} title="No plan data for this filter" description="Try a different plan filter." />
          )}
        </DashboardSection>

        <DashboardSection
          title="Top Revenue Organizations"
          subtitle="Click an organization for details"
          icon={Building2}
        >
          {topOrganizations.length ? (
            <ol className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {topOrganizations.map((org) => (
                <li key={org.organizationId}>
                  <button
                    type="button"
                    onClick={() => openOrganization(org)}
                    aria-label={`Open ${org.name} organization details`}
                    className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-all duration-150 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 dark:hover:bg-slate-800/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">
                      <Building2 className="h-4 w-4 text-[#0f55f7]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-[#0f55f7] dark:text-white">{org.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                        {org.plan} · {formatINR(org.monthlyRevenue)}/mo
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatINR(org.totalRevenue)}</span>
                      <span className={`mt-0.5 block text-[10px] font-semibold ${org.status === 'active' ? 'text-emerald-500' : org.status === 'trial' ? 'text-cyan-500' : 'text-slate-400'}`}>
                        {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[#0f55f7] group-hover:opacity-100 dark:text-slate-600" />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <EmptySection icon={Building2} title="No organizations match this filter" description="Try a different plan filter." />
          )}
        </DashboardSection>
      </div>

      {/* ── Plan distribution donut + Revenue breakdown ── */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardSection
          title="Plan Revenue Distribution"
          subtitle="Revenue contribution by plan"
          icon={BarChart3}
        >
          {distributionData.length ? (
            <>
              <div className="mx-auto h-[220px] w-full max-w-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={84}
                      paddingAngle={2}
                    >
                      {distributionData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<PlanDonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {distributionData.map((entry) => (
                  <li key={entry.name} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/40">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{entry.name}</span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900 dark:text-white">{formatINR(entry.value)}</span>
                    <span className="w-9 shrink-0 text-right text-xs font-bold tabular-nums text-slate-400">{entry.percent}%</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptySection icon={BarChart3} title="No plan revenue for this filter" description="Try a different plan filter." />
          )}
        </DashboardSection>

        <DashboardSection
          title="Revenue Breakdown"
          subtitle={`How the ${revenuePeriod === 'monthly' ? rangeLabel.toLowerCase() : periodLabel.toLowerCase()} revenue is composed`}
          icon={Wallet}
        >
          <ul className="space-y-3">
            {breakdownRows.map((row) => (
              <li key={row.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="truncate">{row.label}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-white">{formatINR(row.amount)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${row.percent}%`, backgroundColor: row.color }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-400">{row.percent}%</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total (selected period)</span>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{formatINR(periodRevenue)}</span>
          </div>
        </DashboardSection>
      </div>

      {/* ── Recent transactions ── */}
      <DashboardSection
        title="Recent Transactions"
        subtitle={`${transactions.length} transaction${transactions.length === 1 ? '' : 's'} · ${formatINR(paidTotal)} collected`}
        icon={Wallet}
      >
        {transactions.length ? (
          <div className="custom-scrollbar overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-700/80">
            {/* border-separate is required for the sticky Actions column to work
                (border-collapse disables position:sticky on table cells). The
                scroll stays inside this wrapper so the page never scrolls sideways. */}
            <table className="w-full min-w-[1024px] border-separate border-spacing-0 text-left">
              <thead className="bg-slate-50/95 dark:bg-slate-800/95">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Transaction ID</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Organization</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plan</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Invoice ID</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Payment Date</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Method</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="sticky right-0 z-10 bg-slate-50 py-3 pl-4 pr-5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 shadow-[-10px_0_16px_-14px_rgba(15,23,42,0.35)] dark:bg-slate-800 dark:shadow-[-10px_0_16px_-14px_rgba(0,0,0,0.6)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="group transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className="whitespace-nowrap font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{transaction.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-teal-100 bg-teal-50 dark:border-teal-500/20 dark:bg-teal-500/10">
                          <Building2 className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                        </span>
                        <span className="min-w-0 break-words text-sm font-bold leading-5 text-slate-800 dark:text-slate-100">{transaction.organization}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="break-words text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">{transaction.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="break-words font-mono text-xs leading-4 text-slate-500 dark:text-slate-400">{transaction.invoiceId}</span>
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums leading-5 text-slate-500 dark:text-slate-400">{formatDate(transaction.paymentDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatINR(transaction.amount)}</td>
                    <td className="px-4 py-3 text-sm leading-5 text-slate-500 dark:text-slate-400">{transaction.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center whitespace-nowrap rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[transaction.status] || STATUS_PILL.Failed}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="sticky right-0 z-10 bg-white py-3 pl-4 pr-5 text-right shadow-[-10px_0_16px_-14px_rgba(15,23,42,0.35)] transition-colors group-hover:bg-slate-50 dark:bg-slate-900 dark:shadow-[-10px_0_16px_-14px_rgba(0,0,0,0.6)] dark:group-hover:bg-slate-900">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => openTransaction(transaction)}
                        className="whitespace-nowrap"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptySection icon={Receipt} title="No transactions match your filters" description="Try adjusting the date range, plan or payment status." />
        )}
      </DashboardSection>
    </div>
  )
}
