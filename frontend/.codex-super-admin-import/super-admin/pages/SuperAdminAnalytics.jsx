import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Activity, ArrowUpRight, ArrowDownRight, BarChart3, Building2,
  CheckCircle2, CreditCard, Download, DollarSign, Globe,
  GraduationCap, MapPin, RefreshCw, TrendingUp, Users, Wallet,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import PageHeader from '@shared/components/PageHeader'
import EmptyState from '@shared/components/EmptyState'
import { ROUTES } from '@shared/constants/routeConstants'
import { ORGANIZATIONS } from '@shared/data/superAdminPageMockData'
import { SUBSCRIPTION_RECORDS } from '@shared/data/subscriptionMockData'
import { PLATFORM_ACTIVITY } from '@shared/data/platformMockData'
import { organizationApi, subscriptionApi, superAdminActivityApi, getApiErrorMessage } from '@shared/services/apiServices'
import { triggerFileDownload } from '@shared/utils/download'
import { normalizeActivity, resolveActivityDestination } from '@features/super-admin/utils/activityNavigation'
import {
  DATE_RANGES, DEFAULT_DATE_RANGE, buildAnalyticsReportCsv, buildEngagementSeries,
  buildOrganizationGrowthSeries, buildRegions, buildRevenueSeries, buildTopOrganizations,
  computeAnalyticsSnapshot, trailingMonthsForRange,
} from '@features/super-admin/utils/analyticsData'
import { useAuth } from '@shared/hooks/useAuth'

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const PLAN_COLORS = {
  Enterprise: '#2563EB',
  Professional: '#8B5CF6',
  'Enterprise Plus': '#6D28D9',
  Starter: '#10B981',
  Trial: '#06B6D4',
  Free: '#94A3B8',
}
const planColor = (plan) => PLAN_COLORS[plan] || '#64748b'

const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(226,232,240,0.9)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
  padding: '8px 12px',
  fontSize: '12px',
}

const CARD_CLASS =
  'rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.05)] dark:border-slate-700/80 dark:bg-slate-900/75 sm:p-5'

// ─── Reusable section card with a header + optional action ─────────────────
function SectionCard({ icon: Icon, color = '#0f55f7', title, subtitle, action, children, className = '' }) {
  return (
    <section className={`${CARD_CLASS} ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: `${color}14` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

// ─── Reusable segmented control (chart period / mode) ──────────────────────
function SegmentedControl({ options, value, onChange, ariaLabel }) {
  return (
    <div
      className="flex flex-wrap items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800/60"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 ${
            value === option.value
              ? 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// ─── Chart tooltip showing exact values ────────────────────────────────────
function ChartTooltip({ active, payload, label, formatValue = (v) => v }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          {entry.name}: {formatValue(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ─── KPI summary card (compact, consistent) ────────────────────────────────
function AnalyticsKpi({ icon: Icon, label, value, prefix = '', change, color = '#0f55f7', delay = 0, onClick }) {
  const isPositive = change >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative flex min-h-[96px] items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 backdrop-blur-xl transition-all duration-300 dark:border-slate-700/80 dark:bg-slate-900/70 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 26px -22px rgba(15,23,42,0.35)' }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}14 0%, ${color}05 45%, transparent 78%)` }} />
      <span aria-hidden className="pointer-events-none absolute bottom-2 left-0 top-2 w-[3px] rounded-full" style={{ background: `linear-gradient(180deg, ${color}, ${color}59)` }} />
      <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border" style={{ borderColor: `${color}26`, background: `linear-gradient(135deg, ${color}1F, ${color}08)` }}>
        <Icon className="h-[18px] w-[18px]" style={{ color }} />
      </div>
      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xl font-bold leading-6 tracking-tight text-slate-900 dark:text-white" title={`${prefix}${typeof value === 'number' ? value.toLocaleString('en-IN') : value}`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
            {Math.abs(change)}%
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400" title={label}>{label}</p>
        <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400 dark:text-slate-500">vs previous period</p>
      </div>
    </motion.div>
  )
}

// ─── Filter bar ────────────────────────────────────────────────────────────
const SELECT_CLASS =
  'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300'

function FilterBar({ organizations, plans, countries, filters, onFilter, onReset, hasActiveFilters }) {
  return (
    <div className={`${CARD_CLASS} mb-4`}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1 lg:max-w-[220px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization</span>
          <select
            value={filters.organizationId}
            onChange={(e) => onFilter({ organizationId: e.target.value })}
            className={`${SELECT_CLASS} w-full`}
            aria-label="Filter by organization"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1 lg:max-w-[180px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</span>
          <select
            value={filters.plan}
            onChange={(e) => onFilter({ plan: e.target.value })}
            className={`${SELECT_CLASS} w-full`}
            aria-label="Filter by plan"
          >
            <option value="">All Plans</option>
            {plans.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1 lg:max-w-[180px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country</span>
          <select
            value={filters.country}
            onChange={(e) => onFilter({ country: e.target.value })}
            className={`${SELECT_CLASS} w-full`}
            aria-label="Filter by country"
          >
            <option value="">All Countries</option>
            {countries.map((country) => <option key={country} value={country}>{country}</option>)}
          </select>
        </label>
        <div className="flex flex-1 items-end gap-2 lg:flex-none">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Platform Growth (3 compact metrics) ───────────────────────────────────
function PlatformGrowth({ userGrowth, orgGrowth, revenueGrowth }) {
  const rows = [
    { label: 'User Growth', value: userGrowth, color: '#06b6a8', icon: Users },
    { label: 'Organization Growth', value: orgGrowth, color: '#0f55f7', icon: Building2 },
    { label: 'Revenue Growth', value: revenueGrowth, color: '#8b5cf6', icon: DollarSign },
  ]
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const positive = row.value >= 0
        const width = Math.min(Math.abs(row.value), 100)
        return (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <row.icon className="h-3.5 w-3.5" style={{ color: row.color }} />
                {row.label}
              </span>
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(row.value)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${width}%`, backgroundColor: row.color }} />
            </div>
          </div>
        )
      })}
      <p className="flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#06b6a8]" />
        Month-over-month change across the selected period.
      </p>
    </div>
  )
}

// ─── Subscription Performance (status counts + plan donut) ─────────────────
function SubscriptionPerformance({ snapshot, onSegmentClick }) {
  const { statusCounts, activeCount, renewalRate, planDistribution } = snapshot
  const counts = [
    { label: 'Active', value: activeCount, color: '#06b6a8' },
    { label: 'Expiring Soon', value: statusCounts.expiring, color: '#f59e0b' },
    { label: 'Expired', value: statusCounts.expired, color: '#ef4444' },
    { label: 'Cancelled', value: statusCounts.cancelled, color: '#64748b' },
  ]
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <div className="grid grid-cols-2 gap-2">
          {counts.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/40">
              <p className="text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">{item.value}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Renewal Rate</span>
          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{renewalRate}%</span>
        </div>
      </div>

      <div>
        <div className="relative mx-auto h-40 w-full max-w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={planDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="84%"
                paddingAngle={3}
                cornerRadius={4}
                stroke="transparent"
                onClick={(_, index) => onSegmentClick(planDistribution[index]?.name)}
              >
                {planDistribution.map((entry) => <Cell key={entry.name} fill={planColor(entry.name)} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{subscriptionsTotal(planDistribution)}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Subscriptions</p>
            </div>
          </div>
        </div>
        <ul className="mt-3 space-y-1.5">
          {planDistribution.map((entry) => (
            <li key={entry.name}>
              <button
                type="button"
                onClick={() => onSegmentClick(entry.name)}
                className="group flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 dark:hover:bg-slate-800/40"
                aria-label={`Filter by ${entry.name} plan`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: planColor(entry.name) }} />
                <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
                <span className="ml-auto text-xs font-bold tabular-nums text-slate-400">{entry.value}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const subscriptionsTotal = (distribution) => distribution.reduce((sum, item) => sum + item.value, 0)

// ─── User Engagement (compact blocks + trend) ──────────────────────────────
function UserEngagement({ snapshot }) {
  const { deltas } = snapshot
  const blocks = [
    { label: 'Total Active Users', value: 12840, color: '#0f55f7', icon: Users },
    { label: 'Daily Active Users', value: 1221, color: '#06b6a8', icon: Activity },
    { label: 'Weekly Active Users', value: 8550, color: '#8b5cf6', icon: Activity },
    { label: 'Monthly Active Users', value: 12840, color: '#f59e0b', icon: Activity },
    { label: 'User Growth', value: `${deltas.students}%`, color: '#10b981', icon: TrendingUp },
  ]
  const trend = buildEngagementSeries('daily')
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {blocks.map((block) => (
          <div key={block.label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/40">
            <p className="flex items-center gap-1.5 text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
              {block.icon && <block.icon className="h-3.5 w-3.5" style={{ color: block.color }} />}
              {block.value}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{block.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="userEngGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f55f7" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0f55f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="users" stroke="#0f55f7" strokeWidth={1.5} fill="url(#userEngGrad)" name="Active Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Daily active-user trend from platform activity.</p>
    </div>
  )
}

// ─── Regions (ranked list) ─────────────────────────────────────────────────
function RegionsList({ regions }) {
  if (!regions.length) {
    return <p className="py-6 text-center text-sm text-slate-400">No region data available.</p>
  }
  const maxCount = regions[0]?.count || 1
  return (
    <ul className="space-y-3">
      {regions.map((region) => (
        <li key={region.country}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {region.country}
            </span>
            <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-300">
              {region.count} orgs <span className="font-medium text-slate-400">· {region.share}%</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" style={{ width: `${(region.count / maxCount) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

// ─── Revenue Insights ──────────────────────────────────────────────────────
function RevenueInsights({ insights }) {
  const rows = [
    { label: 'Total Revenue (12 mo)', value: formatINR(insights.totalRevenue), icon: Wallet, color: '#0f55f7' },
    { label: 'MRR', value: formatINR(insights.mrr), icon: DollarSign, color: '#06b6a8' },
    { label: 'ARR', value: formatINR(insights.arr), icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Average Revenue / Organization', value: formatINR(insights.avgPerOrganization), icon: Building2, color: '#f59e0b' },
  ]
  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/40">
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <row.icon className="h-3.5 w-3.5" style={{ color: row.color }} />
            {row.label}
          </span>
          <span className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">{row.value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Revenue Growth</span>
        <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">+{insights.growth}%</span>
      </div>
    </div>
  )
}

// ─── Top Organizations (compact, clickable) ────────────────────────────────
function TopOrganizations({ rows, onOpen }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-slate-400">No organizations to display.</p>
  return (
    <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-700">
            <th className="px-3 py-2.5">Organization</th>
            <th className="px-3 py-2.5">Students</th>
            <th className="px-3 py-2.5">Employees</th>
            <th className="px-3 py-2.5">Plan</th>
            <th className="px-3 py-2.5 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onOpen(row)}
              className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <td className="px-3 py-3">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900 transition-colors group-hover:text-[#0f55f7] dark:text-white dark:group-hover:text-[#6aa0ff]">
                  <Building2 className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  {row.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 opacity-0 transition group-hover:opacity-100" />
                </span>
              </td>
              <td className="px-3 py-3 text-sm tabular-nums text-slate-600 dark:text-slate-300">{row.students.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm tabular-nums text-slate-600 dark:text-slate-300">{row.employees.toLocaleString()}</td>
              <td className="px-3 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300" style={{ backgroundColor: `${planColor(row.plan)}14` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: planColor(row.plan) }} />
                  {row.plan}
                </span>
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatINR(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Recent Platform Activity (clickable rows → detail pages) ──────────────
function RecentActivity({ activities, onOpen }) {
  if (!activities.length) return <p className="py-6 text-center text-sm text-slate-400">No recent activity.</p>
  return (
    <ol className="divide-y divide-slate-100 dark:divide-slate-700/50">
      {activities.slice(0, 6).map((event) => {
        const isDanger = event.tone === 'danger'
        const isSuccess = event.tone === 'success'
        const isMuted = event.tone === 'muted'
        const Icon = isDanger ? Activity : isSuccess ? CheckCircle2 : isMuted ? Users : Building2
        return (
          <li key={event.id}>
            <button
              type="button"
              onClick={() => onOpen(event)}
              aria-label={`Open ${event.title} — ${event.organization}`}
              title={`Open ${event.title} — ${event.organization}`}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-all duration-150 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 dark:hover:bg-slate-800/40"
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isDanger ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : isSuccess ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : isMuted ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-blue-50 text-[#0f55f7] dark:bg-blue-500/10'}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{event.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">{event.organization}</span>
              </span>
              <time className="shrink-0 text-[11px] font-medium text-slate-400">{formatActivityTime(event.time)}</time>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[#0f55f7] group-hover:opacity-100 dark:text-slate-600 dark:group-hover:text-[#6aa0ff]" />
            </button>
          </li>
        )
      })}
    </ol>
  )
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

// ─── Skeleton while analytics data loads ───────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[96px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-900/70" />)}
      </div>
      <div className="h-[52px] animate-pulse rounded-[14px] border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-900/70" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-[14px] border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-900/70" />
        ))}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function SuperAdminAnalytics() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isDemo = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))

  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [organizations, setOrganizations] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [activities, setActivities] = useState([])

  // Filters
  const [filters, setFilters] = useState({ organizationId: '', plan: '', country: '' })
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  // Chart controls
  const [engagementGranularity, setEngagementGranularity] = useState('monthly')
  const [revenueMode, setRevenueMode] = useState('mrr')
  const [orgPeriod, setOrgPeriod] = useState('monthly')

  useEffect(() => {
    let cancelled = false
    const applyDemo = () => {
      setOrganizations(ORGANIZATIONS)
      setSubscriptions(SUBSCRIPTION_RECORDS)
      setActivities(PLATFORM_ACTIVITY.map(normalizeActivity))
      setStatus('ready')
    }

    if (isDemo) {
      applyDemo()
      return () => { cancelled = true }
    }

    Promise.all([
      organizationApi.list(),
      subscriptionApi.list(),
      superAdminActivityApi.list(),
    ])
      .then(([orgs, subs, acts]) => {
        if (cancelled) return
        setOrganizations(orgs || [])
        setSubscriptions(subs || [])
        setActivities(Array.isArray(acts) && acts.length ? acts.map(normalizeActivity) : PLATFORM_ACTIVITY.map(normalizeActivity))
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        applyDemo()
        setStatus('error')
        toast.error(getApiErrorMessage(error, 'Live analytics unavailable. Showing demo data.'))
      })
    return () => { cancelled = true }
  }, [isDemo])

  // Custom range → trailing months
  const customMonths = useMemo(() => {
    const from = customFrom ? new Date(customFrom) : null
    const to = customTo ? new Date(customTo) : null
    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 12
    const diff = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1
    return Math.max(1, Math.min(12, diff))
  }, [customFrom, customTo])

  const snapshot = useMemo(
    () => computeAnalyticsSnapshot({
      organizations,
      subscriptions,
      filters,
      range: dateRange,
      customMonths,
    }),
    [organizations, subscriptions, filters, dateRange, customMonths],
  )

  const { kpis, deltas } = snapshot

  const orgOptions = useMemo(() => organizations.map((org) => ({
    id: org.organizationId ?? org.id,
    name: org.organizationName ?? org.name,
  })), [organizations])

  const planOptions = useMemo(() => [...new Set(subscriptions.map((sub) => sub.planName ?? sub.plan).filter(Boolean))].sort(), [subscriptions])

  const countryOptions = useMemo(() => [...new Set(organizations.map((org) => org.country).filter(Boolean))].sort(), [organizations])

  const hasActiveFilters = Boolean(filters.organizationId || filters.plan || filters.country) || dateRange !== DEFAULT_DATE_RANGE

  const resetFilters = () => {
    setFilters({ organizationId: '', plan: '', country: '' })
    setDateRange(DEFAULT_DATE_RANGE)
    setCustomFrom('')
    setCustomTo('')
  }

  const handleExport = () => {
    try {
      const csv = buildAnalyticsReportCsv({ organizations, subscriptions, snapshot })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      triggerFileDownload(blob, `platform-analytics-${new Date().toISOString().slice(0, 10)}.csv`)
      toast.success('Analytics report exported')
    } catch {
      toast.error('Unable to export the report. Please try again.')
    }
  }

  const openOrganization = (org) => {
    navigate(
      ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', String(org.id)),
      { state: { organization: { id: org.id, name: org.name } } },
    )
  }

  const handleActivityClick = (event) => {
    const destination = resolveActivityDestination(event, {
      subscriptionByOrganization: (orgId) => {
        const match = SUBSCRIPTION_RECORDS.find((item) => String(item.organizationId) === String(orgId))
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

  const handlePlanSegment = (plan) => {
    setFilters((current) => ({ ...current, plan }))
    toast.success(plan ? `Filtered to the ${plan} plan` : 'Plan filter cleared')
  }

  const engagementSeries = useMemo(() => sliceSeries(buildEngagementSeries(engagementGranularity), dateRange, customMonths, engagementGranularity), [engagementGranularity, dateRange, customMonths])
  const revenueSeries = useMemo(() => sliceSeries(buildRevenueSeries(revenueMode), dateRange, customMonths, 'monthly'), [revenueMode, dateRange, customMonths])
  const orgGrowthSeries = useMemo(() => buildOrganizationGrowthSeries(orgPeriod, organizations), [orgPeriod, organizations])
  const regions = useMemo(() => buildRegions(snapshot.filteredOrgs), [snapshot.filteredOrgs])
  const topOrganizations = useMemo(() => buildTopOrganizations(snapshot.filteredOrgs, snapshot.filteredSubs), [snapshot.filteredOrgs, snapshot.filteredSubs])

  const dateRangeControl = (
    <div className="flex flex-wrap items-center gap-2">
      {dateRange === 'custom' && (
        <>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            aria-label="Custom range start"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            aria-label="Custom range end"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          />
        </>
      )}
      <select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
        aria-label="Date range"
      >
        {DATE_RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
      </select>
      <button
        type="button"
        onClick={handleExport}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0f55f7] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b46d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40"
      >
        <Download className="h-4 w-4" />
        Export Report
      </button>
    </div>
  )

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* ── Header ── */}
      <PageHeader
        title="Platform Analytics"
        subtitle="Monitor platform performance, engagement, revenue and organizational growth."
        icon={BarChart3}
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-4"
        actions={dateRangeControl}
      />

      {status === 'loading' ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {status === 'error' && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              Live analytics unavailable — showing the demo dataset.
            </div>
          )}

          {/* ── KPI Summary ── */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <AnalyticsKpi icon={Building2} label="Total Organizations" value={kpis.totalOrganizations} change={deltas.organizations} color="#0f55f7" delay={0} onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)} />
            <AnalyticsKpi icon={CheckCircle2} label="Active Organizations" value={kpis.activeOrganizations} change={deltas.activeOrganizations} color="#06b6a8" delay={0.04} />
            <AnalyticsKpi icon={GraduationCap} label="Total Students" value={kpis.totalStudents} change={deltas.students} color="#8b5cf6" delay={0.08} />
            <AnalyticsKpi icon={Users} label="Total Employees" value={kpis.totalEmployees} change={deltas.employees} color="#f59e0b" delay={0.12} />
            <AnalyticsKpi icon={DollarSign} label="Monthly Recurring Revenue" value={kpis.monthlyRevenue.toLocaleString('en-IN')} prefix="₹" change={deltas.revenue} color="#2563eb" delay={0.16} />
            <AnalyticsKpi icon={CreditCard} label="Active Subscriptions" value={kpis.activeSubscriptions} change={deltas.subscriptions} color="#10b981" delay={0.2} onClick={() => navigate(ROUTES.SUPER_ADMIN.SUBSCRIPTIONS)} />
          </div>

          {/* ── Filter Bar ── */}
          <FilterBar
            organizations={orgOptions}
            plans={planOptions}
            countries={countryOptions}
            filters={filters}
            onFilter={(patch) => setFilters((current) => ({ ...current, ...patch }))}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {snapshot.filteredOrgs.length === 0 ? (
            <div className={`${CARD_CLASS} py-10`}>
              <EmptyState
                icon={Building2}
                title="No organizations match your filters"
                description="Try adjusting the organization, plan, country or date range."
                action={<button type="button" onClick={resetFilters} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0f55f7] px-4 text-sm font-bold text-white transition hover:bg-[#0b46d6]">Reset Filters</button>}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* ── Row 1: Engagement + Revenue ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard
                  icon={Users}
                  color="#0f55f7"
                  title="Platform Engagement"
                  subtitle="Monthly active users"
                  action={
                    <SegmentedControl
                      ariaLabel="Engagement period"
                      options={[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                      ]}
                      value={engagementGranularity}
                      onChange={setEngagementGranularity}
                    />
                  }
                >
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementSeries} margin={{ top: 5, right: 10, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f55f7" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0f55f7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="users" stroke="#0f55f7" strokeWidth={2} fill="url(#engagementGrad)" name="Active Users" />
                        <Area type="monotone" dataKey="sessions" stroke="#06b6a8" strokeWidth={2} fill="transparent" name="Sessions" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={DollarSign}
                  color="#06b6a8"
                  title="Revenue Performance"
                  subtitle="Monthly recurring revenue"
                  action={
                    <SegmentedControl
                      ariaLabel="Revenue metric"
                      options={[
                        { value: 'mrr', label: 'MRR' },
                        { value: 'arr', label: 'ARR' },
                        { value: 'growth', label: 'Revenue Growth' },
                      ]}
                      value={revenueMode}
                      onChange={setRevenueMode}
                    />
                  }
                >
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueSeries} margin={{ top: 5, right: 10, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6a8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#06b6a8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => (revenueMode === 'growth' ? `${v}%` : `₹${(Number(v) / 1000).toFixed(0)}k`)} />
                        <Tooltip content={<ChartTooltip formatValue={(v) => (revenueMode === 'growth' ? `${v}%` : formatINR(v))} />} />
                        {revenueMode === 'growth' ? (
                          <Line type="monotone" dataKey="growth" stroke="#06b6a8" strokeWidth={2} dot={{ r: 3, fill: '#06b6a8' }} name="Growth" />
                        ) : (
                          <Area type="monotone" dataKey={revenueMode} stroke="#06b6a8" strokeWidth={2} fill="url(#revenueGrad)" name={revenueMode === 'arr' ? 'ARR' : 'MRR'} />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              {/* ── Row 2: Organization Growth + Platform Growth ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard
                  icon={Building2}
                  color="#0f55f7"
                  title="Organization Growth"
                  subtitle="New organizations onboarded over time"
                  action={
                    <SegmentedControl
                      ariaLabel="Organization growth period"
                      options={[
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'quarterly', label: 'Quarterly' },
                        { value: 'yearly', label: 'Yearly' },
                      ]}
                      value={orgPeriod}
                      onChange={setOrgPeriod}
                    />
                  }
                >
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orgGrowthSeries} margin={{ top: 5, right: 10, left: -14, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="newOrgs" fill="#0f55f7" radius={[4, 4, 0, 0]} name="New Organizations" />
                        <Bar dataKey="activeOrgs" fill="#06b6a8" radius={[4, 4, 0, 0]} name="Active Organizations" />
                        <Bar dataKey="suspended" fill="#ef4444" radius={[4, 4, 0, 0]} name="Suspended" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0f55f7]" /> New</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#06b6a8]" /> Active</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Suspended</span>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={TrendingUp}
                  color="#8b5cf6"
                  title="Platform Growth"
                  subtitle="Month-over-month platform growth"
                >
                  <PlatformGrowth
                    userGrowth={deltas.students}
                    orgGrowth={deltas.organizations}
                    revenueGrowth={deltas.revenue}
                  />
                </SectionCard>
              </div>

              {/* ── Row 3: Subscription Performance + User Engagement ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard
                  icon={CreditCard}
                  color="#f59e0b"
                  title="Subscription Performance"
                  subtitle="Status distribution and plan mix"
                >
                  <SubscriptionPerformance snapshot={snapshot} onSegmentClick={handlePlanSegment} />
                </SectionCard>

                <SectionCard
                  icon={Activity}
                  color="#06b6a8"
                  title="User Engagement"
                  subtitle="Active users and activity trends"
                >
                  <UserEngagement snapshot={snapshot} />
                </SectionCard>
              </div>

              {/* ── Row 4: Regions + Revenue Insights ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard
                  icon={Globe}
                  color="#0f55f7"
                  title="Organizations by Region"
                  subtitle="Where organizations operate"
                >
                  <RegionsList regions={regions} total={snapshot.filteredOrgs.length} />
                </SectionCard>

                <SectionCard
                  icon={Wallet}
                  color="#10b981"
                  title="Revenue Insights"
                  subtitle="Financial health at a glance"
                >
                  <RevenueInsights insights={snapshot.insights} />
                </SectionCard>
              </div>

              {/* ── Row 5: Top Organizations ── */}
              <SectionCard
                icon={Building2}
                color="#2563eb"
                title="Top Organizations"
                subtitle="Leading organizations by subscription revenue"
              >
                <TopOrganizations rows={topOrganizations} onOpen={openOrganization} />
              </SectionCard>

              {/* ── Row 6: Recent Platform Activity ── */}
              <SectionCard
                icon={Activity}
                color="#0f55f7"
                title="Recent Platform Activity"
                subtitle="Latest platform-wide events"
              >
                <RecentActivity activities={activities} onOpen={handleActivityClick} />
              </SectionCard>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Slice a series by the selected date range. Monthly series are trimmed to the
// trailing months for the range; daily/weekly granularity ignores the range so
// the Daily view always shows the full week of activity.
const sliceSeries = (series, range, customMonths, granularity) => {
  if (granularity === 'daily' || granularity === 'weekly') return series
  const trailing = trailingMonthsForRange(range, customMonths)
  const arr = Array.isArray(series) ? series : []
  return arr.slice(-Math.max(2, Math.min(trailing, arr.length)))
}

// Small inline alert icon (kept local to avoid pulling in unused icon names).
function AlertCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
